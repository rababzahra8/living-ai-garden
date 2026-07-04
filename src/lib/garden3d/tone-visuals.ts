import type { BloomVisual } from "./types";

/** Emotional tone of a conversation — drives flower shape & color. */
export type ConvoTone =
  | "happy"
  | "sad"
  | "negative"
  | "calm"
  | "love"
  | "hope"
  | "joy"
  | "neutral";

export type ToneVisual = {
  tone: ConvoTone;
  kind: BloomVisual;
  hue: number;
  /** Petal tilt — positive = open/up, negative = drooping */
  petalLift: number;
  glow: number;
  sparkle: boolean;
  /** Stem lean in radians */
  stemLean: number;
  saturation: number;
  lightness: number;
  emissiveIntensity: number;
  wobble: number;
  label: string;
};

export const TONE_VISUALS: Record<ConvoTone, ToneVisual> = {
  happy: {
    tone: "happy",
    kind: "sunflower",
    hue: 45,
    petalLift: 0.55,
    glow: 0.55,
    sparkle: true,
    stemLean: 0,
    saturation: 82,
    lightness: 62,
    emissiveIntensity: 0.28,
    wobble: 0.35,
    label: "Radiant joy",
  },
  joy: {
    tone: "joy",
    kind: "daisy",
    hue: 52,
    petalLift: 0.5,
    glow: 0.5,
    sparkle: true,
    stemLean: 0.05,
    saturation: 78,
    lightness: 68,
    emissiveIntensity: 0.25,
    wobble: 0.3,
    label: "Bright delight",
  },
  sad: {
    tone: "sad",
    kind: "cosmos",
    hue: 225,
    petalLift: -0.45,
    glow: 0.18,
    sparkle: false,
    stemLean: 0.22,
    saturation: 55,
    lightness: 52,
    emissiveIntensity: 0.08,
    wobble: 0.05,
    label: "Quiet sorrow",
  },
  negative: {
    tone: "negative",
    kind: "rose",
    hue: 355,
    petalLift: -0.25,
    glow: 0.12,
    sparkle: false,
    stemLean: 0.15,
    saturation: 70,
    lightness: 38,
    emissiveIntensity: 0.06,
    wobble: 0,
    label: "Heavy thorns",
  },
  calm: {
    tone: "calm",
    kind: "lavender",
    hue: 265,
    petalLift: 0.25,
    glow: 0.3,
    sparkle: false,
    stemLean: 0,
    saturation: 50,
    lightness: 65,
    emissiveIntensity: 0.12,
    wobble: 0.08,
    label: "Still waters",
  },
  love: {
    tone: "love",
    kind: "rose",
    hue: 345,
    petalLift: 0.42,
    glow: 0.45,
    sparkle: true,
    stemLean: -0.04,
    saturation: 75,
    lightness: 58,
    emissiveIntensity: 0.22,
    wobble: 0.15,
    label: "Tender heart",
  },
  hope: {
    tone: "hope",
    kind: "tulip",
    hue: 145,
    petalLift: 0.48,
    glow: 0.4,
    sparkle: true,
    stemLean: -0.08,
    saturation: 68,
    lightness: 55,
    emissiveIntensity: 0.2,
    wobble: 0.12,
    label: "New growth",
  },
  neutral: {
    tone: "neutral",
    kind: "cosmos",
    hue: 310,
    petalLift: 0.3,
    glow: 0.28,
    sparkle: false,
    stemLean: 0,
    saturation: 65,
    lightness: 62,
    emissiveIntensity: 0.14,
    wobble: 0.1,
    label: "Gentle bloom",
  },
};

const TONE_ALIASES: Record<string, ConvoTone> = {
  joy: "joy",
  happy: "happy",
  sorrow: "sad",
  sad: "sad",
  negative: "negative",
  angry: "negative",
  calm: "calm",
  love: "love",
  hope: "hope",
  courage: "hope",
  reflection: "neutral",
  gentle: "neutral",
  programming: "neutral",
  ai: "neutral",
  design: "neutral",
  career: "happy",
  personal: "love",
  deep: "hope",
};

/** Parse species stored as "tone:kind" or legacy kind-only. */
export function parseSeedMood(species: string): { tone: ConvoTone; kind: string } {
  if (species.includes(":")) {
    const [toneRaw, kind] = species.split(":");
    const tone = TONE_ALIASES[toneRaw] ?? (toneRaw as ConvoTone);
    return { tone: TONE_VISUALS[tone] ? tone : "neutral", kind };
  }
  return { tone: "neutral", kind: species };
}

/** Encode mood + species for DB storage. */
export function encodeSeedSpecies(tone: string, kind: string): string {
  return `${tone}:${kind}`;
}

export function resolveToneVisual(tone: ConvoTone, hueOverride?: number): ToneVisual {
  const base = TONE_VISUALS[tone] ?? TONE_VISUALS.neutral;
  if (hueOverride == null) return base;
  return { ...base, hue: hueOverride };
}

export function toneFromMoodString(mood: string): ConvoTone {
  return TONE_ALIASES[mood] ?? (TONE_VISUALS[mood as ConvoTone] ? (mood as ConvoTone) : "neutral");
}
