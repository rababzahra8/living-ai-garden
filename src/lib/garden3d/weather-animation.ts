import * as THREE from "three";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { skyBackground } from "@/lib/garden3d/weather-visuals";

const FADE_SPEED = 0.55;
const STRENGTH_SPEED = 1.25;
const SKY_COLOR = new THREE.Color();
const SKY_FROM = new THREE.Color();
const SKY_TO = new THREE.Color();

export type WeatherAnimationState = {
  weather: GardenWeather;
  target: GardenWeather;
  opacity: number;
  strength: number;
  targetStrength: number;
  nightMode: boolean;
  skyColor: THREE.Color;
};

SKY_COLOR.set(skyBackground("clear", false));

export const weatherAnim: WeatherAnimationState = {
  weather: "clear",
  target: "clear",
  opacity: 1,
  strength: 1,
  targetStrength: 1,
  nightMode: false,
  skyColor: SKY_COLOR,
};

let skyFromWeather: GardenWeather = "clear";

export function setWeatherAnimationTarget(
  target: GardenWeather,
  targetStrength: number,
  nightMode: boolean,
) {
  const a = weatherAnim;
  if (a.target !== target) {
    skyFromWeather = a.weather;
    a.weather = target;
    a.opacity = 0;
  }
  a.target = target;
  a.targetStrength = targetStrength;
  a.nightMode = nightMode;
}

export function tickWeatherAnimation(delta: number) {
  const a = weatherAnim;

  a.opacity = THREE.MathUtils.lerp(a.opacity, 1, 1 - Math.exp(-delta * FADE_SPEED * 1.4));

  a.strength = THREE.MathUtils.lerp(
    a.strength,
    a.targetStrength,
    1 - Math.exp(-delta * STRENGTH_SPEED),
  );

  SKY_FROM.set(skyBackground(skyFromWeather, a.nightMode));
  SKY_TO.set(skyBackground(a.weather, a.nightMode));
  SKY_COLOR.copy(SKY_FROM).lerp(SKY_TO, a.opacity);

  if (a.opacity > 0.98) {
    skyFromWeather = a.weather;
  }
}

/** Particle / grass budget multiplier (lower at night = smoother FPS). */
export function gardenPerformanceScale(nightMode: boolean, lite: boolean): number {
  if (lite) return 0.35;
  if (nightMode) return 0.55;
  return 1;
}
