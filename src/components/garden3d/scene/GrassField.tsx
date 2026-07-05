import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";
import { gardenPerformanceScale } from "@/lib/garden3d/weather-animation";

export function GrassField({
  lite = false,
  nightMode = false,
}: {
  lite?: boolean;
  nightMode?: boolean;
}) {
  const perf = gardenPerformanceScale(nightMode, lite);
  const count = Math.floor((lite ? 20000 : 100000) * perf);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameSkip = useRef(0);

  const blades = useMemo(() => {
    return Array.from({ length: count }, () => {
      const x = (Math.random() - 0.5) * 42;
      const z = (Math.random() - 0.5) * 38;
      const y = terrainHeight(x, z);
      return {
        x,
        y,
        z,
        rot: Math.random() * Math.PI * 2,
        scale: 0.35 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    frameSkip.current += 1;
    if (perf < 0.7 && frameSkip.current % 2 !== 0) return;

    const t = clock.elapsedTime;
    const step = Math.min(delta * 60, 2);
    blades.forEach((b, i) => {
      const sway = Math.sin(t * 1.2 + b.phase) * 0.08;
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(sway, b.rot, sway * 0.5);
      dummy.scale.set(0.04, b.scale * 0.75, 0.04);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      castShadow={!lite}
      receiveShadow
      frustumCulled
    >
      <coneGeometry args={[1, 1.6, 3]} />
      <meshStandardMaterial color="#4a8f52" roughness={0.85} flatShading />
    </instancedMesh>
  );
}
