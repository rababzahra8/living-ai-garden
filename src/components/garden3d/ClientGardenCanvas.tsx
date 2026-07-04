import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, type ComponentType } from "react";

import { LoadErrorPanel } from "@/components/LoadErrorPanel";
import { ASYNC_TIMEOUT, getErrorMessage, withTimeout } from "@/lib/async-safe";
import type { GardenExperienceProps } from "./GardenExperience";

function GardenFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-sky-200/80 via-emerald-100/40 to-emerald-900/30 dark:from-slate-950 dark:via-indigo-950/40 dark:to-emerald-950/30">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        <div className="glass-panel px-6 py-4 text-sm text-white/70">Awakening the garden…</div>
      </div>
    </div>
  );
}

export function ClientGardenCanvas(props: GardenExperienceProps) {
  const [GardenExperience, setGardenExperience] = useState<ComponentType<GardenExperienceProps> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  const loadGarden = useCallback(() => {
    setError(null);
    setGardenExperience(null);

    withTimeout(import("./GardenExperience"), ASYNC_TIMEOUT.garden3d, "The 3D garden took too long to load")
      .then((mod) => setGardenExperience(() => mod.default))
      .catch((err) => setError(getErrorMessage(err, "Could not load the garden")));
  }, []);

  useEffect(() => {
    loadGarden();
  }, [loadGarden, loadKey]);

  if (error) {
    return (
      <div className="absolute inset-0 bg-slate-950">
        <LoadErrorPanel
          className="h-full text-white/70 [&_p]:text-white/70"
          message={error}
          onRetry={() => setLoadKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!GardenExperience) {
    return <GardenFallback />;
  }

  return <GardenExperience {...props} />;
}
