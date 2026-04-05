"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTransitionStore } from "@/store/useTransitionStore";

export function TransitionController() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const unsubscribe = useTransitionStore.subscribe((state, prev) => {
      // When chaos animation finishes and we move to "navigating"
      if (state.phase === "navigating" && prev.phase === "exiting") {
        if (state.targetPath && !hasNavigated.current) {
          hasNavigated.current = true;
          router.push(state.targetPath);

          // Small delay then start entering phase
          setTimeout(() => {
            useTransitionStore.getState().setPhase("entering");
          }, 100);

          // Complete transition after blocks settle
          setTimeout(() => {
            useTransitionStore.getState().setPhase("revealing");
          }, 800);

          setTimeout(() => {
            useTransitionStore.getState().completeTransition();
            hasNavigated.current = false;
          }, 1400);
        }
      }
    });

    return unsubscribe;
  }, [router]);

  return null;
}
