import { useRef, type RefObject } from "react";
import { EffectComposer, Bloom, Vignette, GodRays, Noise } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import { MOON_POSITION } from "@/lib/garden3d/night-sky-shaders";

const bloomDay = (
  <Bloom intensity={0.25} luminanceThreshold={0.78} luminanceSmoothing={0.85} mipmapBlur />
);
const bloomNight = (
  <Bloom intensity={0.85} luminanceThreshold={0.42} luminanceSmoothing={0.75} mipmapBlur />
);
const bloomLiteDay = (
  <Bloom intensity={0.18} luminanceThreshold={0.82} luminanceSmoothing={0.9} mipmapBlur />
);
const bloomLiteNight = (
  <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur />
);

export function PostEffects({ nightMode, lite = false }: { nightMode: boolean; lite?: boolean }) {
  const moonLightRef = useRef<THREE.Mesh>(null);

  if (lite) {
    return (
      <EffectComposer multisampling={0}>
        {nightMode ? bloomLiteNight : bloomLiteDay}
        <Vignette
          eskil
          offset={0.12}
          darkness={nightMode ? 0.45 : 0.3}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    );
  }

  if (nightMode) {
    return (
      <>
        <mesh ref={moonLightRef} position={MOON_POSITION} renderOrder={998}>
          <sphereGeometry args={[2.5, 12, 12]} />
          <meshBasicMaterial color="#eef4ff" toneMapped={false} fog={false} />
        </mesh>
        <EffectComposer multisampling={0}>
          <GodRays
            sun={moonLightRef as RefObject<THREE.Mesh>}
            blendFunction={BlendFunction.SCREEN}
            samples={50}
            density={0.94}
            decay={0.92}
            weight={0.35}
            exposure={0.45}
            clampMax={1}
            kernelSize={KernelSize.SMALL}
            blur
          />
          {bloomNight}
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil offset={0.1} darkness={0.62} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      {bloomDay}
      <Vignette eskil offset={0.1} darkness={0.35} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
