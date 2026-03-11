import { create } from "zustand";

interface VideoState {
  playStartTime: number | null;
  lastPosition: number;
  setPlayStartTime: (time: number) => void;
  clearPlayStartTime: () => void;
  setLastPosition: (pos: number) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  playStartTime: null,
  lastPosition: 0,
  setPlayStartTime: (time) => set({ playStartTime: time }),
  clearPlayStartTime: () => set({ playStartTime: null }),
  setLastPosition: (pos) => set({ lastPosition: pos }),
}));
