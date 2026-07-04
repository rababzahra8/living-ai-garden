import type { SeedVisual } from "@/lib/garden3d/types";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

/** Lighter showcase for logged-out visitors — fewer meshes, less GPU work. */
export const DEMO_ENERGY = 48;

export const DEMO_LATEST_THREAD_ID = "demo-thread-joy";

export const DEMO_THREAD_TITLES: Record<string, string> = {
  "demo-thread-joy": "Today I felt pure joy watching the sunset",
  "demo-thread-happy": "So happy — my garden is finally blooming",
  "demo-thread-love": "Thinking about someone I love dearly",
  "demo-thread-hope": "Hopeful about tomorrow, planting new seeds",
  "demo-thread-calm": "A calm evening walk through the meadow",
  "demo-thread-sad": "Feeling a little sad and that's okay",
};

type DemoFlower = {
  id: string;
  threadId: string;
  x: number;
  y: number;
  hue: number;
  growth: number;
  species: string;
  number: number;
};

const DEMO_FLOWERS: DemoFlower[] = [
  { id: "demo-1", threadId: "demo-thread-happy", x: 18, y: 24, hue: 45, growth: 5, species: "happy:sunflower", number: 1 },
  { id: "demo-2", threadId: "demo-thread-joy", x: 38, y: 20, hue: 52, growth: 5, species: "joy:daisy", number: 2 },
  { id: "demo-3", threadId: "demo-thread-love", x: 58, y: 32, hue: 345, growth: 5, species: "love:rose", number: 3 },
  { id: "demo-4", threadId: "demo-thread-hope", x: 72, y: 28, hue: 145, growth: 5, species: "hope:tulip", number: 4 },
  { id: "demo-5", threadId: "demo-thread-calm", x: 28, y: 52, hue: 265, growth: 5, species: "calm:lavender", number: 5 },
  { id: "demo-6", threadId: "demo-thread-sad", x: 52, y: 58, hue: 225, growth: 5, species: "sad:cosmos", number: 6 },
];

export const DEMO_SEEDS: SeedVisual[] = DEMO_FLOWERS.map((f) => ({
  id: f.id,
  thread_id: f.threadId,
  x: f.x,
  y: f.y,
  hue: f.hue,
  growth: f.growth,
  species: f.species,
  conversation_number: f.number,
  deleted_at: null,
}));

export type DemoShowcasePhase = {
  label: string;
  night: boolean;
  weather: GardenWeather;
  durationMs: number;
};

/** Slower, simpler cycle — fewer scene swaps on the landing page. */
export const DEMO_SHOWCASE_PHASES: DemoShowcasePhase[] = [
  { label: "Golden morning", night: false, weather: "clear", durationMs: 28_000 },
  { label: "Gentle rain", night: false, weather: "rain", durationMs: 24_000 },
  { label: "Starry night", night: true, weather: "clear", durationMs: 30_000 },
];
