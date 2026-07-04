import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Sky } from "@react-three/drei";
import { NightSkyEffects, DaySun } from "./NightSkyEffects";
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

function DriftingClouds({
  weather,
  isNight,
  strength = 1,
  lite = false,
}: {
  weather: GardenWeather;
  isNight: boolean;
  strength?: number;
  lite?: boolean;
}) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const isRain = weather === "rain" && strength > 0.05;
  const isRainbow = weather === "rainbow" && strength > 0.05;

  const color = isNight
    ? isRain
      ? "#4a5568"
      : isRainbow
        ? "#6b7280"
        : "#374151"
    : isRain
      ? "#b0bccf"
      : isRainbow
        ? "#eef4ff"
        : "#ffffff";

  const opacity = (isNight ? (isRain ? 0.55 : 0.28) : isRain ? 0.72 : isRainbow ? 0.58 : 0.52) * Math.max(strength, isNight ? 0.65 : 0.85);

  const clouds = useMemo(() => {
    const specs: {
      x: number;
      y: number;
      z: number;
      bounds: [number, number, number];
      segments: number;
      opacityMul: number;
      drift: number;
      phase: number;
    }[] = [
      { x: -18, y: 11, z: -12, bounds: [16, 2.5, 3], segments: 20, opacityMul: 1, drift: 1.4, phase: 0 },
      { x: 6, y: 13, z: -16, bounds: [14, 2, 3], segments: 18, opacityMul: 0.9, drift: 1.1, phase: 2.1 },
      { x: -4, y: 15, z: -20, bounds: [18, 2.5, 3], segments: 22, opacityMul: 1.1, drift: 0.85, phase: 4.3 },
      { x: 14, y: 9, z: -10, bounds: [10, 1.8, 2], segments: 14, opacityMul: 0.75, drift: 1.6, phase: 1.2 },
      { x: -12, y: 8, z: -8, bounds: [12, 2, 2.5], segments: 16, opacityMul: 0.85, drift: 1.25, phase: 3.5 },
      { x: 20, y: 12, z: -18, bounds: [15, 2.2, 3], segments: 18, opacityMul: 0.95, drift: 1.0, phase: 5.8 },
      { x: -22, y: 10, z: -14, bounds: [13, 2, 2.5], segments: 16, opacityMul: 0.8, drift: 1.35, phase: 6.2 },
    ];
    if (isRain && !lite) {
      specs.push(
        { x: 0, y: 14, z: -11, bounds: [20, 2.8, 3.5], segments: 24, opacityMul: 1.2, drift: 0.7, phase: 0.8 },
        { x: -8, y: 16, z: -22, bounds: [17, 2.4, 3], segments: 20, opacityMul: 1, drift: 0.95, phase: 2.9 },
      );
    }
    if (lite) {
      return specs.slice(0, 3).map((s) => ({ ...s, segments: Math.min(s.segments, 12) }));
    }
    return specs;
  }, [isRain, lite]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < clouds.length; i++) {
      const g = refs.current[i];
      const c = clouds[i];
      if (!g) continue;
      g.position.x = c.x + ((t * c.drift + c.phase) % 56) - 28;
      g.position.y = c.y + Math.sin(t * 0.15 + c.phase) * 0.25;
    }
  });

  return (
    <>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={[c.x, c.y, c.z]}>
          <Cloud
            opacity={opacity * c.opacityMul}
            speed={0.08 + i * 0.012}
            bounds={c.bounds}
            segments={c.segments}
            color={color}
            fade={30}
            growth={4}
            volume={6}
          />
        </group>
      ))}
    </>
  );
}

export function SkyAtmosphere({
  timeOfDay,
  nightMode,
  weather = "clear",
  weatherStrength = 1,
  lite = false,
}: {
  timeOfDay: import("@/lib/garden3d/types").TimeOfDay;
  nightMode: boolean;
  weather?: GardenWeather;
  weatherStrength?: number;
  lite?: boolean;
}) {
  const isNight = nightMode || timeOfDay === "night";
  const isRain = weather === "rain" && weatherStrength > 0.05;
  const isRainbow = weather === "rainbow" && weatherStrength > 0.05;
  const sunPos = useMemo(() => {
    if (isNight) return [8, 4, -20] as [number, number, number];
    if (timeOfDay === "sunset") return [18, 3, -8] as [number, number, number];
    if (timeOfDay === "golden") return [12, 8, -6] as [number, number, number];
    return [10, 14, -4] as [number, number, number];
  }, [timeOfDay, isNight]);

  const skyBg = isNight ? "#030712" : isRain ? "#9eb0c4" : isRainbow ? "#b8d8f0" : "#87ceeb";
  const fogNear = isNight ? 18 : 28;
  const fogFar = isNight ? 75 : 110;

  return (
    <>
      {!isNight && (
        <>
          <Sky
            distance={450000}
            sunPosition={sunPos}
            turbidity={isRain ? 6 : isRainbow ? 4 : 3}
            rayleigh={isRain ? 1.2 : 2.5}
            mieCoefficient={0.004}
            mieDirectionalG={0.85}
          />
          <DaySun position={sunPos} />
        </>
      )}
      {isNight && (
        <>
          <color attach="background" args={["#030712"]} />
          <NightSkyEffects lite={lite} />
        </>
      )}
      <fog attach="fog" args={[skyBg, fogNear, fogFar]} />
      <DistantMountains />
      <DriftingClouds weather={weather} isNight={isNight} strength={weatherStrength} lite={lite} />
      {!lite && !isNight && !isRain && <Pollen />}
      {!lite && isNight && <Fireflies />}
      <ambientLight intensity={isNight ? 0.12 : isRain ? 0.32 : isRainbow ? 0.45 : 0.38} color={isNight ? "#9eb8ff" : isRain ? "#c8d4e8" : "#fff5e6"} />
      <directionalLight
        castShadow={!isNight && !lite}
        position={isNight ? [15, 28, -30] : sunPos}
        intensity={isNight ? 0.18 : isRain ? 0.6 : isRainbow ? 1.0 : 1.15}
        color={isNight ? "#c8d8ff" : timeOfDay === "sunset" ? "#ffb07c" : "#fff4dd"}
        shadow-mapSize={lite ? [512, 512] : [2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight
        args={[isNight ? "#1a1040" : "#87ceeb", isNight ? "#0a1a12" : "#3d7a4a", isNight ? 0.45 : 0.55]}
      />
    </>
  );
}
