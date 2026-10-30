# GROUP-D-SYSTEM

Design system extracted from groupdynamics.net. The baseline for every Group Dynamics build.

The brief in one sentence: **minimal sites with elevated micro-interactions** — strip the surface to almost nothing, then layer cinematic motion on top so it never feels static or empty.

---

## 1. Voice & feel

- **Off-grid, discovered, not manufactured.** Layouts feel hand-placed, not gridded. Body copy hugs the right edge. Negative space carries weight.
- **Pitch-deck typography.** Type is small, monospaced, uppercase-with-wide-tracking. Reads like a printed dossier or studio internal doc.
- **Movement is the brand.** Mask wipes, drifting background blocks, settling chaos on every page transition. The page is never fully still — but motion is *quiet*, not bouncy.
- **One unexpected accent.** The palette is muted greys/beiges; a single bold colour (currently `#FF0000`) lives in the background blocks. Use it sparingly so it always feels intentional.
- **Show the seams a little.** Draggable images, a preloader that announces itself, a 1.5-second hand-off before content appears. The site rewards patience.

If a section looks "done" but boring, the answer is *less content + more motion*, not more decoration.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind v4 + CSS variables in `globals.css` |
| Animation | GSAP + ScrollTrigger + Draggable + SplitType |
| 3D | `@react-three/fiber`, `@react-three/drei`, three.js |
| State | Zustand (one store: transition phase + intro flags) |
| Smooth scroll | Lenis |
| Fonts | ABC Monument Grotesk Mono (Light, 300), self-hosted woff2 |

GSAP is the single source of truth for animation. Don't mix in Framer Motion, AnimeJS, CSS-only transitions for anything non-trivial, etc. Reuse the existing `RevealText` / `MaskedText` / `SplitTextReveal` primitives before reaching for `gsap.to` directly.

---

## 3. Design tokens

All tokens live in `src/app/globals.css`. **Never hardcode colours, font sizes, or spacing in components — use the token.**

### 3.1 Colours

```css
--white:    #f0e6d3;  /* warm off-white, NOT pure white */
--black:    #1a1a1a;  /* near-black, NOT #000 — softer on the eye */
--beige:    #fafaf9;
--sage:     #eeeded;
--lavender: #e8e7e5;
--teal:     #f1f1f1;
```

Page background is pure `#fff`; type is `--black`. Selection inverts (`background: --black; color: --white`).

**Background block palette** (the drifting rectangles): `#e0dfdf`, `#f1f1f1`, `#FF0000`, `#e7e6e6`. Three muted greys + one pure red. The red is the only saturated colour on the entire site.

**3D / canvas palette** (when `BackgroundCanvas` is populated): `#c4a484`, `#7a8b6e`, `#BFB5AF`, `#6b8f9e`, `#b8956a`, `#9b8578` — warm beige, sage, dusty lavender, muted teal, camel, taupe. Used at `opacity: 0.85`.

### 3.2 Typography

```css
--font-abc: "ABCMonumentGrotesk", system-ui, sans-serif;
font-weight: 300;        /* always Light */
line-height: 1.3;        /* default; body copy uses 1.6–1.7 */
letter-spacing: 0.01em;  /* default; labels use 0.15–0.3em */
```

Type scale (Tailwind v4 theme variables):

```css
--text-reg:  0.6875rem;  /* body, h1, primary */
--text-tiny: 0.625rem;
--text-sm:   0.5625rem;  /* nav, footer, labels */
--text-xs:   0.5rem;     /* eyebrow labels, list items */
```

The root font-size is fluid: `clamp(12px, 1.5vw + 8px, 16px)`. Every `rem` scales with the viewport, so the whole system breathes without media queries.

**Tracking conventions:**

| Use case | letter-spacing |
|---|---|
| Body copy | `0.02em` |
| Headings (uppercase) | `0.2em` |
| Nav / labels | `0.15em` |
| Eyebrow micro-labels | `0.3em` |

**Casing:** body is sentence case. Everything else (nav, labels, headings, footer) is `text-transform: uppercase`. Brand mark "group dynamics" appears lowercase in `<title>` but uppercase as an in-page heading.

### 3.3 Spacing

```css
--page-pad: clamp(1rem, 3vw, 2.5rem);
```

All page-level horizontal/vertical padding uses `var(--page-pad)`. Section gaps use `clamp()` for fluid rhythm — typical values:

- between sections: `clamp(3rem, 8vh, 5rem)` — `clamp(4rem, 12vh, 8rem)`
- internal grid gap: `clamp(2rem, 4vw, 4rem)`

Body copy column max-width: `32rem`, **right-aligned via `marginLeft: auto`**. Don't centre-justify content blocks.

### 3.4 Radii, borders, shadows

- Border radius: `2px` only (on draggable images). Everything else is square.
- Borders: `1px solid rgba(0,0,0,0.1)` on the rare divider (e.g. footer top).
- **No shadows.** Depth comes from layered z-index + motion, not blur.

---

## 4. Layout

### 4.1 Stacking order (z-index)

```
0   body background (#fff)
1   BackgroundBlocks (DOM, fixed inset-0)
2   BackgroundCanvas (Three.js, fixed)
10  main content (children of PageReveal)
50  Nav, Footer, DraggableImage (chrome / interactive)
60  Preloader (one-shot at first load)
```

`pointerEvents: none` on every fixed background layer. Only chrome and content can be clicked.

### 4.2 Page shell

Every route renders inside `<ClientShell>`, which mounts (in order):

```
Preloader
TransitionController       (no DOM, drives the state machine)
BackgroundBlocks           (fixed inset-0 — drifting rectangles)
BackgroundCanvas           (fixed inset-0 — Three.js canvas)
Nav                        (fixed top, full width)
<main>
  <PageReveal>{children}</PageReveal>
</main>
```

The page itself is just the `children`. Don't re-implement nav, background, or transition wrappers on a per-route basis.

### 4.3 Page composition pattern

Pages are flex columns with `paddingTop: 6rem` (clears the nav) and `padding: var(--page-pad)`. Body content is offset right (`marginLeft: auto, maxWidth: 32rem`) and headings/heroes sit at the bottom of the viewport (`marginTop: auto`). The shape on the home page is roughly:

```
[ nav                                                  ]

                        [ short paragraph offset right ]



                        [ uppercase heading            ]
[ draggable image  ]
```

Two-column layouts use `gridTemplateColumns: "1fr 1.5fr"` with the eyebrow label in the narrow column and content in the wide one. See `AboutContent.tsx`.

---

## 5. Motion system

This is where the wow lives. Every animation goes through one of four primitives below — don't author one-off `gsap.to` calls in page components.

### 5.1 The transition state machine

`useTransitionStore` (Zustand) is the conductor. Five phases:

```
idle → exiting → navigating → entering → revealing → idle
```

- **idle**: page is settled, all reveal-on-scroll triggers are armed.
- **exiting**: user clicked a `<TransitionLink>`. Background blocks enter chaos for ~1.4s. Page fades out.
- **navigating**: Next.js router commits the new route.
- **entering**: new page is mounted, blocks start settling.
- **revealing**: PageReveal fades the new content in.

Plus two intro flags — `preloaderDone` and `blocksReady` — that combine into `introComplete`. **Every text-reveal component gates on `introComplete`** so nothing animates while the preloader is still on screen.

To add a new phase-aware effect, subscribe to the store; never use `setTimeout` to guess where the page is.

### 5.2 Easings & durations (memorise these)

| Use | Easing | Duration |
|---|---|---|
| Mask wipes (text reveal) | `power3.inOut` | `0.4 – 0.6s` |
| Block movements (chaos) | `power2.inOut` | `0.35 – 0.4s` |
| Block settles | `power3.out` | `1s` |
| Page fade in/out | `power2.out` / `power2.in` | `0.3 – 0.6s` |
| Image fade-in | `power2.out` | `0.8s` |
| Word/line stagger | — | `0.04 – 0.1s` |

Anything bouncier (`back.out`, `elastic`) is **off-brand**. Keep eases minimal; the energy comes from staggered timing and layered systems, not springiness.

### 5.3 Reusable primitives

#### `<RevealText>` — the workhorse

Word-by-word mask wipe. A black rectangle covers each word, then `scaleX: 1 → 0` from a randomised origin. After completion, masks set `display: none` to kill subpixel remnants.

```tsx
<RevealText as="h1" delay={0.6} stagger={0.015}>
  Group Dynamics
</RevealText>
```

Default behaviour: arms a ScrollTrigger at `top 95%`, fires once. Pass `triggerOnScroll={false}` for above-the-fold copy that should fire on intro complete. Always gates on `introComplete` so it never plays under the preloader.

**Use this for ~95% of text reveals on the site.**

#### `<MaskedText>` — slower, more deliberate

Same idea, but stagger order is sequential (not random) and duration is longer (`0.6s` per word). Use for hero statements where you want each word to land separately.

#### `<SplitTextReveal>` — y-axis lift

Splits by chars/words/lines via `SplitType`, animates `y: 100% → 0%` + opacity. Good for marquee-style headings; less good for body copy. Wraps in `overflow: hidden` with a `clipPath: inset(0 0 -10% 0)` to allow descenders to peek.

#### `<DraggableImage>`

GSAP Draggable with `cursor: grab` / `activeCursor: grabbing`, fades in 0.3s after `revealing` ends. Drops one image as a piece of "found texture" on a page. Pass `side="left|right"` (and optional `mobileSide`) to anchor it.

### 5.4 Background motion (always running)

Two layered systems run independently of page content. Both subscribe to the transition store.

**`BackgroundBlocks` (DOM, the visible one):** 4 fixed `<span>` rectangles. On first load: parked at corners → 3 cycles of random `randomRect()` positions → 1–3 of them "settle" into a `restingRect()` (full-width strip, full-height column, or large floating rect) while the rest park back at corners. On `exiting`: 4 rapid chaos cycles (0.35s each). On `entering`: settle again.

**`BackgroundCanvas` + `ColorBlocks` (Three.js, currently dormant):** 6 lerping coloured planes that match the same phase logic but with stepped chaos timings `[40, 120, 120, 80, 80, 160, 120, 120, 160]ms`. Wire it in when a route wants more visual weight.

### 5.5 The preloader

Plays once on first load only. Two centred words ("Group Dynamics") with mask covering each. Mask wipes off (random stagger), holds 1.2s, mask wipes back on, fires `setPreloaderDone()`, unmounts. Total ~2.6s. Don't put a spinner anywhere else — this is the only "loading" UI on the site.

### 5.6 Hover & micro-interactions

- Links: `hover:opacity-50 transition-opacity`. That's it.
- Cursor: default. `grab` only on draggable images.
- No tap-highlight, no underlines on hover, no colour shifts.

The "wow" is reserved for entrances and transitions. Idle hovers stay calm so the entrances feel bigger by contrast.

---

## 6. Component inventory

| Component | Role |
|---|---|
| `ClientShell` | Mounts every persistent layer. Wrap `<main>` once in `layout.tsx`. |
| `Preloader` | One-shot intro overlay. |
| `TransitionController` | Headless — listens to store, calls `router.push`, advances phases. |
| `TransitionLink` | Drop-in `<a>` replacement that triggers the transition state machine. **Always use instead of `next/link`** for in-app navigation. |
| `BackgroundBlocks` | DOM-driven drifting rectangles. |
| `BackgroundCanvas` + `ColorBlocks` | Three.js layer (optional — currently mounted but only ambient light). |
| `Nav` | Fixed top bar. Email left, route link right. |
| `Footer` | Fixed bottom bar. Email only. Used selectively. |
| `PageReveal` | Wraps page children, owns the cross-fade. |
| `RevealText` / `MaskedText` / `SplitTextReveal` | Text reveal primitives. |
| `DraggableImage` | Draggable image accent. |

---

## 7. Content tone (copy)

Short, declarative, slightly cryptic. Capability names are one-word abstractions ("Signal", "System", "Matter", "Space"). Descriptions read like manifesto fragments — sentence fragments allowed, "and" before the last item not required.

> Independent design and development lab. We work off-grid, building ideas that feel discovered, not manufactured. Part studio, part workshop, part experimental unit.

Avoid: marketing verbs ("empower", "leverage"), exclamation marks, oxford comma in the manifesto sections. Use sparingly: numbers, dates, anything that anchors to the calendar.

---

## 8. Accessibility & performance baselines

- Respect `prefers-reduced-motion` — wrap any new GSAP timeline in a check and fall back to instant state. **TODO in current site, must be enforced in the starter.**
- All interactive elements need a hit target ≥ 24×24 even when visually smaller.
- Self-host fonts (`woff2` + `woff` fallback, `font-display: swap`).
- Images: prefer `.webp`, lazy-load anything below the fold, set `width`/`height` to prevent CLS.
- No analytics blocking the main thread on first paint — `<Analytics />` ships after `<ClientShell>`.

---

## 9. File / folder layout (the starter)

```
src/
  app/
    globals.css            # tokens live here, nowhere else
    layout.tsx             # mounts <ClientShell>
    page.tsx               # route entry, imports *Content
    {route}/
      page.tsx
      {Route}Content.tsx   # actual JSX, "use client"
  components/
    ClientShell.tsx
    Nav.tsx / Footer.tsx
    Preloader.tsx
    TransitionController.tsx
    TransitionLink.tsx
    PageReveal.tsx
    BackgroundBlocks.tsx
    BackgroundCanvas.tsx
    ColorBlock.tsx
    RevealText.tsx
    MaskedText.tsx
    SplitTextReveal.tsx
    DraggableImage.tsx
  store/
    useTransitionStore.ts  # the single source of truth for motion phases
public/
  fonts/                   # self-hosted woff2 + woff
  og.webp
```

Pattern: a route's `page.tsx` is a thin server component that imports a co-located `*Content.tsx` client component. Don't put `"use client"` on `page.tsx`.

---

## 10. Quick reference — building a new page

1. Create `src/app/{route}/page.tsx` exporting metadata + `<{Route}Content />`.
2. Create `{Route}Content.tsx` with `"use client"`. Outer wrapper:
   ```tsx
   <div style={{
     position: "relative",
     minHeight: "100vh",
     padding: "var(--page-pad)",
     paddingTop: "6rem",
     display: "flex",
     flexDirection: "column",
   }}>
   ```
3. Headings/labels: `<RevealText as="h1" stagger={0.015}>` with `letterSpacing: 0.2em, textTransform: uppercase, fontSize: var(--text-reg)`.
4. Body copy: `<RevealText as="p" delay={0.1}>` with `fontSize: var(--text-reg), lineHeight: 1.7, letterSpacing: 0.02em`. Wrap in a `marginLeft: auto, maxWidth: 32rem` section.
5. Internal navigation: `<TransitionLink>`, never `next/link`.
6. New animations: subscribe to `useTransitionStore` and gate on `introComplete`; reuse easings from §5.2.

If a design ask doesn't fit cleanly, push back before reaching for new dependencies. The kit above is intentionally small.
