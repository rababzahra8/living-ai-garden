import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { createThread, deleteThread } from "@/lib/chat.functions";
import { inferGardenWeather } from "@/lib/garden3d/garden-weather";
import { ClientGardenCanvas } from "@/components/garden3d/ClientGardenCanvas";
import { GardenChrome } from "@/components/garden3d/ui/GardenChrome";
import { useTheme } from "@/lib/theme";

type SeedRow = {
  id: string;
  thread_id: string | null;
  x: number;
  y: number;
  hue: number;
  growth: number;
  species: string;
  conversation_number: number;
  deleted_at: string | null;
};

type ThreadRow = { id: string; title: string; updated_at: string };

export const Route = createFileRoute("/_authenticated/garden")({
  component: GardenPage,
});

function GardenPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createThreadFn = useServerFn(createThread);
  const deleteThreadFn = useServerFn(deleteThread);
  const { theme } = useTheme();
  const [threadsOpen, setThreadsOpen] = useState(false);

  const seedsQ = useQuery({
    queryKey: ["seeds"],
    queryFn: async (): Promise<SeedRow[]> => {
      const { data, error } = await supabase
        .from("seeds")
        .select("id, thread_id, x, y, hue, growth, species, conversation_number, deleted_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as SeedRow[];
    },
    retry: 1,
  });

  const energyQ = useQuery({
    queryKey: ["garden-energy"],
    queryFn: async (): Promise<number> => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return 0;

      const { data, error } = await supabase
        .from("user_garden")
        .select("energy")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.energy ?? 0;
    },
    retry: 1,
  });

  const threadsQ = useQuery({
    queryKey: ["threads"],
    queryFn: async (): Promise<ThreadRow[]> => {
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as ThreadRow[];
    },
    retry: 1,
  });

  useEffect(() => {
    const err = seedsQ.error ?? threadsQ.error ?? energyQ.error;
    if (err) toast.error(err instanceof Error ? err.message : "Could not load garden data");
  }, [seedsQ.error, threadsQ.error, energyQ.error]);

  const threadTitles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of threadsQ.data ?? []) map[t.id] = t.title;
    return map;
  }, [threadsQ.data]);

  const startChat = useMutation({
    mutationFn: async () => createThreadFn(),
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not start"),
  });

  const deleteConversation = useMutation({
    mutationFn: async (threadId: string) => deleteThreadFn({ data: { threadId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      qc.invalidateQueries({ queryKey: ["seeds"] });
      qc.invalidateQueries({ queryKey: ["garden-energy"] });
      toast.success("Conversation archived as a numbered memory — your energy remains");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  const goToThread = (threadId: string) => {
    setThreadsOpen(false);
    navigate({ to: "/chat/$threadId", params: { threadId } });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const seeds = seedsQ.data ?? [];
  const energy = energyQ.data ?? 0;
  const activeSeeds = useMemo(() => seeds.filter((s) => s.thread_id && !s.deleted_at), [seeds]);
  const weather = useMemo(
    () => inferGardenWeather(activeSeeds, threadTitles, threadsQ.data?.[0]?.id ?? null),
    [activeSeeds, threadTitles, threadsQ.data],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <ClientGardenCanvas
        mode="garden"
        seeds={seeds}
        threadTitles={threadTitles}
        latestThreadId={threadsQ.data?.[0]?.id ?? null}
        nightMode={theme === "dark"}
        energy={energy}
        onGardenerClick={() => startChat.mutate()}
        onFlowerClick={goToThread}
      />

      <GardenChrome
        energy={energy}
        seeds={seeds}
        weather={weather}
        threads={threadsQ.data ?? []}
        threadsOpen={threadsOpen}
        onThreadsOpenChange={setThreadsOpen}
        onNewChat={() => startChat.mutate()}
        onOpenThread={goToThread}
        onDeleteThread={(id) => deleteConversation.mutate(id)}
        onSignOut={signOut}
        chatPending={startChat.isPending}
        deletePending={deleteConversation.isPending}
      />
    </div>
  );
}
