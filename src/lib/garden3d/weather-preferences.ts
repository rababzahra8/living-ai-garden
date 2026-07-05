import type { GardenWeather } from "@/lib/garden3d/garden-weather";

export type WeatherPreference = "auto" | GardenWeather;

const STORAGE_KEY = "garden-weather-preference";

const VALID_WEATHER: GardenWeather[] = ["clear", "rain", "spring", "summer", "autumn", "winter"];

export function loadWeatherPreference(): WeatherPreference {
  if (typeof window === "undefined") return "auto";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw || raw === "auto") return "auto";
  if (raw === "thunder") return "rain";
  return VALID_WEATHER.includes(raw as GardenWeather) ? (raw as GardenWeather) : "auto";
}

export function saveWeatherPreference(pref: WeatherPreference) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, pref);
}

export const WEATHER_OPTIONS: { value: WeatherPreference; label: string; icon: string }[] = [
  { value: "auto", label: "Auto cycle", icon: "🔄" },
  { value: "spring", label: "Spring", icon: "🌸" },
  { value: "summer", label: "Summer", icon: "☀️" },
  { value: "autumn", label: "Autumn", icon: "🍂" },
  { value: "winter", label: "Winter", icon: "❄️" },
  { value: "rain", label: "Rain", icon: "🌧️" },
  { value: "clear", label: "Clear", icon: "🌤️" },
];
