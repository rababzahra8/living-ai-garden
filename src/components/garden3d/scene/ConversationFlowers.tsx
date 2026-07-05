import { useEffect, useMemo, useRef, useState } from "react";
import { Float } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SeedVisual } from "@/lib/garden3d/types";
import { inferFlowerFromChat, parseStoredSpecies } from "@/lib/flower-mood";
import { hashString, hslToHex, seedToWorld, worldToSeed } from "@/lib/garden3d/math";
import {
  resolveToneVisual,
  toneFromMoodString,
  type ToneVisual,
} from "@/lib/garden3d/tone-visuals";
import { FlowerStem, RadialPetal } from "./flower-parts";
import { SpeciesBloom } from "./SpeciesBlooms";
import { MemoryStone } from "./MemoryStone";

const FLOWER_SCALE = 1.3;
const DRAG_THRESHOLD_PX = 6;
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();
const _pointer = new THREE.Vector2();

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

function FlowerBody({
  seed,
  context,
  arrangeMode,
  isDragging,
  onOpen,
  onDragStart,
}: {
  seed: SeedVisual;
  context: string;
  arrangeMode: boolean;
  isDragging: boolean;
  onOpen?: () => void;
  onDragStart?: (clientX: number, clientY: number) => void;
}) {
  const { gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const { visual, species } = useMemo(() => resolveVisual(seed, context), [seed, context]);
  const hash = hashString(seed.id);
  const [x, y, z] = seedToWorld(seed.x, seed.y);
  const glow = hslToHex(visual.hue, visual.saturation, visual.lightness);

  const content = (
    <group
      position={[x, y, z]}
      scale={FLOWER_SCALE * (isDragging ? 1.08 : 1)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = arrangeMode ? "grab" : "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        if (!isDragging) document.body.style.cursor = "auto";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        pointerDownRef.current = { x: e.clientX, y: e.clientY };
        if (arrangeMode) {
          onDragStart?.(e.clientX, e.clientY);
          gl.domElement.setPointerCapture(e.pointerId);
          document.body.style.cursor = "grabbing";
        }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        if (gl.domElement.hasPointerCapture(e.pointerId)) {
          gl.domElement.releasePointerCapture(e.pointerId);
        }
        if (!arrangeMode && pointerDownRef.current) {
          const dx = e.clientX - pointerDownRef.current.x;
          const dy = e.clientY - pointerDownRef.current.y;
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) onOpen?.();
        }
        pointerDownRef.current = null;
        if (!arrangeMode) document.body.style.cursor = "auto";
      }}
    >
      {/* Invisible grab target — petals alone are hard to hit */}
      <mesh position={[0, 0.55, 0]} visible={false}>
        <cylinderGeometry args={[0.38, 0.38, 1.15, 10]} />
        <meshBasicMaterial />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.12, 0.22, 32]} />
        <meshBasicMaterial
          color={arrangeMode ? "#4ade80" : glow}
          transparent
          opacity={arrangeMode || hovered || isDragging ? 0.65 : 0.35}
        />
      </mesh>
      <BloomMesh visual={visual} species={species} growth={seed.growth} seed={hash} hovered={hovered} />
    </group>
  );

  if (isDragging) return content;

  return (
    <Float speed={visual.tone === "sad" ? 0.6 : 1} rotationIntensity={0.012} floatIntensity={0.04}>
      {content}
    </Float>
  );
}

export function ConversationFlowers({
  seeds,
  threadTitles,
  arrangeMode = false,
  onFlowerClick,
  onMoveSeed,
  onDragEnd,
  onDragStateChange,
}: {
  seeds: SeedVisual[];
  threadTitles: Record<string, string>;
  arrangeMode?: boolean;
  onFlowerClick?: (threadId: string) => void;
  onMoveSeed?: (seedId: string, x: number, y: number) => void;
  onDragEnd?: (seedId: string, x: number, y: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
}) {
  const { camera, raycaster, gl } = useThree();
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 50, y: 50 });

  useEffect(() => {
    dragIdRef.current = dragId;
  }, [dragId]);

  useEffect(() => {
    if (!arrangeMode) {
      const id = dragIdRef.current;
      if (id && onDragEnd) {
        const { x, y } = lastPosRef.current;
        onDragEnd(id, x, y);
      }
      setDragId(null);
      dragStartRef.current = null;
      onDragStateChange?.(false);
    }
  }, [arrangeMode, onDragEnd, onDragStateChange]);

  useEffect(() => {
    if (!dragId) return;

    const onMove = (e: PointerEvent) => {
      const id = dragIdRef.current;
      if (!id || !onMoveSeed) return;

      if (dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        dragStartRef.current = null;
      }

      const rect = gl.domElement.getBoundingClientRect();
      _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_pointer, camera);
      if (raycaster.ray.intersectPlane(_plane, _hit)) {
        const [xp, yp] = worldToSeed(_hit.x, _hit.z);
        lastPosRef.current = { x: xp, y: yp };
        onMoveSeed(id, xp, yp);
      }
    };

    const onUp = () => {
      const id = dragIdRef.current;
      if (id && onDragEnd) {
        const { x, y } = lastPosRef.current;
        onDragEnd(id, x, y);
      }
      setDragId(null);
      dragStartRef.current = null;
      onDragStateChange?.(false);
      document.body.style.cursor = arrangeMode ? "grab" : "auto";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragId, arrangeMode, camera, raycaster, gl, onMoveSeed, onDragEnd, onDragStateChange]);

  const startDrag = (seedId: string, clientX: number, clientY: number, seedX: number, seedY: number) => {
    dragStartRef.current = { x: clientX, y: clientY };
    lastPosRef.current = { x: seedX, y: seedY };
    setDragId(seedId);
    onDragStateChange?.(true);
  };

  return (
    <group>
      {seeds.map((seed) => {
        if (seed.deleted_at != null) {
          return <MemoryStone key={seed.id} seed={seed} />;
        }
        if (!seed.thread_id) return null;
        return (
          <FlowerBody
            key={seed.id}
            seed={seed}
            context={threadTitles[seed.thread_id] ?? ""}
            arrangeMode={arrangeMode}
            isDragging={dragId === seed.id}
            onOpen={arrangeMode ? undefined : () => onFlowerClick?.(seed.thread_id!)}
            onDragStart={(clientX, clientY) => startDrag(seed.id, clientX, clientY, seed.x, seed.y)}
          />
        );
      })}
    </group>
  );
}
