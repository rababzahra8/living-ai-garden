import { inferFlowerFromChat, parseStoredSpecies } from "@/lib/flower-mood";
import { gardenWeatherFromEmotion } from "@/lib/garden-emotions";
import { toneFromMoodString, type ConvoTone } from "@/lib/garden3d/tone-visuals";
import type { SeedVisual } from "@/lib/garden3d/types";

export type GardenWeather = "clear" | "rainbow" | "rain";

const POSITIVE: ConvoTone[] = ["happy", "joy", "love", "hope"];
const SAD: ConvoTone[] = ["sad", "negative"];

function weatherFromTone(tone: ConvoTone): GardenWeather | null {
  if (POSITIVE.includes(tone)) return "rainbow";
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

function weatherForSeed(seed: SeedVisual, threadTitles: Record<string, string>): GardenWeather | null {
  const { mood } = parseStoredSpecies(seed.species);
  const fromCatalog = gardenWeatherFromEmotion(mood);
  if (mood !== "neutral" && mood !== "reflection") {
    return fromCatalog;
  }
  const tone = toneForSeed(seed, threadTitles);
  return weatherFromTone(tone);
}

/** Derive garden weather from conversation moods. Latest thread wins. */
export function inferGardenWeather(
  seeds: SeedVisual[],
  threadTitles: Record<string, string>,
  latestThreadId?: string | null,
): GardenWeather {
  if (seeds.length === 0) return "clear";

  // Most recently updated conversation drives weather
  if (latestThreadId) {
    const latestSeed = seeds.find((s) => s.thread_id === latestThreadId);
    if (latestSeed) {
      const wx = weatherForSeed(latestSeed, threadTitles);
      if (wx) return wx;
    } else if (threadTitles[latestThreadId]) {
      const inferred = inferFlowerFromChat(threadTitles[latestThreadId], "");
      const wx = weatherFromTone(toneFromMoodString(inferred.mood));
      if (wx) return wx;
    }
  }

  // Otherwise tally all flowers
  let positive = 0;
  let sad = 0;
  for (const seed of seeds) {
    const tone = toneForSeed(seed, threadTitles);
    if (POSITIVE.includes(tone)) positive++;
    if (SAD.includes(tone)) sad++;
  }

  if (sad > positive) return "rain";
  if (positive > sad) return "rainbow";
  if (positive > 0 && sad === 0) return "rainbow";
  if (sad > 0 && positive === 0) return "rain";
  return "clear";
}
