import { useEffect, useState } from "react";
import type { GardenStats } from "@/lib/garden3d/types";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";

const WEATHER_LABEL: Record<GardenWeather, { icon: string; label: string; hint?: string }> = {
  clear: { icon: "☀️", label: "Clear skies" },
  rainbow: { icon: "🌈", label: "Rainbow", hint: "Look toward the horizon behind the flowers" },
  rain: { icon: "🌧️", label: "Gentle rain" },
};

function AnimatedStat({ label, value, icon }: { label: string; value: number; icon: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = display;
    const diff = value - start;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - startTime) / duration);
      setDisplay(Math.round(start + diff * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="glass-stat">
      <span className="text-base">{icon}</span>
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-white/60">{label}</div>
        <div className="text-lg font-semibold tabular-nums text-white">{display}</div>
      </div>
    </div>
  );
}

export function GardenHUD({ stats, weather = "clear" }: { stats: GardenStats; weather?: GardenWeather }) {
  const wx = WEATHER_LABEL[weather];

  return (
    <div className="glass-panel glass-panel-hud pointer-events-none p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        Living Garden
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/75">
        <span>{wx.icon}</span>
        <span className="font-medium">{wx.label}</span>
        {wx.hint && <span className="hidden text-white/45 sm:inline">· {wx.hint}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <AnimatedStat label="Garden Level" value={stats.level} icon="🌱" />
        <AnimatedStat label="Flowers" value={stats.flowers} icon="🌸" />
        <AnimatedStat label="Memories" value={stats.memories} icon="🪨" />
        <AnimatedStat label="Butterflies" value={stats.butterflies} icon="🦋" />
        <AnimatedStat label="Trees" value={stats.trees} icon="🌳" />
        <AnimatedStat label="Huts" value={stats.huts} icon="🏡" />
        <AnimatedStat label="Energy" value={stats.energy} icon="✨" />
      </div>
    </div>
  );
}
