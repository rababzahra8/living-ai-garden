import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { gardenPerformanceScale, weatherAnim } from "@/lib/garden3d/weather-animation";

function effectiveStrength() {
  return weatherAnim.opacity * weatherAnim.strength;
}

function useInitInstancedMatrices(
  ref: RefObject<THREE.InstancedMesh | null>,
  count: number,
  init: (dummy: THREE.Object3D, i: number) => void,
  deps: unknown[],
) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const initialized = useRef(false);

  useEffect(() => {
    initialized.current = false;
  }, [count, ...deps]);

  useFrame(() => {
    if (!ref.current || initialized.current || count < 1) return;
    for (let i = 0; i < count; i++) init(dummy, i);
    ref.current.instanceMatrix.needsUpdate = true;
    initialized.current = true;
  });
}

function RainFall({
  lite = false,
  perf = 1,
}: {
  lite?: boolean;
  perf?: number;
}) {
  const rainCount = Math.max(1, Math.floor((lite ? 280 : 1400) * perf));
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameSkip = useRef(0);

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

  useInitInstancedMatrices(
    ref,
    rainCount,
    (d, i) => {
      const drop = drops[i];
      d.position.set(drop.x, drop.y, drop.z);
      d.scale.set(0.015, 0.08 + drop.speed * 0.3, 0.015);
      d.updateMatrix();
      ref.current!.setMatrixAt(i, d.matrix);
    },
    [drops],
  );

  useFrame((_, delta) => {
    if (!ref.current) return;
    const strength = effectiveStrength();
    if (matRef.current) matRef.current.opacity = 0.55 * strength;
    if (strength < 0.02) return;

    frameSkip.current += 1;
    if (perf < 0.7 && frameSkip.current % 2 !== 0) return;

    const step = Math.min(delta * 60, 2);
    drops.forEach((drop, i) => {
      drop.y -= drop.speed * step;
      if (drop.y < 0) {
        drop.y = 14 + Math.random() * 6;
        drop.x = (Math.random() - 0.5) * 38;
        drop.z = (Math.random() - 0.5) * 28;
      }
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.scale.set(0.015, 0.08 + drop.speed * 0.3, 0.015);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rainCount]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        color="#a8c8e8"
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function SnowFall({ lite = false, perf = 1 }: { lite?: boolean; perf?: number }) {
  const count = Math.max(1, Math.floor((lite ? 120 : 500) * perf));
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameSkip = useRef(0);

  const flakes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 36,
        y: Math.random() * 16 + 2,
        z: (Math.random() - 0.5) * 26,
        speed: 0.03 + Math.random() * 0.05,
        drift: Math.random() * Math.PI * 2,
      })),
    [count],
  );

  useInitInstancedMatrices(
    ref,
    count,
    (d, i) => {
      const flake = flakes[i];
      d.position.set(flake.x, flake.y, flake.z);
      d.scale.setScalar(0.04);
      d.updateMatrix();
      ref.current!.setMatrixAt(i, d.matrix);
    },
    [flakes],
  );

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const strength = effectiveStrength();
    if (matRef.current) matRef.current.opacity = 0.75 * strength;
    if (strength < 0.02) return;

    frameSkip.current += 1;
    if (perf < 0.7 && frameSkip.current % 2 !== 0) return;

    const t = clock.elapsedTime;
    const step = Math.min(delta * 60, 2);
    flakes.forEach((f, i) => {
      f.y -= f.speed * step;
      f.x += Math.sin(t * 0.5 + f.drift) * 0.008 * step;
      if (f.y < 0) {
        f.y = 14 + Math.random() * 4;
        f.x = (Math.random() - 0.5) * 36;
        f.z = (Math.random() - 0.5) * 26;
      }
      dummy.position.set(f.x, f.y, f.z);
      dummy.scale.setScalar(0.04);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial ref={matRef} color="#f0f8ff" transparent opacity={0.75} depthWrite={false} />
    </instancedMesh>
  );
}

const BLOSSOM_COLORS = ["#ffc8dd", "#ffafcc", "#fbb4d6", "#fde4ef", "#fff0f6"];
const LEAF_COLORS = ["#c45c26", "#d97706", "#b45309", "#92400e", "#ea580c", "#f59e0b"];
const _petalColor = new THREE.Color();

function DriftingPetals({
  count,
  lite,
  palette,
  scale = 0.06,
  speedMul = 1,
  perf = 1,
}: {
  count: number;
  lite: boolean;
  palette: string[];
  scale?: number;
  speedMul?: number;
  perf?: number;
}) {
  const n = Math.max(1, Math.floor((lite ? count * 0.25 : count) * perf));
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const frameSkip = useRef(0);

  const items = useMemo(
    () =>
      Array.from({ length: n }, () => ({
        x: (Math.random() - 0.5) * 42,
        y: Math.random() * 16 + 1,
        z: (Math.random() - 0.5) * 32,
        speed: (0.02 + Math.random() * 0.04) * speedMul,
        spin: Math.random() * Math.PI * 2,
        sway: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
      })),
    [n, palette, speedMul],
  );

  useInitInstancedMatrices(
    ref,
    n,
    (d, i) => {
      const p = items[i];
      d.position.set(p.x, p.y, p.z);
      d.rotation.set(p.spin, 0, 0);
      d.scale.set(scale, scale * 0.35, scale);
      d.updateMatrix();
      ref.current!.setMatrixAt(i, d.matrix);
      ref.current!.setColorAt(i, _petalColor.set(p.color));
    },
    [items, scale],
  );

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const strength = effectiveStrength();
    if (matRef.current) matRef.current.opacity = 0.85 * strength;
    if (strength < 0.02) return;

    frameSkip.current += 1;
    if (perf < 0.7 && frameSkip.current % 2 !== 0) return;

    const t = clock.elapsedTime;
    const step = Math.min(delta * 60, 2);
    items.forEach((p, i) => {
      p.y -= p.speed * step;
      p.x += Math.sin(t * 0.35 + p.sway) * 0.012 * step;
      p.z += Math.cos(t * 0.28 + p.sway) * 0.008 * step;
      if (p.y < 0) {
        p.y = 14 + Math.random() * 5;
        p.x = (Math.random() - 0.5) * 42;
        p.z = (Math.random() - 0.5) * 32;
      }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.spin + t * 0.4, t * 0.25, 0);
      dummy.scale.set(scale, scale * 0.35, scale);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
      ref.current!.setColorAt(i, _petalColor.set(p.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function GardenWeatherEffects({
  weather,
  lite = false,
  nightMode = false,
}: {
  weather: GardenWeather;
  lite?: boolean;
  nightMode?: boolean;
}) {
  const perf = gardenPerformanceScale(nightMode, lite);

  if (weather === "clear" || weather === "summer") return null;

  return (
    <group frustumCulled={false}>
      {weather === "rain" && <RainFall lite={lite} perf={perf} />}
      {weather === "winter" && <SnowFall lite={lite} perf={perf} />}
      {weather === "spring" && (
        <DriftingPetals
          count={950}
          lite={lite}
          palette={BLOSSOM_COLORS}
          scale={0.065}
          speedMul={0.85}
          perf={perf}
        />
      )}
      {weather === "autumn" && (
        <DriftingPetals
          count={700}
          lite={lite}
          palette={LEAF_COLORS}
          scale={0.08}
          speedMul={1.1}
          perf={perf}
        />
      )}
    </group>
  );
}
