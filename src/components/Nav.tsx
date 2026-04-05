"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "./TransitionLink";
import { RevealText } from "./RevealText";

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.2rem var(--page-pad)",
        color: "var(--black)",
        fontSize: "var(--text-sm, 0.5625rem)",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
      }}
    >
      <a
        href="mailto:info@groupdynamics.net"
        className="hover:opacity-50 transition-opacity"
      >
        <RevealText as="span" triggerOnScroll={false} delay={0.1}>
          info@groupdynamics.net
        </RevealText>
      </a>
      <div style={{ display: "flex", gap: "2rem" }}>
        {isHome ? (
          <TransitionLink
            href="/info"
            className="hover:opacity-50 transition-opacity"
          >
            <RevealText as="span" triggerOnScroll={false} delay={0.15}>
              Group Info
            </RevealText>
          </TransitionLink>
        ) : (
          <TransitionLink
            href="/"
            className="hover:opacity-50 transition-opacity"
          >
            <RevealText as="span" triggerOnScroll={false} delay={0.15}>
              Home
            </RevealText>
          </TransitionLink>
        )}
      </div>
    </nav>
  );
}
