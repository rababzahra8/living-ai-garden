import { z } from "zod";
import type { FlowerMood, FlowerSpecies } from "@/lib/flower-mood";
import { inferFlowerFromConversation } from "@/lib/flower-mood";

/** Emotions the gardener LLM can assign — each maps to a flower in the garden. */
export const GARDEN_EMOTION_CATALOG = [
  { id: "happy", flower: "sunflower" as FlowerSpecies, hue: 45, weather: "rainbow", label: "Happy → Sunflower" },
  { id: "joy", flower: "daisy" as FlowerSpecies, hue: 52, weather: "rainbow", label: "Joy → Daisy" },
  { id: "love", flower: "rose" as FlowerSpecies, hue: 345, weather: "rainbow", label: "Love → Rose" },
  { id: "hope", flower: "tulip" as FlowerSpecies, hue: 145, weather: "rainbow", label: "Hope → Tulip" },
  { id: "courage", flower: "tulip" as FlowerSpecies, hue: 18, weather: "rainbow", label: "Courage → Tulip" },
  { id: "calm", flower: "lavender" as FlowerSpecies, hue: 265, weather: "clear", label: "Calm → Lavender" },
  { id: "sad", flower: "cosmos" as FlowerSpecies, hue: 225, weather: "rain", label: "Sad → Cosmos" },
  { id: "negative", flower: "rose" as FlowerSpecies, hue: 355, weather: "rain", label: "Angry → Rose" },
  { id: "neutral", flower: "cosmos" as FlowerSpecies, hue: 310, weather: "clear", label: "Neutral → Cosmos" },
] as const;

export type GardenEmotionId = (typeof GARDEN_EMOTION_CATALOG)[number]["id"];

const emotionIds = GARDEN_EMOTION_CATALOG.map((e) => e.id) as [GardenEmotionId, ...GardenEmotionId[]];

const EmotionSchema = z.object({
  emotion: z.enum(emotionIds),
  confidence: z.number().min(0).max(1),
});

const EMOTION_CLASSIFIER_PROMPT = `You classify the emotional tone of a conversation in a reflective garden app.
Each emotion plants a specific flower:

- happy → sunflower (celebration, excitement, wonderful news)
- joy → daisy (gratitude, contentment, light delight)
- love → rose (care, connection, warmth, friendship)
- hope → tulip (dreams, growth, healing, new beginnings)
- courage → tulip (anxiety, fear, bravery, pushing through worry)
- calm → lavender (peace, rest, mindfulness, stillness)
- sad → cosmos (grief, loneliness, sorrow, loss)
- negative → rose (anger, frustration, bitterness, hate)
- neutral → cosmos (everyday chat without strong feeling)

Weight the LATEST user message most heavily. Return JSON only:
{"emotion":"<one of the ids above>","confidence":0.0-1.0}`;

export function flowerMoodFromEmotion(emotion: GardenEmotionId): FlowerMood {
  const entry = GARDEN_EMOTION_CATALOG.find((e) => e.id === emotion) ?? GARDEN_EMOTION_CATALOG[8];
  return { mood: entry.id, species: entry.flower, hue: entry.hue };
}

export function resolveConversationMood(
  llm: { emotion: GardenEmotionId; confidence: number } | null,
  priorMessages: string[],
  userMessage: string,
  gardenerReply: string,
): FlowerMood {
  if (llm && llm.confidence >= 0.55) {
    return flowerMoodFromEmotion(llm.emotion);
  }
  return inferFlowerFromConversation(priorMessages, userMessage, gardenerReply);
}

export async function classifyEmotionWithLLM(
  apiKey: string,
  model: string,
  priorMessages: string[],
  userMessage: string,
  gardenerReply: string,
): Promise<{ emotion: GardenEmotionId; confidence: number } | null> {
  const recent = priorMessages.slice(-6);
  const snippet = [
    ...recent.map((m, i) => `[${i + 1}] ${m}`),
    `[latest user] ${userMessage}`,
    `[gardener reply] ${gardenerReply}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 60,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EMOTION_CLASSIFIER_PROMPT },
          { role: "user", content: snippet },
        ],
      }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = EmotionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Text block for the gardener system prompt — emotions stay invisible to the user. */
export function gardenerEmotionGuide(): string {
  return `
The garden listens to feeling. You do not name emotions mechanically, but let your tone match theirs:
- joy or happiness → warm, bright, celebrate with them
- love or care → tender, unhurried, heart-forward
- hope or courage → gentle encouragement, new growth metaphors
- calm → quiet, spacious, soft pacing
- sadness → hold space, never rush to fix, rain-soft imagery
- anger or hurt → steady, validating, no toxic positivity
- jokes → laugh with them; laughter waters their flower

You never mention JSON, classifiers, models, or "detected emotion." You are simply the Gardener.`.trim();
}
