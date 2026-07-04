import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 12;

const PALETTE = [
  { wing: "#f8b4d9", edge: "#e879a9", body: "#2d2a32" },
  { wing: "#fde68a", edge: "#fbbf24", body: "#3d3428" },
  { wing: "#a5f3fc", edge: "#22d3ee", body: "#1e293b" },
  { wing: "#ddd6fe", edge: "#a78bfa", body: "#2e1065" },
  { wing: "#fecaca", edge: "#f87171", body: "#3b2020" },
  { wing: "#bbf7d0", edge: "#4ade80", body: "#14532d" },
];

type ButterflySpec = {
  phase: number;
  speed: number;
  radius: number;
  height: number;
  offset: number;
  scale: number;
  colors: (typeof PALETTE)[number];
};

function Butterfly3D({ spec }: { spec: ButterflySpec }) {
  const root = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!root.current || !leftWing.current || !rightWing.current) return;
    const t = clock.elapsedTime;
    const angle = t * spec.speed + spec.offset;
    const x = Math.cos(angle) * spec.radius;
    const z = Math.sin(angle * 0.7) * spec.radius * 0.65;
    const y = spec.height + Math.sin(t * 1.8 + spec.phase) * 0.5;
    root.current.position.set(x, y, z);
    root.current.rotation.set(
      Math.sin(t * 0.8 + spec.phase) * 0.15,
      angle + Math.PI / 2,
      Math.sin(t + spec.phase) * 0.12,
    );

    const flap = Math.abs(Math.sin(t * 14 + spec.phase)) * 0.55 + 0.1;
    leftWing.current.rotation.z = flap;
    rightWing.current.rotation.z = -flap;
  });

  const s = spec.scale;
  const { wing, edge, body } = spec.colors;

  return (
    <group ref={root} scale={s}>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0.04]} rotation={[0.5, 0, 0.25]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 4]} />
        <meshStandardMaterial color={body} />
      </mesh>
      <mesh position={[0, 0.08, -0.04]} rotation={[-0.5, 0, -0.25]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 4]} />
        <meshStandardMaterial color={body} />
      </mesh>

      <group ref={leftWing} position={[0.02, 0, 0]}>
        <mesh position={[0.14, 0.06, 0]} rotation={[0, 0, -0.3]} castShadow scale={[1.5, 1.1, 0.12]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color={wing} emissive={edge} emissiveIntensity={0.2} roughness={0.35} />
        </mesh>
        <mesh position={[0.1, -0.08, 0]} rotation={[0, 0, 0.2]} castShadow scale={[1.1, 0.75, 0.12]}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshStandardMaterial color={edge} emissive={wing} emissiveIntensity={0.12} roughness={0.4} />
        </mesh>
      </group>

      <group ref={rightWing} position={[-0.02, 0, 0]} scale={[-1, 1, 1]}>
        <mesh position={[0.14, 0.06, 0]} rotation={[0, 0, -0.3]} castShadow scale={[1.5, 1.1, 0.12]}>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color={wing} emissive={edge} emissiveIntensity={0.2} roughness={0.35} />
        </mesh>
        <mesh position={[0.1, -0.08, 0]} rotation={[0, 0, 0.2]} castShadow scale={[1.1, 0.75, 0.12]}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshStandardMaterial color={edge} emissive={wing} emissiveIntensity={0.12} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function ButterflySwarm() {
  const specs = useMemo(
    (): ButterflySpec[] =>
      Array.from({ length: COUNT }, (_, i) => ({
        phase: Math.random() * Math.PI * 2,
        speed: 0.22 + Math.random() * 0.28,
        radius: 4 + Math.random() * 7,
        height: 2 + Math.random() * 3.5,
        offset: Math.random() * Math.PI * 2,
        scale: 0.45 + Math.random() * 0.25,
        colors: PALETTE[i % PALETTE.length],
      })),
    [],
  );

  return (
    <group>
      {specs.map((spec, i) => (
        <Butterfly3D key={i} spec={spec} />
      ))}
    </group>
  );
}
