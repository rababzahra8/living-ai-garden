import { useMemo, useState } from "react";
import { Environment, ContactShadows } from "@react-three/drei";
import { visualsFromEnergy } from "@/lib/garden-energy";
import {
  defaultHutPlacements,
  defaultTreePlacements,
  type HutPlacement,
  type TreePlacement,
} from "@/lib/garden3d/scenery-layout";
import { SkyAtmosphere } from "./SkyAtmosphere";
import { TerrainLandscape, TerrainDetails } from "./TerrainLandscape";
import { PondWater } from "./PondWater";
import { GrassField } from "./GrassField";
import { StylizedTrees } from "./StylizedTrees";
import { GardenHuts } from "./GardenHuts";
import { ConversationFlowers } from "./ConversationFlowers";
import { GardenBoundary } from "./GardenBoundary";
import { ButterflySwarm } from "./ButterflySwarm";
import { Gardener3D } from "./Gardener3D";
import { CameraRig } from "./CameraRig";
import { PostEffects } from "./PostEffects";
import { GardenWeatherEffects } from "./GardenWeather";
import { inferGardenMood } from "@/lib/garden3d/garden-weather";
import type { GardenMode, SeedVisual } from "@/lib/garden3d/types";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import { GardenerCottage } from "./GardenerCottage";
import { WeatherAnimationDriver } from "./WeatherAnimationDriver";
import { SmoothSkyBackground } from "./SmoothSkyBackground";

export function GardenScene({
  mode,
  seeds,
  threadTitles,
  latestThreadId,
  onGardenerClick,
  onFlowerClick,
  arrangeMode = false,
  onMoveSeed,
  onDragEnd,
  onDragStateChange,
  trees,
  huts,
  onMoveScenery,
  onDragEndScenery,
  onSceneryDragStateChange,
  nightMode,
  energy = 0,
  weather: weatherProp,
  weatherStrength = 1,
}: {
  mode: GardenMode;
  seeds: SeedVisual[];
  threadTitles: Record<string, string>;
  latestThreadId?: string | null;
  onGardenerClick?: () => void;
  onFlowerClick?: (threadId: string) => void;
  arrangeMode?: boolean;
  onMoveSeed?: (seedId: string, x: number, y: number) => void;
  onDragEnd?: (seedId: string, x: number, y: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
  trees?: TreePlacement[];
  huts?: HutPlacement[];
  onMoveScenery?: (id: string, x: number, z: number) => void;
  onDragEndScenery?: (id: string, x: number, z: number) => void;
  onSceneryDragStateChange?: (dragging: boolean) => void;
  nightMode: boolean;
  energy?: number;
  weather?: GardenWeather;
  weatherStrength?: number;
}) {
  const lite = mode === "landing";
  const [flowerDragging, setFlowerDragging] = useState(false);
  const [sceneryDragging, setSceneryDragging] = useState(false);
  const sceneDragging = flowerDragging || sceneryDragging;
  const visuals = useMemo(() => {
    const v = visualsFromEnergy(energy);
    if (!lite) return v;
    return {
      ...v,
      trees: Math.min(v.trees, 4),
      butterflies: Math.min(v.butterflies, 4),
      huts: Math.min(v.huts, 2),
    };
  }, [energy, lite]);
  const activeSeeds = useMemo(
    () => seeds.filter((s) => s.thread_id && !s.deleted_at),
    [seeds],
  );
  const inferredWeather = useMemo(
    () => inferGardenMood(activeSeeds, threadTitles, latestThreadId),
    [activeSeeds, threadTitles, latestThreadId],
  );
  const weather = weatherProp ?? inferredWeather;
  const activeWeather = weather;
  const timeOfDay = nightMode ? "night" : mode === "landing" ? "golden" : "morning";

  const handleDragState = (dragging: boolean) => {
    setFlowerDragging(dragging);
    onDragStateChange?.(dragging);
  };

  const handleSceneryDragState = (dragging: boolean) => {
    setSceneryDragging(dragging);
    onSceneryDragStateChange?.(dragging);
  };

  const treePlacements = trees ?? defaultTreePlacements(visuals.trees);
  const hutPlacements = huts ?? defaultHutPlacements(visuals.huts);

  return (
    <>
      <WeatherAnimationDriver
        weather={activeWeather}
        strength={weatherStrength}
        nightMode={nightMode}
      />
      <SmoothSkyBackground />
      <SkyAtmosphere
        timeOfDay={timeOfDay}
        nightMode={nightMode}
        weather={activeWeather}
        weatherStrength={weatherStrength}
        lite={lite}
      />
      {!lite && <Environment preset={nightMode ? "night" : "park"} environmentIntensity={0.35} />}

      <TerrainLandscape />
      {!lite && <TerrainDetails />}
      <GrassField lite={lite} nightMode={nightMode} />
      <PondWater />
      <StylizedTrees
        trees={treePlacements}
        arrangeMode={arrangeMode && !lite}
        nightMode={nightMode}
        onMoveScenery={onMoveScenery}
        onDragEndScenery={onDragEndScenery}
        onDragStateChange={handleSceneryDragState}
      />
      <GardenHuts
        huts={hutPlacements}
        arrangeMode={arrangeMode && !lite}
        nightMode={nightMode}
        onMoveScenery={onMoveScenery}
        onDragEndScenery={onDragEndScenery}
        onDragStateChange={handleSceneryDragState}
      />
      {!lite && <GardenBoundary />}

      <ConversationFlowers
        seeds={seeds}
        threadTitles={threadTitles}
        arrangeMode={arrangeMode}
        onFlowerClick={onFlowerClick}
        onMoveSeed={onMoveSeed}
        onDragEnd={onDragEnd}
        onDragStateChange={handleDragState}
      />
      <ButterflySwarm count={visuals.butterflies} />
      <GardenWeatherEffects weather={activeWeather} lite={lite} nightMode={nightMode} />

      <GardenerCottage nightMode={nightMode} />
      <Gardener3D onClick={onGardenerClick} nightMode={nightMode} />

      {!lite && (
        <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={40} blur={2.5} far={12} />
      )}

      <CameraRig mode={mode} seeds={seeds} arrangeMode={arrangeMode} sceneDragging={sceneDragging} />
      <PostEffects nightMode={nightMode} lite={lite} />
    </>
  );
}
