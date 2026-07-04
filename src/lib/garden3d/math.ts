/** Deterministic hash for procedural variation per seed. */
export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function seededRandom(seed: number, offset = 0): number {
  const x = Math.sin((seed + offset) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Rolling meadow height — smooth stylized hills. */
export function terrainHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.11) * 0.55 +
    Math.cos(z * 0.09) * 0.45 +
    Math.sin(x * 0.22 + z * 0.17) * 0.28 +
    Math.cos(x * 0.05 - z * 0.07) * 0.18
  );
}

export function terrainNormal(x: number, z: number): [number, number, number] {
  const e = 0.15;
  const h = terrainHeight(x, z);
  const hx = terrainHeight(x + e, z) - h;
  const hz = terrainHeight(x, z + e) - h;
  const len = Math.hypot(-hx, 1, -hz) || 1;
  return [-hx / len, 1 / len, -hz / len];
}

/** Map seed percent coords to a visible meadow arc in front of the camera. */
export function seedToWorld(xPct: number, yPct: number): [number, number, number] {
  const angle = (xPct / 100) * Math.PI * 1.2 - Math.PI * 0.6;
  const radius = 2.5 + (yPct / 100) * 6.5;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius * 0.55 + 3;
  const y = terrainHeight(x, z);
  return [x, y, z];
}

/** Centroid of all seeds — used to frame the camera. */
export function seedsCentroid(seeds: { x: number; y: number }[]): [number, number, number] {
  if (seeds.length === 0) return [0, 1.5, 3];
  let sx = 0;
  let sy = 0;
  let sz = 0;
  for (const s of seeds) {
    const [x, y, z] = seedToWorld(s.x, s.y);
    sx += x;
    sy += y;
    sz += z;
  }
  const n = seeds.length;
  return [sx / n, sy / n + 1.2, sz / n];
}

export function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
