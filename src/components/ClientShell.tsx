"use client";

import { type ReactNode } from "react";
import { BackgroundBlocks } from "./BackgroundBlocks";
import { BackgroundCanvas } from "./BackgroundCanvas";
import { Nav } from "./Nav";
import { Preloader } from "./Preloader";
import { TransitionController } from "./TransitionController";
import { PageReveal } from "./PageReveal";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Preloader />
      <TransitionController />
      <BackgroundBlocks />
      <BackgroundCanvas />
      <Nav />
      <main className="relative z-10 min-h-screen">
        <PageReveal>{children}</PageReveal>
      </main>
    </>
  );
}
