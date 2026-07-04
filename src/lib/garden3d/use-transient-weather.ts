import { useEffect, useRef, useState } from "react";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

const RAIN_MS = 2 * 60 * 1000;
const RAINBOW_MS = 90 * 1000;
const FADE_MS = 18 * 1000;

function startFade(
  fadeInterval: { current: ReturnType<typeof setInterval> | undefined },
  onDone: () => void,
  setStrength: (n: number) => void,
) {
  const start = performance.now();
  fadeInterval.current = setInterval(() => {
    const p = Math.min(1, (performance.now() - start) / FADE_MS);
    setStrength(1 - p);
    if (p >= 1) {
      clearInterval(fadeInterval.current);
      onDone();
    }
  }, 50);
}

/**
 * Mood weather follows conversation emotions but doesn't loop forever:
 * rain/rainbow runs for a while, fades, then clears until feelings update again.
 */
export function useTransientGardenWeather(
  inferred: GardenWeather,
  emotionKey?: string | null,
): { weather: GardenWeather; strength: number; inferredWeather: GardenWeather } {
  const [weather, setWeather] = useState<GardenWeather>(inferred);
  const [strength, setStrength] = useState(inferred === "clear" ? 0 : 1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fadeInterval = useRef<ReturnType<typeof setInterval>>();
  const prevInferred = useRef(inferred);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (fadeInterval.current) clearInterval(fadeInterval.current);
  };

  const scheduleEpisode = (type: GardenWeather) => {
    const duration = type === "rain" ? RAIN_MS : RAINBOW_MS;
    setWeather(type);
    setStrength(1);

    timers.current.push(
      setTimeout(() => {
        startFade(fadeInterval, () => {
          setWeather("clear");
          setStrength(0);
        }, setStrength);
      }, duration - FADE_MS),
    );

    timers.current.push(
      setTimeout(() => {
        setWeather("clear");
        setStrength(0);
      }, duration),
    );
  };

  useEffect(() => {
    clearAll();
    const inferredChanged = prevInferred.current !== inferred;
    prevInferred.current = inferred;

    if (inferred === "clear") {
      if (weather === "rain" || weather === "rainbow") {
        startFade(fadeInterval, () => {
          setWeather("clear");
          setStrength(0);
        }, setStrength);
      } else {
        setWeather("clear");
        setStrength(0);
      }
      return clearAll;
    }

    // Emotion flipped (sad → happy, etc.) — switch immediately
    if (inferredChanged && (weather === "rain" || weather === "rainbow") && weather !== inferred) {
      scheduleEpisode(inferred);
      return clearAll;
    }

    // New emotional activity or first load — start / restart episode
    scheduleEpisode(inferred);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inferred, emotionKey]);

  const active = weather === "clear" ? "clear" : weather;
  return {
    weather: active,
    strength: active === "clear" ? 0 : strength,
    inferredWeather: inferred,
  };
}
