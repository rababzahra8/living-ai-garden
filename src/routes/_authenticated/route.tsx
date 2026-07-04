import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ASYNC_TIMEOUT, withTimeout } from "@/lib/async-safe";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const {
        data: { session },
        error,
      } = await withTimeout(supabase.auth.getSession(), ASYNC_TIMEOUT.auth, "Session check timed out");
      if (error || !session?.user) throw redirect({ to: "/auth" });
      return { user: session.user };
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
