const MUTE_KEY = "garden-audio-muted";
const AMBIENCE_SRC = "/audio/garden-ambience.mp3";
const RAIN_SRC = "/audio/rain.mp3";
const AMBIENCE_VOLUME = 0.42;
const RAIN_VOLUME = 0.5;

export function readGardenAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "true";
}

export function writeGardenAudioMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUTE_KEY, String(muted));
}

/** Looping birdsong + rain layers for the garden. */
export function createGardenAudio() {
  let ambience: HTMLAudioElement | null = null;
  let rain: HTMLAudioElement | null = null;
  let rainMix = 0;
  let muted = readGardenAudioMuted();

  const ensure = () => {
    if (!ambience) {
      ambience = new Audio(AMBIENCE_SRC);
      ambience.loop = true;
      ambience.preload = "auto";
    }
    if (!rain) {
      rain = new Audio(RAIN_SRC);
      rain.loop = true;
      rain.preload = "auto";
    }
  };

  const applyVolumes = () => {
    if (!ambience || !rain) return;
    if (muted) {
      ambience.volume = 0;
      rain.volume = 0;
      return;
    }
    ambience.volume = AMBIENCE_VOLUME * (1 - rainMix * 0.7);
    rain.volume = RAIN_VOLUME * rainMix;
  };

  const tryPlayAmbience = async () => {
    ensure();
    if (!ambience) return;
    try {
      if (ambience.paused) await ambience.play();
    } catch {
      /* autoplay blocked until user interacts */
    }
  };

  const syncRainPlayback = async () => {
    if (!rain || muted) return;
    if (rainMix > 0.02) {
      try {
        if (rain.paused) await rain.play();
      } catch {
        /* ignore */
      }
    } else if (!rain.paused) {
      rain.pause();
    }
  };

  return {
    async start() {
      await tryPlayAmbience();
      await syncRainPlayback();
    },
    setWeather(isRaining: boolean, strength: number) {
      rainMix = isRaining ? Math.min(1, Math.max(0, strength)) : 0;
      applyVolumes();
      void syncRainPlayback();
    },
    setMuted(nextMuted: boolean) {
      muted = nextMuted;
      writeGardenAudioMuted(muted);
      applyVolumes();
      if (!muted) {
        void tryPlayAmbience();
        void syncRainPlayback();
      }
    },
    isMuted() {
      return muted;
    },
    destroy() {
      for (const track of [ambience, rain]) {
        if (!track) continue;
        track.pause();
        track.removeAttribute("src");
        track.load();
      }
      ambience = null;
      rain = null;
      rainMix = 0;
    },
  };
}

/** @deprecated Use createGardenAudio */
export const createGardenAmbience = createGardenAudio;
