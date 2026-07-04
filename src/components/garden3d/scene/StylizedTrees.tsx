import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";

type TreeKind = "cherry" | "oak" | "willow" | "pine" | "magic";

function TreeMesh({
  kind,
  position,
  scale = 1,
}: {
  kind: TreeKind;
  position: [number, number, number];
  scale?: number;
}) {
  const canopy = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!canopy.current) return;
    canopy.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + position[0]) * 0.02;
  });

  const trunkColor = kind === "pine" ? "#4a3728" : "#5c4033";
  const leafColor =
    kind === "cherry"
      ? "#f4a7b9"
      : kind === "magic"
        ? "#7ef0d4"
        : kind === "willow"
          ? "#6fa858"
          : kind === "pine"
            ? "#2d5a3d"
            : "#4f8f55";

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </mesh>
      <group ref={canopy} position={[0, 2.4, 0]}>
        {kind === "willow" ? (
          Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[Math.sin(i) * 0.8, -0.5 - i * 0.08, Math.cos(i) * 0.8]} castShadow>
              <capsuleGeometry args={[0.06, 1.6 - i * 0.08, 4, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </mesh>
          ))
        ) : kind === "pine" ? (
          [0, 1, 2].map((i) => (
            <mesh key={i} castShadow position={[0, i * 0.7, 0]} scale={[1.4 - i * 0.25, 1, 1.4 - i * 0.25]}>
              <coneGeometry args={[1.2 - i * 0.2, 1.4, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.85} flatShading />
            </mesh>
          ))
        ) : (
          <>
            <mesh castShadow>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial
                color={leafColor}
                roughness={0.75}
                flatShading
                emissive={kind === "magic" ? "#2dd4bf" : "#000000"}
                emissiveIntensity={kind === "magic" ? 0.35 : 0}
              />
            </mesh>
            <mesh castShadow position={[0.9, -0.2, 0.3]} scale={0.65}>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color={leafColor} roughness={0.75} flatShading />
            </mesh>
            <mesh castShadow position={[-0.7, -0.3, -0.4]} scale={0.55}>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color={leafColor} roughness={0.75} flatShading />
            </mesh>
          </>
        )}
        {kind === "cherry" &&
          Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[Math.sin(i * 1.2) * 1.2, -0.5 - i * 0.15, Math.cos(i * 1.2) * 1.2]}>
              <planeGeometry args={[0.12, 0.1]} />
              <meshBasicMaterial color="#ffb7c5" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))}
      </group>
    </group>
  );
}

const TREE_KINDS: TreeKind[] = ["cherry", "oak", "willow", "pine", "magic"];

const BASE_LAYOUT: { kind: TreeKind; x: number; z: number; scale: number }[] = [
  { kind: "cherry", x: -14, z: -2, scale: 1.15 },
  { kind: "oak", x: 14, z: -4, scale: 1.35 },
  { kind: "willow", x: 10, z: 6, scale: 1.05 },
  { kind: "pine", x: -10, z: 8, scale: 0.95 },
  { kind: "magic", x: 0, z: -10, scale: 1.2 },
];

function extraTreeLayout(count: number) {
  const extras: typeof BASE_LAYOUT = [];
  for (let i = BASE_LAYOUT.length; i < count; i++) {
    const t = i - BASE_LAYOUT.length;
    const angle = t * 1.35 + 0.4;
    const r = 15 + (t % 4) * 2.5;
    extras.push({
      kind: TREE_KINDS[i % TREE_KINDS.length],
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r * 0.85 - 1,
      scale: 0.82 + (t % 3) * 0.1,
    });
  }
  return extras;
}

export function StylizedTrees({ count = 5 }: { count?: number }) {
  const layout = useMemo(() => {
    const base = BASE_LAYOUT.slice(0, Math.min(count, BASE_LAYOUT.length));
    const extras = count > BASE_LAYOUT.length ? extraTreeLayout(count) : [];
    return [...base, ...extras];
  }, [count]);

  return (
    <group>
      {layout.map(({ kind, x, z, scale }) => (
        <TreeMesh key={`${kind}-${x}-${z}`} kind={kind} position={[x, terrainHeight(x, z), z]} scale={scale} />
      ))}
    </group>
  );
}
