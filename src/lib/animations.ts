/**
 * Public types and helpers for authoring animations.
 *
 * This file is safe to import from both client and server. The server-only
 * filesystem discovery + MDX loading lives in `./animations.server.ts`.
 */

export type TileSize = "sm" | "wide" | "tall" | "feature" | "text";

export const TILE_SIZE_CLASS: Record<TileSize, string> = {
  sm: "col-span-2 row-span-2 aspect-square sm:col-span-1 sm:row-span-1",
  wide: "col-span-2 row-span-2 aspect-[2/1]",
  tall: "col-span-2 row-span-4 aspect-[1/2] sm:col-span-1 sm:row-span-2",
  feature: "col-span-2 row-span-4 aspect-[1/1]",
  text: "col-span-2 row-span-2 aspect-square sm:col-span-1 sm:row-span-1",
};

export type AnimationMeta = {
  /** Human title shown on tile and exhibit page. Required. */
  title: string;
  /** ISO date string (e.g. `'2024-10-15'`). Drives byline and year corner. */
  date: string;
  /** Optional tags. Drives Compendium search and tag sidebar. */
  tags?: readonly string[];
  /** Required tile vocabulary on the bento grid. */
  tileSize: TileSize;
  /**
   * Optional short description used by `feature` and `text` tile variants.
   * Should be < ~140 chars; serif italic in the tile composition.
   */
  blurb?: string;
  /**
   * Opt into rendering a sibling `<Preview />` component on the bento tile
   * instead of the static `preview.webp` image. The Preview must obey the
   * tile-preview contract (no global CSS, no document listeners, etc.) —
   * see `eslint.config.mjs` for the enforced subset.
   */
  livePreview?: boolean;
  /** Optional override of `siteConfig.author`. Use for "after X" attributions. */
  author?: string;
};

/**
 * Identity helper for type checking. Use in your animation's `index.tsx`:
 *
 *     export const meta = defineMeta({
 *       title: "Magnetic Button Interaction",
 *       date: "2024-10-15",
 *       tileSize: "sm",
 *       tags: ["hover", "transform"],
 *     });
 */
export function defineMeta<const T extends AnimationMeta>(meta: T): T {
  return meta;
}

/** Year extracted from an ISO date string, for the tile corner label. */
export function getYear(date: string): string {
  return date.slice(0, 4);
}

/** Pretty-printed byline date — e.g. "OCTOBER 2024". */
export function formatByline(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const month = d.toLocaleString("en-US", { month: "long" });
  return `${month.toUpperCase()} ${d.getFullYear()}`;
}
