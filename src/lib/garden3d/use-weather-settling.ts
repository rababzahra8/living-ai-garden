import { useEffect, useState } from "react";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { weatherAnim } from "@/lib/garden3d/weather-animation";

const SETTLE_THRESHOLD = 0.94;

export function useWeatherSettling() {
  const [state, setState] = useState(() => ({
    settling: weatherAnim.opacity < SETTLE_THRESHOLD,
    progress: weatherAnim.opacity,
    weather: weatherAnim.weather,
  }));

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const settling = weatherAnim.opacity < SETTLE_THRESHOLD;
      const progress = weatherAnim.opacity;
      const weather = weatherAnim.weather;

      setState((prev) => {
        if (
          prev.settling === settling &&
          prev.weather === weather &&
          Math.abs(prev.progress - progress) < 0.008
        ) {
          return prev;
        }
        return { settling, progress, weather };
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return state;
}
