import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";

const COUNT = 6000;

export function GrassField() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
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
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
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
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow receiveShadow frustumCulled>
      <coneGeometry args={[1, 3, 3]} />
      <meshStandardMaterial color="#4a8f52" roughness={0.85} flatShading />
    </instancedMesh>
  );
}
