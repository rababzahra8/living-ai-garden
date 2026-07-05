import { useCallback, useEffect, useRef, useState } from "react";
import type { GardenWeather, MoodBoost } from "@/lib/garden3d/garden-weather";
import {
  loadWeatherPreference,
  saveWeatherPreference,
  type WeatherPreference,
} from "@/lib/garden3d/weather-preferences";

const CYCLE: { weather: GardenWeather; ms: number }[] = [
  { weather: "spring", ms: 48_000 },
  { weather: "summer", ms: 48_000 },
  { weather: "autumn", ms: 42_000 },
  { weather: "winter", ms: 42_000 },
  { weather: "rain", ms: 36_000 },
  { weather: "clear", ms: 36_000 },
];

const MOOD_MS = 90_000;
const FADE_MS = 18_000;

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

function moodToWeather(mood: MoodBoost): GardenWeather | null {
  if (mood === "rain") return "rain";
  if (mood === "spring") return "spring";
  return null;
}

export function useGardenWeather(inferredMood: MoodBoost, emotionKey?: string | null) {
  const [preference, setPreferenceState] = useState<WeatherPreference>(() => loadWeatherPreference());
  const [cycleIndex, setCycleIndex] = useState(0);
  const [moodWeather, setMoodWeather] = useState<GardenWeather | null>(null);
  const [moodStrength, setMoodStrength] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fadeInterval = useRef<ReturnType<typeof setInterval>>();
  const prevMood = useRef(inferredMood);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (fadeInterval.current) clearInterval(fadeInterval.current);
  };

  const setPreference = useCallback((pref: WeatherPreference) => {
    saveWeatherPreference(pref);
    setPreferenceState(pref);
    if (pref !== "auto") {
      clearAll();
      setMoodWeather(null);
      setMoodStrength(0);
    }
  }, []);

  // Day cycle when preference is auto
  useEffect(() => {
    if (preference !== "auto") return;
    const phase = CYCLE[cycleIndex];
    const t = setTimeout(() => setCycleIndex((i) => (i + 1) % CYCLE.length), phase.ms);
    return () => clearTimeout(t);
  }, [preference, cycleIndex]);

  // Mood overlay (auto only): brief rain or spring warmth from chat, then fade
  useEffect(() => {
    if (preference !== "auto") return;

    clearAll();
    const moodChanged = prevMood.current !== inferredMood;
    prevMood.current = inferredMood;

    const overlay = moodToWeather(inferredMood);
    if (!overlay) {
      if (moodWeather) {
        startFade(fadeInterval, () => {
          setMoodWeather(null);
          setMoodStrength(0);
        }, setMoodStrength);
      }
      return clearAll;
    }

    if (moodChanged || !moodWeather) {
      setMoodWeather(overlay);
      setMoodStrength(1);

      timers.current.push(
        setTimeout(() => {
          startFade(fadeInterval, () => {
            setMoodWeather(null);
            setMoodStrength(0);
          }, setMoodStrength);
        }, MOOD_MS - FADE_MS),
      );
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inferredMood, emotionKey, preference]);

  const baseWeather: GardenWeather =
    preference === "auto" ? CYCLE[cycleIndex].weather : preference;

  const weather: GardenWeather =
    preference === "auto" && moodWeather && moodStrength > 0.05 ? moodWeather : baseWeather;

  const strength =
    preference === "auto" && moodWeather && moodStrength > 0.05
      ? moodStrength
      : preference === "auto" && weather === "rain"
        ? 1
        : 1;

  return {
    weather,
    strength,
    inferredMood,
    preference,
    setPreference,
    cycling: preference === "auto",
  };
}
