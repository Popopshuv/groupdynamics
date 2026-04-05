"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BLESSED_SECTIONS,
  buildMediaItems,
  getRandomDescription,
  type MediaItem,
  type SectionConfig,
} from "./blessedContentConfig";

gsap.registerPlugin(ScrollTrigger);

type ModalItem = MediaItem;

// English voices with accents (Mac/Chrome) - AU, UK, Irish, Scottish, etc.
// NOTE: Exclude "Google" voices - Chrome has bugs where they fail on first load,
// get stuck, and block subsequent speech. Prefer native system voices only.
const ALLOWED_VOICE_NAMES = [
  "Karen", // Australian
  "Matilda", // Australian
  "Lee", // Australian
  "Serena", // British
  "Kate", // British
  "Stephanie", // British
  "Jamie", // British
  "Daniel", // British
  "Oliver", // British
  "Moira", // Irish
  "Fiona", // Scottish
  "Tessa", // South African
];

// Circle layout: group titles arranged evenly around center
function getCirclePosition(
  i: number,
  total: number,
): { left: string; top: string } {
  const radius = 35; // % from center
  const angle = (2 * Math.PI * i) / total - Math.PI / 2; // start at top (12 o'clock)
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  return { left: `${x}%`, top: `${y}%` };
}

// Scattered positions for dropdown - full screen, fake random grid
const DROPDOWN_POSITIONS: [string, string][] = [
  ["5%", "8%"],
  ["35%", "5%"],
  ["65%", "10%"],
  ["92%", "12%"],
  ["12%", "22%"],
  ["48%", "18%"],
  ["78%", "25%"],
  ["8%", "38%"],
  ["32%", "35%"],
  ["58%", "32%"],
  ["85%", "40%"],
  ["22%", "48%"],
  ["52%", "45%"],
  ["82%", "52%"],
  ["5%", "58%"],
  ["38%", "55%"],
  ["68%", "60%"],
  ["15%", "68%"],
  ["45%", "72%"],
  ["75%", "70%"],
  ["8%", "82%"],
  ["35%", "78%"],
  ["62%", "85%"],
  ["88%", "80%"],
  ["18%", "92%"],
  ["50%", "90%"],
  ["80%", "92%"],
];

function getDropdownPosition(i: number): { left: string; top: string } {
  const [left, top] = DROPDOWN_POSITIONS[i % DROPDOWN_POSITIONS.length];
  return { left, top };
}

/** Vertical offset to center content when there are few items. Returns 0 when content fills the space. */
function getVerticalCenterOffset(itemCount: number): number {
  if (itemCount <= 0) return 0;
  const threshold = 10; // Only center when few items; many items fill the space
  if (itemCount > threshold) return 0;
  const tops: number[] = [];
  for (let i = 0; i < itemCount; i++) {
    const [, topStr] = DROPDOWN_POSITIONS[i % DROPDOWN_POSITIONS.length];
    tops.push(parseFloat(topStr));
  }
  const minTop = Math.min(...tops);
  const maxTop = Math.max(...tops);
  const contentCenter = (minTop + maxTop) / 2;
  // Container is min-h-[130vh]/[120vh] but viewport is 100vh - center in visible area
  // 50vh viewport center = 50/130 * 100 ≈ 38.5% of container (mobile)
  const targetCenter = 38.5;
  return targetCenter - contentCenter;
}

function DropdownContent({
  section,
  onOpenModal,
  speak,
}: {
  section: SectionConfig;
  onOpenModal: (items: ModalItem[], currentIndex: number) => void;
  speak: (text: string) => void;
}) {
  const modalItems = useMemo(
    () =>
      buildMediaItems(
        section.folder ?? section.label,
        section.media.map((m) => m.filename),
        section.hoverDescriptions,
      ),
    [section],
  );

  const totalItems = section.textLinks.length + modalItems.length;
  const verticalOffset = getVerticalCenterOffset(totalItems);

  return (
    <div className="absolute inset-0 min-h-[130vh] md:min-h-[120vh]">
      {section.textLinks.map((link, i) => {
        const pos = getDropdownPosition(i);
        const topNum = parseFloat(pos.top) + verticalOffset;
        return (
          <a
            key={i}
            href={link.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => speak(link.audioText ?? link.text)}
            className="absolute text-sm md:text-reg font-light tracking-[0.2em] uppercase text-foreground whitespace-nowrap hover:opacity-80 transition-opacity "
            style={{
              left: pos.left,
              top: `${topNum}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {link.text}
          </a>
        );
      })}
      {modalItems.map((item, i) => {
        const pos = getDropdownPosition(section.textLinks.length + i);
        const topNum = parseFloat(pos.top) + verticalOffset;
        return (
          <button
            key={item.src}
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(modalItems, i);
            }}
            // onMouseEnter={() =>
            //   speak(getRandomDescription(section.hoverDescriptions))
            // }
            className="absolute aspect-video overflow-hidden bg-foreground/10 hover:bg-foreground/15 transition-colors w-[clamp(100px,38vw,200px)] md:w-[clamp(140px,22vw,220px)] cursor-pointer"
            style={{
              left: pos.left,
              top: `${topNum}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={`${item.src}#t=0.001`}
                  preload="metadata"
                  playsInline
                  muted
                  loop
                  onPlay={(e) => e.currentTarget.pause()}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center text-foreground/60">
                  ▶
                </span>
              </>
            ) : (
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 25vw"
                unoptimized
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ModalBackdrop({
  items,
  initialIndex,
  onClose,
}: {
  items: ModalItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const content = items[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    const overlay = overlayRef.current;
    const box = contentRef.current;
    if (!overlay || !box) return;

    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" },
    );
    gsap.fromTo(
      box,
      { opacity: 0, scale: 0.95, y: -12 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      },
    );
  }, []);

  const handleClose = useCallback(() => {
    const overlay = overlayRef.current;
    const box = contentRef.current;
    if (!overlay || !box) {
      onClose();
      return;
    }
    gsap.to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in" });
    gsap.to(box, {
      opacity: 0,
      scale: 0.98,
      y: 8,
      duration: 0.2,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose]);

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPrev) setCurrentIndex((i) => i - 1);
    },
    [hasPrev],
  );
  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasNext) setCurrentIndex((i) => i + 1);
    },
    [hasNext],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        setCurrentIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, hasPrev, hasNext]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 "
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-[calc(100vw-1rem)] md:max-w-[70vw] flex flex-col items-center p-2 md:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full">
          <button
            onClick={handleClose}
            className="absolute -top-10 right-0 w-10 h-10 flex items-center justify-center text-foreground text-2xl hover:bg-foreground/10 transition-colors z-10"
            aria-label="Close"
          >
            ×
          </button>
          {content.type === "video" ? (
            <video
              key={content.src}
              src={`${content.src}#t=0.001`}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full max-w-full max-h-[85vh] md:max-h-[80vh] h-auto object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={content.src}
              src={content.src}
              alt=""
              className="w-full max-w-full max-h-[85vh] md:max-h-[80vh] h-auto object-contain"
            />
          )}
        </div>
        {/* <p className="mt-4 text-foreground/80 max-w-full text-center">
          {content.description}
        </p> */}
        {items.length > 1 && (
          <div className="z-50 mt-1 flex items-center justify-center gap-3 text-foreground/50 bg-background p-1 rounded-full">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="Previous"
              className="w-8 h-8 flex items-center justify-center text-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-full"
            >
              ‹
            </button>
            <span className="text-tiny">
              {currentIndex + 1} / {items.length}
            </span>
            <button
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Next"
              className="w-8 h-8 flex items-center justify-center text-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-full"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Blessed() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    items: ModalItem[];
    initialIndex: number;
  } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const openModal = useCallback((items: ModalItem[], currentIndex: number) => {
    setModalState({ items, initialIndex: currentIndex });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  // Web Speech API - built into browsers, no account required
  // Chrome/Safari require user activation (click) before speak() works; hover alone is blocked.
  const preferredVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const fallbackVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speechActivatedRef = useRef(false);
  const speakDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const english = all.filter((v) => v.lang.startsWith("en"));
      const nativeOnly = english.filter((v) => !v.name.includes("Google"));
      preferredVoicesRef.current = nativeOnly.filter((v) =>
        ALLOWED_VOICE_NAMES.some((name) => v.name.includes(name)),
      );
      fallbackVoicesRef.current = nativeOnly.length > 0 ? nativeOnly : english;
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    if (typeof text !== "string" || !text.trim()) return;
    if (!("speechSynthesis" in window)) return;
    if (!speechActivatedRef.current) return;

    const trimmed = text.trim();

    if (speakDebounceRef.current) {
      clearTimeout(speakDebounceRef.current);
      speakDebounceRef.current = null;
    }

    speakDebounceRef.current = setTimeout(() => {
      speakDebounceRef.current = null;

      const doSpeak = () => {
        window.speechSynthesis.cancel();
        // Brief pause lets the synth reset; avoids race with animations
        setTimeout(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          let voices =
            preferredVoicesRef.current.length > 0
              ? preferredVoicesRef.current
              : fallbackVoicesRef.current;
          if (voices.length === 0) {
            voices = window.speechSynthesis
              .getVoices()
              .filter((v) => v.lang.startsWith("en"));
          }

          const u = new SpeechSynthesisUtterance(trimmed);
          u.lang = "en-US";
          u.rate = 0.9;
          if (voices.length > 0) {
            u.voice = voices[Math.floor(Math.random() * voices.length)];
          }

          window.speechSynthesis.speak(u);
        }, 30);
      };

      // Run during idle so we don't compete with GSAP/ScrollTrigger on main thread
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(doSpeak, { timeout: 120 });
      } else {
        doSpeak();
      }
    }, 100);
  }, []);

  const activateSpeech = useCallback(() => {
    speechActivatedRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      if (speakDebounceRef.current) {
        clearTimeout(speakDebounceRef.current);
      }
    };
  }, []);

  // Scroll trigger random stagger on coordinate blocks
  // Delay creation until pin spacer layout has settled (CapabilitiesParallax adds 265vh)
  const scrollCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const blocks = section.querySelectorAll<HTMLElement>(".blessed-block");
    if (blocks.length === 0) return;

    gsap.set(blocks, { opacity: 0, y: -16 });

    const t = setTimeout(() => {
      scrollCtxRef.current = gsap.context(() => {
        gsap.fromTo(
          blocks,
          { opacity: 0, y: -16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            stagger: { each: 0.1, from: "random" },
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      }, section);
    }, 800);

    return () => {
      clearTimeout(t);
      scrollCtxRef.current?.revert();
      scrollCtxRef.current = null;
    };
  }, []);

  const [dropdownSection, setDropdownSection] = useState<SectionConfig | null>(
    null,
  );

  const handleGroupClick = useCallback((section: SectionConfig) => {
    setDropdownSection(section);
    setDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setDropdownSection(null);
  }, []);

  return (
    <section
      onClick={activateSpeech}
      // title="Click anywhere to enable read-aloud on hover"
      className="w-full min-h-screen px-6 py-12 md:px-12 text-reg flex justify-center items-center relative"
    >
      <div className="max-w-8xl w-full mx-auto flex-1 flex flex-col min-w-0">
        {/* Group labels in a circle - centered layout */}
        <div
          ref={sectionRef as React.RefObject<HTMLDivElement>}
          className="relative w-full min-h-[80vh]"
        >
          {BLESSED_SECTIONS.map((section, i) => {
            const pos = getCirclePosition(i, BLESSED_SECTIONS.length);
            return (
              <button
                key={section.label}
                onClick={() => handleGroupClick(section)}
                onMouseEnter={() => speak(section.label)}
                className="blessed-block absolute flex justify-center items-center bg-background hover:z-20 cursor-pointer"
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10 - i,
                }}
              >
                <span className="text-reg font-light tracking-[0.2em] uppercase text-foreground whitespace-nowrap">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed centered dropdown overlay - always same position, no layout shift */}
      {dropdownOpen && dropdownSection && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md overflow-auto p-4 md:p-6"
          onClick={closeDropdown}
          role="dialog"
          aria-modal="true"
          aria-label="Group details"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeDropdown();
            }}
            className="fixed top-4 right-4 z-[60] w-10 h-10 flex items-center justify-center text-foreground text-2xl hover:bg-foreground/10 transition-colors rounded"
            aria-label="Close"
          >
            ×
          </button>
          <div
            className="relative min-h-[130vh] md:min-h-[120vh] min-w-full"
            onClick={closeDropdown}
          >
            <DropdownContent
              section={dropdownSection}
              onOpenModal={openModal}
              speak={speak}
            />
          </div>
        </div>
      )}

      {/* Brutalist modal with open/close animation */}
      {modalState && (
        <ModalBackdrop
          items={modalState.items}
          initialIndex={modalState.initialIndex}
          onClose={closeModal}
        />
      )}
    </section>
  );
}
