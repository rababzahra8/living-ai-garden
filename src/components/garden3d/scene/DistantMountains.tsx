import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { weatherAnim } from "@/lib/garden3d/weather-animation";

type PeakSpec = {
  x: number;
  y: number;
  z: number;
  r: number;
  h: number;
  segs: number;
  rot?: number;
  rock: string;
  /** 0 = full color, 1 = heavy atmospheric haze */
  haze?: number;
};

const BACK_RANGE: PeakSpec[] = [
  { x: -28, y: 0.5, z: -36, r: 9, h: 7, segs: 7, rock: "#7a8f9a", haze: 0.72 },
  { x: -14, y: 0.2, z: -38, r: 11, h: 9, segs: 8, rock: "#6d8490", haze: 0.78 },
  { x: 2, y: 0, z: -37, r: 13, h: 11, segs: 8, rock: "#647d88", haze: 0.8 },
  { x: 18, y: 0.3, z: -36, r: 10, h: 8.5, segs: 7, rock: "#708894", haze: 0.75 },
  { x: 32, y: 0.4, z: -35, r: 8, h: 6.5, segs: 6, rock: "#7a9098", haze: 0.7 },
];

const MID_RANGE: PeakSpec[] = [
  { x: -22, y: 0.8, z: -30, r: 12, h: 10, segs: 9, rot: 0.12, rock: "#4f6d62", haze: 0.35 },
  { x: -6, y: 0.5, z: -31, r: 15, h: 12.5, segs: 10, rock: "#456258", haze: 0.3 },
  { x: 10, y: 0.6, z: -29, r: 14, h: 11.5, segs: 9, rot: -0.1, rock: "#4a685c", haze: 0.32 },
  { x: 26, y: 0.7, z: -30, r: 11, h: 9.5, segs: 8, rock: "#527064", haze: 0.38 },
];

const FRONT_RANGE: PeakSpec[] = [
  { x: -16, y: 1.2, z: -24, r: 14, h: 11, segs: 10, rot: 0.18, rock: "#3d5a4e", haze: 0.08 },
  { x: 4, y: 1, z: -23, r: 18, h: 13.5, segs: 11, rock: "#354f45", haze: 0.05 },
  { x: 22, y: 1.1, z: -25, r: 13, h: 10.5, segs: 9, rot: -0.14, rock: "#3a564a", haze: 0.1 },
];

const HAZE = new THREE.Color("#c5d8e8");
const WINTER_ROCK = new THREE.Color("#6a7d88");
const _rock = new THREE.Color();
const _snow = new THREE.Color("#f2f7fc");

function MountainPeak({
  spec,
  snowMixRef,
  isNight,
}: {
  spec: PeakSpec;
  snowMixRef: MutableRefObject<number>;
  isNight: boolean;
}) {
  const rockMat = useRef<THREE.MeshStandardMaterial>(null);
  const snowMat = useRef<THREE.MeshStandardMaterial>(null);
  const snowMesh = useRef<THREE.Mesh>(null);

  const baseRock = useMemo(() => new THREE.Color(spec.rock), [spec.rock]);
  const hazeRock = useMemo(() => {
    const c = baseRock.clone();
    return c.lerp(HAZE, spec.haze ?? 0);
  }, [baseRock, spec.haze]);

  useFrame(() => {
    const snow = snowMixRef.current;
    const night = isNight ? 0.72 : 1;

    if (rockMat.current) {
      _rock.copy(hazeRock);
      if (snow > 0.02) _rock.lerp(WINTER_ROCK, snow * 0.45);
      _rock.multiplyScalar(night);
      rockMat.current.color.copy(_rock);
    }

    if (snowMat.current && snowMesh.current) {
      const visible = snow > 0.02;
      snowMesh.current.visible = visible;
      if (visible) {
        const cap = THREE.MathUtils.clamp(snow * 1.1, 0, 1);
        snowMesh.current.scale.set(cap, cap * (0.85 + (spec.haze ?? 0) * 0.15), cap);
        snowMat.current.opacity = cap * 0.96;
        _snow.set("#f2f7fc").multiplyScalar(isNight ? 0.85 : 1);
        snowMat.current.color.copy(_snow);
      }
    }
  });

  return (
    <group position={[spec.x, spec.y, spec.z]} rotation={[0, spec.rot ?? 0, 0]}>
      <mesh position={[0, spec.h * 0.38, 0]} castShadow={!isNight}>
        <coneGeometry args={[spec.r, spec.h, spec.segs]} />
        <meshStandardMaterial ref={rockMat} roughness={0.94} metalness={0.02} flatShading />
      </mesh>
      <mesh ref={snowMesh} position={[0, spec.h * 0.78, 0]} visible={false}>
        <coneGeometry args={[spec.r * 0.52, spec.h * 0.36, Math.max(6, spec.segs - 2)]} />
        <meshStandardMaterial
          ref={snowMat}
          transparent
          opacity={0}
          roughness={0.82}
          metalness={0.04}
          flatShading
        />
      </mesh>
    </group>
  );
}

export function DistantMountains({
  weather,
  isNight,
  lite = false,
}: {
  weather: GardenWeather;
  isNight: boolean;
  lite?: boolean;
}) {
  const snowMix = useRef(0);
  const peaks = lite ? [...FRONT_RANGE.slice(0, 2)] : [...BACK_RANGE, ...MID_RANGE, ...FRONT_RANGE];

  useFrame(() => {
    const target =
      weather === "winter" || weatherAnim.weather === "winter"
        ? weatherAnim.opacity * weatherAnim.strength
        : 0;
    snowMix.current = THREE.MathUtils.lerp(snowMix.current, target, 0.07);
  });

  return (
    <group position={[0, -0.35, 0]}>
      {peaks.map((spec, i) => (
        <MountainPeak key={i} spec={spec} snowMixRef={snowMix} isNight={isNight} />
      ))}
    </group>
  );
}
