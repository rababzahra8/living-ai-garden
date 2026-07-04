import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { SeedVisual } from "@/lib/garden3d/types";
import { inferFlowerFromChat, parseStoredSpecies } from "@/lib/flower-mood";
import { hashString, hslToHex, seedToWorld, seededRandom } from "@/lib/garden3d/math";
import {
  resolveToneVisual,
  toneFromMoodString,
  type ToneVisual,
} from "@/lib/garden3d/tone-visuals";

const FLOWER_SCALE = 1.3;

function PetalMat({ color, emissive, intensity = 0.35 }: { color: string; emissive: string; intensity?: number }) {
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

/** Flat petal radiating horizontally — classic sunflower / daisy layout. */
function FlatPetal({
  angle,
  length,
  width,
  color,
  emissive,
  innerRadius = 0.15,
  droop = 0.06,
  y = 0,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  emissive: string;
  innerRadius?: number;
  droop?: number;
  y?: number;
}) {
  return (
    <group rotation={[0, angle, 0]} position={[0, y, 0]}>
      <mesh
        position={[0, 0.02, innerRadius + length * 0.5]}
        rotation={[droop, 0, 0]}
        scale={[width, 0.045, length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <PetalMat color={color} emissive={emissive} />
      </mesh>
      {/* Rounded petal tip */}
      <mesh position={[0, 0.03, innerRadius + length]} rotation={[droop, 0, 0]} scale={[width * 0.85, 0.04, width * 0.7]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <PetalMat color={color} emissive={emissive} intensity={0.4} />
      </mesh>
    </group>
  );
}

/** Soft capsule petal — for roses / tulips that cup upward. */
function StylizedPetal({
  angle,
  color,
  emissive,
  length,
  width,
  tilt,
  y = 0,
}: {
  angle: number;
  color: string;
  emissive: string;
  length: number;
  width: number;
  tilt: number;
  y?: number;
}) {
  return (
    <group rotation={[tilt, angle, 0]} position={[0, y, 0]}>
      <mesh position={[0, length * 0.48, 0]} scale={[width, length, width * 0.35]} castShadow>
        <sphereGeometry args={[0.22, 10, 10]} />
        <PetalMat color={color} emissive={emissive} />
      </mesh>
    </group>
  );
}

function SunflowerBloom({ seed }: { seed: number }) {
  const group = useRef<THREE.Group>(null);
  const outerCount = 28;
  const innerCount = 14;

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.15 + seed) * 0.03;
  });

  return (
    <group ref={group}>
      {/* Outer ring — long petals spread flat */}
      {Array.from({ length: outerCount }).map((_, i) => {
        const len = 0.5 + seededRandom(seed, i) * 0.12;
        const isTip = i % 4 === 0;
        return (
          <FlatPetal
            key={i}
            angle={(i / outerCount) * Math.PI * 2}
            color={isTip ? "#ffb347" : "#ffe066"}
            emissive="#f5a623"
            length={len}
            width={0.1 + seededRandom(seed, i + 5) * 0.025}
            innerRadius={0.17}
            droop={0.04 + seededRandom(seed, i + 10) * 0.04}
          />
        );
      })}
      {/* Inner ring — shorter petals between outer ones */}
      {Array.from({ length: innerCount }).map((_, i) => (
        <FlatPetal
          key={`in-${i}`}
          angle={(i / innerCount) * Math.PI * 2 + Math.PI / innerCount}
          color="#ffd43b"
          emissive="#e8a317"
          length={0.32}
          width={0.08}
          innerRadius={0.12}
          droop={0.08}
        />
      ))}
      {/* Flat seed disk */}
      <mesh castShadow rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.2, 0.07, 24]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.14, 0.15, 0.05, 20]} />
        <meshStandardMaterial color="#3d2814" emissive="#2a1a0a" emissiveIntensity={0.15} roughness={0.9} />
      </mesh>
    </group>
  );
}

function DaisyBloom({ seed }: { seed: number }) {
  const count = 18;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <FlatPetal
          key={i}
          angle={(i / count) * Math.PI * 2}
          color="#fffef8"
          emissive="#fff8dc"
          length={0.42 + seededRandom(seed, i) * 0.08}
          width={0.085}
          innerRadius={0.1}
          droop={0.05}
        />
      ))}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.05, 16]} />
        <meshStandardMaterial color="#ffb703" emissive="#f59e0b" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}

function RoseBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const layers = [
    { count: 5, tilt: 0.72, scale: 0.7, y: 0 },
    { count: 7, tilt: 0.58, scale: 0.95, y: 0.05 },
    { count: 9, tilt: 0.45, scale: 1.1, y: 0.1 },
  ];
  const base = hslToHex(visual.hue, visual.saturation + 10, visual.lightness);
  const em = hslToHex(visual.hue, visual.saturation, visual.lightness - 15);

  return (
    <group>
      {layers.map((layer, li) =>
        Array.from({ length: layer.count }).map((_, i) => (
          <StylizedPetal
            key={`${li}-${i}`}
            angle={(i / layer.count) * Math.PI * 2 + li * 0.4}
            color={base}
            emissive={em}
            length={0.3 * layer.scale}
            width={0.1 * layer.scale}
            tilt={layer.tilt}
            y={layer.y}
          />
        )),
      )}
    </group>
  );
}

function TulipBloom({ visual }: { visual: ToneVisual }) {
  const c1 = hslToHex(visual.hue, visual.saturation + 15, visual.lightness);
  const c2 = hslToHex(visual.hue + 10, visual.saturation, visual.lightness - 5);
  const petals = [c1, c2, c1];
  return (
    <group>
      {petals.map((color, i) => (
        <mesh key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]} castShadow>
          <sphereGeometry args={[0.3, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <PetalMat color={color} emissive={color} intensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function CosmosBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  const count = 14;
  const color = hslToHex(visual.hue, visual.saturation + 15, visual.lightness + 5);
  const em = hslToHex(visual.hue, visual.saturation, visual.lightness - 10);
  const droop = visual.tone === "sad" ? 0.2 : 0.05;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <FlatPetal
          key={i}
          angle={(i / count) * Math.PI * 2}
          color={color}
          emissive={em}
          length={0.38 + seededRandom(seed, i) * 0.06}
          width={0.07}
          innerRadius={0.08}
          droop={droop}
        />
      ))}
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.04, 12]} />
        <meshStandardMaterial color={hslToHex((visual.hue + 50) % 360, 80, 55)} emissive={em} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function LavenderBloom({ visual }: { visual: ToneVisual }) {
  const color = hslToHex(visual.hue, visual.saturation + 20, visual.lightness);
  return (
    <group>
      {Array.from({ length: 28 }).map((_, i) => {
        const t = i / 28;
        return (
          <mesh key={i} position={[Math.sin(t * 12) * 0.04, t * 0.5, Math.cos(t * 12) * 0.04]} rotation={[0.5, t * 8, 0]}>
            <capsuleGeometry args={[0.022, 0.07, 4, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
          </mesh>
        );
      })}
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

function MoodBloom({ visual, seed }: { visual: ToneVisual; seed: number }) {
  switch (visual.kind) {
    case "sunflower":
      return <SunflowerBloom seed={seed} />;
    case "daisy":
      return <DaisyBloom seed={seed} />;
    case "rose":
      return <RoseBloom visual={visual} seed={seed} />;
    case "tulip":
      return <TulipBloom visual={visual} />;
    case "lavender":
      return <LavenderBloom visual={visual} />;
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
    default:
      return <CosmosBloom visual={visual} seed={seed} />;
  }
}

function FlowerStem({ visual, height = 0.82 }: { visual: ToneVisual; height?: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.034, height, 8]} />
        <meshStandardMaterial color={visual.tone === "negative" ? "#5a4545" : "#2e7d48"} roughness={0.85} />
      </mesh>
      {[
        { x: 0.12, y: height * 0.35, rz: -0.6 },
        { x: -0.1, y: height * 0.5, rz: 0.55 },
      ].map((leaf, i) => (
        <mesh key={i} position={[leaf.x, leaf.y, 0]} rotation={[0, 0, leaf.rz]} scale={[0.45, 0.06, 0.15]} castShadow>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial color="#43a047" roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function BloomMesh({ visual, growth, seed, hovered }: { visual: ToneVisual; growth: number; seed: number; hovered: boolean }) {
  const sizeVar = 0.95 + seededRandom(seed, 3) * 0.12;
  const glow = hslToHex(visual.hue, Math.min(95, visual.saturation + 15), visual.lightness + 8);

  // Stage 1: tiny sprout
  if (growth < 2) {
    return (
      <group scale={0.4}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#6b4e3d" />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <capsuleGeometry args={[0.02, 0.14, 4, 6]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
      </group>
    );
  }

  // Stage 2+: always show real petals (no ugly yellow bud sphere)
  const bloomScale = growth >= 3 ? sizeVar * (hovered ? 1.1 : 1) : sizeVar * 0.88;
  const headY = 0.86;

  return (
    <group scale={sizeVar} rotation={[0, 0, visual.stemLean]}>
      <FlowerStem visual={visual} />
      <group position={[0, headY, 0]} scale={bloomScale}>
        <MoodBloom visual={visual} seed={seed} />
      </group>
      {growth >= 2 && (
        <>
          <pointLight position={[0, headY, 0]} intensity={visual.glow * 1.4} color={glow} distance={3} decay={2} />
          {visual.sparkle && (
            <Sparkles count={12} scale={0.6} size={1.2} speed={0.14} color={glow} position={[0, headY, 0]} />
          )}
        </>
      )}
    </group>
  );
}

function resolveVisual(seed: SeedVisual, context: string): ToneVisual {
  const { mood, species } = parseStoredSpecies(seed.species);
  let tone = toneFromMoodString(mood);

  if (tone === "neutral" && context) {
    const inferred = inferFlowerFromChat(context, "");
    tone = toneFromMoodString(inferred.mood);
  }

  const base = resolveToneVisual(tone, seed.hue);
  const boosted = {
    ...base,
    saturation: Math.min(98, base.saturation + 18),
    lightness: Math.min(75, base.lightness + 10),
    emissiveIntensity: Math.min(0.45, base.emissiveIntensity + 0.12),
  };
  if (species && species !== base.kind) {
    return { ...boosted, kind: species as ToneVisual["kind"] };
  }
  return boosted;
}

function SingleFlower({ seed, context, onClick }: { seed: SeedVisual; context: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isMemory = seed.deleted_at != null;
  const visual = useMemo(() => resolveVisual(seed, context), [seed, context]);
  const hash = hashString(seed.id);
  const [x, y, z] = seedToWorld(seed.x, seed.y);
  const glow = hslToHex(visual.hue, isMemory ? 12 : visual.saturation, isMemory ? 42 : visual.lightness);

  if (isMemory) {
    return (
      <Float speed={0.35} rotationIntensity={0.008} floatIntensity={0.02}>
        <group position={[x, y, z]} scale={FLOWER_SCALE * 0.82}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.1, 0.18, 32]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} />
          </mesh>
          <group rotation={[0.15, 0, 0.12]}>
            <FlowerStem visual={{ ...visual, tone: "sad" }} height={0.62} />
            <group position={[0, 0.68, 0]} scale={0.55}>
              <mesh>
                <sphereGeometry args={[0.14, 8, 8]} />
                <meshStandardMaterial color="#64748b" roughness={0.95} />
              </mesh>
            </group>
          </group>
          <Html center position={[0, 1.35, 0]} distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div
              className="rounded-full border border-white/25 bg-slate-900/75 px-2.5 py-1 text-center shadow-lg backdrop-blur-sm"
              title="This conversation was removed — the memory remains, but the chat is not accessible yet."
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">Memory</div>
              <div className="text-sm font-bold tabular-nums text-white/90">#{seed.conversation_number}</div>
            </div>
          </Html>
        </group>
      </Float>
    );
  }

  return (
    <Float speed={visual.tone === "sad" ? 0.6 : 1} rotationIntensity={0.012} floatIntensity={0.04}>
      <group
        position={[x, y, z]}
        scale={FLOWER_SCALE}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.12, 0.22, 32]} />
          <meshBasicMaterial color={glow} transparent opacity={hovered ? 0.55 : 0.35} />
        </mesh>
        <BloomMesh visual={visual} growth={seed.growth} seed={hash} hovered={hovered} />
      </group>
    </Float>
  );
}

export function ConversationFlowers({
  seeds,
  threadTitles,
  onFlowerClick,
}: {
  seeds: SeedVisual[];
  threadTitles: Record<string, string>;
  onFlowerClick?: (threadId: string) => void;
}) {
  return (
    <group>
      {seeds.map((seed) => (
        <SingleFlower
          key={seed.id}
          seed={seed}
          context={seed.thread_id ? (threadTitles[seed.thread_id] ?? "") : ""}
          onClick={seed.thread_id ? () => onFlowerClick?.(seed.thread_id!) : undefined}
        />
      ))}
    </group>
  );
}
