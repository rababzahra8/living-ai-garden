import { z } from "zod";
import type { FlowerMood, FlowerSpecies } from "@/lib/flower-mood";
import { inferFlowerFromConversation } from "@/lib/flower-mood";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

export type CatalogWeather =
  | "rainbow"
  | "sunrise"
  | "clear"
  | "breeze"
  | "rain"
  | "fog"
  | "drizzle"
  | "snow"
  | "storm"
  | "thunder"
  | "windy"
  | "cloudy";

/** Emotions the gardener LLM can assign — each maps to a flower in the garden. */
export const GARDEN_EMOTION_CATALOG = [
  // Positive
  { id: "happy", flower: "sunflower" as FlowerSpecies, hue: 45, weather: "rainbow" as CatalogWeather, label: "Happy → Sunflower" },
  { id: "joy", flower: "daisy" as FlowerSpecies, hue: 52, weather: "rainbow" as CatalogWeather, label: "Joy → Daisy" },
  { id: "love", flower: "rose" as FlowerSpecies, hue: 345, weather: "rainbow" as CatalogWeather, label: "Love → Rose" },
  { id: "hope", flower: "tulip" as FlowerSpecies, hue: 145, weather: "rainbow" as CatalogWeather, label: "Hope → Tulip" },
  { id: "hopeful", flower: "lotus" as FlowerSpecies, hue: 130, weather: "sunrise" as CatalogWeather, label: "Hopeful → Lotus" },
  { id: "courage", flower: "hibiscus" as FlowerSpecies, hue: 18, weather: "clear" as CatalogWeather, label: "Courage → Hibiscus" },
  { id: "playful", flower: "cherryBlossom" as FlowerSpecies, hue: 70, weather: "breeze" as CatalogWeather, label: "Playful → Cherry Blossom" },

  // Peaceful
  { id: "calm", flower: "lavender" as FlowerSpecies, hue: 265, weather: "clear" as CatalogWeather, label: "Calm → Lavender" },
  { id: "neutral", flower: "chamomile" as FlowerSpecies, hue: 310, weather: "cloudy" as CatalogWeather, label: "Neutral → Chamomile" },

  // Sad / gloomy
  { id: "sad", flower: "cosmos" as FlowerSpecies, hue: 225, weather: "rain" as CatalogWeather, label: "Sad → Cosmos" },
  { id: "melancholy", flower: "bluebell" as FlowerSpecies, hue: 240, weather: "fog" as CatalogWeather, label: "Melancholy → Bluebell" },
  { id: "wilted", flower: "blackDahlia" as FlowerSpecies, hue: 205, weather: "drizzle" as CatalogWeather, label: "Wilted → Black Dahlia" },
  { id: "numb", flower: "edelweiss" as FlowerSpecies, hue: 235, weather: "snow" as CatalogWeather, label: "Numb → Edelweiss" },
  { id: "exhausted", flower: "aster" as FlowerSpecies, hue: 250, weather: "cloudy" as CatalogWeather, label: "Exhausted → Aster" },
  { id: "disappointed", flower: "hydrangea" as FlowerSpecies, hue: 215, weather: "rain" as CatalogWeather, label: "Disappointed → Hydrangea" },
  { id: "heartbroken", flower: "bleedingHeart" as FlowerSpecies, hue: 330, weather: "storm" as CatalogWeather, label: "Heartbroken → Bleeding Heart" },
  { id: "overwhelmed", flower: "passionflower" as FlowerSpecies, hue: 275, weather: "storm" as CatalogWeather, label: "Overwhelmed → Passionflower" },
  { id: "confused", flower: "nightJasmine" as FlowerSpecies, hue: 200, weather: "fog" as CatalogWeather, label: "Confused → Night Jasmine" },

  // Mean / dark
  { id: "angry", flower: "marigold" as FlowerSpecies, hue: 0, weather: "storm" as CatalogWeather, label: "Angry → Marigold" },
  { id: "jealous", flower: "greenChrysanthemum" as FlowerSpecies, hue: 105, weather: "storm" as CatalogWeather, label: "Jealous → Green Chrysanthemum" },
  { id: "bitter", flower: "thistle" as FlowerSpecies, hue: 255, weather: "fog" as CatalogWeather, label: "Bitter → Thistle" },
  { id: "resentful", flower: "blackRose" as FlowerSpecies, hue: 345, weather: "storm" as CatalogWeather, label: "Resentful → Black Rose" },
  { id: "spiteful", flower: "blackDahlia" as FlowerSpecies, hue: 355, weather: "thunder" as CatalogWeather, label: "Spiteful → Black Dahlia" },
  { id: "annoyed", flower: "snapdragon" as FlowerSpecies, hue: 20, weather: "windy" as CatalogWeather, label: "Annoyed → Snapdragon" },
  { id: "unimpressed", flower: "reedGrass" as FlowerSpecies, hue: 290, weather: "cloudy" as CatalogWeather, label: "Unimpressed → Reed Grass" },
  { id: "suspicious", flower: "nightJasmine" as FlowerSpecies, hue: 185, weather: "fog" as CatalogWeather, label: "Suspicious → Night Jasmine" },
  { id: "mischievous", flower: "foxglove" as FlowerSpecies, hue: 300, weather: "windy" as CatalogWeather, label: "Mischievous → Foxglove" },
] as const;

export type GardenEmotionId = (typeof GARDEN_EMOTION_CATALOG)[number]["id"];

const emotionIds = GARDEN_EMOTION_CATALOG.map((e) => e.id) as [GardenEmotionId, ...GardenEmotionId[]];

const EmotionSchema = z.object({
  emotion: z.enum(emotionIds),
  confidence: z.number().min(0).max(1),
});

function buildEmotionClassifierPrompt(): string {
  const lines = GARDEN_EMOTION_CATALOG.map((e) => `- ${e.id} → ${e.flower.replace(/([A-Z])/g, " $1").trim()} (${e.label.split("→")[0]?.trim()})`);
  return `You classify the emotional tone of a conversation in a reflective garden app.
Each emotion plants a specific flower:

${lines.join("\n")}

Weight the LATEST user message most heavily. Return JSON only:
{"emotion":"<one of the ids above>","confidence":0.0-1.0}`;
}

export function gardenWeatherFromEmotion(emotionId: string): GardenWeather {
  const entry = GARDEN_EMOTION_CATALOG.find((e) => e.id === emotionId);
  if (!entry) return "clear";
  if (entry.weather === "rainbow" || entry.weather === "sunrise" || entry.weather === "breeze") {
    return "rainbow";
  }
  if (
    entry.weather === "rain" ||
    entry.weather === "drizzle" ||
    entry.weather === "storm" ||
    entry.weather === "thunder"
  ) {
    return "rain";
  }
  return "clear";
}

export function flowerMoodFromEmotion(emotion: GardenEmotionId): FlowerMood {
  const entry =
    GARDEN_EMOTION_CATALOG.find((e) => e.id === emotion) ??
    GARDEN_EMOTION_CATALOG.find((e) => e.id === "neutral")!;
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
          { role: "system", content: buildEmotionClassifierPrompt() },
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
- joy, happiness, love, hope, courage, playfulness → warm, bright, celebrate with them
- calm or neutral → quiet, unhurried, gentle pacing
- sadness, grief, exhaustion, disappointment → hold space, rain-soft imagery, never rush to fix
- anger, bitterness, jealousy, spite → steady, validating, no toxic positivity
- confusion or overwhelm → patient, grounding, one step at a time
- jokes → laugh with them; laughter waters their flower

You never mention JSON, classifiers, models, or "detected emotion." You are simply the Gardener.`.trim();
}
