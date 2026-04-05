"use client";

import { RevealText } from "@/components/RevealText";

export function HomeContent() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "var(--page-pad)",
        paddingTop: "6rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Body text — offset to the right */}
      <section
        style={{
          marginLeft: "auto",
          maxWidth: "32rem",
          paddingRight: "var(--page-pad)",
        }}
      >
        <RevealText
          as="p"
          delay={0.3}
          triggerOnScroll={false}
          style={{
            fontSize: "var(--text-reg, 0.6875rem)",
            lineHeight: 1.7,
            letterSpacing: "0.02em",
          }}
        >
          Independent design and development lab. We work off-grid, building ideas that feel discovered, not manufactured. Part studio, part workshop, part experimental unit. We prototype quickly, think systemically, and craft experiences that cut cleanly through crowded markets.
        </RevealText>
      </section>

      {/* Group Dynamics — bottom, aligned with body text */}
      <section
        style={{
          marginTop: "auto",
          paddingTop: "clamp(4rem, 12vh, 8rem)",
          marginBottom: "100px",
          marginLeft: "auto",
          maxWidth: "32rem",
          paddingRight: "var(--page-pad)",
          width: "100%",
        }}
      >
        <RevealText
          as="h1"
          triggerOnScroll={false}
          delay={0.6}
          stagger={0.015}
          style={{
            fontSize: "var(--text-reg, 0.6875rem)",
            lineHeight: 1.3,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Group Dynamics
        </RevealText>
      </section>
    </div>
  );
}
