import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { seedsCentroid } from "@/lib/garden3d/math";
import type { SeedVisual } from "@/lib/garden3d/types";

export function CameraRig({
  mode,
  seeds = [],
  arrangeMode = false,
  sceneDragging = false,
}: {
  mode: "landing" | "garden";
  seeds?: SeedVisual[];
  arrangeMode?: boolean;
  sceneDragging?: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const radius = mode === "landing" ? 14 : 12;
    const [fx, , fz] = seeds.length > 0 ? seedsCentroid(seeds) : [0, 1.5, 3];
    camera.position.set(fx + 2, 5.5, fz + radius);
    initialized.current = true;
  }, [camera, mode, seeds]);

  useEffect(() => {
    const [fx, fy, fz] = seeds.length > 0 ? seedsCentroid(seeds) : [0, 1.5, 3];
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(fx, fy, fz);
    controls.update();
  }, [seeds]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!sceneDragging}
      enableRotate={!arrangeMode && !sceneDragging}
      enablePan={!sceneDragging}
      enableDamping
      dampingFactor={0.085}
      minDistance={3.5}
      maxDistance={28}
      maxPolarAngle={Math.PI / 2.05}
      minPolarAngle={0.2}
      enablePan
      panSpeed={0.65}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      target={[0, 1.5, 3]}
    />
  );
}
