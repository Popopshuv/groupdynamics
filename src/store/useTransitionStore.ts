import { create } from "zustand";

export type TransitionPhase =
  | "idle"
  | "exiting" // chaos animation plays
  | "navigating" // route change happens
  | "entering" // blocks settle to resting position
  | "revealing"; // content fades in

interface TransitionState {
  phase: TransitionPhase;
  targetPath: string | null;
  isFirstLoad: boolean;
  preloaderDone: boolean;
  setPhase: (phase: TransitionPhase) => void;
  startTransition: (path: string) => void;
  completeTransition: () => void;
  setPreloaderDone: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  phase: "idle",
  targetPath: null,
  isFirstLoad: true,
  preloaderDone: false,
  setPhase: (phase) => set({ phase }),
  startTransition: (path) => set({ phase: "exiting", targetPath: path }),
  completeTransition: () =>
    set({ phase: "idle", targetPath: null, isFirstLoad: false }),
  setPreloaderDone: () => set({ preloaderDone: true, isFirstLoad: false }),
}));
