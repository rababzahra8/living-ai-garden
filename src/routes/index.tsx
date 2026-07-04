import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseConfigBanner } from "@/components/SupabaseConfigBanner";
import { ClientGardenCanvas } from "@/components/garden3d/ClientGardenCanvas";
import { LandingOverlay } from "@/components/garden3d/ui/LandingOverlay";
import { useTheme } from "@/lib/theme";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { ASYNC_TIMEOUT, getErrorMessage, withTimeout } from "@/lib/async-safe";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [checking, setChecking] = useState(true);

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
        nightMode={theme === "dark"}
        onGardenerClick={() => navigate({ to: "/auth" })}
      />
      <LandingOverlay />
    </div>
  );
}
