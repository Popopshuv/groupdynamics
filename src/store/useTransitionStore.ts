import { create } from "zustand";

export type TransitionPhase =
  | "idle"
  | "exiting"
  | "navigating"
  | "entering"
  | "revealing";

interface TransitionState {
  phase: TransitionPhase;
  targetPath: string | null;
  isFirstLoad: boolean;
  preloaderDone: boolean;
  blocksReady: boolean;
  /** True when both preloader and blocks intro are done */
  introComplete: boolean;
  setPhase: (phase: TransitionPhase) => void;
  startTransition: (path: string) => void;
  completeTransition: () => void;
  setPreloaderDone: () => void;
  setBlocksReady: () => void;
}

function checkIntroComplete(preloaderDone: boolean, blocksReady: boolean): boolean {
  return preloaderDone && blocksReady;
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  phase: "idle",
  targetPath: null,
  isFirstLoad: true,
  preloaderDone: false,
  blocksReady: false,
  introComplete: false,
  setPhase: (phase) => set({ phase }),
  startTransition: (path) => set({ phase: "exiting", targetPath: path }),
  completeTransition: () =>
    set({ phase: "idle", targetPath: null, isFirstLoad: false }),
  setPreloaderDone: () => {
    const { blocksReady } = get();
    set({
      preloaderDone: true,
      isFirstLoad: false,
      introComplete: checkIntroComplete(true, blocksReady),
    });
  },
  setBlocksReady: () => {
    const { preloaderDone } = get();
    set({
      blocksReady: true,
      introComplete: checkIntroComplete(preloaderDone, true),
    });
  },
}));
