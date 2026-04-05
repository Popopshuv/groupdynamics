"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface MaskedTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  triggerOnScroll?: boolean;
  stagger?: number;
  maskColor?: string;
}

export function MaskedText({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  triggerOnScroll = true,
  stagger = 0.08,
  maskColor,
}: MaskedTextProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll(".masked-item");
    const masks = el.querySelectorAll(".masked-item > .mask");

    // Start: items visible but masks cover them
    gsap.set(items, { opacity: 1 });
    gsap.set(masks, { scaleX: 1, transformOrigin: "right center" });

    const animate = () => {
      const tl = gsap.timeline({ delay });

      // Wipe masks off left-to-right (shrink toward right edge)
      tl.to(masks, {
        scaleX: 0,
        duration: 0.6,
        stagger,
        ease: "power3.inOut",
      });
    };

    if (triggerOnScroll) {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: animate,
      });
    } else {
      animate();
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [children, delay, stagger, triggerOnScroll]);

  // Split into words, each wrapped with mask overlay
  const words = children.split(/\s+/);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} style={{ display: "inline-block", marginRight: "0.3em" }}>
          <span className="masked-item" style={{ opacity: 0 }}>
            {word}
            <span
              className="mask"
              style={maskColor ? { backgroundColor: maskColor } : undefined}
            />
          </span>
        </span>
      ))}
    </Tag>
  );
}
