"use client";

import { RevealText } from "@/components/RevealText";
import { DraggableImage } from "@/components/DraggableImage";

const capabilities = [
  {
    title: "Signal",
    description:
      "Clarity before momentum. Intent sharpened. Positioning defined. Ideas pressure tested until the strong survive.",
    items: [
      "Brand positioning and narrative",
      "Go-to-market architecture",
      "Product and category ideation",
      "Creative direction",
      "Concept decks and proof-of-idea frameworks",
    ],
  },
  {
    title: "System",
    description:
      "Digital structures built to move. Interactive platforms, real time 3D environments, custom infrastructure. Raw code. High performance.",
    items: [
      "Interactive web and app development",
      "Real time 3D and WebGL experiences",
      "Brand identity systems",
      "Custom CMS and internal brand tools",
      "Motion systems and advanced animation",
    ],
  },
  {
    title: "Matter",
    description:
      "Concept to physical form. Apparel, hard goods, engineered objects. Sketch to prototype to factory output.",
    items: [
      "Product concept and industrial design",
      "Design and tech packs",
      "3D modeling and rapid prototyping",
      "Manufacturing files and sourcing guidance",
      "Packaging and physical brand systems",
    ],
  },
  {
    title: "Space",
    description:
      "Environments that react. LED floors, interactive walls, responsive installations, spatial systems merging digital and physical.",
    items: [
      "Interactive installations",
      "LED and projection driven environments",
      "Sensor based and reactive systems",
      "Retail and pop up activations",
      "Stage and spatial digital integration",
    ],
  },
];

export function WorkContent() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "var(--page-pad)",
        paddingTop: "6rem",
        paddingBottom: "3rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section style={{ flex: 1 }}>
        <div className="flex flex-col gap-12 max-w-md">
          {capabilities.map((cap) => (
            <div key={cap.title} className="flex flex-col">
              <RevealText
                as="h3"
                stagger={0.06}
                style={{
                  fontSize: "var(--text-reg)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                {cap.title}
              </RevealText>
              <RevealText
                as="p"
                stagger={0.06}
                style={{
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.6,
                  opacity: 0.8,
                  marginBottom: "0.75rem",
                }}
              >
                {cap.description}
              </RevealText>
              <ul className="flex flex-col">
                {cap.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      padding: "0.15rem 0",
                      lineHeight: 1.2,
                    }}
                  >
                    <RevealText
                      as="span"
                      stagger={0.06}
                      style={{
                        fontSize: "var(--text-sm)",
                        opacity: 0.9,
                        lineHeight: 1.2,
                      }}
                    >
                      {item}
                    </RevealText>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <DraggableImage
        src="/data/structured/109.JPEG"
        alt="Group Dynamics"
        side="right"
      />
    </div>
  );
}
