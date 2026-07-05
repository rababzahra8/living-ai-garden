import { WEATHER_LABELS, type GardenWeather } from "@/lib/garden3d/garden-weather";

export function WeatherTransitionOverlay({
  settling,
  progress,
  weather,
}: {
  settling: boolean;
  progress: number;
  weather: GardenWeather;
}) {
  if (!settling) return null;

  const wx = WEATHER_LABELS[weather];
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)));

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-300"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="weather-transition-card glass-panel flex flex-col items-center gap-4 px-8 py-7 text-center shadow-2xl shadow-emerald-950/40">
        <div className="weather-transition-orbit">
          <span className="weather-transition-icon text-5xl" aria-hidden>
            {wx.icon}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium tracking-wide text-white/90">Season shifting</p>
          <p className="text-xs text-white/55">{wx.label}</p>
        </div>
        <div className="w-36">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="weather-transition-bar h-full rounded-full bg-gradient-to-r from-emerald-400/90 to-teal-300/90"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-white/35">Settling in</p>
        </div>
      </div>
    </div>
  );
}
