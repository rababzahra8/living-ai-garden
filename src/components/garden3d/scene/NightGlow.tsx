import * as THREE from "three";

/** Always-visible warm glow — works even when scene lights are dim. */
export function WarmGlow({
  position,
  size = 0.14,
  color = "#ffdd88",
}: {
  position: [number, number, number];
  size?: number;
  color?: string;
}) {
  return (
    <mesh position={position} renderOrder={50}>
      <sphereGeometry args={[size, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.95} />
    </mesh>
  );
}

export function WindowGlow({
  position,
  rotation = [0, 0, 0] as [number, number, number],
  width = 0.32,
  height = 0.32,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh renderOrder={50}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffe9a8" toneMapped={false} transparent opacity={0.92} side={THREE.DoubleSide} />
      </mesh>
      <pointLight intensity={1.8} distance={7} decay={2} color="#ffcc66" position={[0, 0, 0.08]} />
    </group>
  );
}

export function TreeLanternGlow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <WarmGlow position={[0, 0, 0]} size={0.1} color="#e8ffcc" />
      <pointLight intensity={1.4} distance={6} decay={2} color="#c8ff9e" />
    </group>
  );
}
