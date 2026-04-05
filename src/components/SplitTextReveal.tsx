"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextRevealProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  triggerOnScroll?: boolean;
  splitBy?: "chars" | "words" | "lines";
  stagger?: number;
}

export function SplitTextReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  triggerOnScroll = true,
  splitBy = "words",
  stagger = 0.04,
}: SplitTextRevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = new SplitType(el, {
      types: splitBy === "chars" ? "chars" : splitBy === "lines" ? "lines" : "words",
    });

    const targets =
      splitBy === "chars"
        ? split.chars
        : splitBy === "lines"
          ? split.lines
          : split.words;

    if (!targets) return;

    gsap.set(targets, { y: "100%", opacity: 0 });

    const animConfig: gsap.TweenVars = {
      y: "0%",
      opacity: 1,
      duration: 0.8,
      stagger,
      ease: "power3.out",
      delay,
    };

    if (triggerOnScroll) {
      gsap.to(targets, {
        ...animConfig,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    } else {
      gsap.to(targets, animConfig);
    }

    return () => {
      split.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [children, splitBy, stagger, delay, triggerOnScroll]);

  return (
    <Tag
      ref={ref}
      className={`overflow-hidden ${className}`}
      style={{ clipPath: "inset(0 0 -10% 0)" }}
    >
      {children}
    </Tag>
  );
}
