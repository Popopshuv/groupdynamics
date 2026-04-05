"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTransitionStore } from "@/store/useTransitionStore";

const BLOCK_COUNT = 4;
const COLORS = ["var(--beige)", "var(--sage)", "var(--lavender)", "var(--teal)"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRect(): { left: string; top: string; width: string; height: string } {
  const w = 15 + Math.random() * 60;
  const h = 15 + Math.random() * 60;
  const l = Math.random() * (100 - w);
  const t = Math.random() * (100 - h);
  return { left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` };
}

function restingRect(): { left: string; top: string; width: string; height: string } {
  const patterns = [
    () => {
      const h = 20 + Math.random() * 40;
      const t = Math.random() * (100 - h);
      return { left: "0%", top: `${t}%`, width: "100%", height: `${h}%` };
    },
    () => {
      const w = 20 + Math.random() * 40;
      const l = Math.random() * (100 - w);
      return { left: `${l}%`, top: "0%", width: `${w}%`, height: "100%" };
    },
    () => {
      const w = 30 + Math.random() * 50;
      const h = 30 + Math.random() * 50;
      const l = Math.random() * (100 - w);
      const t = Math.random() * (100 - h);
      return { left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` };
    },
  ];
  return pick(patterns)();
}

function parkedRect(): { left: string; top: string; width: string; height: string } {
  const corner = pick(["0%", "50%", "95%"]);
  return { left: corner, top: corner, width: "1%", height: "1%" };
}

export function BackgroundBlocks() {
  const blockRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevPhaseRef = useRef<string>("idle");
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const initializedRef = useRef(false);

  // Intro animation
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const blocks = blockRefs.current.filter(Boolean) as HTMLSpanElement[];

    // Each block gets one color forever
    blocks.forEach((block, i) => {
      block.style.backgroundColor = COLORS[i % COLORS.length];
      gsap.set(block, parkedRect());
    });

    const tl = gsap.timeline({ delay: 0.5 });
    tlRef.current = tl;

    for (let s = 0; s < 3; s++) {
      const label = `intro${s}`;
      tl.addLabel(label);
      blocks.forEach((block) => {
        tl.to(block, { ...randomRect(), duration: 0.4, ease: "power2.inOut" }, label);
      });
    }

    tl.addLabel("settle");
    const stickCount = Math.floor(Math.random() * 3) + 1;
    blocks.forEach((block, i) => {
      const r = i < stickCount ? restingRect() : parkedRect();
      tl.to(block, { ...r, duration: 1, ease: "power3.out" }, "settle");
    });
  }, []);

  // Transition animations
  useEffect(() => {
    const getBlocks = () =>
      blockRefs.current.filter(Boolean) as HTMLSpanElement[];

    const unsubscribe = useTransitionStore.subscribe((state) => {
      const phase = state.phase;
      if (phase === prevPhaseRef.current) return;
      prevPhaseRef.current = phase;

      if (phase === "exiting") {
        if (tlRef.current) { tlRef.current.kill(); tlRef.current = null; }

        const blocks = getBlocks();
        const tl = gsap.timeline();
        tlRef.current = tl;

        for (let s = 0; s < 4; s++) {
          const label = `s${s}`;
          tl.addLabel(label);
          blocks.forEach((block) => {
            tl.to(block, { ...randomRect(), duration: 0.35, ease: "power2.inOut" }, label);
          });
        }

        tl.call(() => {
          useTransitionStore.getState().setPhase("navigating");
        });
      }

      if (phase === "entering") {
        if (tlRef.current) { tlRef.current.kill(); tlRef.current = null; }

        const blocks = getBlocks();
        const stickCount = Math.floor(Math.random() * 3) + 1;

        blocks.forEach((block, i) => {
          const r = i < stickCount ? restingRect() : parkedRect();
          gsap.to(block, { ...r, duration: 1, ease: "power3.out" });
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: BLOCK_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => { blockRefs.current[i] = el; }}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "1%",
            height: "1%",
          }}
        />
      ))}
    </div>
  );
}
