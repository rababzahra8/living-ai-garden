export type SeedVisual = {
  id: string;
  thread_id: string | null;
  x: number;
  y: number;
  hue: number;
  growth: number;
  species: string;
  conversation_number: number;
  deleted_at?: string | null;
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
  memories: number;
  butterflies: number;
  trees: number;
  huts: number;
  energy: number;
  level: number;
};
