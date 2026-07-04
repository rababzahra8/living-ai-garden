export type SeedVisual = {
  id: string;
  thread_id: string | null;
  x: number;
  y: number;
  hue: number;
  growth: number;
  species: string;
};

export type GardenMode = "landing" | "garden";

export type BloomVisual =
  | "rose"
  | "daisy"
  | "tulip"
  | "lavender"
  | "cosmos"
  | "crystal"
  | "glowTree"
  | "lotus"
  | "sunflower"
  | "cherry"
  | "worldTree";

export type TimeOfDay = "morning" | "golden" | "sunset" | "night";

export type GardenStats = {
  flowers: number;
  butterflies: number;
  trees: number;
  energy: number;
  level: number;
};
