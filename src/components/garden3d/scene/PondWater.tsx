import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";

export function PondWater() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = -0.35 + Math.sin(clock.elapsedTime * 0.6) * 0.02;
  });

  return (
    <group position={[-6, -0.35, 4]}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 48]} />
        <MeshReflectorMaterial
          blur={[300, 120]}
          resolution={512}
          mixBlur={0.8}
          mixStrength={1.2}
          roughness={0.15}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#4a8fa8"
          metalness={0.35}
          mirror={0.45}
        />
      </mesh>
      {[
        [-1.2, 0.8, 0.3],
        [0.6, -0.5, -0.4],
        [1.5, 0.2, 0.8],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, r, 0]} castShadow>
          <circleGeometry args={[0.55, 16, 0, Math.PI * 1.85]} />
          <meshStandardMaterial color="#3d7a48" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2) * 1.5, -0.05, Math.cos(i * 2) * 1.2]} rotation={[0, i, 0]}>
          <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
          <meshStandardMaterial
            color={i ? "#f4a261" : "#ffffff"}
            emissive={i ? "#f4a261" : "#ffffff"}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
