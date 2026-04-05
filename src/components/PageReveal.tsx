"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useTransitionStore } from "@/store/useTransitionStore";

export function PageReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prevPhase = useRef<string>("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Don't reveal until preloader is done
    const doInitialReveal = () => {
      gsap.to(el, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const { preloaderDone } = useTransitionStore.getState();
    if (preloaderDone) {
      doInitialReveal();
    }

    const unsubscribe = useTransitionStore.subscribe((state) => {
      // Preloader just finished — reveal page
      if (state.preloaderDone && prevPhase.current === "") {
        doInitialReveal();
      }

      if (state.phase === "exiting" && prevPhase.current !== "exiting") {
        gsap.to(el, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      } else if (
        state.phase === "revealing" &&
        prevPhase.current !== "revealing"
      ) {
        gsap.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
      prevPhase.current = state.phase;
    });

    return unsubscribe;
  }, []);

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
