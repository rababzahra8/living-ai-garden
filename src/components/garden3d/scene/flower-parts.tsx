import { useMemo } from "react";
import { leafGeometry, teardropPetalGeometry, tulipPetalGeometry } from "@/lib/garden3d/petal-geometry";
import { hslToHex } from "@/lib/garden3d/math";
import type { ToneVisual } from "@/lib/garden3d/tone-visuals";

export function PetalMat({
  color,
  emissive,
  intensity = 0.35,
}: {
  color: string;
  emissive: string;
  intensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={intensity}
      roughness={0.45}
      metalness={0.02}
    />
  );
}

export function RadialPetal({
  angle,
  length,
  width,
  color,
  emissive,
  innerRadius = 0.06,
  droop = 0.06,
  lift = 0.015,
  geometry = "teardrop",
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  emissive: string;
  innerRadius?: number;
  droop?: number;
  lift?: number;
  geometry?: "teardrop" | "tulip";
}) {
  const geo = useMemo(
    () => (geometry === "tulip" ? tulipPetalGeometry(length, width) : teardropPetalGeometry(length, width)),
    [geometry, length, width],
  );

  return (
    <group rotation={[0, angle, 0]}>
      <mesh geometry={geo} position={[0, lift, innerRadius]} rotation={[droop, 0, 0]} castShadow>
        <PetalMat color={color} emissive={emissive} />
      </mesh>
    </group>
  );
}

export function CupPetal({
  angle,
  length,
  width,
  color,
  emissive,
  tilt,
  y = 0,
  innerRadius = 0.04,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  emissive: string;
  tilt: number;
  y?: number;
  innerRadius?: number;
}) {
  const geo = useMemo(() => teardropPetalGeometry(length, width, 0.028), [length, width]);

  return (
    <group rotation={[tilt, angle, 0]} position={[0, y, 0]}>
      <mesh geometry={geo} position={[0, 0.01, innerRadius]} rotation={[0.12, 0, 0]} castShadow>
        <PetalMat color={color} emissive={emissive} intensity={0.32} />
      </mesh>
    </group>
  );
}

export function FlowerCenter({
  radius,
  color,
  emissive,
  height = 0.04,
}: {
  radius: number;
  color: string;
  emissive?: string;
  height?: number;
}) {
  return (
    <mesh position={[0, height * 0.5, 0]} castShadow>
      <cylinderGeometry args={[radius * 0.92, radius, height, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissive ? 0.35 : 0.08}
        roughness={0.75}
      />
    </mesh>
  );
}

export function petalColors(visual: ToneVisual) {
  const base = hslToHex(visual.hue, visual.saturation + 10, visual.lightness);
  const em = hslToHex(visual.hue, visual.saturation, visual.lightness - 12);
  const light = hslToHex(visual.hue, visual.saturation - 8, visual.lightness + 12);
  return { base, em, light };
}

export function ringPetals(
  count: number,
  props: { length: number; width: number; color: string; emissive: string; innerRadius?: number; droop?: number },
) {
  return Array.from({ length: count }, (_, i) => (
    <RadialPetal key={i} angle={(i / count) * Math.PI * 2} {...props} />
  ));
}

export function FlowerStem({ visual, height = 0.82 }: { visual: ToneVisual; height?: number }) {
  const leafGeo = useMemo(() => leafGeometry(0.2, 0.07), []);

  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.034, height, 8]} />
        <meshStandardMaterial color={visual.tone === "negative" ? "#5a4545" : "#2e7d48"} roughness={0.85} />
      </mesh>
      {[
        { x: 0.1, y: height * 0.35, rz: -0.55 },
        { x: -0.08, y: height * 0.52, rz: 0.5 },
      ].map((leaf, i) => (
        <mesh key={i} geometry={leafGeo} position={[leaf.x, leaf.y, 0]} rotation={[0, i * 0.4, leaf.rz]} castShadow>
          <meshStandardMaterial color="#43a047" roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}
