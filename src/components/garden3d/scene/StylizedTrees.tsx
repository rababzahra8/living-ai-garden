import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/garden3d/math";
import type { TreeKind, TreePlacement } from "@/lib/garden3d/scenery-layout";
import { useTerrainDrag } from "./useTerrainDrag";
import { TreeLanternGlow } from "./NightGlow";

function TreeMesh({
  kind,
  scale = 1,
  nightMode = false,
}: {
  kind: TreeKind;
  scale?: number;
  nightMode?: boolean;
}) {
  const canopy = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!canopy.current) return;
    canopy.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.02;
  });

  const trunkColor = kind === "pine" ? "#4a3728" : "#5c4033";
  const leafColor =
    kind === "cherry"
      ? "#f4a7b9"
      : kind === "magic"
        ? "#7ef0d4"
        : kind === "willow"
          ? "#6fa858"
          : kind === "pine"
            ? "#2d5a3d"
            : "#4f8f55";

  return (
    <group scale={scale}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 2.4, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </mesh>
      <group ref={canopy} position={[0, 2.4, 0]}>
        {kind === "willow" ? (
          Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[Math.sin(i) * 0.8, -0.5 - i * 0.08, Math.cos(i) * 0.8]} castShadow>
              <capsuleGeometry args={[0.06, 1.6 - i * 0.08, 4, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.8} />
            </mesh>
          ))
        ) : kind === "pine" ? (
          [0, 1, 2].map((i) => (
            <mesh key={i} castShadow position={[0, i * 0.7, 0]} scale={[1.4 - i * 0.25, 1, 1.4 - i * 0.25]}>
              <coneGeometry args={[1.2 - i * 0.2, 1.4, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.85} flatShading />
            </mesh>
          ))
        ) : (
          <>
            <mesh castShadow>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial
                color={leafColor}
                roughness={0.75}
                flatShading
                emissive={kind === "magic" ? "#2dd4bf" : "#000000"}
                emissiveIntensity={kind === "magic" ? 0.35 : 0}
              />
            </mesh>
            <mesh castShadow position={[0.9, -0.2, 0.3]} scale={0.65}>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color={leafColor} roughness={0.75} flatShading />
            </mesh>
            <mesh castShadow position={[-0.7, -0.3, -0.4]} scale={0.55}>
              <icosahedronGeometry args={[1.3, 0]} />
              <meshStandardMaterial color={leafColor} roughness={0.75} flatShading />
            </mesh>
          </>
        )}
        {kind === "cherry" &&
          Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[Math.sin(i * 1.2) * 1.2, -0.5 - i * 0.15, Math.cos(i * 1.2) * 1.2]}>
              <planeGeometry args={[0.12, 0.1]} />
              <meshBasicMaterial color="#ffb7c5" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))}
      </group>
      {nightMode && <TreeLanternGlow position={[0.55, 0.35, 0.4]} />}
    </group>
  );
}

function DraggableTree({
  tree,
  arrangeMode,
  isDragging,
  onDragStart,
  nightMode = false,
}: {
  tree: TreePlacement;
  arrangeMode: boolean;
  isDragging: boolean;
  onDragStart: (clientX: number, clientY: number) => void;
  nightMode?: boolean;
}) {
  const { gl } = useThree();
  const y = terrainHeight(tree.x, tree.z);

  return (
    <group position={[tree.x, y, tree.z]}>
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
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial color="#a78bfa" transparent opacity={0.55} />
          </mesh>
        )}
        <mesh visible={false} position={[0, 2, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 4.5, 8]} />
          <meshBasicMaterial />
        </mesh>
        <TreeMesh kind={tree.kind} scale={tree.scale} nightMode={nightMode} />
      </group>
    </group>
  );
}

export function StylizedTrees({
  trees,
  arrangeMode = false,
  nightMode = false,
  onMoveScenery,
  onDragEndScenery,
  onDragStateChange,
}: {
  trees: TreePlacement[];
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

  if (trees.length === 0) return null;

  return (
    <group>
      {trees.map((tree) => (
        <DraggableTree
          key={tree.id}
          tree={tree}
          arrangeMode={arrangeMode}
          isDragging={dragId === tree.id}
          nightMode={nightMode}
          onDragStart={(cx, cy) => startDrag(tree.id, cx, cy, tree.x, tree.z)}
        />
      ))}
    </group>
  );
}
