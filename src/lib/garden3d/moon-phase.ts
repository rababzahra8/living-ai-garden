/** Lunar cycle helpers — real date-based moon phases. */

const LUNAR_CYCLE = 29.530588853;
/** Reference new moon (UTC). */
const KNOWN_NEW_MOON = Date.UTC(2024, 0, 11, 11, 57, 0);

export type MoonPhaseName =
  | "new"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type MoonPhaseInfo = {
  name: MoonPhaseName;
  label: string;
  illumination: number;
  /** 0–29.5 days since last new moon */
  age: number;
  waxing: boolean;
};

export function getMoonPhase(date = new Date()): MoonPhaseInfo {
  const days = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const age = ((days % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  const illumination = (1 - Math.cos((age / LUNAR_CYCLE) * Math.PI * 2)) / 2;
  const waxing = age < LUNAR_CYCLE / 2;

  let name: MoonPhaseName;
  if (illumination < 0.03) name = "new";
  else if (age < 6.5) name = "waxing_crescent";
  else if (age < 8.5) name = "first_quarter";
  else if (age < 13.5) name = "waxing_gibbous";
  else if (age < 16.5) name = "full";
  else if (age < 21.5) name = "waning_gibbous";
  else if (age < 23.5) name = "last_quarter";
  else name = "waning_crescent";

  const labels: Record<MoonPhaseName, string> = {
    new: "New Moon",
    waxing_crescent: "Waxing Crescent",
    first_quarter: "First Quarter",
    waxing_gibbous: "Waxing Gibbous",
    full: "Full Moon",
    waning_gibbous: "Waning Gibbous",
    last_quarter: "Last Quarter",
    waning_crescent: "Waning Crescent",
  };

  return { name, label: labels[name], illumination, age, waxing };
}

/** Canvas texture showing the current moon phase. */
export function createMoonPhaseTexture(info: MoonPhaseInfo, size = 256): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  ctx.clearRect(0, 0, size, size);

  // Glow halo
  const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.35);
  glow.addColorStop(0, "rgba(200, 220, 255, 0.35)");
  glow.addColorStop(1, "rgba(200, 220, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  if (info.illumination < 0.02) {
    // New moon — faint silver disc so it's still findable in the sky
    ctx.fillStyle = "rgba(200, 210, 230, 0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(210, 220, 240, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    return canvas;
  }

  // Lit disc — correct crescent / gibbous shape for all 8 phases
  ctx.fillStyle = "#eef2ff";
  ctx.beginPath();
  if (info.illumination >= 0.98) {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else {
    const limb = r * (1 - info.illumination * 2);
    if (info.waxing) {
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
      ctx.arc(cx + limb, cy, r, Math.PI / 2, -Math.PI / 2, true);
    } else {
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2);
      ctx.arc(cx - limb, cy, r, -Math.PI / 2, Math.PI / 2, true);
    }
    ctx.closePath();
  }
  ctx.fill();

  // Subtle crater shading
  ctx.fillStyle = "rgba(160, 170, 200, 0.12)";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cr = r * (0.15 + (i % 3) * 0.08);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.35, cy + Math.sin(a) * r * 0.3, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
