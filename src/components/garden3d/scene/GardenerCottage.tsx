import { terrainHeight } from "@/lib/garden3d/math";
import { WarmGlow, WindowGlow } from "./NightGlow";

/** Gardener's cottage behind her usual spot (x=0, z≈2). */
export function GardenerCottage({ nightMode = false }: { nightMode?: boolean }) {
  const x = 0;
  const z = -1.8;
  const y = terrainHeight(x, z);

  return (
    <group position={[x, y, z]} rotation={[0, Math.PI, 0]}>
      {/* Base */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.6, 1.1, 1.4]} />
        <meshStandardMaterial color="#8b6914" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.15, 0.75, 4]} />
        <meshStandardMaterial color="#c4a35a" roughness={0.85} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.42, 0.71]}>
        <boxGeometry args={[0.42, 0.65, 0.06]} />
        <meshStandardMaterial color="#4a3520" roughness={0.95} />
      </mesh>
      {/* Window */}
      <mesh position={[0.45, 0.72, 0.71]}>
        <boxGeometry args={[0.32, 0.32, 0.05]} />
        <meshStandardMaterial color={nightMode ? "#ffe9a8" : "#a8d4f0"} roughness={0.3} />
      </mesh>
      <mesh position={[-0.45, 0.72, 0.71]}>
        <boxGeometry args={[0.32, 0.32, 0.05]} />
        <meshStandardMaterial color={nightMode ? "#ffe9a8" : "#a8d4f0"} roughness={0.3} />
      </mesh>
      {nightMode && (
        <>
          <WindowGlow position={[0.45, 0.72, 0.74]} />
          <WindowGlow position={[-0.45, 0.72, 0.74]} />
          <WarmGlow position={[0, 0.08, 1.05]} size={0.1} />
          <pointLight position={[0, 0.75, 0.95]} intensity={2.5} color="#ffcc66" distance={9} decay={2} />
        </>
      )}
      {/* Chimney */}
      <mesh castShadow position={[0.55, 1.45, -0.2]}>
        <boxGeometry args={[0.22, 0.55, 0.22]} />
        <meshStandardMaterial color="#6b5344" roughness={0.95} />
      </mesh>
      {/* Porch step */}
      <mesh position={[0, 0.06, 0.85]}>
        <boxGeometry args={[0.9, 0.1, 0.35]} />
        <meshStandardMaterial color="#9a7b4f" roughness={0.92} />
      </mesh>
    </group>
  );
}