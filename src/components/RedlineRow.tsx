"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTransitionStore } from "@/store/useTransitionStore";

gsap.registerPlugin(ScrollTrigger);

/** A run of words in a line: kept, struck out, or a link. */
export type RedlineSegment =
  | string
  | { strike: string }
  | { link: string; href: string };

export type RedlineKind = "head" | "text" | "item" | "blank";

interface RedlineRowProps {
  number: number;
  kind: RedlineKind;
  segments?: RedlineSegment[];
  /** Editor's note in the margin. Sits under the line on mobile. */
  note?: string;
}

const maskStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "calc(100% + 0.05em)",
  height: "100%",
  backgroundColor: "var(--black)",
  transformOrigin: "right center",
  zIndex: 2,
};

/** One word behind a black mask — same markup as RevealText. */
function Word({ word, struck, last }: { word: string; struck?: boolean; last?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        // Struck words carry their gap as padding so the strike line runs
        // across the space to the next word instead of breaking per word.
        marginRight: struck && !last ? 0 : "0.25em",
        paddingRight: struck && !last ? "0.25em" : 0,
        position: "relative",
        overflow: "hidden",
        verticalAlign: "baseline",
        lineHeight: "inherit",
      }}
    >
      <span
        className="redline-item"
        style={{ display: "inline-block", visibility: "hidden", lineHeight: "inherit" }}
      >
        {word}
      </span>
      {struck && (
        <span
          className="redline-strike"
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "55%",
            width: "100%",
            height: "1px",
            backgroundColor: "var(--gray-3)",
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      )}
      <span className="redline-mask" style={maskStyle} />
    </span>
  );
}

function Segment({ segment }: { segment: RedlineSegment }) {
  if (typeof segment === "string") {
    return (
      <>
        {segment.split(/\s+/).map((w, i) => (
          <Word key={`${w}-${i}`} word={w} />
        ))}
      </>
    );
  }

  if ("strike" in segment) {
    const words = segment.strike.split(/\s+/);
    return (
      <del style={{ textDecoration: "none", color: "var(--gray-3)" }}>
        {words.map((w, i) => (
          <Word key={`${w}-${i}`} word={w} struck last={i === words.length - 1} />
        ))}
      </del>
    );
  }

  return (
    <a href={segment.href} className="hover:opacity-50 transition-opacity">
      {segment.link.split(/\s+/).map((w, i) => (
        <Word key={`${w}-${i}`} word={w} />
      ))}
    </a>
  );
}

/**
 * One numbered line of the redline draft. On scroll-in: the words wipe in
 * behind black masks (as RevealText), then any struck words get their line
 * drawn through, then the margin note fades up.
 */
export function RedlineRow({ number, kind, segments = [], note }: RedlineRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const masks = el.querySelectorAll<HTMLElement>(".redline-mask");
    const items = el.querySelectorAll<HTMLElement>(".redline-item");
    const strikes = el.querySelectorAll<HTMLElement>(".redline-strike");
    const fades = el.querySelectorAll<HTMLElement>(".redline-fade");

    gsap.set(items, { visibility: "visible" });
    gsap.set(masks, { scaleX: 1, transformOrigin: "right center" });
    gsap.set(strikes, { scaleX: 0 });
    gsap.set(fades, { opacity: 0 });

    let played = false;
    let tl: gsap.core.Timeline | undefined;

    const animate = () => {
      if (played) return;
      played = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        masks.forEach((m) => { m.style.display = "none"; });
        gsap.set(strikes, { scaleX: 1 });
        gsap.set(fades, { opacity: 1 });
        return;
      }

      tl = gsap.timeline();
      tl.to(fades, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);
      if (masks.length) {
        tl.to(
          masks,
          {
            scaleX: 0,
            duration: 0.4,
            stagger: { each: 0.04, from: "random" },
            ease: "power3.inOut",
            onComplete: () => masks.forEach((m) => { m.style.display = "none"; }),
          },
          0,
        );
      }
      if (strikes.length) {
        // The edit lands after the words have settled.
        tl.to(
          strikes,
          { scaleX: 1, duration: 0.3, stagger: 0.08, ease: "power3.inOut" },
          ">+0.15",
        );
      }
      const noteEl = el.querySelector<HTMLElement>(".redline-note");
      if (noteEl) {
        tl.fromTo(
          noteEl,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          ">-0.1",
        );
      }
    };

    const setupTrigger = () => {
      ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: animate });
    };

    // Same gate as RevealText: wait for the intro and any page transition.
    const isReady = (s: ReturnType<typeof useTransitionStore.getState>) =>
      s.introComplete && (s.phase === "idle" || s.phase === "revealing");

    let unsub: (() => void) | undefined;
    if (isReady(useTransitionStore.getState())) {
      setupTrigger();
    } else {
      unsub = useTransitionStore.subscribe((state) => {
        if (isReady(state)) {
          unsub?.();
          setupTrigger();
        }
      });
    }

    return () => {
      unsub?.();
      tl?.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  const text =
    kind === "blank" ? null : (
      <p
        className={kind === "item" ? "pl-[1.75em]" : undefined}
        style={
          kind === "head"
            ? { letterSpacing: "0.15em", textTransform: "uppercase" }
            : undefined
        }
      >
        {kind === "item" && <Word word="—" />}
        {segments.map((s, i) => (
          <Segment key={i} segment={s} />
        ))}
      </p>
    );

  return (
    <div
      ref={ref}
      // Notes sit in their own margin column only when there's room left of
      // the draggable image (xl); narrower, they drop under their line.
      className="grid items-baseline grid-cols-[2.5rem_minmax(0,1fr)] md:grid-cols-[3rem_minmax(0,28rem)] xl:grid-cols-[3rem_minmax(0,28rem)_minmax(0,12rem)] md:gap-x-6"
      style={{ minHeight: "2em" }}
    >
      <span
        aria-hidden
        className="redline-fade"
        style={{ color: "var(--gray-3)", fontSize: "var(--text-tiny)", lineHeight: "inherit" }}
      >
        {String(number).padStart(3, "0")}
      </span>
      {text ?? <span />}
      {note && (
        <span
          className="redline-note col-start-2 xl:col-start-3 pl-[1.75em] xl:pl-0"
          style={{
            color: "var(--gray-3)",
            fontSize: "var(--text-tiny)",
            lineHeight: "inherit",
            opacity: 0,
          }}
        >
          — {note}
        </span>
      )}
    </div>
  );
}
