import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { GardenStats } from "@/lib/garden3d/types";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { getMoonPhase } from "@/lib/garden3d/moon-phase";

const HUD_STORAGE_KEY = "garden-hud-expanded";

const WEATHER_LABEL: Record<GardenWeather, { icon: string; label: string; hint?: string }> = {
  clear: { icon: "☀️", label: "Clear skies" },
  rainbow: { icon: "🌈", label: "Rainbow", hint: "Look toward the horizon behind the flowers" },
  rain: { icon: "🌧️", label: "Gentle rain", hint: "Fades after a while — new feelings bring it back" },
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
      <span className="text-sm sm:text-base">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[9px] font-medium uppercase tracking-wider text-white/60 sm:text-[10px]">
          {label}
        </div>
        <div className="text-base font-semibold tabular-nums text-white sm:text-lg">{display}</div>
      </div>
    </div>
  );
}

function readHudExpanded() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(HUD_STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return window.innerWidth >= 768;
}

export function GardenHUD({
  stats,
  weather = "clear",
  nightMode = false,
}: {
  stats: GardenStats;
  weather?: GardenWeather;
  nightMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(() => readHudExpanded());
  const wx = WEATHER_LABEL[weather];
  const moon = nightMode ? getMoonPhase() : null;

  useEffect(() => {
    localStorage.setItem(HUD_STORAGE_KEY, String(expanded));
  }, [expanded]);

  return (
    <div className="glass-panel glass-panel-hud pointer-events-auto w-full max-w-[11.5rem] min-w-0 sm:max-w-xs md:max-w-sm">
      <div className="flex items-center gap-2 p-2.5 sm:p-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white sm:text-sm">Living Garden</div>
          {!expanded && (
            <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-white/65">
              <span>{wx.icon}</span>
              <span className="truncate">{wx.label}</span>
              <span className="text-white/40">· Lv {stats.level}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse garden stats" : "Expand garden stats"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/8 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-[10px] text-white/75 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
            <span>{wx.icon}</span>
            <span className="font-medium">{wx.label}</span>
            {wx.hint && <span className="hidden text-white/45 md:inline">· {wx.hint}</span>}
            {moon && <span className="ml-auto text-white/55">🌙 {moon.label}</span>}
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <AnimatedStat label="Garden Level" value={stats.level} icon="🌱" />
            <AnimatedStat label="Flowers" value={stats.flowers} icon="🌸" />
            <AnimatedStat label="Memories" value={stats.memories} icon="🪨" />
            <AnimatedStat label="Butterflies" value={stats.butterflies} icon="🦋" />
            <AnimatedStat label="Trees" value={stats.trees} icon="🌳" />
            <AnimatedStat label="Huts" value={stats.huts} icon="🏡" />
            <AnimatedStat label="Energy" value={stats.energy} icon="✨" />
          </div>
        </div>
      )}
    </div>
  );
}
