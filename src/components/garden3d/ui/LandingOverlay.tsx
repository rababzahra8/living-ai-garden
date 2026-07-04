import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function LandingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-0 flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-auto flex shrink-0 justify-end p-3 sm:p-5">
        <div className="glass-pill max-w-[calc(100vw-1.5rem)] px-3 py-1.5 text-[10px] leading-snug text-white/60 sm:text-xs">
          <span className="hidden sm:inline">Drag to explore · scroll to zoom</span>
          <span className="sm:hidden">Drag · scroll to zoom</span>
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-4 text-center sm:px-6 sm:py-6">
        <div className="glass-pill pointer-events-auto mb-3 inline-flex max-w-full items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-white/75 sm:mb-5 sm:px-4 sm:py-2 sm:text-xs">
          <Sparkles className="h-3 w-3 shrink-0 text-emerald-300 sm:h-3.5 sm:w-3.5" />
          <span className="truncate">A living world on the internet</span>
        </div>

        <div className="glass-panel pointer-events-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
          <h1 className="text-balance bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(1.75rem,8vw,3.75rem)] font-semibold leading-tight tracking-tight text-transparent">
            The Living AI Garden
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-white/65 sm:mt-5 sm:text-lg">
            Step into a peaceful three-dimensional meadow. Every conversation plants a seed that grows
            into a unique flower — your memories blooming into a forest over time.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="glass-button-primary group relative w-full max-w-xs overflow-hidden rounded-full px-6 py-3 text-sm font-medium text-white sm:w-auto sm:px-8"
            >
              <span className="relative z-10">Enter the garden</span>
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="text-sm text-white/60 underline-offset-4 hover:text-white/90 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <div className="flex shrink-0 justify-center px-3 pb-4 pt-2 sm:pb-8">
        <div className="glass-pill max-w-full px-3 py-1.5 text-[10px] text-white/50 sm:px-4 sm:py-2 sm:text-xs">
          <span className="hidden sm:inline">Drag to look around · scroll to zoom in</span>
          <span className="sm:hidden">Drag to look · pinch to zoom</span>
        </div>
      </div>
    </div>
  );
}
