export type FlowerSpecies =
  | "sunflower"
  | "daisy"
  | "rose"
  | "tulip"
  | "lavender"
  | "cosmos"
  | "lotus"
  | "hibiscus"
  | "cherryBlossom"
  | "chamomile"
  | "bluebell"
  | "blackDahlia"
  | "edelweiss"
  | "aster"
  | "hydrangea"
  | "bleedingHeart"
  | "passionflower"
  | "nightJasmine"
  | "marigold"
  | "greenChrysanthemum"
  | "thistle"
  | "blackRose"
  | "snapdragon"
  | "reedGrass"
  | "foxglove"
  | "crystal"
  | "glowTree"
  | "cherry"
  | "worldTree";

export type FlowerMood = {
  hue: number;
  species: FlowerSpecies;
  mood: string;
};

type MoodProfile = {
  mood: string;
  species: FlowerSpecies;
  hue: number;
  weight: number;
  patterns: RegExp[];
};

/** Emotional tones first — they win when matched. */
const PROFILES: MoodProfile[] = [
  {
    mood: "happy",
    species: "sunflower",
    hue: 45,
    weight: 2,
    patterns: [
      /\b(happy|happiness|glad|delight|wonderful|amazing|awesome|great|excited|celebrat|smile|laugh|fun|yay|hooray|fantastic|beautiful day|positive|positivity|optimis|cheerful|thrilled|ecstatic|joyful|good day|best day)\b/i,
    ],
  },
  {
    mood: "joy",
    species: "daisy",
    hue: 52,
    weight: 2,
    patterns: [
      /\b(joy|joyful|grateful|thankful|blessed|playful|lighthearted|cheerful|gratitude|content|pleased)\b/i,
    ],
  },
  {
    mood: "sad",
    species: "cosmos",
    hue: 225,
    weight: 2.2,
    patterns: [
      /\b(sad|sorrow|sorrowful|grief|grieve|loss|lost|miss|missing|lonely|alone|cry|tears|weep|melanchol|blue|empty|numb|goodbye|anxious|anxiety|worried|worry|stress|stressed|overwhelm|afraid|fear|scared)\b/i,
    ],
  },
  {
    mood: "negative",
    species: "rose",
    hue: 355,
    weight: 2.2,
    patterns: [
      /\b(angry|anger|hate|frustrat|annoyed|upset|mad|rage|bitter|resent|fail|failed|awful|terrible|worst|disgust|toxic|unfair|wrong|broken|give up|negative|negativity|pessimis|depress|miserable|hopeless|horrible|bad day|worst day|can't stand|fed up|sick of)\b/i,
    ],
  },
  {
    mood: "love",
    species: "rose",
    hue: 345,
    weight: 1.5,
    patterns: [
      /\b(love|loving|heart|care|caring|kindness|kind|compassion|warmth|hug|friend|family|together|connect|bond|cherish|adore)\b/i,
    ],
  },
  {
    mood: "calm",
    species: "lavender",
    hue: 265,
    weight: 1.5,
    patterns: [
      /\b(calm|peace|peaceful|quiet|still|stillness|rest|breathe|breath|serene|gentle|soft|slow|ease|relax|tranquil|mindful|meditat)\b/i,
    ],
  },
  {
    mood: "hope",
    species: "tulip",
    hue: 145,
    weight: 1.5,
    patterns: [
      /\b(hope|hopeful|grow|growth|bloom|blossom|future|dream|begin|start|new|seed|sprout|renew|heal|healing|better|forward)\b/i,
    ],
  },
  {
    mood: "courage",
    species: "tulip",
    hue: 18,
    weight: 1.2,
    patterns: [
      /\b(brave|courage|strong|strength|overcome|persist|resilien|keep going|anxious|worry|stress|overwhelm|afraid|fear|scared)\b/i,
    ],
  },
  {
    mood: "reflection",
    species: "cosmos",
    hue: 290,
    weight: 1,
    patterns: [
      /\b(think|thinking|reflect|reflection|wonder|meaning|purpose|learn|understand|memory|remember|question|why|deep|soul|wisdom)\b/i,
    ],
  },
  {
    mood: "programming",
    species: "crystal",
    hue: 205,
    weight: 1,
    patterns: [
      /\b(code|coding|program|software|debug|typescript|javascript|python|react|api|engineer|developer|algorithm|database|git)\b/i,
    ],
  },
  {
    mood: "ai",
    species: "glowTree",
    hue: 185,
    weight: 1,
    patterns: [/\b(ai|machine learning|llm|gpt|model|neural|agent|prompt|automation|robot)\b/i],
  },
  {
    mood: "design",
    species: "lotus",
    hue: 285,
    weight: 1,
    patterns: [/\b(design|ui|ux|creative|color|layout|brand|aesthetic|figma|visual|art)\b/i],
  },
  {
    mood: "career",
    species: "sunflower",
    hue: 42,
    weight: 1,
    patterns: [
      /\b(career|job|work|interview|resume|promotion|salary|office|professional|startup)\b/i,
    ],
  },
  {
    mood: "personal",
    species: "cherry",
    hue: 345,
    weight: 1,
    patterns: [/\b(personal|family|relationship|feel|feeling|life|myself|home)\b/i],
  },
  {
    mood: "deep",
    species: "worldTree",
    hue: 155,
    weight: 1,
    patterns: [
      /\b(deep|exist|philosophy|universe|conscious|why am i|who am i|legacy|death|birth)\b/i,
    ],
  },
];

/** Emotional moods outrank topic moods (work, code, etc.) for weather & flower tone. */
const EMOTIONAL_MOODS = new Set([
  "happy",
  "joy",
  "sad",
  "negative",
  "love",
  "calm",
  "hope",
  "courage",
]);

function scoreProfiles(
  text: string,
  multiplier: number,
): Map<string, { profile: MoodProfile; score: number }> {
  const scores = new Map<string, { profile: MoodProfile; score: number }>();
  for (const profile of PROFILES) {
    let score = 0;
    for (const pattern of profile.patterns) {
      const matches = text.match(new RegExp(pattern.source, "gi"));
      if (matches) score += matches.length * profile.weight;
    }
    if (EMOTIONAL_MOODS.has(profile.mood)) score *= 1.5;
    if (score > 0) {
      const prev = scores.get(profile.mood);
      scores.set(profile.mood, {
        profile,
        score: (prev?.score ?? 0) + score * multiplier,
      });
    }
  }
  return scores;
}

function pickBestProfile(
  scores: Map<string, { profile: MoodProfile; score: number }>,
): MoodProfile | null {
  let best: MoodProfile | null = null;
  let bestScore = 0;
  for (const { profile, score } of scores.values()) {
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }
  return bestScore > 0 ? best : null;
}

/** Infer flower from the latest exchange only. */
export function inferFlowerFromChat(userMessage: string, gardenerReply: string): FlowerMood {
  const best = pickBestProfile(scoreProfiles(`${userMessage}\n${gardenerReply}`, 1));
  if (best) return { hue: best.hue, species: best.species, mood: best.mood };
  return { hue: 310, species: "cosmos", mood: "neutral" };
}

/** Infer flower from full conversation — latest messages weighted more heavily. */
export function inferFlowerFromConversation(
  priorMessages: string[],
  userMessage: string,
  gardenerReply: string,
): FlowerMood {
  const combined = new Map<string, { profile: MoodProfile; score: number }>();

  const merge = (scores: Map<string, { profile: MoodProfile; score: number }>) => {
    for (const [mood, entry] of scores) {
      const prev = combined.get(mood);
      combined.set(mood, {
        profile: entry.profile,
        score: (prev?.score ?? 0) + entry.score,
      });
    }
  };

  if (priorMessages.length > 0) merge(scoreProfiles(priorMessages.join("\n"), 1));
  merge(scoreProfiles(`${userMessage}\n${gardenerReply}`, 4));

  const best = pickBestProfile(combined);
  if (best) return { hue: best.hue, species: best.species, mood: best.mood };
  return { hue: 310, species: "cosmos", mood: "neutral" };
}

/** DB species string: "happy:sunflower" */
export function formatSeedSpecies(mood: string, species: FlowerSpecies): string {
  return `${mood}:${species}`;
}

/** Read mood + kind from stored species. */
export function parseStoredSpecies(stored: string): { mood: string; species: FlowerSpecies } {
  if (stored.includes(":")) {
    const [mood, species] = stored.split(":");
    return { mood, species: species as FlowerSpecies };
  }
  return { mood: "neutral", species: stored as FlowerSpecies };
}
