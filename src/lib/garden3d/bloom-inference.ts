import type { BloomVisual } from "./types";

const TOPIC_RULES: { kind: BloomVisual; hue: number; patterns: RegExp[] }[] = [
  {
    kind: "crystal",
    hue: 205,
    patterns: [
      /\b(code|coding|program|software|debug|typescript|javascript|python|react|api|engineer|developer|algorithm|database|git)\b/i,
    ],
  },
  {
    kind: "glowTree",
    hue: 185,
    patterns: [/\b(ai|machine learning|llm|gpt|model|neural|agent|prompt|automation|robot)\b/i],
  },
  {
    kind: "lotus",
    hue: 285,
    patterns: [/\b(design|ui|ux|creative|color|layout|brand|aesthetic|figma|visual|art)\b/i],
  },
  {
    kind: "sunflower",
    hue: 42,
    patterns: [/\b(career|job|work|interview|resume|promotion|salary|office|professional|startup)\b/i],
  },
  {
    kind: "cherry",
    hue: 345,
    patterns: [/\b(personal|family|relationship|feel|feeling|life|myself|heart|friend|home|love)\b/i],
  },
  {
    kind: "worldTree",
    hue: 155,
    patterns: [
      /\b(deep|meaning|purpose|exist|philosophy|soul|universe|conscious|why am i|who am i|legacy|death|birth)\b/i,
    ],
  },
];

const SPECIES_MAP: Record<string, BloomVisual> = {
  rose: "rose",
  blackRose: "rose",
  daisy: "daisy",
  chamomile: "daisy",
  tulip: "tulip",
  hibiscus: "tulip",
  snapdragon: "tulip",
  lavender: "lavender",
  bluebell: "lavender",
  nightJasmine: "lavender",
  cosmos: "cosmos",
  aster: "cosmos",
  hydrangea: "cosmos",
  reedGrass: "cosmos",
  thistle: "cosmos",
  foxglove: "cosmos",
  marigold: "cosmos",
  crystal: "crystal",
  glowTree: "glowTree",
  lotus: "lotus",
  passionflower: "lotus",
  sunflower: "sunflower",
  cherry: "cherry",
  cherryBlossom: "cherry",
  worldTree: "worldTree",
  blackDahlia: "rose",
  edelweiss: "cosmos",
  bleedingHeart: "rose",
  greenChrysanthemum: "cosmos",
};

export function resolveBloomVisual(
  species: string,
  hue: number,
  context = "",
): { kind: BloomVisual; hue: number } {
  const stored = SPECIES_MAP[species];
  if (stored && !["rose", "daisy", "tulip", "lavender", "cosmos"].includes(stored)) {
    return { kind: stored, hue };
  }

  let best: (typeof TOPIC_RULES)[number] | null = null;
  let bestScore = 0;
  for (const rule of TOPIC_RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      const m = context.match(new RegExp(pattern.source, "gi"));
      if (m) score += m.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  if (best && bestScore > 0) return { kind: best.kind, hue: best.hue };

  const moodKind = SPECIES_MAP[species] ?? "cosmos";
  return { kind: moodKind, hue };
}
