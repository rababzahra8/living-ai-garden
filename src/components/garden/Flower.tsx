import { useId, useMemo } from "react";
import type { FlowerSpecies } from "@/lib/flower-mood";

type Palette = {
  petal: string;
  petalMid: string;
  petalDeep: string;
  petalLight: string;
  center: string;
  centerLight: string;
  leaf: string;
  leafDeep: string;
};

function buildPalette(hue: number): Palette {
  return {
    petal: `hsl(${hue} 72% 72%)`,
    petalMid: `hsl(${hue} 76% 62%)`,
    petalDeep: `hsl(${hue} 68% 48%)`,
    petalLight: `hsl(${hue} 65% 84%)`,
    center: `hsl(${(hue + 38) % 360} 78% 48%)`,
    centerLight: `hsl(${(hue + 50) % 360} 85% 62%)`,
    leaf: `hsl(142 48% 38%)`,
    leafDeep: `hsl(148 52% 28%)`,
  };
}

/** Organic teardrop petal path, tip pointing up from origin. */
const PETAL = "M0,2 C-5,0 -9,-10 -7,-22 C-4,-28 4,-28 7,-22 C9,-10 5,0 0,2 Z";

/**
 * Conversation flowers — illustration-style SVG with organic shapes,
 * layered gradients, and species-specific blooms.
 */
export function Flower({
  x,
  y,
  hue = 320,
  growth = 0,
  species = "cosmos",
  onClick,
}: {
  x: number;
  y: number;
  hue?: number;
  growth?: number;
  species?: FlowerSpecies | string;
  onClick?: () => void;
}) {
  const uid = useId().replace(/:/g, "");
  const g = Math.min(4, Math.max(0, growth));
  const kind = (species as FlowerSpecies) || "cosmos";
  const c = useMemo(() => buildPalette(hue), [hue]);

  const bloomY = -58;
  const stemTop = g >= 4 ? bloomY + 10 : g >= 3 ? -48 : g >= 2 ? -38 : g >= 1 ? -16 : 0;

  return (
    <g transform={`translate(${x} ${y})`} className="animate-sprout cursor-pointer" onClick={onClick}>
      <g transform="scale(2.4)">
      <defs>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.petalLight} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c.petalLight} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-stem`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={c.leafDeep} />
          <stop offset="100%" stopColor="oklch(0.52 0.14 142)" />
        </linearGradient>
        <linearGradient id={`${uid}-petal`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={c.petalDeep} />
          <stop offset="45%" stopColor={c.petalMid} />
          <stop offset="100%" stopColor={c.petalLight} />
        </linearGradient>
        <linearGradient id={`${uid}-petal-side`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.petalLight} />
          <stop offset="100%" stopColor={c.petalMid} />
        </linearGradient>
        <linearGradient id={`${uid}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.58 0.16 145)" />
          <stop offset="100%" stopColor={c.leafDeep} />
        </linearGradient>
        <radialGradient id={`${uid}-center`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={c.centerLight} />
          <stop offset="100%" stopColor={c.center} />
        </radialGradient>
        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={c.petalDeep} floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Ground shadow */}
      {g >= 2 && <ellipse cx="1" cy="3" rx="7" ry="2" fill="oklch(0.35 0.08 145)" opacity="0.22" />}

      {/* Seed */}
      {g === 0 && (
        <>
          <ellipse cx="0" cy="1.5" rx="3.5" ry="1.2" fill="oklch(0.35 0.08 145)" opacity="0.2" />
          <ellipse cx="0" cy="0.5" rx="3" ry="2" fill="oklch(0.42 0.06 55)" />
          <path d="M-1.5,0.5 Q0,-2 1.5,0.5" stroke="oklch(0.48 0.05 55)" strokeWidth="0.6" fill="none" />
        </>
      )}

      {/* Sprout */}
      {g >= 1 && (
        <g opacity={g === 1 ? 1 : 0.9}>
          <path d="M0,0 C-4,-6 -5,-12 -2,-14 C0,-15 0,-10 0,0" fill={`url(#${uid}-leaf)`} />
          <path d="M0,0 C4,-6 5,-12 2,-14 C0,-15 0,-10 0,0" fill={`url(#${uid}-leaf)`} />
        </g>
      )}

      {/* Stem + leaves */}
      {g >= 2 && (
        <>
          <path
            d={`M0,0 C2,${stemTop * 0.35} -1,${stemTop * 0.7} 0,${stemTop}`}
            stroke={`url(#${uid}-stem)`}
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          <Leaf uid={uid} y={stemTop * 0.38} flip={-1} />
          <Leaf uid={uid} y={stemTop * 0.58} flip={1} />
          {g >= 3 && <Leaf uid={uid} y={stemTop * 0.78} flip={-1} scale={0.85} />}
        </>
      )}

      {/* Bud */}
      {g === 3 && (
        <g transform={`translate(0 ${stemTop - 2})`} filter={`url(#${uid}-soft)`}>
          <ellipse cx="0" cy="2" rx="5" ry="7" fill={c.petalDeep} />
          <path d="M-5,2 C-6,-4 -3,-10 0,-11 C3,-10 6,-4 5,2 Z" fill={`url(#${uid}-petal)`} />
          <path d="M-3,0 C-1,-6 1,-6 3,0" stroke={c.petalLight} strokeWidth="0.7" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Full bloom */}
      {g >= 4 && (
        <g className="animate-sway" style={{ transformOrigin: `0px ${bloomY + 10}px` }}>
          <circle cx="0" cy={bloomY + 6} r="22" fill={`url(#${uid}-halo)`} className="animate-twinkle" />
          <g transform={`translate(0 ${bloomY})`} filter={`url(#${uid}-soft)`}>
            {kind === "rose" && <Rose c={c} uid={uid} />}
            {kind === "daisy" && <Daisy c={c} uid={uid} />}
            {kind === "tulip" && <Tulip c={c} uid={uid} />}
            {kind === "lavender" && <Lavender c={c} uid={uid} />}
            {(kind === "cosmos" || !["rose", "daisy", "tulip", "lavender"].includes(kind)) && (
              <Cosmos c={c} uid={uid} />
            )}
          </g>
        </g>
      )}
      </g>
    </g>
  );
}

function Leaf({
  uid,
  y,
  flip,
  scale = 1,
}: {
  uid: string;
  y: number;
  flip: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(0 ${y}) scale(${flip * scale} ${scale})`}>
      <path
        d="M0,0 C-10,2 -16,10 -12,18 C-8,14 -3,6 0,0"
        fill={`url(#${uid}-leaf)`}
      />
      <path d="M0,2 C-5,8 -8,12 -10,16" stroke="oklch(0.42 0.1 145)" strokeWidth="0.5" fill="none" opacity="0.45" />
    </g>
  );
}

function Rose({ c, uid }: { c: Palette; uid: string }) {
  const layers = [
    { rot: 0, sx: 1.15, op: 0.95 },
    { rot: 42, sx: 1.05, op: 0.92 },
    { rot: 84, sx: 1.12, op: 0.9 },
    { rot: 126, sx: 1, op: 0.88 },
    { rot: 168, sx: 1.08, op: 0.9 },
    { rot: 210, sx: 0.95, op: 0.88 },
    { rot: 252, sx: 1.02, op: 0.86 },
    { rot: 294, sx: 0.92, op: 0.84 },
  ];
  return (
    <>
      {layers.map(({ rot, sx, op }, i) => (
        <g key={i} transform={`rotate(${rot}) scale(${sx})`} opacity={op}>
          <path d={PETAL} fill={`url(#${uid}-petal)`} transform="translate(0 -2)" />
        </g>
      ))}
      {[20, 65, 110, 155, 200, 245, 290, 335].map((rot) => (
        <g key={`inner-${rot}`} transform={`rotate(${rot}) scale(0.62)`}>
          <path d={PETAL} fill={c.petalMid} transform="translate(0 -1)" opacity="0.9" />
        </g>
      ))}
      <circle cx="0" cy="0" r="5" fill={`url(#${uid}-center)`} />
      <circle cx="-1.2" cy="-1.2" r="1.5" fill="white" opacity="0.25" />
    </>
  );
}

function Daisy({ c, uid }: { c: Palette; uid: string }) {
  const count = 16;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const rot = (360 / count) * i;
        return (
          <g key={i} transform={`rotate(${rot})`}>
            <path
              d="M0,0 C-2.5,0 -3.5,-14 -2,-24 C-1,-27 1,-27 2,-24 C3.5,-14 2.5,0 0,0"
              fill={i % 2 === 0 ? c.petalLight : `url(#${uid}-petal-side)`}
              opacity="0.96"
            />
          </g>
        );
      })}
      <circle cx="0" cy="0" r="7" fill={`url(#${uid}-center)`} />
      <circle cx="0" cy="0" r="5" fill="hsl(45 88% 58%)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((rot) => (
        <circle key={rot} cx="0" cy="-2.5" r="0.9" fill="hsl(38 75% 42%)" transform={`rotate(${rot})`} />
      ))}
    </>
  );
}

function Tulip({ c, uid }: { c: Palette; uid: string }) {
  return (
    <>
      <path
        d="M-11,6 C-14,-2 -12,-16 -5,-24 C-2,-27 2,-27 5,-24 C12,-16 14,-2 11,6 C6,8 -6,8 -11,6 Z"
        fill={c.petalDeep}
      />
      <path
        d="M-8,6 C-10,-1 -8,-14 -3,-20 C0,-22 3,-20 8,-14 C10,-1 8,6 0,7 C-4,7 -8,6 -8,6 Z"
        fill={`url(#${uid}-petal)`}
      />
      <path
        d="M-4,6 C-5,0 -3,-10 0,-16 C3,-10 5,0 4,6 C2,7 -2,7 -4,6 Z"
        fill={c.petalLight}
        opacity="0.88"
      />
      <path d="M-3,-8 Q0,-14 3,-8" stroke="white" strokeWidth="0.6" fill="none" opacity="0.35" />
      <ellipse cx="0" cy="7" rx="9" ry="2.5" fill={c.petalDeep} opacity="0.55" />
    </>
  );
}

function Lavender({ c, uid }: { c: Palette; uid: string }) {
  const florets = [
    { x: 0, y: -18, r: 3.2 },
    { x: -3.5, y: -14, r: 2.8 },
    { x: 3.2, y: -13, r: 2.6 },
    { x: -2, y: -9, r: 2.5 },
    { x: 2.5, y: -8, r: 2.4 },
    { x: -3, y: -4, r: 2.6 },
    { x: 1, y: -3, r: 2.3 },
    { x: -1.5, y: 1, r: 2.5 },
    { x: 2, y: 2, r: 2.2 },
  ];
  return (
    <>
      <path
        d="M0,4 C-1,-6 1,-14 0,-20"
        stroke={`url(#${uid}-stem)`}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {florets.map(({ x, y, r }, i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle cx="0" cy="0" r={r} fill={c.petalDeep} />
          <circle cx="0" cy="0" r={r * 0.65} fill={`url(#${uid}-petal)`} />
          <circle cx={r * 0.2} cy={-r * 0.2} r={r * 0.25} fill={c.petalLight} opacity="0.7" />
        </g>
      ))}
    </>
  );
}

function Cosmos({ c, uid }: { c: Palette; uid: string }) {
  const petals = 8;
  return (
    <>
      {Array.from({ length: petals }, (_, i) => {
        const rot = (360 / petals) * i + (i % 2 === 0 ? 4 : -4);
        return (
          <g key={i} transform={`rotate(${rot})`}>
            <path
              d="M0,1 C-4,1 -7,-8 -5,-20 C-3,-26 3,-26 5,-20 C7,-8 4,1 0,1"
              fill={`url(#${uid}-petal)`}
              opacity="0.94"
            />
            <path
              d="M0,1 C-1.5,1 -2.5,-8 -1.5,-18"
              stroke={c.petalLight}
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
          </g>
        );
      })}
      <circle cx="0" cy="0" r="3" fill={c.petalDeep} />
      <circle cx="0" cy="0" r="6.5" fill={`url(#${uid}-center)`} opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((rot) => (
        <g key={rot} transform={`rotate(${rot})`}>
          <circle cx="0" cy="-3.8" r="0.7" fill="hsl(45 90% 55%)" />
          <line x1="0" y1="-3" x2="0" y2="-6.5" stroke="hsl(45 70% 45%)" strokeWidth="0.4" opacity="0.7" />
        </g>
      ))}
    </>
  );
}
