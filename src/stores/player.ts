import { create } from "zustand";
import type { VizPoint } from "@/lib/types";

// Single shared audio player. One <audio> element lives here so a play button
// anywhere on the page controls the same playback and the bottom PlayerBar
type PlayerState = {
  audio: HTMLAudioElement | null;
  currentTrack: VizPoint | null;
  isPlaying: boolean;
  toggle: (point: VizPoint) => void;
  pause: () => void;
  resume: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  audio: null,
  currentTrack: null,
  isPlaying: false,

  toggle: (point) => {
    const { audio, currentTrack, isPlaying } = get();
    if (currentTrack?.id === point.id && audio) {
      if (isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play().catch(() => set({ isPlaying: false }));
        set({ isPlaying: true });
      }
      return;
    }
    audio?.pause();
    const next = new Audio(point.audio_url);
    next.addEventListener("ended", () => set({ isPlaying: false }));
    next.addEventListener("error", () => set({ isPlaying: false }));
    set({ audio: next, currentTrack: point, isPlaying: true });
    next.play().catch(() => set({ isPlaying: false }));
  },

  pause: () => {
    get().audio?.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    const { audio } = get();
    if (!audio) return;
    audio.play().catch(() => set({ isPlaying: false }));
    set({ isPlaying: true });
  },
}));
