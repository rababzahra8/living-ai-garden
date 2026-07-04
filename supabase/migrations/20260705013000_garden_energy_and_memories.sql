-- Persistent garden energy (never decreases when conversations are removed)
CREATE TABLE public.user_garden (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  energy INTEGER NOT NULL DEFAULT 0,
  next_conversation_number INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_garden TO authenticated;
GRANT ALL ON public.user_garden TO service_role;
ALTER TABLE public.user_garden ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own garden stats" ON public.user_garden
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Soft-delete + numbered conversation markers on seeds
ALTER TABLE public.seeds ADD COLUMN IF NOT EXISTS conversation_number INTEGER;
ALTER TABLE public.seeds ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS num
  FROM public.seeds
)
UPDATE public.seeds s
SET conversation_number = n.num
FROM numbered n
WHERE s.id = n.id AND s.conversation_number IS NULL;

UPDATE public.seeds SET conversation_number = 1 WHERE conversation_number IS NULL;

ALTER TABLE public.seeds ALTER COLUMN conversation_number SET NOT NULL;

-- Backfill energy from existing flowers (approximate lifetime value)
INSERT INTO public.user_garden (user_id, energy, next_conversation_number)
SELECT
  user_id,
  GREATEST(20, COALESCE(SUM(12 + growth * 4), 0))::INTEGER,
  COALESCE(MAX(conversation_number), 0) + 1
FROM public.seeds
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE SET
  energy = GREATEST(user_garden.energy, EXCLUDED.energy),
  next_conversation_number = GREATEST(user_garden.next_conversation_number, EXCLUDED.next_conversation_number);
