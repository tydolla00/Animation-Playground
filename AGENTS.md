# AGENTS.md — Editorial Archive

Context for autonomous agents and collaborators working in this repo. For human onboarding, see `README.md`.

## Product shape

This app is **not** an embed-everywhere component library. Each animation is:

1. A **gallery tile** on `/` (bento-ish grid).
2. An **exhibit doc** at `/exhibit/[slug]` (MDX prose + excerpts; **no embedded live iframe**).
3. A **full-screen demo** at `/embed/[slug]` linked as “View Live →”.

## Stack (facts)

| Area | Choice |
|------|--------|
| Runtime | Next.js **16**, App Router, TypeScript |
| Styles | Tailwind **v4** + shadcn (`components.json`; `globals.css` is the CSS source of truth) |
| Themes | `next-themes`; `defaultTheme="system"`; light + warm editorial dark palette in `globals.css` |
| Motion | `motion/react` preferred for interactive demos |
| Content | `@next/mdx` + Turbopack: rehype plugins must be **[string, options]** tuples in `next.config.ts` (see [`rehype-pretty-code`](https://github.com/rehype-pretty/rehype-pretty-code)) |

## Exhibit folder contract

Each slug is **`src/animations/<slug>/`** with:

| File | Role |
|------|------|
| `meta.ts` | **`export const meta = defineMeta({ ... })`** — server-loadable metadata (title, `date`, `tags`, `tileSize`, `blurb`, `livePreview`, …) |
| `component.tsx` | **`export default`** = full-screen client demo for `/embed/<slug>`; optional **`export function Preview`** for live tiles |
| `theory.mdx` | Exhibit body; fenced code handled by **rehype-pretty-code** + Shiki (light/dark token CSS in `globals.css`) |

Optional static tile image:

- **`public/animations/<slug>/preview.{webp,png,jpg,...}`**

**Why `meta.ts` exists:** `"use client"` modules do **not** reliably expose non-component named exports across the RSC boundary. Keep **all metadata** out of `"use client"` files.

Discovery and loading happen in **`src/lib/animations.server.ts`** (`getAnimationSlugs`, `getAnimationEntry`, `getAllAnimations`, …). Do not rename those files casually without updating the loaders.

### `meta.tileSize`

`TileSize`: `'sm' | 'wide' | 'tall' | 'feature' | 'text'`. Mapped in **`src/components/bento-tile.tsx`** to grid spans (`grid-auto-flow: dense`, 4 columns on large screens).

### Live tile preview (`livePreview`)

If `meta.livePreview === true`, the registry pulls **`Preview`** from `component.tsx` (and must obey the ESLint contract — see below). **Otherwise** only `public/animations/<slug>/preview.*` is used; missing file ⇒ placeholder asterisk.

## Routing & layouts

| Path | Layout note |
|------|-------------|
| `/`, `/exhibit/*` | Wrapped by **`src/app/(chrome)/layout.tsx`**: header, **`CompendiumProvider`**, search index from server |
| `/embed/[slug]` | **No chrome** — `src/app/embed/[slug]/page.tsx` mounts only `Component`; `robots.index = false` (canonical detail is `/exhibit/...`) |

## Global UX details agents should preserve

### Compendium (search overlay)

Implemented in **`src/components/compendium.tsx`**.

- Opens via header, **⌘K** / **Ctrl+K**, or **`/`** when focus is not in an editable field.
- **ESC** closes.
- Clearing query on close is done by **wrapping `setOpen`**, not `useEffect` + `setState` (avoid `react-hooks/set-state-in-effect`).

### Theme toggle hydration

**`src/components/theme-toggle.tsx`** uses **`useIsMounted()`** from **`src/lib/use-is-mounted.ts`** (`useSyncExternalStore`), not `resolvedTheme !== undefined`. `next-themes` resolves the theme before hydrate; comparing to `undefined` causes **hydration mismatch**.

### Site copy & author

Central config: **`src/config/site.ts`** (name, GitHub URL for footer link, hardcoded exhibit author stamped on tiles).

### Background texture

**`body::before`** in **`globals.css`** uses **`/public/worn-dots.png`**. Editing blend/opacity touches light + `.dark body::before`.

## Animation implementation guidance

### Keyframes / global CSS inside a demo

- **`/embed/<slug>`** is an isolated route — safe to use **`@keyframes` in `<style>`** or **`import ./styles.css`** in that slug’s **`component.tsx`** without polluting `/`.
- **`Preview`** must **not** add global selectors, `<style>` with keyframes at document scope, stylesheet imports that define global `@keyframes`, or `document`/`window` listeners (see ESLint).

### ESLint preview contract

**`eslint.config.mjs`** — `files: ['src/animations/*/Preview.tsx', 'src/animations/*/preview.tsx']` restricts imports/syntax.

If **`Preview`** lives inline in **`component.tsx`**, that file is **not** linted by those rules — same contract applies **by convention**.

### Sharing logic between Preview and full demo

Extract hooks/utilities beside the slug, e.g. **`src/animations/<slug>/use-*-pointer.ts`** (see **`magnetic-button/`**).

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm new "Slug Title Here"    # scaffold under src/animations + public/animations
pnpm lint:tags                # frequencies of tags from meta.ts
```

## MCP / integrations

Workspace rules may mention **PostHog** (`.cursor/rules/posthog-integration.mdc`). **This archive build does not wire PostHog** unless explicitly added later: **never hallucinate keys** if you add analytics.

## When editing shadcn

Follow **`.agents/skills/shadcn/SKILL.md`**: semantic tokens (`bg-background`), `gap-*` not `space-y-*`, `size-*`, `cn()`, overlay components own z-index unless there is a strong reason otherwise.

## Typecheck

ESLint passes in CI/script; **`pnpm exec tsc --noEmit`** is a good sanity check after structural changes.
