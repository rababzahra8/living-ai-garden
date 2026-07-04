import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

const RAINBOW_COLORS = ["#ff595e", "#ff924c", "#ffca3a", "#8ac926", "#52b788", "#4dabf7", "#9b5de5"];

function RainbowArc({ strength = 1, lite = false }: { strength?: number; lite?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const segments = lite ? 32 : 96;

  useFrame(({ clock }) => {
    if (!groupRef.current || lite) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.6) * 0.015;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={[0, 0.3, -20]} rotation={[0, 0, 0]}>
      {RAINBOW_COLORS.map((color, i) => (
        <mesh key={color} renderOrder={10 + i}>
          <torusGeometry args={[14 - i * 0.24, 0.14, lite ? 6 : 8, segments, Math.PI]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={(0.68 - i * 0.04) * strength}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function RainFall({ strength = 1, lite = false }: { strength?: number; lite?: boolean }) {
  const rainCount = lite ? 280 : 1400;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useMemo(
    () =>
      Array.from({ length: rainCount }, () => ({
        x: (Math.random() - 0.5) * 38,
        y: Math.random() * 18 + 2,
        z: (Math.random() - 0.5) * 28,
        speed: 0.12 + Math.random() * 0.18,
      })),
    [rainCount],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (lite && Math.floor(clock.elapsedTime * 30) % 2 === 1) return;
    drops.forEach((d, i) => {
      d.y -= d.speed;
      if (d.y < 0) {
        d.y = 14 + Math.random() * 6;
        d.x = (Math.random() - 0.5) * 38;
        d.z = (Math.random() - 0.5) * 28;
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.set(0.015, 0.08 + d.speed * 0.3, 0.015);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rainCount]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#a8c8e8" transparent opacity={0.55 * strength} depthWrite={false} />
    </instancedMesh>
  );
}

export function GardenWeatherEffects({
  weather,
  strength = 1,
  lite = false,
}: {
  weather: GardenWeather;
  strength?: number;
  lite?: boolean;
}) {
  if (weather === "clear" || strength <= 0.01) return null;

  return (
    <group frustumCulled={false}>
      {weather === "rainbow" && <RainbowArc strength={strength} lite={lite} />}
      {weather === "rain" && <RainFall strength={strength} lite={lite} />}
    </group>
  );
}
