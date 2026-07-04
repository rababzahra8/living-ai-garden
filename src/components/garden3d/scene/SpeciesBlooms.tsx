import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { FlowerSpecies } from "@/lib/flower-mood";
import { hslToHex, seededRandom } from "@/lib/garden3d/math";
import type { ToneVisual } from "@/lib/garden3d/tone-visuals";
import {
  CupPetal,
  FlowerCenter,
  RadialPetal,
  petalColors,
  ringPetals,
} from "./flower-parts";

function SunflowerBloom({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.15 + seed) * 0.03;
  });
  return (
    <group ref={group}>
      {Array.from({ length: 24 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 24) * Math.PI * 2}
          color={i % 4 === 0 ? "#ffb347" : "#ffe066"}
          emissive="#f5a623"
          length={0.48 + seededRandom(seed, i) * 0.1}
          width={0.1}
          innerRadius={0.14}
          droop={0.05}
        />
      ))}
      <FlowerCenter radius={0.2} color="#5c3d1e" height={0.06} />
    </group>
  );
}

function DaisyBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const { base, em, light } = petalColors(visual);
  return (
    <group>
      {ringPetals(16, { length: 0.42, width: 0.09, color: light, emissive: em, innerRadius: 0.08, droop: 0.04 })}
      <FlowerCenter radius={0.1} color={hslToHex(45, 85, 55)} emissive="#f59e0b" height={0.04} />
    </group>
  );
}

function RoseLayers({ visual, seed, layers, dark = false }: { visual: ToneVisual; seed: number; layers: number; dark?: boolean }) {
  const { base, em } = petalColors(visual);
  const color = dark ? hslToHex(visual.hue, visual.saturation + 5, visual.lightness - 22) : base;
  return (
    <group>
      {Array.from({ length: layers }).map((_, li) =>
        Array.from({ length: 5 + li * 2 }).map((_, i) => (
          <CupPetal
            key={`${li}-${i}`}
            angle={(i / (5 + li * 2)) * Math.PI * 2 + li * 0.35}
            color={color}
            emissive={em}
            length={0.18 + li * 0.04}
            width={0.08 + li * 0.015}
            tilt={0.7 - li * 0.08}
            y={li * 0.04}
            innerRadius={0.02 + li * 0.02}
          />
        )),
      )}
    </group>
  );
}

function TulipCup({ visual, count = 6 }: { visual: ToneVisual; count?: number }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / count) * Math.PI * 2}
          color={base}
          emissive={em}
          length={0.4}
          width={0.13}
          innerRadius={0.05}
          droop={0.95}
          geometry="tulip"
        />
      ))}
      <FlowerCenter radius={0.05} color={hslToHex(visual.hue, 40, 35)} height={0.07} />
    </group>
  );
}

function LotusBloom({ visual }: { visual: ToneVisual }) {
  const { base, em, light } = petalColors(visual);
  return (
    <group rotation={[0.15, 0, 0]}>
      {[0.55, 0.42, 0.3].map((len, ring) =>
        Array.from({ length: 8 }).map((_, i) => (
          <RadialPetal
            key={`${ring}-${i}`}
            angle={(i / 8) * Math.PI * 2 + ring * 0.2}
            color={ring === 0 ? light : base}
            emissive={em}
            length={len}
            width={0.14 - ring * 0.02}
            innerRadius={0.04 + ring * 0.06}
            droop={-0.08 + ring * 0.04}
          />
        )),
      )}
      <FlowerCenter radius={0.08} color="#ffd54f" emissive="#ffb300" height={0.05} />
    </group>
  );
}

function HibiscusBloom({ visual }: { visual: ToneVisual }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      {ringPetals(5, { length: 0.52, width: 0.16, color: base, emissive: em, innerRadius: 0.1, droop: 0.02 })}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
        <meshStandardMaterial color="#ffd54f" emissive="#ff8f00" emissiveIntensity={0.4} />
      </mesh>
      <FlowerCenter radius={0.06} color="#c62828" height={0.03} />
    </group>
  );
}

function CherryBlossomBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const pink = hslToHex(visual.hue, 55, 82);
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 5) * Math.PI * 2 + 0.1}
          color={pink}
          emissive={hslToHex(visual.hue, 45, 70)}
          length={0.28 + seededRandom(seed, i) * 0.04}
          width={0.09}
          innerRadius={0.04}
          droop={0.03}
        />
      ))}
      <FlowerCenter radius={0.035} color="#fff59d" emissive="#ffee58" height={0.025} />
    </group>
  );
}

function ChamomileBloom({ visual }: { visual: ToneVisual }) {
  return (
    <group scale={0.85}>
      {ringPetals(12, { length: 0.32, width: 0.07, color: "#fffef5", emissive: "#fff8dc", innerRadius: 0.06, droop: 0.05 })}
      <FlowerCenter radius={0.09} color={hslToHex(visual.hue, 70, 55)} emissive="#ffb300" height={0.05} />
    </group>
  );
}

function BellSpike({ visual, count, droop = 0.9 }: { visual: ToneVisual; count: number; droop?: number }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.014, 0.36, 6]} />
        <meshStandardMaterial color="#3d5c34" roughness={0.9} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[0, 0.08 + i * 0.09, 0]} rotation={[0, i * 0.8, 0]}>
          <RadialPetal angle={0} color={base} emissive={em} length={0.14} width={0.055} innerRadius={0.02} droop={droop} geometry="tulip" />
          <RadialPetal angle={Math.PI} color={base} emissive={em} length={0.14} width={0.055} innerRadius={0.02} droop={droop} geometry="tulip" />
        </group>
      ))}
    </group>
  );
}

function EdelweissBloom({ visual }: { visual: ToneVisual }) {
  const white = hslToHex(visual.hue, 8, 92);
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 12) * Math.PI * 2}
          color={white}
          emissive="#e8e8e8"
          length={0.22}
          width={0.045}
          innerRadius={0.05}
          droop={0.08}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <RadialPetal
          key={`f-${i}`}
          angle={(i / 8) * Math.PI * 2 + 0.2}
          color="#f5f5f0"
          emissive="#ddd"
          length={0.12}
          width={0.025}
          innerRadius={0.03}
          droop={0.15}
        />
      ))}
      <FlowerCenter radius={0.05} color="#c5a028" height={0.03} />
    </group>
  );
}

function AsterBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      {Array.from({ length: 22 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 22) * Math.PI * 2}
          color={base}
          emissive={em}
          length={0.28 + seededRandom(seed, i) * 0.05}
          width={0.045}
          innerRadius={0.07}
          droop={0.06}
        />
      ))}
      <FlowerCenter radius={0.09} color={hslToHex((visual.hue + 40) % 360, 75, 45)} emissive="#ffb300" height={0.04} />
    </group>
  );
}

function HydrangeaBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const { base, em, light } = petalColors(visual);
  const clusters = 18;
  return (
    <group>
      {Array.from({ length: clusters }).map((_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / clusters);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.22;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi) * 0.85 + 0.05;
        const z = r * Math.sin(phi) * Math.sin(theta);
        return (
          <group key={i} position={[x, y, z]} scale={0.35}>
            {ringPetals(4, {
              length: 0.14,
              width: 0.05,
              color: i % 3 === 0 ? light : base,
              emissive: em,
              innerRadius: 0.02,
              droop: 0.02,
            })}
          </group>
        );
      })}
    </group>
  );
}

function BleedingHeartBloom({ visual }: { visual: ToneVisual }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.4, 6]} />
        <meshStandardMaterial color="#4a6741" />
      </mesh>
      {[-0.08, 0.08].map((x, i) => (
        <group key={i} position={[x, 0.22 - i * 0.04, 0]} rotation={[0.4, 0, x > 0 ? 0.25 : -0.25]}>
          <CupPetal angle={0} color={base} emissive={em} length={0.2} width={0.1} tilt={0.2} innerRadius={0.02} />
          <CupPetal angle={Math.PI} color={em} emissive={base} length={0.18} width={0.09} tilt={0.15} innerRadius={0.02} />
        </group>
      ))}
    </group>
  );
}

function PassionflowerBloom({ visual }: { visual: ToneVisual }) {
  const { base, em, light } = petalColors(visual);
  return (
    <group>
      {ringPetals(10, { length: 0.38, width: 0.08, color: light, emissive: em, innerRadius: 0.1, droop: 0.03 })}
      {ringPetals(5, { length: 0.22, width: 0.05, color: base, emissive: em, innerRadius: 0.06, droop: 0.5 })}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.05, 8]} />
        <meshStandardMaterial color="#5c3d1e" />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} rotation={[0.8, (i / 5) * Math.PI * 2, 0]} position={[0, 0.02, 0.04]}>
          <boxGeometry args={[0.008, 0.06, 0.008]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
}

function MarigoldBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      {Array.from({ length: 3 }).map((_, li) =>
        Array.from({ length: 8 + li * 4 }).map((_, i) => (
          <RadialPetal
            key={`${li}-${i}`}
            angle={(i / (8 + li * 4)) * Math.PI * 2 + li * 0.15}
            color={base}
            emissive={em}
            length={0.2 + li * 0.06}
            width={0.06}
            innerRadius={0.04 + li * 0.04}
            droop={0.04 + li * 0.02}
          />
        )),
      )}
      <FlowerCenter radius={0.07} color="#e65100" emissive="#ff6d00" height={0.04} />
    </group>
  );
}

function ChrysanthemumBloom({ visual, green = false }: { visual: ToneVisual; green?: boolean }) {
  const color = green
    ? hslToHex(visual.hue, 45, 48)
    : hslToHex(visual.hue, visual.saturation + 10, visual.lightness);
  const em = hslToHex(visual.hue, visual.saturation, visual.lightness - 10);
  return (
    <group>
      {Array.from({ length: 4 }).map((_, li) =>
        Array.from({ length: 14 }).map((_, i) => (
          <RadialPetal
            key={`${li}-${i}`}
            angle={(i / 14) * Math.PI * 2 + li * 0.12}
            color={color}
            emissive={em}
            length={0.16 + li * 0.05}
            width={0.035}
            innerRadius={0.03 + li * 0.035}
            droop={0.05}
          />
        )),
      )}
      <FlowerCenter radius={0.06} color={green ? "#2e7d32" : "#ff8f00"} height={0.035} />
    </group>
  );
}

function ThistleBloom({ visual }: { visual: ToneVisual }) {
  const { base, em } = petalColors(visual);
  return (
    <group>
      {Array.from({ length: 16 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 16) * Math.PI * 2}
          color={base}
          emissive={em}
          length={0.12}
          width={0.025}
          innerRadius={0.08}
          droop={-0.15}
        />
      ))}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color={em} emissive={base} emissiveIntensity={0.25} roughness={0.6} />
      </mesh>
    </group>
  );
}

function SnapdragonBloom({ visual }: { visual: ToneVisual }) {
  const { base, em, light } = petalColors(visual);
  return (
    <group rotation={[0.1, 0, 0]}>
      <RadialPetal angle={0} color={light} emissive={em} length={0.32} width={0.12} innerRadius={0.04} droop={0.15} geometry="tulip" />
      <RadialPetal angle={Math.PI} color={base} emissive={em} length={0.28} width={0.1} innerRadius={0.04} droop={0.2} geometry="tulip" />
      <RadialPetal angle={Math.PI / 2} color={base} emissive={em} length={0.22} width={0.08} innerRadius={0.03} droop={0.35} geometry="tulip" />
      <RadialPetal angle={-Math.PI / 2} color={base} emissive={em} length={0.22} width={0.08} innerRadius={0.03} droop={0.35} geometry="tulip" />
      <FlowerCenter radius={0.04} color="#4a148c" height={0.06} />
    </group>
  );
}

function ReedGrassBloom({ visual }: { visual: ToneVisual }) {
  const tan = hslToHex(visual.hue, 15, 55);
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.7, 6]} />
        <meshStandardMaterial color="#6b8e4e" roughness={0.9} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[Math.sin(i * 0.9) * 0.04, 0.62 + i * 0.015, Math.cos(i * 0.9) * 0.04]}
          rotation={[0.3, i * 0.5, 0.2]}
        >
          <boxGeometry args={[0.008, 0.12, 0.004]} />
          <meshStandardMaterial color={tan} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function CrystalBloom({ visual }: { visual: ToneVisual }) {
  const glow = hslToHex(visual.hue, visual.saturation, visual.lightness + 15);
  return (
    <group>
      <mesh castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshPhysicalMaterial color={glow} transmission={0.5} roughness={0.04} thickness={0.8} emissive={glow} emissiveIntensity={0.6} />
      </mesh>
      <Sparkles count={12} scale={0.9} size={1.4} speed={0.18} color={glow} />
    </group>
  );
}

function CosmosBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const { base, em } = petalColors(visual);
  const droop = visual.tone === "sad" ? 0.18 : 0.05;
  return (
    <group>
      {Array.from({ length: 14 }).map((_, i) => (
        <RadialPetal
          key={i}
          angle={(i / 14) * Math.PI * 2}
          color={base}
          emissive={em}
          length={0.38 + seededRandom(seed, i) * 0.06}
          width={0.075}
          innerRadius={0.07}
          droop={droop}
        />
      ))}
      <FlowerCenter radius={0.07} color={hslToHex((visual.hue + 50) % 360, 80, 55)} emissive={em} height={0.035} />
    </group>
  );
}

function LavenderBloom({ visual }: { visual: ToneVisual }) {
  const { base } = petalColors(visual);
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.016, 0.44, 6]} />
        <meshStandardMaterial color="#4a6741" roughness={0.9} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const y = 0.08 + (i / 11) * 0.38;
        return (
          <group key={i} position={[Math.sin(i * 1.7) * 0.025, y, Math.cos(i * 1.7) * 0.025]}>
            {ringPetals(4, { length: 0.07, width: 0.028, color: base, emissive: base, innerRadius: 0.012, droop: 0.02 })}
          </group>
        );
      })}
    </group>
  );
}

/** Render the correct 3D bloom for each catalog species. */
export function SpeciesBloom({
  species,
  visual,
  seed,
}: {
  species: FlowerSpecies | string;
  visual: ToneVisual;
  seed: number;
}) {
  switch (species) {
    case "sunflower":
      return <SunflowerBloom seed={seed} />;
    case "daisy":
      return <DaisyBloom visual={visual} seed={seed} />;
    case "rose":
      return <RoseLayers visual={visual} seed={seed} layers={3} />;
    case "blackRose":
      return <RoseLayers visual={visual} seed={seed} layers={3} dark />;
    case "blackDahlia":
      return <RoseLayers visual={visual} seed={seed} layers={4} dark />;
    case "tulip":
    case "snapdragon":
      return species === "snapdragon" ? <SnapdragonBloom visual={visual} /> : <TulipCup visual={visual} />;
    case "lotus":
      return <LotusBloom visual={visual} />;
    case "hibiscus":
      return <HibiscusBloom visual={visual} />;
    case "cherryBlossom":
    case "cherry":
      return <CherryBlossomBloom visual={visual} seed={seed} />;
    case "chamomile":
      return <ChamomileBloom visual={visual} />;
    case "lavender":
    case "nightJasmine":
      return species === "nightJasmine" ? (
        <BellSpike visual={visual} count={4} droop={0.4} />
      ) : (
        <LavenderBloom visual={visual} />
      );
    case "bluebell":
      return <BellSpike visual={visual} count={5} droop={0.95} />;
    case "foxglove":
      return <BellSpike visual={visual} count={7} droop={1.05} />;
    case "edelweiss":
      return <EdelweissBloom visual={visual} />;
    case "aster":
      return <AsterBloom visual={visual} seed={seed} />;
    case "hydrangea":
      return <HydrangeaBloom visual={visual} seed={seed} />;
    case "bleedingHeart":
      return <BleedingHeartBloom visual={visual} />;
    case "passionflower":
      return <PassionflowerBloom visual={visual} />;
    case "marigold":
      return <MarigoldBloom visual={visual} seed={seed} />;
    case "greenChrysanthemum":
      return <ChrysanthemumBloom visual={visual} green />;
    case "thistle":
      return <ThistleBloom visual={visual} />;
    case "reedGrass":
      return <ReedGrassBloom visual={visual} />;
    case "crystal":
      return <CrystalBloom visual={visual} />;
    case "glowTree":
      return (
        <group>
          <mesh castShadow>
            <coneGeometry args={[0.3, 0.9, 8]} />
            <meshStandardMaterial color="#2dd4bf" emissive="#14b8a6" emissiveIntensity={0.55} />
          </mesh>
          <Sparkles count={10} scale={0.8} size={1.3} speed={0.2} color="#5eead4" />
        </group>
      );
    case "worldTree":
      return (
        <group>
          <mesh castShadow position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshStandardMaterial color={hslToHex(visual.hue, 50, 45)} emissive={hslToHex(visual.hue, 40, 35)} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, -0.1, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.25, 6]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
        </group>
      );
    case "cosmos":
    case "sad":
    default:
      return <CosmosBloom visual={visual} seed={seed} />;
  }
}
