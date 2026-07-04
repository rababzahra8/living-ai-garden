import { useEffect, useRef, useState } from "react";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { DEMO_SHOWCASE_PHASES, type DemoShowcasePhase } from "@/lib/garden3d/demo-garden";

const FADE_MS = 4_000;

export function useDemoGardenShowcase(): {
  nightMode: boolean;
  weather: GardenWeather;
  weatherStrength: number;
  phase: DemoShowcasePhase;
  phaseIndex: number;
} {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [weatherStrength, setWeatherStrength] = useState(1);
  const fadeInterval = useRef<ReturnType<typeof setInterval>>();
  const phase = DEMO_SHOWCASE_PHASES[phaseIndex]!;

  useEffect(() => {
    if (fadeInterval.current) clearInterval(fadeInterval.current);

    setWeatherStrength(phase.weather === "clear" ? 0 : 1);

    const fadeStart = Math.max(0, phase.durationMs - FADE_MS);
    const fadeTimer = setTimeout(() => {
      if (phase.weather === "clear") return;
      const start = performance.now();
      fadeInterval.current = setInterval(() => {
        const p = Math.min(1, (performance.now() - start) / FADE_MS);
        setWeatherStrength(1 - p);
        if (p >= 1 && fadeInterval.current) clearInterval(fadeInterval.current);
      }, 50);
    }, fadeStart);

    const nextTimer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % DEMO_SHOWCASE_PHASES.length);
    }, phase.durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextTimer);
      if (fadeInterval.current) clearInterval(fadeInterval.current);
    };
  }, [phaseIndex, phase.durationMs, phase.weather]);

  const activeWeather = phase.weather;
  const strength = activeWeather === "clear" ? 0 : weatherStrength;

  return {
    nightMode: phase.night,
    weather: activeWeather,
    weatherStrength: strength,
    phase,
    phaseIndex,
  };
}
