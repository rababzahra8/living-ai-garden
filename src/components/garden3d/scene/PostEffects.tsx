import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function PostEffects({ nightMode }: { nightMode: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={nightMode ? 0.45 : 0.25}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil offset={0.15} darkness={0.35} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
