import { useMemo } from "react";
import * as THREE from "three";
import { gardenBoundaryRing, seedToWorld, terrainHeight } from "@/lib/garden3d/math";

function FencePost({ x, z }: { x: number; z: number }) {
  const y = terrainHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 6]} />
        <meshStandardMaterial color="#6b5344" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function GardenBoundary() {
  const { posts, railPoints } = useMemo(() => {
    const ring = gardenBoundaryRing();
    const world = ring.map(([xp, yp]) => {
      const [x, , z] = seedToWorld(xp, yp);
      return new THREE.Vector3(x, terrainHeight(x, z) + 0.55, z);
    });
    if (world.length > 0) world.push(world[0].clone());
    return { posts: ring.map(([xp, yp]) => seedToWorld(xp, yp)), railPoints: world };
  }, []);

  const railGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(railPoints, true, "catmullrom", 0.2);
    return new THREE.TubeGeometry(curve, 64, 0.035, 6, true);
  }, [railPoints]);

  return (
    <group>
      {posts.map(([x, , z], i) => (
        <FencePost key={i} x={x} z={z} />
      ))}
      <mesh geometry={railGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#7a6248" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Soft inner glow marking the planting zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 4.2]}>
        <ringGeometry args={[1.8, 5.2, 48]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
