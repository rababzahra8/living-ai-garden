import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import { ClientGardenCanvas } from "@/components/garden3d/ClientGardenCanvas";
import { LandingOverlay } from "@/components/garden3d/ui/LandingOverlay";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { ASYNC_TIMEOUT, getErrorMessage, withTimeout } from "@/lib/async-safe";
import {
  DEMO_ENERGY,
  DEMO_LATEST_THREAD_ID,
  DEMO_SEEDS,
  DEMO_THREAD_TITLES,
} from "@/lib/garden3d/demo-garden";
import { useDemoGardenShowcase } from "@/lib/garden3d/use-demo-garden-showcase";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const showcase = useDemoGardenShowcase();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false);
      return;
    }

    withTimeout(supabase.auth.getSession(), ASYNC_TIMEOUT.auth, "Session check timed out")
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) navigate({ to: "/garden", replace: true });
      })
      .catch((err) => toast.error(getErrorMessage(err, "Could not verify session")))
      .finally(() => setChecking(false));
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        <p className="text-sm text-white/50">Opening the garden…</p>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <SupabaseConfigBanner />
      <ClientGardenCanvas
        mode="landing"
        seeds={DEMO_SEEDS}
        threadTitles={DEMO_THREAD_TITLES}
        latestThreadId={DEMO_LATEST_THREAD_ID}
        nightMode={showcase.nightMode}
        energy={DEMO_ENERGY}
        weather={showcase.weather}
        weatherStrength={showcase.weatherStrength}
        onGardenerClick={() => navigate({ to: "/auth" })}
        onFlowerClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
      />
      <LandingOverlay showcaseLabel={showcase.phase.label} />
    </div>
  );
}
