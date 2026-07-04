import { Sparkles } from "lucide-react";

const SKIN_LIGHT = "oklch(0.9 0.03 55)";
const SKIN_MID = "oklch(0.86 0.04 55)";
const SKIN_SHADOW = "oklch(0.74 0.06 45)";
const HAIR_LIGHT = "oklch(0.58 0.07 50)";
const HAIR_MID = "oklch(0.52 0.07 45)";
const HAIR_SHADOW = "oklch(0.38 0.06 40)";

export function Gardener({ x, y, onClick }: { x: number; y: number; onClick: () => void }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label="Talk to the gardener"
    >
      <defs>
        {/* Skin & body */}
        <linearGradient id="g-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={SKIN_LIGHT} />
          <stop offset="55%" stopColor={SKIN_MID} />
          <stop offset="100%" stopColor={SKIN_SHADOW} />
        </linearGradient>
        <linearGradient id="g-skin-limb" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SKIN_SHADOW} />
          <stop offset="35%" stopColor={SKIN_MID} />
          <stop offset="70%" stopColor={SKIN_LIGHT} />
          <stop offset="100%" stopColor={SKIN_SHADOW} />
        </linearGradient>

        {/* Hair */}
        <linearGradient id="g-hair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={HAIR_LIGHT} />
          <stop offset="50%" stopColor={HAIR_MID} />
          <stop offset="100%" stopColor={HAIR_SHADOW} />
        </linearGradient>

        {/* Dress */}
        <linearGradient id="g-dress" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.62 0.15 150)" />
          <stop offset="45%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="oklch(0.42 0.12 145)" />
        </linearGradient>
        <linearGradient id="g-dress-fold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.38 0.1 145)" stopOpacity="0.5" />
          <stop offset="50%" stopColor="oklch(0.55 0.14 150)" stopOpacity="0" />
          <stop offset="100%" stopColor="oklch(0.38 0.1 145)" stopOpacity="0.45" />
        </linearGradient>

        {/* Apron */}
        <linearGradient id="g-apron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.98 0.02 95)" />
          <stop offset="100%" stopColor="oklch(0.88 0.03 100)" />
        </linearGradient>

        {/* Hat */}
        <linearGradient id="g-hat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.92 0.1 55)" />
          <stop offset="100%" stopColor="oklch(0.72 0.12 50)" />
        </linearGradient>

        {/* Boots */}
        <linearGradient id="g-boot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.48 0.06 55)" />
          <stop offset="100%" stopColor="oklch(0.32 0.05 45)" />
        </linearGradient>

        {/* Watering can */}
        <linearGradient id="g-can" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.92 0.1 55)" />
          <stop offset="100%" stopColor="oklch(0.68 0.12 50)" />
        </linearGradient>

        <radialGradient id="g-head-shade" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={SKIN_LIGHT} />
          <stop offset="100%" stopColor={SKIN_SHADOW} />
        </radialGradient>

        <filter id="g-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="oklch(0.3 0.05 145)" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Warm glow */}
      <circle cx="0" cy="-30" r="72" fill="var(--sun)" opacity="0.2" className="animate-twinkle" />

      <g className="animate-bob" filter="url(#g-drop)">
        {/* Ground shadow — elliptical for depth */}
        <ellipse cx="2" cy="58" rx="32" ry="7" fill="var(--grass-deep)" opacity="0.35" />

        {/* ── Back leg (farther, slightly left) ── */}
        <g opacity="0.85">
          <ellipse cx="-6" cy="36" rx="5.5" ry="8" fill="url(#g-skin-limb)" />
          <ellipse cx="-7" cy="46" rx="5" ry="7" fill="url(#g-skin-limb)" />
          <path
            d="M-12,50 Q-7,52 -4,50 L-2,54 Q-7,58 -12,54 Z"
            fill="url(#g-boot)"
          />
          <ellipse cx="-8" cy="51" rx="3" ry="1.5" fill="oklch(0.55 0.05 55)" opacity="0.4" />
        </g>

        {/* ── Back arm ── */}
        <g transform="rotate(8 -10 -4)">
          <ellipse cx="-18" cy="6" rx="4.5" ry="9" fill="url(#g-skin-limb)" />
          <ellipse cx="-22" cy="18" rx="4" ry="8" fill="url(#g-skin-limb)" />
          <ellipse cx="-23" cy="26" rx="3.5" ry="3.5" fill="url(#g-skin)" />
        </g>

        {/* Hair back */}
        <path
          d="M-14,-28 C-26,-14 -24,8 -16,20 C-11,24 -7,18 -9,8 C-13,-4 -15,-18 -14,-28 Z"
          fill="url(#g-hair)"
        />
        <path
          d="M14,-28 C26,-14 24,8 16,20 C11,24 7,18 9,8 C13,-4 15,-18 14,-28 Z"
          fill="url(#g-hair)"
        />

        {/* Dress skirt — ends above knees to show legs */}
        <path
          d="M-14,-8 C-20,6 -22,22 -18,32 Q0,38 18,32 C22,22 20,6 14,-8 Z"
          fill="url(#g-dress)"
        />
        {/* Dress fold shadows */}
        <path d="M-14,-8 C-18,10 -16,28 -10,32 Q-4,22 -6,8 Z" fill="url(#g-dress-fold)" />
        <path d="M14,-8 C18,10 16,28 10,32 Q4,22 6,8 Z" fill="url(#g-dress-fold)" />
        {/* Bodice */}
        <path d="M-11,-8 Q0,0 11,-8 Q0,-4 -11,-8 Z" fill="oklch(0.58 0.14 150)" />

        {/* ── Front leg (closer, slightly right) ── */}
        <ellipse cx="7" cy="34" rx="6" ry="9" fill="url(#g-skin-limb)" />
        <ellipse cx="8" cy="45" rx="5.5" ry="8" fill="url(#g-skin-limb)" />
        <path
          d="M2,49 Q8,51 13,49 L15,54 Q8,59 2,55 Z"
          fill="url(#g-boot)"
        />
        <ellipse cx="10" cy="52" rx="4" ry="2" fill="oklch(0.55 0.05 55)" opacity="0.45" />

        {/* Apron */}
        <path
          d="M-10,-2 L-8,28 Q0,32 8,28 L10,-2 Q0,6 -10,-2 Z"
          fill="url(#g-apron)"
        />
        <path d="M-5,-2 L5,-2" stroke="var(--petal)" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
        <path d="M-3,8 L3,8 M-2,16 L2,16" stroke="oklch(0.85 0.03 100)" strokeWidth="0.8" opacity="0.5" />

        {/* ── Front arm — upper + forearm + hand ── */}
        <g transform="rotate(-12 12 -2)">
          <ellipse cx="20" cy="4" rx="5" ry="10" fill="url(#g-skin-limb)" />
          <ellipse cx="26" cy="16" rx="4.5" ry="9" fill="url(#g-skin-limb)" />
          <ellipse cx="28" cy="24" rx="4" ry="3.8" fill="url(#g-skin)" />
        </g>

        {/* 3D watering can */}
        <g transform="translate(26 18) rotate(-8)">
          {/* Body */}
          <path d="M-7,-5 L7,-5 L9,8 Q0,13 -9,8 Z" fill="url(#g-can)" />
          <path d="M-7,-5 L7,-5 L6,-3 L-6,-3 Z" fill="oklch(0.95 0.08 60)" />
          <ellipse cx="0" cy="-5" rx="7" ry="2" fill="oklch(0.78 0.1 55)" />
          {/* Spout */}
          <path d="M7,-2 L14,0 L13,3 L7,1 Z" fill="oklch(0.72 0.11 52)" />
          <ellipse cx="14" cy="1.5" rx="1.5" ry="2" fill="oklch(0.65 0.1 50)" />
          {/* Handle */}
          <path
            d="M-4,-5 Q-4,-14 2,-14 Q8,-14 8,-5"
            stroke="oklch(0.68 0.11 50)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-3,-5 Q-3,-12 2,-12 Q7,-12 7,-5"
            stroke="oklch(0.88 0.08 58)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Water droplet */}
          <circle cx="15" cy="4" r="2" fill="var(--sun)" className="animate-twinkle" />
        </g>

        {/* Neck */}
        <rect x="-4" y="-34" width="8" height="9" rx="3" fill="url(#g-skin-limb)" />

        {/* Head — radial shading */}
        <ellipse cx="0" cy="-28" rx="14" ry="15" fill="url(#g-head-shade)" />

        {/* Bangs */}
        <path
          d="M-13,-38 Q-6,-29 0,-31 Q6,-29 13,-38 Q9,-42 0,-40 Q-9,-42 -13,-38 Z"
          fill="url(#g-hair)"
        />

        {/* Sun hat — brim + crown with depth */}
        <ellipse cx="1" cy="-42" rx="26" ry="6" fill="oklch(0.55 0.1 48)" opacity="0.5" />
        <ellipse cx="0" cy="-43" rx="26" ry="6" fill="url(#g-hat)" />
        <path d="M-11,-43 Q0,-58 11,-43 L9,-39 Q0,-48 -9,-39 Z" fill="url(#g-hat)" />
        <path d="M-11,-43 Q0,-58 11,-43" stroke="oklch(0.95 0.08 60)" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="-13" cy="-44" r="3.2" fill="var(--petal)" />
        <circle cx="-13" cy="-44" r="1.3" fill="var(--sun)" />
        <circle cx="15" cy="-42" r="2.8" fill="var(--petal)" opacity="0.9" />
        <circle cx="15" cy="-42" r="1.1" fill="var(--sun)" />

        {/* Eyes — layered for depth */}
        <ellipse cx="-5.5" cy="-28" rx="2.2" ry="2.6" fill="white" />
        <ellipse cx="-5.5" cy="-27.5" rx="1.6" ry="2" fill="var(--foreground)" />
        <circle cx="-4.8" cy="-28.5" r="0.75" fill="white" opacity="0.9" />
        <ellipse cx="5.5" cy="-28" rx="2.2" ry="2.6" fill="white" />
        <ellipse cx="5.5" cy="-27.5" rx="1.6" ry="2" fill="var(--foreground)" />
        <circle cx="6.2" cy="-28.5" r="0.75" fill="white" opacity="0.9" />

        {/* Lashes & brows */}
        <path d="M-8.5,-30 L-6.5,-32" stroke="var(--foreground)" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M8.5,-30 L6.5,-32" stroke="var(--foreground)" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M-8,-32 Q-5.5,-33.5 -3,-32" stroke={HAIR_SHADOW} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M8,-32 Q5.5,-33.5 3,-32" stroke={HAIR_SHADOW} strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Blush */}
        <ellipse cx="-10" cy="-22" rx="3.5" ry="2.5" fill="var(--petal)" opacity="0.28" />
        <ellipse cx="10" cy="-22" rx="3.5" ry="2.5" fill="var(--petal)" opacity="0.28" />

        {/* Nose hint */}
        <ellipse cx="0" cy="-24" rx="1.2" ry="1.6" fill={SKIN_SHADOW} opacity="0.25" />

        {/* Smile */}
        <path
          d="M-4,-20 Q0,-17 4,-20"
          stroke="oklch(0.65 0.08 25)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Flower behind ear */}
        <circle cx="13" cy="-32" r="2.8" fill="var(--petal)" />
        <circle cx="13" cy="-32" r="1.1" fill="var(--sun)" />
      </g>

      <foreignObject x="-60" y="-92" width="120" height="24" style={{ pointerEvents: "none" }}>
        <div className="flex justify-center">
          <div className="flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-primary" />
            Chat with me
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
