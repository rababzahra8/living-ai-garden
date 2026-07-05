import { useMemo, useState } from "react";
import { Float, Html } from "@react-three/drei";
import type { SeedVisual } from "@/lib/garden3d/types";
import { seedToWorld } from "@/lib/garden3d/math";

export function MemoryStone({ seed }: { seed: SeedVisual }) {
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = seedToWorld(seed.x, seed.y);
  const tilt = useMemo(() => [0.08, (seed.id.charCodeAt(0) % 10) * 0.06, 0.12] as const, [seed.id]);

  return (
    <Float speed={0.2} rotationIntensity={0.004} floatIntensity={0.015}>
      <group
        position={[x, y, z]}
        rotation={tilt}
        scale={0.9}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "default";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.14, 0.24, 32]} />
          <meshBasicMaterial color="#64748b" transparent opacity={hovered ? 0.45 : 0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.14, 0]} scale={[0.5, 0.32, 0.42]}>
          <dodecahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.92} metalness={0.05} />
        </mesh>
        <mesh castShadow position={[0.12, 0.08, 0.1]} scale={[0.28, 0.2, 0.24]}>
          <dodecahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#64748b" roughness={0.95} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.28, 24]} />
          <meshStandardMaterial color="#475569" roughness={1} />
        </mesh>
        {hovered && (
          <Html center position={[0, 0.75, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div className="rounded-full border border-white/20 bg-slate-800/80 px-2.5 py-1 text-center text-sm font-bold tabular-nums text-white/85 shadow-lg backdrop-blur-sm">
              #{seed.conversation_number}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}
