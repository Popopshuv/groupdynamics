"use client";

import { DraggableImage } from "@/components/DraggableImage";
import {
  RedlineRow,
  type RedlineKind,
  type RedlineSegment,
} from "@/components/RedlineRow";

interface Line {
  kind: RedlineKind;
  segments?: RedlineSegment[];
  note?: string;
}

const head = (title: string, note?: string): Line => ({
  kind: "head",
  segments: [title],
  note,
});
const text = (segments: RedlineSegment[] | string, note?: string): Line => ({
  kind: "text",
  segments: typeof segments === "string" ? [segments] : segments,
  note,
});
const item = (segment: RedlineSegment, note?: string): Line => ({
  kind: "item",
  segments: [segment],
  note,
});
const blank: Line = { kind: "blank" };

// The page reads as a working draft: the live copy is what's left standing,
// the struck lines are what got cut on the way there.
const draft: Line[] = [
  head("What we do", "draft 7"),
  blank,
  text(
    [{ strike: "A full-service agency." }, "Part studio, part workshop, part experimental unit."],
    "never an agency",
  ),
  blank,
  blank,

  head("01 Signal"),
  text("Clarity before momentum."),
  text("Intent sharpened."),
  text("Positioning defined."),
  text(
    ["Ideas", { strike: "workshopped" }, "pressure tested until the strong survive."],
    "workshops are too polite",
  ),
  blank,
  item("Brand positioning and narrative"),
  item("Go-to-market architecture"),
  item("Product and category ideation"),
  item({ strike: "Social media management" }, "not our lane"),
  item("Creative direction"),
  item("Concept decks and proof-of-idea frameworks"),
  blank,
  blank,

  head("02 System"),
  text(
    ["Digital", { strike: "experiences" }, "structures built to move."],
    "structures, not experiences",
  ),
  text("Interactive platforms, real time 3D environments, custom infrastructure."),
  text([{ strike: "Scalable solutions." }, "Raw code. High performance."], "no buzzwords"),
  blank,
  item("Interactive web and app development"),
  item("Real time 3D and WebGL experiences"),
  item("Brand identity systems"),
  item("Custom CMS and internal brand tools"),
  item({ strike: "Template site builds" }, "we write it"),
  item("Motion systems and advanced animation"),
  blank,
  blank,

  head("03 Matter"),
  text("Concept to physical form."),
  text("Apparel, hard goods, engineered objects."),
  text(["Sketch to prototype to", { strike: "render" }, "factory output."], "it has to exist"),
  blank,
  item("Product concept and industrial design"),
  item("Design and tech packs"),
  item("3D modeling and rapid prototyping"),
  item({ strike: "Print-on-demand merch" }, "made, not printed"),
  item("Manufacturing files and sourcing guidance"),
  item("Packaging and physical brand systems"),
  blank,
  blank,

  head("04 Space"),
  text(["Environments that", { strike: "display" }, "react."], "a screen isn't a space"),
  text(
    "LED floors, interactive walls, responsive installations, spatial systems merging digital and physical.",
  ),
  blank,
  item("Interactive installations"),
  item("LED and projection driven environments"),
  item("Sensor based and reactive systems"),
  item({ strike: "Static signage" }, "it has to react"),
  item("Retail and pop up activations"),
  item("Stage and spatial digital integration"),
  blank,
  blank,

  text([{ strike: "Request a proposal." }, "Start a conversation."], "less form, more talk"),
  text([{ link: "info@groupdynamics.net", href: "mailto:info@groupdynamics.net" }]),
];

export function WorkContent() {
  return (
    <div
      // Mobile: the draft runs full width, so leave clear space under it for
      // the draggable image (34vw wide, ~3:2 portrait) instead of covering text.
      className="pb-[calc(51vw+clamp(4rem,15vh,8rem)+2rem)] md:pb-12"
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingLeft: "var(--page-pad)",
        paddingRight: "var(--page-pad)",
        paddingTop: "6rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section
        style={{
          fontSize: "var(--text-reg)",
          lineHeight: 2,
          letterSpacing: "0.02em",
        }}
      >
        {draft.map((line, i) => (
          <RedlineRow key={i} number={i + 1} {...line} />
        ))}
      </section>
      {/* Desktop: pin the image's frame to the first viewport, where it sat
          before the page got long. Mobile: the bottom of the page. The frame
          is zero-width so it never blocks the text under it. */}
      <div className="absolute right-0 bottom-0 w-0 md:top-0 md:bottom-auto md:h-screen">
        <DraggableImage
          src="/data/structured/109.JPEG"
          alt="Group Dynamics"
          side="right"
        />
      </div>
    </div>
  );
}
