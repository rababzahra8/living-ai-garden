import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  setWeatherAnimationTarget,
  tickWeatherAnimation,
  type WeatherAnimationState,
  weatherAnim,
} from "@/lib/garden3d/weather-animation";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

/** Runs weather fade + sky blend on the render loop (no React state per frame). */
export function WeatherAnimationDriver({
  weather,
  strength,
  nightMode,
}: {
  weather: GardenWeather;
  strength: number;
  nightMode: boolean;
}) {
  useEffect(() => {
    setWeatherAnimationTarget(weather, strength, nightMode);
  }, [weather, strength, nightMode]);

  useFrame((_, delta) => {
    tickWeatherAnimation(delta);
  });

  return null;
}

export function readWeatherAnimation(): WeatherAnimationState {
  return weatherAnim;
}
