import type { GardenWeather } from "@/lib/garden3d/garden-weather";

export function skyBackground(
  weather: GardenWeather,
  nightMode: boolean,
): string {
  if (nightMode) return "#030712";
  switch (weather) {
    case "rain":
      return "#9eb0c4";
    case "winter":
      return "#c8d8e8";
    case "autumn":
      return "#c9b8a0";
    case "spring":
      return "#a8d8c8";
    case "summer":
      return "#87ceeb";
    default:
      return "#87ceeb";
  }
}

export function isPrecipitation(weather: GardenWeather): boolean {
  return weather === "rain" || weather === "winter";
}
