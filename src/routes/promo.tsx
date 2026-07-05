import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  CloudRain,
  Flower2,
  MessageCircle,
  Moon,
  RotateCcw,
  Sparkles,
  Trees,
  Zap,
} from "lucide-react";
import { markPromoSeen } from "@/lib/promo-seen";

export const Route = createFileRoute("/promo")({
  validateSearch: (search: Record<string, unknown>) => ({
    return: typeof search.return === "string" ? search.return : undefined,
  }),
  component: PromoPage,
});

const FEATURES = [
  {
    id: "chat",
    icon: MessageCircle,
    emoji: "🌿",
    title: "Talk to the Gardener",
    tagline: "Warm AI companion",
    description:
      "Have a real conversation with the Gardener. Brief, thoughtful replies in a calm garden voice. Every thread is saved.",
    mock: (
      <div className="promo-mock-chat space-y-2">
        <div className="promo-bubble promo-bubble-user">I've had a heavy week…</div>
        <div className="promo-bubble promo-bubble-ai">
          That weight is real. We can plant something gentle here, a soft bloom for what you carried.
        </div>
      </div>
    ),
    accent: "from-emerald-400/30 to-teal-500/10",
  },
  {
    id: "flowers",
    icon: Flower2,
    emoji: "🌸",
    title: "Every chat plants a flower",
    tagline: "27 emotions → unique blooms",
    description:
      "Happy, melancholy, playful, heartbroken. Sunflowers, roses, lotus, tulips and more bloom from how you feel.",
    mock: (
      <div className="promo-flower-row flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {[
          { emoji: "🌻", label: "Sunflower" },
          { emoji: "🌹", label: "Rose" },
          { emoji: "🪷", label: "Lotus" },
          { emoji: "🌷", label: "Tulip" },
        ].map((f, i) => (
          <div
            key={f.label}
            className="promo-flower-card flex flex-col items-center gap-1"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="promo-flower-emoji text-4xl sm:text-5xl">{f.emoji}</span>
            <span className="text-[10px] font-medium text-white/45">{f.label}</span>
          </div>
        ))}
      </div>
    ),
    accent: "from-pink-400/30 to-rose-500/10",
  },
  {
    id: "weather",
    icon: CloudRain,
    emoji: "🌧️",
    title: "Living seasons & weather",
    tagline: "Sky shifts through the day",
    description:
      "Spring, summer, autumn, winter, and rain cycle on their own. Chat moods can bring gentle rain or spring warmth that fades. Lock any weather you like.",
    mock: (
      <div className="promo-mock-weather flex justify-center gap-3 text-3xl sm:gap-4 sm:text-4xl">
        {["🌸", "☀️", "🍂", "❄️", "🌧️", "⛈️"].map((e, i) => (
          <span key={e} className="promo-weather-cycle" style={{ animationDelay: `${i * 0.4}s` }}>
            {e}
          </span>
        ))}
      </div>
    ),
    accent: "from-sky-400/30 to-blue-500/10",
  },
  {
    id: "garden",
    icon: Trees,
    emoji: "🦋",
    title: "A living 3D meadow",
    tagline: "Grows with you",
    description:
      "Terrain, pond, grass, butterflies, trees, and huts in a fenced meadow you can arrange. Drag flowers, trees, and huts inside the boundary.",
    mock: (
      <div className="promo-mock-garden grid grid-cols-3 gap-2 text-center text-2xl sm:text-3xl">
        {["🌳", "🦋", "🏡", "🌸", "💧", "✨"].map((e, i) => (
          <span key={e} className="promo-grid-pop rounded-lg bg-white/5 py-2" style={{ animationDelay: `${i * 0.1}s` }}>
            {e}
          </span>
        ))}
      </div>
    ),
    accent: "from-green-400/30 to-lime-500/10",
  },
  {
    id: "night",
    icon: Moon,
    emoji: "🌙",
    title: "Day & night sky",
    tagline: "Sun, moon phases, stars",
    description:
      "Golden mornings, starry nights, drifting clouds, aurora, and a visible moon that tracks real lunar phases. Lights glow on the cottage, trees, and huts at night.",
    mock: (
      <div className="promo-mock-night relative flex h-20 items-center justify-center">
        <span className="promo-moon-glow text-5xl">🌙</span>
        <span className="promo-star absolute left-1/4 top-2 text-xs opacity-80">✦</span>
        <span className="promo-star absolute right-1/4 top-4 text-sm opacity-60" style={{ animationDelay: "0.5s" }}>
          ✦
        </span>
        <span className="promo-star absolute bottom-3 left-1/3 text-xs opacity-70" style={{ animationDelay: "1s" }}>
          ✦
        </span>
      </div>
    ),
    accent: "from-indigo-400/30 to-violet-500/10",
  },
  {
    id: "stones",
    icon: Sparkles,
    emoji: "🪨",
    title: "Stones & energy",
    tagline: "Delete chat → stone marker",
    description:
      "Remove a conversation and the flower becomes a numbered stone, not erased from the meadow. Garden energy stays; trees and butterflies remain.",
    mock: (
      <div className="promo-mock-stats flex justify-center gap-4 text-sm">
        {[
          { label: "Energy", value: "48", icon: "✨" },
          { label: "Flowers", value: "6", icon: "🌸" },
          { label: "Stones", value: "2", icon: "🪨" },
        ].map((s, i) => (
          <div key={s.label} className="promo-stat-pop rounded-xl bg-white/10 px-4 py-3 text-center" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="text-lg">{s.icon}</div>
            <div className="text-lg font-semibold text-white">{s.value}</div>
            <div className="text-[10px] text-white/50">{s.label}</div>
          </div>
        ))}
      </div>
    ),
    accent: "from-amber-400/30 to-orange-500/10",
  },
] as const;

function PromoPage() {
  const navigate = useNavigate();
  const { return: returnTo } = Route.useSearch();
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const feature = FEATURES[index];
  const Icon = feature.icon;
  const fromGarden = returnTo === "garden";

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    goTo((index + 1) % FEATURES.length);
  }, [index, goTo]);

  const enterGarden = useCallback(() => {
    markPromoSeen();
    if (fromGarden) {
      navigate({ to: "/garden" });
    } else {
      navigate({ to: "/" });
    }
  }, [fromGarden, navigate]);

  return (
    <div className="promo-root relative flex min-h-dvh flex-col overflow-hidden bg-slate-950 text-white">
      <div className={`promo-bg absolute inset-0 bg-gradient-to-br ${feature.accent} transition-all duration-700`} />
      <div className="promo-bg-shimmer absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium tracking-wide text-white/80">Living AI Garden</span>
        </div>
        {fromGarden ? (
          <button
            type="button"
            onClick={enterGarden}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/20"
          >
            Skip tour
          </button>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] text-white/50 sm:text-xs">
            Feature tour
          </span>
        )}
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
        <div key={animKey} className="promo-card-enter w-full max-w-2xl">
          <div className="glass-panel overflow-hidden border border-white/10 px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">
                {feature.emoji}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-emerald-300/90">
                  {feature.tagline}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{feature.title}</h2>
              </div>
            </div>

            <div className="mb-6 min-h-[100px] rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              {feature.mock}
            </div>

            <p className="text-pretty text-sm leading-relaxed text-white/70 sm:text-base">{feature.description}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FEATURES.map((f, i) => {
            const FIcon = f.icon;
            const active = i === index;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => goTo(i)}
                className={`promo-pill flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  active
                    ? "bg-white text-slate-900 shadow-lg shadow-white/20"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <FIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{f.title.split(" ").slice(0, 2).join(" ")}</span>
                <span className="sm:hidden">{f.emoji}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Feature ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-emerald-400" : "w-2 bg-white/25 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </main>

      <footer className="relative z-10 flex shrink-0 flex-col items-center gap-3 px-4 pb-8 pt-2 sm:flex-row sm:justify-center">
        {fromGarden ? (
          <button
            type="button"
            onClick={enterGarden}
            className="glass-button-primary w-full max-w-xs rounded-full px-8 py-3.5 text-sm font-semibold sm:w-auto"
          >
            Back to garden
          </button>
        ) : (
          <Link
            to="/"
            className="glass-button-primary w-full max-w-xs rounded-full px-8 py-3.5 text-center text-sm font-semibold sm:w-auto"
          >
            Try the live garden
          </Link>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={next}
            className="glass-button flex items-center gap-2 rounded-full px-5 py-3 text-sm"
          >
            Next feature →
          </button>
          <button
            type="button"
            onClick={() => goTo(0)}
            className="glass-button flex items-center gap-2 rounded-full px-4 py-3 text-sm"
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {!fromGarden && (
        <div className="relative z-10 border-t border-white/10 bg-black/30 px-4 py-3 text-center">
          <p className="text-xs text-white/45">
            Try the live app:{" "}
            <Link to="/" className="text-emerald-300 underline-offset-2 hover:underline">
              living-ai-garden.r-rababzahra888.workers.dev
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
