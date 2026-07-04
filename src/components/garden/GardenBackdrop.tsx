/**
 * Ambient garden backdrop: sky, sun/moon, hills, pond, grass.
 * Purely decorative — no interactive elements.
 */
export function GardenBackdrop() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--sky)" />
          <stop offset="100%" stopColor="var(--sky-2)" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--sun)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="grass-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--grass)" />
          <stop offset="100%" stopColor="var(--grass-deep)" />
        </linearGradient>
        <radialGradient id="pond-g" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--pond)" />
          <stop offset="100%" stopColor="var(--pond-deep)" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#sky)" />

      {/* Sun / moon */}
      <circle cx="1250" cy="220" r="160" fill="url(#sun)" />
      <circle cx="1250" cy="220" r="55" fill="var(--sun)" opacity="0.9" />

      {/* Distant hills */}
      <path d="M0,620 Q400,470 800,560 T1600,540 L1600,900 L0,900 Z" fill="var(--grass-deep)" opacity="0.35" />
      <path d="M0,680 Q500,560 1000,640 T1600,620 L1600,900 L0,900 Z" fill="var(--grass-deep)" opacity="0.55" />

      {/* Grass foreground */}
      <path d="M0,720 Q800,660 1600,720 L1600,900 L0,900 Z" fill="url(#grass-g)" />

      {/* Pond */}
      <ellipse cx="480" cy="820" rx="260" ry="55" fill="url(#pond-g)" />
      <ellipse cx="440" cy="810" rx="80" ry="10" fill="var(--pond)" opacity="0.6" />

      {/* Stars in dark mode */}
      <g className="hidden dark:inline">
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 173) % 1600;
          const y = ((i * 91) % 420) + 20;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 5 === 0 ? 1.6 : 1}
              fill="var(--foreground)"
              className="animate-twinkle"
              style={{ animationDelay: `${(i % 7) * 0.4}s` }}
            />
          );
        })}
      </g>
    </svg>
  );
}
