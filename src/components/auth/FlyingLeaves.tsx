/** Lightweight CSS-only leaf drift — no canvas, no Three.js. */

import type { CSSProperties } from "react";

const LEAVES = [
  { left: "8%", delay: "0s", duration: "19s", size: 18, drift: "a", opacity: 0.35 },
  { left: "22%", delay: "-4s", duration: "16s", size: 14, drift: "b", opacity: 0.28 },
  { left: "38%", delay: "-9s", duration: "21s", size: 22, drift: "a", opacity: 0.4 },
  { left: "55%", delay: "-2s", duration: "17s", size: 16, drift: "b", opacity: 0.32 },
  { left: "70%", delay: "-11s", duration: "20s", size: 20, drift: "a", opacity: 0.38 },
  { left: "85%", delay: "-6s", duration: "18s", size: 15, drift: "b", opacity: 0.3 },
  { left: "15%", delay: "-14s", duration: "22s", size: 24, drift: "b", opacity: 0.25 },
  { left: "48%", delay: "-7s", duration: "15s", size: 13, drift: "a", opacity: 0.34 },
  { left: "62%", delay: "-12s", duration: "23s", size: 19, drift: "b", opacity: 0.36 },
  { left: "92%", delay: "-3s", duration: "18s", size: 17, drift: "a", opacity: 0.27 },
] as const;

function LeafSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="text-leaf"
    >
      <path d="M12 3C7 8 5 12 6.5 17.5 8 22 14 21 17.5 17 20 12 17 6 12 3Z" />
    </svg>
  );
}

export function FlyingLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className={`auth-leaf auth-leaf--${leaf.drift}`}
          style={
            {
              left: leaf.left,
              top: "-5%",
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              "--leaf-opacity": leaf.opacity,
            } as CSSProperties
          }
        >
          <LeafSvg size={leaf.size} />
        </span>
      ))}
    </div>
  );
}
