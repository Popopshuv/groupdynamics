"use client";

import { RevealText } from "@/components/RevealText";

export function AboutContent() {
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
      {/* Two column about */}
      <section
        style={{
          marginTop: "clamp(3rem, 8vh, 5rem)",
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "clamp(2rem, 4vw, 4rem)",
        }}
      >
        <div>
          <RevealText
            as="span"
            style={{
              fontSize: "0.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              opacity: 0.4,
            }}
          >
            Who we are
          </RevealText>
        </div>
        <div>
          <RevealText
            as="p"
            delay={0.1}
            style={{
              fontSize: "0.6875rem",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            Group Dynamics is an independent design and development lab. We work off-grid, building ideas that feel discovered, not manufactured. Part studio, part workshop, part experimental unit.
          </RevealText>
          <RevealText
            as="p"
            delay={0.3}
            style={{
              fontSize: "0.6875rem",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
              marginTop: "1rem",
            }}
          >
            We prototype quickly, think systemically, and craft experiences that cut cleanly through crowded markets.
          </RevealText>
        </div>
      </section>

      {/* Contact */}
      <section
        style={{
          marginTop: "clamp(4rem, 12vh, 8rem)",
        }}
      >
        <RevealText
          as="h2"
          stagger={0.015}
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Reach out
        </RevealText>
        <div
          style={{
            marginTop: "0.8rem",
            fontSize: "0.5625rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          <a href="mailto:info@groupdynamics.net">info@groupdynamics.net</a>
        </div>
      </section>
    </div>
  );
}
