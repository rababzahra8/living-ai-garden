import { useMemo, useState } from "react";
import { Float, Html } from "@react-three/drei";
import type { SeedVisual } from "@/lib/garden3d/types";
import { inferFlowerFromChat, parseStoredSpecies } from "@/lib/flower-mood";
import { hashString, hslToHex, seedToWorld } from "@/lib/garden3d/math";
import {
  resolveToneVisual,
  toneFromMoodString,
  type ToneVisual,
} from "@/lib/garden3d/tone-visuals";
import { FlowerStem, RadialPetal } from "./flower-parts";
import { SpeciesBloom } from "./SpeciesBlooms";

const FLOWER_SCALE = 1.3;

function resolveVisual(seed: SeedVisual, context: string): { visual: ToneVisual; species: string } {
  const { mood, species } = parseStoredSpecies(seed.species);
  let tone = toneFromMoodString(mood);

  if (tone === "neutral" && context) {
    const inferred = inferFlowerFromChat(context, "");
    tone = toneFromMoodString(inferred.mood);
  }

  const base = resolveToneVisual(tone, seed.hue);
  const visual = {
    ...base,
    saturation: Math.min(98, base.saturation + 18),
    lightness: Math.min(75, base.lightness + 10),
    emissiveIntensity: Math.min(0.45, base.emissiveIntensity + 0.12),
  };

  return { visual, species };
}

function BloomMesh({
  visual,
  species,
  growth,
  seed,
  hovered,
}: {
  visual: ToneVisual;
  species: string;
  growth: number;
  seed: number;
  hovered: boolean;
}) {
  const sizeVar = 0.95 + ((seed % 100) / 100) * 0.12;
  const glow = hslToHex(visual.hue, Math.min(95, visual.saturation + 15), visual.lightness + 8);

  if (growth < 2) {
    const budColor = hslToHex(visual.hue, visual.saturation, visual.lightness + 5);
    return (
      <group scale={0.45}>
        <FlowerStem visual={visual} height={0.5} />
        <group position={[0, 0.5, 0]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <RadialPetal
              key={i}
              angle={(i / 5) * Math.PI * 2}
              color={budColor}
              emissive={budColor}
              length={0.14}
              width={0.06}
              innerRadius={0.02}
              droop={0.55}
            />
          ))}
        </group>
      </group>
    );
  }

  const bloomScale = growth >= 3 ? sizeVar * (hovered ? 1.1 : 1) : sizeVar * 0.88;
  const headY = species === "reedGrass" ? 0.7 : 0.86;

  return (
    <group scale={sizeVar} rotation={[0, 0, visual.stemLean]}>
      {species !== "reedGrass" && <FlowerStem visual={visual} />}
      <group position={[0, headY, 0]} scale={bloomScale}>
        <SpeciesBloom species={species} visual={visual} seed={seed} />
      </group>
      {growth >= 2 && visual.glow > 0 && (
        <pointLight position={[0, headY, 0]} intensity={visual.glow * 1.4} color={glow} distance={3} decay={2} />
      )}
    </group>
  );
}

function SingleFlower({ seed, context, onClick }: { seed: SeedVisual; context: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isMemory = seed.deleted_at != null;
  const { visual, species } = useMemo(() => resolveVisual(seed, context), [seed, context]);
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
              {Array.from({ length: 5 }).map((_, i) => (
                <RadialPetal
                  key={i}
                  angle={(i / 5) * Math.PI * 2}
                  color="#94a3b8"
                  emissive="#64748b"
                  length={0.12}
                  width={0.045}
                  innerRadius={0.02}
                  droop={0.35}
                />
              ))}
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
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.12, 0.22, 32]} />
          <meshBasicMaterial color={glow} transparent opacity={hovered ? 0.55 : 0.35} />
        </mesh>
        <BloomMesh visual={visual} species={species} growth={seed.growth} seed={hash} hovered={hovered} />
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
