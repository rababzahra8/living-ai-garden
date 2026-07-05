import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";
import { WarmGlow } from "./NightGlow";

export function Gardener3D({ onClick, nightMode = false }: { onClick?: () => void; nightMode?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [walking, setWalking] = useState(false);
  const pos = useRef({ x: 0, z: 2 });

  useFrame(({ clock }, delta) => {
    if (!group.current || !body.current) return;
    const t = clock.elapsedTime;
    body.current.position.y = Math.sin(t * 1.8) * 0.04;
    body.current.rotation.y = Math.sin(t * 0.4) * 0.08 + (hovered ? 0.15 : 0);

    if (walking) {
      pos.current.x = THREE.MathUtils.lerp(pos.current.x, 0, delta * 1.5);
      pos.current.z = THREE.MathUtils.lerp(pos.current.z, 1.2, delta * 1.5);
      if (Math.abs(pos.current.x) < 0.05 && Math.abs(pos.current.z - 1.2) < 0.05) {
        setWalking(false);
        onClick?.();
      }
    }

    const y = terrainHeight(pos.current.x, pos.current.z);
    group.current.position.set(pos.current.x, y, pos.current.z);
  });

  return (
    <group ref={group}>
      <group
        ref={body}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!walking) setWalking(true);
        }}
      >
        {/* Shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.2} />
        </mesh>

        {/* Dress */}
        <mesh castShadow position={[0, 0.55, 0]}>
          <coneGeometry args={[0.35, 0.9, 8, 1, false]} />
          <meshStandardMaterial color="#4f8f6a" roughness={0.75} />
        </mesh>
        {/* Apron */}
        <mesh castShadow position={[0, 0.5, 0.12]}>
          <boxGeometry args={[0.28, 0.55, 0.04]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.85} />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#f5d5c8" roughness={0.65} />
        </mesh>
        {/* Face */}
        <mesh position={[-0.06, 1.18, 0.155]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#2a2018" roughness={0.4} />
        </mesh>
        <mesh position={[0.06, 1.18, 0.155]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#2a2018" roughness={0.4} />
        </mesh>
        <mesh position={[-0.06, 1.2, 0.17]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.06, 1.2, 0.17]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 1.08, 0.16]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.045, 0.01, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c97b6a" roughness={0.5} />
        </mesh>

        {/* Hat */}
        <mesh castShadow position={[0, 1.38, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.06, 12]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 1.45, 0]}>
          <coneGeometry args={[0.18, 0.2, 8]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.22, -0.05]}>
          <sphereGeometry args={[0.17, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>

        {/* Arms */}
        <mesh castShadow position={[-0.28, 0.7, 0]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color="#f5d5c8" />
        </mesh>
        <mesh castShadow position={[0.3, 0.72, 0.08]} rotation={[0.3, 0, -0.5]}>
          <capsuleGeometry args={[0.05, 0.25, 4, 8]} />
          <meshStandardMaterial color="#f5d5c8" />
        </mesh>

        {/* Watering can */}
        <group position={[0.38, 0.55, 0.15]} rotation={[0, -0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.18, 0.1]} />
            <meshStandardMaterial color="#c9a66b" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0.1, 0.05, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
            <meshStandardMaterial color="#b8956a" metalness={0.4} />
          </mesh>
          {nightMode && (
            <>
              <WarmGlow position={[0.12, 0.12, 0.06]} size={0.07} color="#ffdd99" />
              <pointLight position={[0.12, 0.12, 0.06]} intensity={2} color="#ffdd99" distance={5} decay={2} />
            </>
          )}
        </group>

        {/* Legs */}
        <mesh castShadow position={[-0.1, 0.18, 0]}>
          <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          <meshStandardMaterial color="#f5d5c8" />
        </mesh>
        <mesh castShadow position={[0.1, 0.18, 0]}>
          <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          <meshStandardMaterial color="#f5d5c8" />
        </mesh>
      </group>

      {(hovered || walking) && (
        <Html position={[0, 2.2, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
          <div className="glass-pill whitespace-nowrap px-3 py-1.5 text-xs font-medium text-white/90">
            ✨ Chat with me
          </div>
        </Html>
      )}
    </group>
  );
}
