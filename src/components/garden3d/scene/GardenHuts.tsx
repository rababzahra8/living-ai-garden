import { useMemo } from "react";
import { terrainHeight } from "@/lib/garden3d/math";

const KINDS = ["round", "square", "tall"] as const;

function HutMesh({
  position,
  scale = 1,
  kind,
}: {
  position: [number, number, number];
  scale?: number;
  kind: (typeof KINDS)[number];
}) {
  const wall = kind === "tall" ? "#7a5c3a" : "#8b6914";
  const roof = kind === "square" ? "#b8956a" : "#c4a35a";
  const w = kind === "tall" ? 0.9 : 1.15;
  const h = kind === "tall" ? 1.0 : 0.75;

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, h * 0.5, 0]}>
        <boxGeometry args={[w, h, w * 0.95]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, h + 0.35, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[w * 0.85, 0.65, 4]} />
        <meshStandardMaterial color={roof} roughness={0.88} />
      </mesh>
      <mesh position={[0, h * 0.35, w * 0.48]}>
        <boxGeometry args={[0.28, 0.42, 0.04]} />
        <meshStandardMaterial color="#4a3520" roughness={0.95} />
      </mesh>
    </group>
  );
}

function hutLayout(count: number) {
  const spots: { x: number; z: number; scale: number; kind: (typeof KINDS)[number] }[] = [
    { x: -12, z: 12, scale: 0.95, kind: "round" },
    { x: 13, z: 10, scale: 1.05, kind: "square" },
    { x: -8, z: -11, scale: 0.88, kind: "tall" },
    { x: 9, z: -12, scale: 1.0, kind: "round" },
    { x: 0, z: 14, scale: 0.92, kind: "square" },
  ];
  return spots.slice(0, count);
}

export function GardenHuts({ count = 0 }: { count?: number }) {
  const huts = useMemo(() => hutLayout(count), [count]);
  if (huts.length === 0) return null;

  return (
    <group>
      {huts.map(({ x, z, scale, kind }, i) => (
        <HutMesh key={i} kind={kind} scale={scale} position={[x, terrainHeight(x, z), z]} />
      ))}
    </group>
  );
}
