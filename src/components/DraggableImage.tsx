"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useTransitionStore } from "@/store/useTransitionStore";

gsap.registerPlugin(Draggable);

interface DraggableImageProps {
  src: string;
  alt: string;
  side?: "left" | "right";
}

export function DraggableImage({ src, alt, side = "left" }: DraggableImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const d = Draggable.create(el, {
      type: "x,y",
      cursor: "grab",
      activeCursor: "grabbing",
      zIndexBoost: true,
    });

    // Only fade in once the revealing phase completes (idle)
    // or if we're already idle (first load after intro)
    const fadeIn = () => {
      gsap.fromTo(
        el,
        { visibility: "visible", opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    };

    const state = useTransitionStore.getState();
    if (state.phase === "idle" && state.introComplete) {
      // Already idle — delayed fade in
      gsap.delayedCall(0.6, fadeIn);
    }

    const unsubscribe = useTransitionStore.subscribe((s, prev) => {
      if (s.phase === "exiting") {
        gsap.killTweensOf(el);
        gsap.set(el, { visibility: "hidden", opacity: 0 });
      }
      // Fade in only when our page is the one that just finished transitioning in
      if (s.phase === "idle" && prev.phase === "revealing") {
        gsap.delayedCall(0.3, fadeIn);
      }
      // Also handle first load
      if (s.introComplete && !prev.introComplete) {
        gsap.delayedCall(0.6, fadeIn);
      }
    });

    return () => {
      unsubscribe();
      gsap.killTweensOf(el);
      d[0]?.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        [side === "left" ? "left" : "right"]: "var(--page-pad)",
        bottom: "clamp(4rem, 15vh, 8rem)",
        width: "clamp(120px, 34vw, 500px)",
        visibility: "hidden",
        opacity: 0,
        zIndex: 50,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          pointerEvents: "none",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
