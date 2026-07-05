import { useThree } from "@react-three/fiber";
import { terrainHeight } from "@/lib/garden3d/math";
import type { HutKind, HutPlacement } from "@/lib/garden3d/scenery-layout";
import { useTerrainDrag } from "./useTerrainDrag";
import { WindowGlow } from "./NightGlow";

const HUT_SCALE = 1.65;

function HutMesh({ kind, scale = 1, nightMode = false }: { kind: HutKind; scale?: number; nightMode?: boolean }) {
  const wall = kind === "tall" ? "#7a5c3a" : "#8b6914";
  const roof = kind === "square" ? "#b8956a" : "#c4a35a";
  const w = kind === "tall" ? 1.15 : 1.45;
  const h = kind === "tall" ? 1.25 : 0.95;

  return (
    <group scale={scale * HUT_SCALE}>
      <mesh castShadow position={[0, h * 0.5, 0]}>
        <boxGeometry args={[w, h, w * 0.95]} />
        <meshStandardMaterial color={wall} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, h + 0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[w * 0.88, 0.82, 4]} />
        <meshStandardMaterial color={roof} roughness={0.88} />
      </mesh>
      <mesh position={[0, h * 0.35, w * 0.48]}>
        <boxGeometry args={[0.34, 0.5, 0.05]} />
        <meshStandardMaterial color="#4a3520" roughness={0.95} />
      </mesh>
      {nightMode && (
        <>
          <WindowGlow position={[w * 0.22, h * 0.55, w * 0.5]} width={0.22} height={0.22} />
          <WindowGlow position={[-w * 0.22, h * 0.55, w * 0.5]} width={0.22} height={0.22} />
        </>
      )}
    </group>
  );
}

function DraggableHut({
  hut,
  arrangeMode,
  isDragging,
  onDragStart,
  nightMode = false,
}: {
  hut: HutPlacement;
  arrangeMode: boolean;
  isDragging: boolean;
  onDragStart: (clientX: number, clientY: number) => void;
  nightMode?: boolean;
}) {
  const { gl } = useThree();
  const y = terrainHeight(hut.x, hut.z);

  return (
    <group position={[hut.x, y, hut.z]}>
      <group
        scale={isDragging ? 1.05 : 1}
        onPointerDown={(e) => {
          if (!arrangeMode) return;
          e.stopPropagation();
          onDragStart(e.clientX, e.clientY);
          gl.domElement.setPointerCapture(e.pointerId);
          document.body.style.cursor = "grabbing";
        }}
        onPointerUp={(e) => {
          if (gl.domElement.hasPointerCapture(e.pointerId)) {
            gl.domElement.releasePointerCapture(e.pointerId);
          }
          if (arrangeMode) document.body.style.cursor = "grab";
        }}
      >
        {arrangeMode && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.9, 1.15, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
          </mesh>
        )}
        <mesh visible={false} position={[0, 0.8, 0]}>
          <boxGeometry args={[1.8, 1.8, 1.8]} />
          <meshBasicMaterial />
        </mesh>
        <HutMesh kind={hut.kind} scale={hut.scale} nightMode={nightMode} />
      </group>
    </group>
  );
}

export function GardenHuts({
  huts,
  arrangeMode = false,
  nightMode = false,
  onMoveScenery,
  onDragEndScenery,
  onDragStateChange,
}: {
  huts: HutPlacement[];
  arrangeMode?: boolean;
  nightMode?: boolean;
  onMoveScenery?: (id: string, x: number, z: number) => void;
  onDragEndScenery?: (id: string, x: number, z: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
}) {
  const { dragId, startDrag } = useTerrainDrag({
    enabled: arrangeMode,
    onMove: onMoveScenery,
    onEnd: onDragEndScenery,
    onDragStateChange,
  });

  if (huts.length === 0) return null;

  return (
    <group>
      {huts.map((hut) => (
        <DraggableHut
          key={hut.id}
          hut={hut}
          arrangeMode={arrangeMode}
          isDragging={dragId === hut.id}
          nightMode={nightMode}
          onDragStart={(cx, cy) => startDrag(hut.id, cx, cy, hut.x, hut.z)}
        />
      ))}
    </group>
  );
}
