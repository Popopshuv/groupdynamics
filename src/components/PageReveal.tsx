"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useTransitionStore } from "@/store/useTransitionStore";

export function PageReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasRevealed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const doReveal = () => {
      if (hasRevealed.current) return;
      hasRevealed.current = true;
      gsap.to(el, { opacity: 1, duration: 0.5, ease: "power2.out" });
    };

    // Check immediately
    if (useTransitionStore.getState().introComplete) {
      doReveal();
    }

    const unsubscribe = useTransitionStore.subscribe((state, prev) => {
      // Intro just completed
      if (state.introComplete && !hasRevealed.current) {
        doReveal();
      }

      // Page transitions
      if (state.phase === "exiting" && prev.phase !== "exiting") {
        hasRevealed.current = false;
        gsap.to(el, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => gsap.set(el, { opacity: 0 }),
        });
      } else if (state.phase === "navigating" && prev.phase === "exiting") {
        // Hard lock to 0 across the React commit so no stale page peeks through
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 0 });
      } else if (state.phase === "revealing" && prev.phase !== "revealing") {
        hasRevealed.current = true;
        gsap.to(el, { opacity: 1, duration: 0.6, ease: "power2.out" });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
