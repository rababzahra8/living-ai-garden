export function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-10" y="-10" width="20" height="90" rx="6" fill="var(--bark)" />
      <g className="animate-sway" style={{ transformOrigin: "0px -10px" }}>
        <circle cx="-30" cy="-40" r="50" fill="var(--leaf)" />
        <circle cx="30" cy="-50" r="55" fill="var(--leaf)" />
        <circle cx="0" cy="-80" r="55" fill="var(--leaf)" />
        <circle cx="0" cy="-40" r="55" fill="var(--grass-deep)" opacity="0.7" />
      </g>
    </g>
  );
}
