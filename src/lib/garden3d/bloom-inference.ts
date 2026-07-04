import type { BloomVisual } from "./types";

/** Each catalog species renders its own 3D bloom shape. */
const SPECIES_MAP: Record<string, BloomVisual | string> = {
  sunflower: "sunflower",
  daisy: "daisy",
  rose: "rose",
  blackRose: "blackRose",
  blackDahlia: "blackDahlia",
  tulip: "tulip",
  lotus: "lotus",
  hibiscus: "hibiscus",
  cherryBlossom: "cherryBlossom",
  cherry: "cherry",
  chamomile: "chamomile",
  lavender: "lavender",
  nightJasmine: "nightJasmine",
  cosmos: "cosmos",
  bluebell: "bluebell",
  edelweiss: "edelweiss",
  aster: "aster",
  hydrangea: "hydrangea",
  bleedingHeart: "bleedingHeart",
  passionflower: "passionflower",
  marigold: "marigold",
  greenChrysanthemum: "greenChrysanthemum",
  thistle: "thistle",
  snapdragon: "snapdragon",
  foxglove: "foxglove",
  reedGrass: "reedGrass",
  crystal: "crystal",
  glowTree: "glowTree",
  worldTree: "worldTree",
};

export function resolveBloomVisual(
  species: string,
  hue: number,
  _context = "",
): { kind: BloomVisual; hue: number; species: string } {
  const mapped = SPECIES_MAP[species] ?? "cosmos";
  const kind = (typeof mapped === "string" && isBloomVisual(mapped) ? mapped : "cosmos") as BloomVisual;
  return { kind, hue, species: SPECIES_MAP[species] ? species : "cosmos" };
}

function isBloomVisual(s: string): s is BloomVisual {
  return [
    "rose", "daisy", "tulip", "lavender", "cosmos", "crystal", "glowTree", "lotus", "sunflower", "cherry", "worldTree",
  ].includes(s);
}
