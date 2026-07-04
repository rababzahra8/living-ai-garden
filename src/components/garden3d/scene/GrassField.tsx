import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";

export function GrassField({ lite = false }: { lite?: boolean }) {
  const count = lite ? 900 : 6000;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const x = (Math.random() - 0.5) * 42;
      const z = (Math.random() - 0.5) * 38;
      const y = terrainHeight(x, z);
      return {
        x,
        y,
        z,
        rot: Math.random() * Math.PI * 2,
        scale: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (lite && Math.floor(clock.elapsedTime * 30) % 2 === 1) return;
    const t = clock.elapsedTime;
    blades.forEach((b, i) => {
      const sway = Math.sin(t * 1.2 + b.phase) * 0.08;
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(sway, b.rot, sway * 0.5);
      dummy.scale.set(0.04, b.scale, 0.04);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow={!lite} receiveShadow frustumCulled>
      <coneGeometry args={[1, 3, 3]} />
      <meshStandardMaterial color="#4a8f52" roughness={0.85} flatShading />
    </instancedMesh>
  );
}
