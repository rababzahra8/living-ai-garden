import type { GardenStats } from "@/lib/garden3d/types";

export const ENERGY_PER_NEW_FLOWER = 12;
export const ENERGY_PER_MESSAGE = 4;
export const ENERGY_JOKE_BONUS = 6;

export type GardenVisuals = {
  trees: number;
  butterflies: number;
  huts: number;
  level: number;
};

/** How many 3D elements unlock as garden energy grows. */
export function visualsFromEnergy(energy: number): GardenVisuals {
  return {
    level: Math.max(1, Math.floor(energy / 25) + 1),
    trees: Math.min(14, 3 + Math.floor(energy / 20)),
    butterflies: Math.min(36, 4 + Math.floor(energy / 12)),
    huts: Math.min(5, Math.floor(energy / 35)),
  };
}

export function computeGardenStats(
  energy: number,
  seeds: { thread_id: string | null; deleted_at?: string | null }[],
): GardenStats {
  const activeFlowers = seeds.filter((s) => s.thread_id && !s.deleted_at).length;
  const memories = seeds.filter((s) => s.deleted_at != null).length;
  return { ...visualsFromEnergy(energy), flowers: activeFlowers, memories, energy };
}
