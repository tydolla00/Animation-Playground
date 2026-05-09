# Editorial Archive

A museum-grade repository for CSS and web animation techniques. Each entry is a
curated exhibit — preserving the logic, theory, and execution of interaction
design in a calm, focused environment.

Built with Next.js 16 (App Router), Tailwind v4, shadcn/ui, MDX, Motion, and
Shiki via rehype-pretty-code.

## Authoring an exhibit

Each exhibit lives in its own folder under `src/animations/`. Scaffold a new
one with the CLI:

```bash
pnpm new "Magnetic Button Interaction"
```

This generates:

```
src/animations/magnetic-button/
  meta.ts          # exports the `meta` blob (server-readable) — title, date,
                   # tags, tileSize, blurb, etc.
  component.tsx    # "use client" — the actual live demo. Rendered full-screen
                   # at /embed/magnetic-button. May export an optional
                   # `Preview` for opt-in live tile rendering.
  theory.mdx       # editorial body — prose interleaved with code excerpts
public/animations/magnetic-button/
  preview.webp     # (optional) committed screenshot used by the bento tile
```

The split between `meta.ts` and `component.tsx` is deliberate: Next.js's RSC
boundary doesn't reliably surface non-component named exports from a
`"use client"` module to a server consumer, so `meta` lives in its own
server-readable file.

Edit `meta.ts` to set:

- `tileSize` — `'sm' | 'wide' | 'tall' | 'feature' | 'text'`
- `tags` — open strings, drives Compendium search and the tag sidebar
- `blurb` — short editorial caption used by `feature` and `text` tiles
- `livePreview` — opt into a sibling `<Preview />` component on the bento tile
  instead of the static `preview.webp`

If you opt into `livePreview`, export a named `Preview` from `component.tsx`
(or create a sibling `Preview.tsx`). The preview must obey a strict subset
(no global CSS, no document listeners, etc.) — see `eslint.config.mjs` for
the enforced rules.

## URLs

| Route                     | What lives there                                                      |
| ------------------------- | --------------------------------------------------------------------- |
| `/`                       | The Curator's Desk — bento grid + tag sidebar                         |
| `/?tag=<tag>`             | Filtered grid                                                         |
| `/exhibit/<slug>`         | Editorial documentation page (theory + inline code excerpts)          |
| `/embed/<slug>`           | Full-bleed live demo (no chrome) — opened by the "View Live →" link   |

The Compendium search overlay opens with `⌘K`, `/`, or the header button.

## Scripts

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm start      # next start
pnpm lint       # eslint
pnpm new <name> # scaffold a new animation entry
pnpm lint:tags  # print all tags + frequencies (spot tag drift)
```

## Stack

| Concern                | Choice                                                  |
| ---------------------- | ------------------------------------------------------- |
| Framework              | Next.js 16 (App Router, RSC, TypeScript)                |
| Styling                | Tailwind v4 + shadcn/ui (`base-nova` style)             |
| Theme                  | `next-themes` with `defaultTheme="system"`              |
| Animation              | Motion (formerly Framer Motion)                         |
| MDX                    | `@next/mdx` + `rehype-pretty-code` (Shiki vitesse)      |
| Search                 | `cmdk` styled to the editorial overlay                  |
| Fonts                  | Fraunces (serif), Lora (body), JetBrains Mono           |
| Deploy                 | Vercel (fully static where possible)                    |

## Design

Editorial palette: warm linen + espresso (light) / aged ivory on espresso
(dark), with terracotta primary and forest accent. Sharp 0px corners, 1px
hairline borders, generous spacing, no drop shadows. Inspired by Are.na, The
Paris Review, and HoverStates.
