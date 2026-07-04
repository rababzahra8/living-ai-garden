import { useMemo } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import { visualsFromEnergy } from "@/lib/garden-energy";
import { SkyAtmosphere } from "./SkyAtmosphere";
import { TerrainLandscape, TerrainDetails } from "./TerrainLandscape";
import { PondWater } from "./PondWater";
import { GrassField } from "./GrassField";
import { StylizedTrees } from "./StylizedTrees";
import { GardenHuts } from "./GardenHuts";
import { ConversationFlowers } from "./ConversationFlowers";
import { ButterflySwarm } from "./ButterflySwarm";
import { Gardener3D } from "./Gardener3D";
import { CameraRig } from "./CameraRig";
import { PostEffects } from "./PostEffects";
import { GardenWeatherEffects } from "./GardenWeather";
import { inferGardenWeather } from "@/lib/garden3d/garden-weather";
import type { GardenMode, SeedVisual } from "@/lib/garden3d/types";

export function GardenScene({
  mode,
  seeds,
  threadTitles,
  latestThreadId,
  onGardenerClick,
  onFlowerClick,
  nightMode,
  energy = 0,
}: {
  mode: GardenMode;
  seeds: SeedVisual[];
  threadTitles: Record<string, string>;
  latestThreadId?: string | null;
  onGardenerClick?: () => void;
  onFlowerClick?: (threadId: string) => void;
  nightMode: boolean;
  energy?: number;
}) {
  const visuals = useMemo(() => visualsFromEnergy(energy), [energy]);
  const activeSeeds = useMemo(
    () => seeds.filter((s) => s.thread_id && !s.deleted_at),
    [seeds],
  );
  const weather = useMemo(
    () => inferGardenWeather(activeSeeds, threadTitles, latestThreadId),
    [activeSeeds, threadTitles, latestThreadId],
  );
  const timeOfDay = nightMode ? "night" : mode === "landing" ? "golden" : "morning";

  return (
    <>
      <color attach="background" args={[nightMode ? "#0f172a" : weather === "rain" ? "#9eb0c4" : weather === "rainbow" ? "#b8d8f0" : "#87ceeb"]} />
      <SkyAtmosphere timeOfDay={timeOfDay} nightMode={nightMode} weather={weather} />
      <Environment preset={nightMode ? "night" : "park"} environmentIntensity={0.35} />

      <TerrainLandscape />
      <TerrainDetails />
      <GrassField />
      <PondWater />
      <StylizedTrees count={visuals.trees} />
      <GardenHuts count={visuals.huts} />

      <ConversationFlowers seeds={seeds} threadTitles={threadTitles} onFlowerClick={onFlowerClick} />
      <ButterflySwarm count={visuals.butterflies} />
      <GardenWeatherEffects weather={weather} />

      <Gardener3D onClick={onGardenerClick} />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={40} blur={2.5} far={12} />

      <CameraRig mode={mode} seeds={seeds} />
      <PostEffects nightMode={nightMode} />
    </>
  );
}
