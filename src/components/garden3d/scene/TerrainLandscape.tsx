import { useMemo, useRef } from "react";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";

const SIZE = 64;
const WORLD = 48;

export function TerrainLandscape() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD, WORLD, SIZE, SIZE);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const cLow = new THREE.Color("#3d6b45");
    const cMid = new THREE.Color("#4f8f55");
    const cHigh = new THREE.Color("#6bab62");
    const cTop = new THREE.Color("#8ecf7a");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      const t = THREE.MathUtils.clamp((h + 0.5) / 1.4, 0, 1);
      const col = cLow.clone().lerp(cMid, t * 0.5).lerp(cHigh, t * 0.8).lerp(cTop, Math.max(0, t - 0.6) * 2.5);
      colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
    </mesh>
  );
}

/** Decorative rocks & mushrooms scattered on terrain. */
export function TerrainDetails() {
  const items = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const x = (Math.sin(i * 2.17) * 0.5 + 0.5) * 36 - 18;
        const z = (Math.cos(i * 1.73) * 0.5 + 0.5) * 24 - 8;
        const y = terrainHeight(x, z);
        return { x, y, z, kind: i % 5 === 0 ? "mushroom" : "rock", s: 0.3 + (i % 4) * 0.12, i };
      }),
    [],
  );

  return (
    <group>
      {items.map(({ x, y, z, kind, s, i }) =>
        kind === "mushroom" ? (
          <group key={i} position={[x, y, z]}>
            <mesh castShadow position={[0, s * 0.35, 0]}>
              <cylinderGeometry args={[s * 0.15, s * 0.2, s * 0.7, 6]} />
              <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0, s * 0.75, 0]}>
              <sphereGeometry args={[s * 0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={i % 2 ? "#c45c5c" : "#d4a84b"} roughness={0.75} />
            </mesh>
          </group>
        ) : (
          <mesh key={i} castShadow position={[x, y + s * 0.2, z]} scale={s}>
            <dodecahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color="#6a7a72" roughness={0.95} flatShading />
          </mesh>
        ),
      )}
    </group>
  );
}
