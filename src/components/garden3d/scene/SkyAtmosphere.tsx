import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

function Pollen({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = Math.random() * 12 + 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.015;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(clock.elapsedTime * 0.4 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#fff8e7" transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function Fireflies({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = Math.random() * 4 + 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 2) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#c8ff9e" transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

function DistantMountains() {
  return (
    <group position={[0, -0.5, -28]}>
      <mesh position={[-12, 2, 0]} rotation={[0, 0.2, 0]}>
        <coneGeometry args={[14, 8, 4]} />
        <meshStandardMaterial color="#7a9a8a" roughness={1} />
      </mesh>
      <mesh position={[8, 1.5, -2]} rotation={[0, -0.15, 0]}>
        <coneGeometry args={[18, 10, 5]} />
        <meshStandardMaterial color="#6b8f7d" roughness={1} />
      </mesh>
      <mesh position={[0, 1, 3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[22, 11, 6]} />
        <meshStandardMaterial color="#5f8574" roughness={1} />
      </mesh>
    </group>
  );
}

function DayClouds({ weather }: { weather: GardenWeather }) {
  const isRain = weather === "rain";
  const isRainbow = weather === "rainbow";
  const color = isRain ? "#b0bccf" : isRainbow ? "#eef4ff" : "#ffffff";
  const opacity = isRain ? 0.72 : isRainbow ? 0.58 : 0.52;
  const speed = isRain ? 0.06 : 0.1;

  const layers: { pos: [number, number, number]; bounds: [number, number, number]; segments: number; opacityMul: number }[] = [
    { pos: [-10, 10, -14], bounds: [16, 2.5, 3], segments: 20, opacityMul: 1 },
    { pos: [12, 12, -18], bounds: [14, 2, 3], segments: 18, opacityMul: 0.9 },
    { pos: [0, 14, -22], bounds: [18, 2.5, 3], segments: 22, opacityMul: 1.1 },
    { pos: [-6, 8, -10], bounds: [10, 1.8, 2], segments: 14, opacityMul: 0.75 },
    { pos: [8, 9, -12], bounds: [12, 2, 2.5], segments: 16, opacityMul: 0.85 },
  ];

  return (
    <>
      {layers.map(({ pos, bounds, segments, opacityMul }, i) => (
        <Cloud
          key={i}
          opacity={opacity * opacityMul}
          speed={speed + i * 0.015}
          bounds={bounds}
          segments={segments}
          color={color}
          position={pos}
          fade={30}
          growth={4}
          volume={6}
        />
      ))}
    </>
  );
}

export function SkyAtmosphere({
  timeOfDay,
  nightMode,
  weather = "clear",
}: {
  timeOfDay: import("@/lib/garden3d/types").TimeOfDay;
  nightMode: boolean;
  weather?: GardenWeather;
}) {
  const isNight = nightMode || timeOfDay === "night";
  const isRain = weather === "rain";
  const isRainbow = weather === "rainbow";
  const sunPos = useMemo(() => {
    if (isNight) return [8, 4, -20] as [number, number, number];
    if (timeOfDay === "sunset") return [18, 3, -8] as [number, number, number];
    if (timeOfDay === "golden") return [12, 8, -6] as [number, number, number];
    return [10, 14, -4] as [number, number, number];
  }, [timeOfDay, isNight]);

  const skyBg = isNight ? "#0f172a" : isRain ? "#9eb0c4" : isRainbow ? "#b8d8f0" : "#87ceeb";
  const fogNear = isNight ? 22 : 28;
  const fogFar = isNight ? 90 : 110;

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={sunPos}
        turbidity={isNight ? 2 : isRain ? 6 : isRainbow ? 4 : 3}
        rayleigh={isNight ? 0.5 : isRain ? 1.2 : 2.5}
        mieCoefficient={0.004}
        mieDirectionalG={0.85}
      />
      <fog attach="fog" args={[skyBg, fogNear, fogFar]} />
      <DistantMountains />
      {!isNight && (
        <>
          <DayClouds weather={weather} />
          {!isRain && <Pollen />}
        </>
      )}
      {isNight && (
        <>
          <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={0.5} />
          <Fireflies />
        </>
      )}
      <ambientLight intensity={isNight ? 0.15 : isRain ? 0.32 : isRainbow ? 0.45 : 0.38} color={isNight ? "#8eb4ff" : isRain ? "#c8d4e8" : "#fff5e6"} />
      <directionalLight
        castShadow
        position={sunPos}
        intensity={isNight ? 0.25 : isRain ? 0.6 : isRainbow ? 1.0 : 1.15}
        color={isNight ? "#a8c8ff" : timeOfDay === "sunset" ? "#ffb07c" : "#fff4dd"}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight
        args={[isNight ? "#1e293b" : "#87ceeb", isNight ? "#0f2918" : "#3d7a4a", isNight ? 0.35 : 0.55]}
      />
    </>
  );
}
