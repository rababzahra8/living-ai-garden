export type TreeKind = "cherry" | "oak" | "willow" | "pine" | "magic";
export type HutKind = "round" | "square" | "tall";

export type TreePlacement = {
  id: string;
  kind: TreeKind;
  x: number;
  z: number;
  scale: number;
};

export type HutPlacement = {
  id: string;
  kind: HutKind;
  x: number;
  z: number;
  scale: number;
};

const TREE_KINDS: TreeKind[] = ["cherry", "oak", "willow", "pine", "magic"];
const HUT_KINDS: HutKind[] = ["round", "square", "tall"];

const BASE_TREES: Omit<TreePlacement, "id">[] = [
  { kind: "cherry", x: -14, z: -2, scale: 1.15 },
  { kind: "oak", x: 14, z: -4, scale: 1.35 },
  { kind: "willow", x: 10, z: 6, scale: 1.05 },
  { kind: "pine", x: -10, z: 8, scale: 0.95 },
  { kind: "magic", x: 0, z: -10, scale: 1.2 },
];

const BASE_HUTS: Omit<HutPlacement, "id">[] = [
  { kind: "round", x: -12, z: 12, scale: 0.95 },
  { kind: "square", x: 13, z: 10, scale: 1.05 },
  { kind: "tall", x: -8, z: -11, scale: 0.88 },
  { kind: "round", x: 9, z: -12, scale: 1.0 },
  { kind: "square", x: 0, z: 14, scale: 0.92 },
];

const STORAGE_KEY = "garden-scenery-positions";

export type SceneryPositions = {
  trees: Record<string, { x: number; z: number }>;
  huts: Record<string, { x: number; z: number }>;
};

export function defaultTreePlacements(count: number): TreePlacement[] {
  const base = BASE_TREES.slice(0, Math.min(count, BASE_TREES.length)).map((t, i) => ({
    ...t,
    id: `tree-${i}`,
  }));

  const extras: TreePlacement[] = [];
  for (let i = BASE_TREES.length; i < count; i++) {
    const t = i - BASE_TREES.length;
    const angle = t * 1.35 + 0.4;
    const r = 15 + (t % 4) * 2.5;
    extras.push({
      id: `tree-${i}`,
      kind: TREE_KINDS[i % TREE_KINDS.length],
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r * 0.85 - 1,
      scale: 0.82 + (t % 3) * 0.1,
    });
  }
  return [...base, ...extras];
}

export function defaultHutPlacements(count: number): HutPlacement[] {
  return BASE_HUTS.slice(0, count).map((h, i) => ({ ...h, id: `hut-${i}` }));
}

export function loadSceneryPositions(): SceneryPositions {
  if (typeof window === "undefined") return { trees: {}, huts: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { trees: {}, huts: {} };
    const parsed = JSON.parse(raw) as SceneryPositions;
    return {
      trees: parsed.trees ?? {},
      huts: parsed.huts ?? {},
    };
  } catch {
    return { trees: {}, huts: {} };
  }
}

export function saveSceneryPositions(positions: SceneryPositions) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

export function mergeTreePlacements(
  count: number,
  saved: SceneryPositions,
  overrides: Record<string, { x: number; z: number }>,
): TreePlacement[] {
  return defaultTreePlacements(count).map((t) => {
    const o = overrides[t.id] ?? saved.trees[t.id];
    return o ? { ...t, x: o.x, z: o.z } : t;
  });
}

export function mergeHutPlacements(
  count: number,
  saved: SceneryPositions,
  overrides: Record<string, { x: number; z: number }>,
): HutPlacement[] {
  return defaultHutPlacements(count).map((h) => {
    const o = overrides[h.id] ?? saved.huts[h.id];
    return o ? { ...h, x: o.x, z: o.z } : h;
  });
}

export function commitSceneryMove(
  positions: SceneryPositions,
  id: string,
  x: number,
  z: number,
): SceneryPositions {
  if (id.startsWith("tree-")) {
    return { ...positions, trees: { ...positions.trees, [id]: { x, z } } };
  }
  if (id.startsWith("hut-")) {
    return { ...positions, huts: { ...positions.huts, [id]: { x, z } } };
  }
  return positions;
}
