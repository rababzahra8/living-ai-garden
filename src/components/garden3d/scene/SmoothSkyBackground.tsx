import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { weatherAnim } from "@/lib/garden3d/weather-animation";

/** Smoothly lerps scene background + fog to match animated sky color. */
export function SmoothSkyBackground() {
  const color = useRef(new THREE.Color("#87ceeb"));

  useFrame(({ scene }) => {
    color.current.copy(weatherAnim.skyColor);
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(color.current, 0.08);
    } else {
      scene.background = color.current.clone();
    }
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(color.current, 0.08);
    }
  });

  return null;
}
