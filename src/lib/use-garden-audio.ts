import { useCallback, useEffect, useRef, useState } from "react";
import { createGardenAudio, readGardenAudioMuted } from "@/lib/garden-audio";

export function useGardenAudio(
  active = true,
  isRaining = false,
  rainStrength = 1,
) {
  const audioRef = useRef<ReturnType<typeof createGardenAudio> | null>(null);
  const [muted, setMuted] = useState(() => readGardenAudioMuted());

  useEffect(() => {
    if (!active) return;
    const audio = createGardenAudio();
    audioRef.current = audio;
    audio.setMuted(muted);
    audio.setWeather(isRaining, rainStrength);
    void audio.start();

    const resumeOnGesture = () => {
      void audio.start();
    };
    window.addEventListener("pointerdown", resumeOnGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      audio.destroy();
    };
  }, [active]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    audioRef.current?.setWeather(isRaining, rainStrength);
  }, [isRaining, rainStrength]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  return { muted, toggleMute };
}
