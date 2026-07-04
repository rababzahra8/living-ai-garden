import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClientGardenCanvas } from "@/components/garden3d/ClientGardenCanvas";
import { LandingOverlay } from "@/components/garden3d/ui/LandingOverlay";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/garden", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return <div className="min-h-dvh bg-slate-950" />;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <ClientGardenCanvas
        mode="landing"
        nightMode={theme === "dark"}
        onGardenerClick={() => navigate({ to: "/auth" })}
      />
      <LandingOverlay />
    </div>
  );
}
