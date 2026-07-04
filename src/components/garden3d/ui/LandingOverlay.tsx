import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function LandingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="flex justify-end p-5 pointer-events-auto">
        <div className="glass-pill px-3 py-1.5 text-xs text-white/60">Drag to explore · scroll to zoom</div>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="glass-pill mb-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/75 pointer-events-auto">
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
          A living world on the internet
        </div>

        <div className="glass-panel max-w-2xl px-8 py-10 pointer-events-auto">
          <h1 className="text-balance bg-gradient-to-b from-white to-white/70 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-6xl">
            The Living AI Garden
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-white/65">
            Step into a peaceful three-dimensional meadow. Every conversation plants a seed that grows
            into a unique flower — your memories blooming into a forest over time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="glass-button-primary group relative overflow-hidden rounded-full px-8 py-3 text-sm font-medium text-white"
            >
              <span className="relative z-10">Enter the garden</span>
            </Link>
          </div>
        </div>
      </main>

      <div className="flex justify-center pb-8">
        <div className="glass-pill px-4 py-2 text-xs text-white/50">
          Drag to look around · scroll to zoom in
        </div>
      </div>
    </div>
  );
}
