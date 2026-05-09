/**
 * Site-wide configuration.
 *
 * Hardcoded `author` is stamped on every tile and exhibit byline. Per-entry
 * `meta.author` may override on a case-by-case basis (e.g. "after Jane Doe"
 * attributions); see `src/lib/animations.ts`.
 */
export const siteConfig = {
  name: "CSS Archive",
  shortName: "Archive",
  tagline: "An editorial archive of CSS and web animation techniques.",
  description:
    "A museum-grade repository for CSS and web animation techniques. Each entry is a curated exhibit — preserving the logic, theory, and execution of interaction design.",
  author: "Ty",
  url: "https://example.com",
  github: "https://github.com/tydolla00/Animation-Playground",
} as const;

export type SiteConfig = typeof siteConfig;
