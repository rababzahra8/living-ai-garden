import { inferFlowerFromChat, parseStoredSpecies } from "@/lib/flower-mood";
import { gardenWeatherFromEmotion } from "@/lib/garden-emotions";
import { toneFromMoodString, type ConvoTone } from "@/lib/garden3d/tone-visuals";
import type { SeedVisual } from "@/lib/garden3d/types";

export type GardenWeather = "clear" | "rain" | "spring" | "summer" | "autumn" | "winter";

/** Brief mood boost from chat (no visible rainbow arc). */
export type MoodBoost = "clear" | "rain" | "spring";

const POSITIVE: ConvoTone[] = ["happy", "joy", "love", "hope"];
const SAD: ConvoTone[] = ["sad", "negative"];

export const WEATHER_LABELS: Record<
  GardenWeather,
  { icon: string; label: string; hint?: string }
> = {
  clear: { icon: "🌤️", label: "Clear skies" },
  spring: { icon: "🌸", label: "Spring bloom", hint: "Warm light from joyful chats" },
  summer: { icon: "☀️", label: "Summer sun" },
  autumn: { icon: "🍂", label: "Autumn breeze" },
  winter: { icon: "❄️", label: "Winter chill" },
  rain: { icon: "🌧️", label: "Gentle rain", hint: "Fades naturally over time" },
};

function moodFromTone(tone: ConvoTone): MoodBoost | null {
  if (POSITIVE.includes(tone)) return "spring";
  if (SAD.includes(tone)) return "rain";
  return null;
}

function toneForSeed(seed: SeedVisual, threadTitles: Record<string, string>): ConvoTone {
  const { mood } = parseStoredSpecies(seed.species);
  const storedTone = toneFromMoodString(mood);

  if (storedTone !== "neutral") return storedTone;

  if (seed.thread_id && threadTitles[seed.thread_id]) {
    const inferred = inferFlowerFromChat(threadTitles[seed.thread_id], "");
    return toneFromMoodString(inferred.mood);
  }

  return storedTone;
}

function moodForSeed(seed: SeedVisual, threadTitles: Record<string, string>): MoodBoost | null {
  const { mood } = parseStoredSpecies(seed.species);
  const fromCatalog = gardenMoodFromEmotion(mood);
  if (mood !== "neutral" && mood !== "reflection") {
    return fromCatalog;
  }
  const tone = toneForSeed(seed, threadTitles);
  return moodFromTone(tone);
}

function gardenMoodFromEmotion(emotionId: string): MoodBoost {
  const wx = gardenWeatherFromEmotion(emotionId);
  if (wx === "rain") return "rain";
  if (wx === "spring") return "spring";
  return "clear";
}

/** Derive brief mood weather from conversation. Latest thread wins. */
export function inferGardenMood(
  seeds: SeedVisual[],
  threadTitles: Record<string, string>,
  latestThreadId?: string | null,
): MoodBoost {
  if (seeds.length === 0) return "clear";

  if (latestThreadId) {
    const latestSeed = seeds.find((s) => s.thread_id === latestThreadId);
    if (latestSeed) {
      const mood = moodForSeed(latestSeed, threadTitles);
      if (mood) return mood;
    } else if (threadTitles[latestThreadId]) {
      const inferred = inferFlowerFromChat(threadTitles[latestThreadId], "");
      const mood = moodFromTone(toneFromMoodString(inferred.mood));
      if (mood) return mood;
    }
  }

  let positive = 0;
  let sad = 0;
  for (const seed of seeds) {
    const tone = toneForSeed(seed, threadTitles);
    if (POSITIVE.includes(tone)) positive++;
    if (SAD.includes(tone)) sad++;
  }

  if (sad > positive) return "rain";
  if (positive > sad) return "spring";
  if (positive > 0 && sad === 0) return "spring";
  if (sad > 0 && positive === 0) return "rain";
  return "clear";
}

/** @deprecated Use inferGardenMood */
export function inferGardenWeather(
  seeds: SeedVisual[],
  threadTitles: Record<string, string>,
  latestThreadId?: string | null,
): MoodBoost {
  return inferGardenMood(seeds, threadTitles, latestThreadId);
}
