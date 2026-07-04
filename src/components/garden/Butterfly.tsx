const PATH_CLASS = {
  1: "animate-butterfly-1",
  2: "animate-butterfly-2",
  3: "animate-butterfly-3",
  4: "animate-butterfly-4",
} as const;

export function Butterfly({
  x,
  y,
  hue = 320,
  delay = 0,
  path = 1,
  duration = 55,
}: {
  x: number;
  y: number;
  hue?: number;
  delay?: number;
  path?: keyof typeof PATH_CLASS;
  duration?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className={PATH_CLASS[path]}
        style={{
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      >
        <g className="animate-wing-left">
          <ellipse cx="-6" cy="0" rx="7" ry="10" fill={`hsl(${hue} 80% 65%)`} opacity="0.9" />
          <ellipse cx="-5" cy="6" rx="5" ry="7" fill={`hsl(${hue + 30} 80% 55%)`} opacity="0.9" />
        </g>
        <g className="animate-wing-right">
          <ellipse cx="6" cy="0" rx="7" ry="10" fill={`hsl(${hue} 80% 65%)`} opacity="0.9" />
          <ellipse cx="5" cy="6" rx="5" ry="7" fill={`hsl(${hue + 30} 80% 55%)`} opacity="0.9" />
        </g>
        <ellipse cx="0" cy="3" rx="1.4" ry="5" fill="var(--bark)" />
      </g>
    </g>
  );
}
