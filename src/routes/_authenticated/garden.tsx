import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { createThread, deleteThread, updateSeedPosition } from "@/lib/chat.functions";
import { inferGardenMood } from "@/lib/garden3d/garden-weather";
import {
  commitSceneryMove,
  loadSceneryPositions,
  mergeHutPlacements,
  mergeTreePlacements,
  saveSceneryPositions,
  type SceneryPositions,
} from "@/lib/garden3d/scenery-layout";
import { useGardenWeather } from "@/lib/garden3d/use-garden-weather";
import { useWeatherSettling } from "@/lib/garden3d/use-weather-settling";
import { ClientGardenCanvas } from "@/components/garden3d/ClientGardenCanvas";
import { GardenChrome } from "@/components/garden3d/ui/GardenChrome";
import { WeatherTransitionOverlay } from "@/components/garden3d/ui/WeatherTransitionOverlay";
import { useGardenAudio } from "@/lib/use-garden-audio";
import { useTheme } from "@/lib/theme";
import { hasSeenPromo } from "@/lib/promo-seen";
import { visualsFromEnergy } from "@/lib/garden-energy";

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
  const updateSeedPositionFn = useServerFn(updateSeedPosition);
  const { theme } = useTheme();
  const [threadsOpen, setThreadsOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenPromo()) {
      navigate({ to: "/promo", search: { return: "garden" } });
    }
  }, [navigate]);
  const [arrangeMode, setArrangeMode] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const positionOverridesRef = useRef(positionOverrides);
  positionOverridesRef.current = positionOverrides;

  const [scenerySaved, setScenerySaved] = useState<SceneryPositions>(() => loadSceneryPositions());
  const [sceneryOverrides, setSceneryOverrides] = useState<Record<string, { x: number; z: number }>>({});
  const sceneryOverridesRef = useRef(sceneryOverrides);
  sceneryOverridesRef.current = sceneryOverrides;

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
      toast.success("Chat removed — a stone marks where the flower grew");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  const savePosition = useMutation({
    mutationFn: async ({ seedId, x, y }: { seedId: string; x: number; y: number }) =>
      updateSeedPositionFn({ data: { seedId, x, y } }),
    onSuccess: (_result, { seedId }) => {
      setPositionOverrides((prev) => {
        if (!prev[seedId]) return prev;
        const next = { ...prev };
        delete next[seedId];
        return next;
      });
      qc.invalidateQueries({ queryKey: ["seeds"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not move flower"),
  });

  const flushPositionOverrides = (overrides: Record<string, { x: number; y: number }>) => {
    const originals = seedsQ.data ?? [];
    for (const [seedId, pos] of Object.entries(overrides)) {
      const orig = originals.find((s) => s.id === seedId);
      if (!orig || orig.x !== pos.x || orig.y !== pos.y) {
        savePosition.mutate({ seedId, x: pos.x, y: pos.y });
      }
    }
  };

  const flushSceneryOverrides = (overrides: Record<string, { x: number; z: number }>) => {
    if (Object.keys(overrides).length === 0) return;
    let next = scenerySaved;
    for (const [id, pos] of Object.entries(overrides)) {
      next = commitSceneryMove(next, id, pos.x, pos.z);
    }
    setScenerySaved(next);
    saveSceneryPositions(next);
    setSceneryOverrides({});
  };

  const handleArrangeModeChange = (on: boolean) => {
    if (!on) {
      flushPositionOverrides(positionOverridesRef.current);
      flushSceneryOverrides(sceneryOverridesRef.current);
    }
    setArrangeMode(on);
  };

  const displaySeeds = useMemo(
    () =>
      (seedsQ.data ?? []).map((s) => {
        const o = positionOverrides[s.id];
        return o ? { ...s, x: o.x, y: o.y } : s;
      }),
    [seedsQ.data, positionOverrides],
  );

  const handleMoveSeed = (seedId: string, x: number, y: number) => {
    setPositionOverrides((prev) => ({ ...prev, [seedId]: { x, y } }));
  };

  const handleDragEnd = (seedId: string, x: number, y: number) => {
    savePosition.mutate({ seedId, x, y });
  };

  const handleMoveScenery = (id: string, x: number, z: number) => {
    setSceneryOverrides((prev) => ({ ...prev, [id]: { x, z } }));
  };

  const handleDragEndScenery = (id: string, x: number, z: number) => {
    const next = commitSceneryMove(scenerySaved, id, x, z);
    setScenerySaved(next);
    saveSceneryPositions(next);
    setSceneryOverrides((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const goToThread = (threadId: string) => {
    setThreadsOpen(false);
    navigate({ to: "/chat/$threadId", params: { threadId } });
  };

  const chatWithGardener = () => {
    const latest = threadsQ.data?.[0];
    if (latest) {
      goToThread(latest.id);
    } else {
      startChat.mutate();
    }
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const seeds = displaySeeds;
  const energy = energyQ.data ?? 0;
  const visuals = useMemo(() => visualsFromEnergy(energy), [energy]);
  const treePlacements = useMemo(
    () => mergeTreePlacements(visuals.trees, scenerySaved, sceneryOverrides),
    [visuals.trees, scenerySaved, sceneryOverrides],
  );
  const hutPlacements = useMemo(
    () => mergeHutPlacements(visuals.huts, scenerySaved, sceneryOverrides),
    [visuals.huts, scenerySaved, sceneryOverrides],
  );
  const activeSeeds = useMemo(() => seeds.filter((s) => s.thread_id && !s.deleted_at), [seeds]);
  const inferredMood = useMemo(
    () => inferGardenMood(activeSeeds, threadTitles, threadsQ.data?.[0]?.id ?? null),
    [activeSeeds, threadTitles, threadsQ.data],
  );
  const latestThread = threadsQ.data?.[0];
  const latestSeed = useMemo(
    () => activeSeeds.find((s) => s.thread_id === latestThread?.id),
    [activeSeeds, latestThread?.id],
  );
  const weatherEmotionKey = `${latestThread?.updated_at ?? ""}:${latestSeed?.species ?? ""}:${inferredMood}`;
  const {
    weather,
    strength: weatherStrength,
    preference: weatherPreference,
    setPreference: setWeatherPreference,
    inferredMood: moodFromChat,
  } = useGardenWeather(inferredMood, weatherEmotionKey);
  const { muted: audioMuted, toggleMute: toggleAudio } = useGardenAudio(
    true,
    weather === "rain",
    weatherStrength,
  );
  const weatherSettling = useWeatherSettling();

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <ClientGardenCanvas
        mode="garden"
        seeds={seeds}
        threadTitles={threadTitles}
        latestThreadId={threadsQ.data?.[0]?.id ?? null}
        nightMode={theme === "dark"}
        energy={energy}
        weather={weather}
        weatherStrength={weatherStrength}
        onGardenerClick={chatWithGardener}
        onFlowerClick={arrangeMode ? undefined : goToThread}
        arrangeMode={arrangeMode}
        onMoveSeed={handleMoveSeed}
        onDragEnd={handleDragEnd}
        trees={treePlacements}
        huts={hutPlacements}
        onMoveScenery={handleMoveScenery}
        onDragEndScenery={handleDragEndScenery}
      />

      <WeatherTransitionOverlay
        settling={weatherSettling.settling}
        progress={weatherSettling.progress}
        weather={weatherSettling.weather}
      />

      <GardenChrome
        energy={energy}
        seeds={seeds}
        weather={weather}
        inferredMood={moodFromChat}
        weatherPreference={weatherPreference}
        onWeatherPreferenceChange={setWeatherPreference}
        nightMode={theme === "dark"}
        threads={threadsQ.data ?? []}
        threadsOpen={threadsOpen}
        onThreadsOpenChange={setThreadsOpen}
        onChatWithGardener={chatWithGardener}
        onNewChat={() => startChat.mutate()}
        onOpenThread={goToThread}
        onDeleteThread={(id) => deleteConversation.mutate(id)}
        onSignOut={signOut}
        chatPending={startChat.isPending}
        deletePending={deleteConversation.isPending}
        arrangeMode={arrangeMode}
        onArrangeModeChange={handleArrangeModeChange}
        audioMuted={audioMuted}
        onAudioToggle={toggleAudio}
      />

      {arrangeMode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex justify-center px-4">
          <div className="glass-pill px-4 py-2 text-center text-xs text-white/80 sm:text-sm">
            Arrange — drag flowers (green), trees (purple), huts (gold). Tap Done to save.
          </div>
        </div>
      )}
    </div>
  );
}
