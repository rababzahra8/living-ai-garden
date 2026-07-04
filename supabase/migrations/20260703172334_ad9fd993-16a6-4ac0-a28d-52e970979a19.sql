
-- THREADS
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads" ON public.threads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX messages_thread_idx ON public.messages(thread_id, created_at);

-- SEEDS
CREATE TABLE public.seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.threads(id) ON DELETE SET NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  hue INTEGER NOT NULL DEFAULT 320,
  growth INTEGER NOT NULL DEFAULT 0,
  species TEXT NOT NULL DEFAULT 'flower',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seeds TO authenticated;
GRANT ALL ON public.seeds TO service_role;
ALTER TABLE public.seeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own seeds" ON public.seeds FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX seeds_user_idx ON public.seeds(user_id);
