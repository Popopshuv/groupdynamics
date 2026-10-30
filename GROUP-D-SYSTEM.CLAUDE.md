# CLAUDE.md — group-d-system starter

You are working inside a Group Dynamics starter. This is an opinionated kit for building **minimal sites with elevated micro-interactions**. The full design reference lives in `GROUP-D-SYSTEM.md` — read it before making non-trivial design decisions.

This file is the short version: **the rules you must follow without being asked.**

---

## The bar

Every page should look almost empty and feel alive. If a section doesn't move, drift, mask in, or react, it's probably wrong. If a section has more than one decorative flourish per viewport, it's also probably wrong. The agency's bread and butter is **calm minimalism + one moment of "oh"**.

Before you ship a page, ask:
1. Could I delete a third of this and lose nothing?
2. Where does the eye land — and is that landing animated?
3. Is the motion *quiet* (long durations, gentle eases) or *bouncy* (springs, overshoot)? It should be quiet.

---

## Hard rules (do not violate without explicit permission)

### Tokens

- **Never hardcode colours, font sizes, font families, or page padding.** Use CSS variables (`var(--black)`, `var(--text-reg)`, `var(--page-pad)`, etc.) defined in `src/app/globals.css`. If a value you need isn't a token, add it to `globals.css` first, then use it.
- The page background is `#fff`. Type is `var(--black)` (which is `#1a1a1a`, never `#000`).
- The only saturated colour on site is the red (`#FF0000`) inside `BackgroundBlocks`. Don't introduce a second accent without asking.

### Typography

- Font family: only `var(--font-abc)` (ABC Monument Grotesk Mono, Light 300). Don't add Google Fonts, don't import a second display face.
- Type is small. Default body is `var(--text-reg)` = `0.6875rem`. Headings are usually the *same size* as body but uppercase + wide-tracked. Don't make headings visually bigger by bumping font-size — make them feel bigger via tracking, casing, position, and motion.
- Casing: body sentence-case, everything else `text-transform: uppercase`. Tracking: `0.02em` body, `0.15em` nav/labels, `0.2em` headings, `0.3em` micro-eyebrows.
- Body line-height `1.7`, default `1.3`. Body letter-spacing `0.02em`.

### Layout

- Every route is wrapped by `<ClientShell>` (already mounted in `app/layout.tsx`). Don't re-mount `Nav`, `BackgroundBlocks`, `Preloader`, etc. in a page.
- Route `page.tsx` is a server component that imports a co-located `*Content.tsx` client component. Don't put `"use client"` on `page.tsx`.
- Page outer wrapper: `position: relative; minHeight: 100vh; padding: var(--page-pad); paddingTop: 6rem; display: flex; flexDirection: column`.
- Body content blocks are offset right (`marginLeft: auto; maxWidth: 32rem`). Don't centre content blocks. Don't use full-bleed paragraphs.
- No shadows. No gradients. Border radius is `2px` and only on draggable images.

### Motion

- **All animation goes through GSAP.** Don't add Framer Motion, AnimeJS, Motion One, or hand-rolled CSS keyframes for anything beyond `transition-opacity` on hover.
- **Reuse the primitives** in `src/components/`:
  - `<RevealText>` — word mask wipe. Use this for ~95% of text reveals.
  - `<MaskedText>` — slower, sequential mask wipe.
  - `<SplitTextReveal>` — char/word/line y-axis lift.
  - `<DraggableImage>` — draggable image accent.
  - `<TransitionLink>` — replaces `next/link` for in-app navigation.
  - `<PageReveal>` — already wraps `<main>`; don't re-add per page.
- For *new* animations: subscribe to `useTransitionStore` and gate on `introComplete`. Never use `setTimeout` to guess timing — read the phase.
- Easings: `power2.out`, `power2.inOut`, `power3.out`, `power3.inOut`. Forbidden by default: `back`, `elastic`, `bounce`, `expo`. If you reach for one, ask first.
- Durations: text masks `0.4–0.6s`, settles `0.8–1s`, page fades `0.3–0.6s`, image fades `0.8s`. Stagger `0.04–0.1s`.
- Hover is opacity-only (`hover:opacity-50 transition-opacity`). No colour shifts, no underlines, no scale, no translate.

### State

- One Zustand store: `useTransitionStore`. Phases: `idle | exiting | navigating | entering | revealing`. Plus intro flags `preloaderDone`, `blocksReady`, `introComplete`. **Don't add a second store, a context, or local refs that duplicate this state.**

### Routing

- Internal nav uses `<TransitionLink>`. External links use plain `<a target="_blank" rel="noopener noreferrer">`.
- Don't bypass the transition store with raw `router.push` calls in click handlers.

### Dependencies

- Stay within the existing kit (Next.js, Tailwind v4, GSAP, SplitType, Lenis, R3F, drei, three, zustand). Adding a new dep requires explicit approval — propose it before installing.

---

## Soft rules (defaults, push back if a design ask conflicts)

- One draggable image per page maximum. More than one starts to feel cluttered.
- One `BackgroundBlocks` accent colour (red). If a route needs a different vibe, change the palette in one place — don't add a second block system.
- Eyebrow labels at `0.5–0.5625rem` with `opacity: 0.4–0.5` and `0.3em` tracking. They're meant to whisper.
- Body copy max-width `32rem`. If copy needs to be wider, the copy is probably too long.
- New routes follow the home/info/about composition: nav, offset-right body, bottom-anchored heading, optional draggable accent.

---

## When in doubt

- **Read `GROUP-D-SYSTEM.md`** for the long-form rationale, full token list, and motion specs.
- **Read the existing component** before writing a new one. The patterns are short; reuse beats parallel implementations.
- **Read `node_modules/next/dist/docs/`** before assuming Next.js APIs — the version in this starter may have breaking changes from your training data.
- If a request would require breaking one of the hard rules above, **stop and ask**. The aesthetic only holds if every page follows the same constraints.

---

## What "good" looks like

A new page in this starter is typically:

- ~80 lines of JSX.
- Two or three text blocks, each wrapped in `<RevealText>`.
- Maybe one `<DraggableImage>`.
- Zero new colours, zero new font sizes, zero new components.
- Indistinguishable in feel from the existing routes — same rhythm, same calm, same sudden moment of motion when you click a link.

If you're writing more than that, you're probably building something the kit already has. Look first.
