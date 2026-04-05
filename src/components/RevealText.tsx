"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTransitionStore } from "@/store/useTransitionStore";

gsap.registerPlugin(ScrollTrigger);

interface RevealTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  triggerOnScroll?: boolean;
  stagger?: number;
}

export function RevealText({
  children,
  as: Tag = "div",
  className = "",
  style,
  delay = 0,
  triggerOnScroll = true,
  stagger = 0.06,
}: RevealTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reset on content change so masks replay
    animatedRef.current = false;

    const masks = el.querySelectorAll(".reveal-mask") as NodeListOf<HTMLElement>;
    const items = el.querySelectorAll(".reveal-item") as NodeListOf<HTMLElement>;

    gsap.set(items, { visibility: "visible" });
    gsap.set(masks, { scaleX: 1, transformOrigin: "right center" });

    const animate = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;

      gsap.to(masks, {
        scaleX: 0,
        duration: 0.4,
        stagger: { each: stagger * 0.7, from: "random" },
        ease: "power3.inOut",
        delay,
        onComplete: () => {
          // Kill any subpixel remnant
          masks.forEach((m) => { m.style.display = "none"; });
        },
      });
    };

    // Wait for preloader to finish before animating
    const tryAnimate = () => {
      const { preloaderDone } = useTransitionStore.getState();
      if (!preloaderDone) {
        const unsub = useTransitionStore.subscribe((state) => {
          if (state.preloaderDone) {
            unsub();
            if (triggerOnScroll) {
              ScrollTrigger.create({
                trigger: el,
                start: "top 95%",
                once: true,
                onEnter: animate,
              });
            } else {
              animate();
            }
          }
        });
        return unsub;
      }

      if (triggerOnScroll) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 95%",
          once: true,
          onEnter: animate,
        });
      } else {
        animate();
      }
      return undefined;
    };

    const unsub = tryAnimate();

    return () => {
      unsub?.();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [children, delay, stagger, triggerOnScroll]);

  const words = children.split(/\s+/);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: "inline-flex",
            marginRight: "0.25em",
            position: "relative",
            overflow: "hidden",
            verticalAlign: "baseline",
            lineHeight: "inherit",
          }}
        >
          <span
            className="reveal-item"
            style={{ display: "inline-block", visibility: "hidden", lineHeight: "inherit" }}
          >
            {word}
          </span>
          <span
            className="reveal-mask"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "calc(100% + 0.05em)",
              height: "100%",
              backgroundColor: "var(--black)",
              transformOrigin: "right center",
              zIndex: 2,
            }}
          />
        </span>
      ))}
    </Tag>
  );
}
