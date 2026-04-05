"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTransitionStore } from "@/store/useTransitionStore";

const words = ["Group", "Dynamics"];

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const { setPreloaderDone } = useTransitionStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const masks = container.querySelectorAll(".preloader-mask") as NodeListOf<HTMLElement>;
    const items = container.querySelectorAll(".preloader-item") as NodeListOf<HTMLElement>;

    // Start with masks covering text
    gsap.set(items, { visibility: "visible" });
    gsap.set(masks, { scaleX: 1, transformOrigin: "right center" });

    const tl = gsap.timeline();

    // Mask reveal — wipe off each word
    tl.to(masks, {
      scaleX: 0,
      duration: 0.6,
      stagger: { each: 0.1, from: "random" },
      ease: "power3.inOut",
      delay: 0.4,
    });

    // Hold
    tl.to({}, { duration: 1.2 });

    // Mask back on (reverse wipe)
    tl.set(masks, { transformOrigin: "left center" });
    tl.to(masks, {
      scaleX: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: "power3.inOut",
    });

    // Done
    tl.call(() => {
      setPreloaderDone();
      setTimeout(() => setVisible(false), 200);
    });
  }, [setPreloaderDone]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: "0.25em" }}>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-flex",
              position: "relative",
              overflow: "hidden",
              fontSize: "var(--text-reg, 0.6875rem)",
              color: "var(--black)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              lineHeight: "inherit",
            }}
          >
            <span
              className="preloader-item"
              style={{ display: "inline-block", visibility: "hidden", lineHeight: "inherit" }}
            >
              {word}
            </span>
            <span
              className="preloader-mask"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "calc(100% + 0.05em)",
                height: "100%",
                backgroundColor: "var(--white)",
                transformOrigin: "right center",
                zIndex: 2,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
