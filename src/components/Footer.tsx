"use client";

export function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0.8rem var(--page-pad)",
        fontSize: "0.5625rem",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        borderTop: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <a href="mailto:info@groupdynamics.net" className="hover:opacity-50 transition-opacity">
        info@groupdynamics.net
      </a>
    </footer>
  );
}
