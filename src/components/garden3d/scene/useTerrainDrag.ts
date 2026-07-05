import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const DRAG_THRESHOLD_PX = 6;
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _hit = new THREE.Vector3();
const _pointer = new THREE.Vector2();

export function useTerrainDrag({
  enabled,
  onMove,
  onEnd,
  onDragStateChange,
}: {
  enabled: boolean;
  onMove?: (id: string, x: number, z: number) => void;
  onEnd?: (id: string, x: number, z: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
}) {
  const { camera, raycaster, gl } = useThree();
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  useEffect(() => {
    dragIdRef.current = dragId;
  }, [dragId]);

  useEffect(() => {
    if (!enabled) {
      const id = dragIdRef.current;
      if (id && onEnd) {
        const { x, z } = lastPosRef.current;
        onEnd(id, x, z);
      }
      setDragId(null);
      dragStartRef.current = null;
      onDragStateChange?.(false);
    }
  }, [enabled, onEnd, onDragStateChange]);

  useEffect(() => {
    if (!dragId) return;

    const onMoveEvt = (e: PointerEvent) => {
      const id = dragIdRef.current;
      if (!id || !onMove) return;

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
        lastPosRef.current = { x: _hit.x, z: _hit.z };
        onMove(id, _hit.x, _hit.z);
      }
    };

    const onUp = () => {
      const id = dragIdRef.current;
      if (id && onEnd) {
        const { x, z } = lastPosRef.current;
        onEnd(id, x, z);
      }
      setDragId(null);
      dragStartRef.current = null;
      onDragStateChange?.(false);
      document.body.style.cursor = enabled ? "grab" : "auto";
    };

    window.addEventListener("pointermove", onMoveEvt);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMoveEvt);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragId, enabled, camera, raycaster, gl, onMove, onEnd, onDragStateChange]);

  const startDrag = (id: string, clientX: number, clientY: number, x: number, z: number) => {
    if (!enabled) return;
    dragStartRef.current = { x: clientX, y: clientY };
    lastPosRef.current = { x, z };
    setDragId(id);
    onDragStateChange?.(true);
  };

  return { dragId, startDrag };
}
