import { lazy, Suspense } from "react";
import type { GardenExperienceProps } from "./GardenExperience";

const GardenExperience = lazy(() => import("./GardenExperience"));

function GardenFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-200/80 via-emerald-100/40 to-emerald-900/30 dark:from-slate-950 dark:via-indigo-950/40 dark:to-emerald-950/30">
      <div className="flex h-full items-center justify-center">
        <div className="glass-panel px-6 py-4 text-sm text-white/70">Awakening the garden…</div>
      </div>
    </div>
  );
}

export function ClientGardenCanvas(props: GardenExperienceProps) {
  return (
    <Suspense fallback={<GardenFallback />}>
      <GardenExperience {...props} />
    </Suspense>
  );
}
