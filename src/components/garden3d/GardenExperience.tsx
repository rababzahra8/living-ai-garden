import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { GardenScene } from "./scene/GardenScene";
import type { GardenWeather } from "@/lib/garden3d/garden-weather";
import type { GardenMode, SeedVisual } from "@/lib/garden3d/types";

export type GardenExperienceProps = {
  mode: GardenMode;
  seeds?: SeedVisual[];
  threadTitles?: Record<string, string>;
  latestThreadId?: string | null;
  onGardenerClick?: () => void;
  onFlowerClick?: (threadId: string) => void;
  nightMode?: boolean;
  energy?: number;
  weather?: GardenWeather;
  weatherStrength?: number;
};

export default function GardenExperience({
  mode,
  seeds = [],
  threadTitles = {},
  latestThreadId = null,
  onGardenerClick,
  onFlowerClick,
  nightMode = false,
  energy = 0,
  weather,
  weatherStrength = 1,
}: GardenExperienceProps) {
  return (
    <>
      <Canvas
        shadows={mode !== "landing"}
        dpr={mode === "landing" ? [1, 1.15] : [1, 1.75]}
        camera={{ position: [0, 5.5, 13], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute inset-0 touch-none"
      >
        <Suspense fallback={null}>
          <GardenScene
            mode={mode}
            seeds={seeds}
            threadTitles={threadTitles}
            latestThreadId={latestThreadId}
            onGardenerClick={onGardenerClick}
            onFlowerClick={onFlowerClick}
            nightMode={nightMode}
            energy={energy}
            weather={weather}
            weatherStrength={weatherStrength}
          />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ background: "transparent" }}
        innerStyles={{ width: 120, height: 2, background: "rgba(255,255,255,0.15)" }}
        barStyles={{ height: 2, background: "rgba(255,255,255,0.85)" }}
        dataStyles={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "system-ui" }}
      />
    </>
  );
}
