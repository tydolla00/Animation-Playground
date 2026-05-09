import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import { siteConfig } from "@/config/site";
import type { AnimationMeta } from "./animations";
import { getYear } from "./animations";
import type { SearchIndexEntry } from "./animations-search";

const ANIMATIONS_ROOT = path.join(process.cwd(), "src/animations");

export type LoadedAnimationMeta = AnimationMeta & {
  /** Always populated — falls back to `siteConfig.author` if `meta.author` unset. */
  author: string;
  /** The folder name, also the URL slug. */
  slug: string;
};

export type AnimationEntry = LoadedAnimationMeta & {
  /** The default-exported React component (the live demo). */
  Component: ComponentType;
  /** Optional sibling Preview component for `livePreview: true` tiles. */
  Preview?: ComponentType;
  /** Compiled MDX theory body — the default export of theory.mdx. */
  Theory: ComponentType;
  /** Raw source text of `index.tsx` for syntax-highlighted display. */
  source: string;
  /** Resolved on-disk path to the animation folder (debug / GitHub link use). */
  folderPath: string;
};

/**
 * Discover all valid animation slugs by scanning `src/animations/*` for
 * folders that contain `meta.ts`, `component.tsx`, and `theory.mdx`. Folders
 * missing any of these files are silently skipped — handy while scaffolding.
 *
 * The split between `meta.ts` (server-readable) and `component.tsx` (client)
 * is necessary because Next.js's RSC boundary doesn't reliably surface named
 * non-component exports from a `"use client"` module to a server consumer.
 */
export async function getAnimationSlugs(): Promise<string[]> {
  let dirents: import("node:fs").Dirent[];
  try {
    dirents = await fs.readdir(ANIMATIONS_ROOT, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const slugs: string[] = [];
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue;
    const folder = path.join(ANIMATIONS_ROOT, dirent.name);
    const hasMeta = await exists(path.join(folder, "meta.ts"));
    const hasComponent = await exists(path.join(folder, "component.tsx"));
    const hasTheory = await exists(path.join(folder, "theory.mdx"));
    if (hasMeta && hasComponent && hasTheory) slugs.push(dirent.name);
  }
  return slugs.sort();
}

/**
 * Load a single animation entry by slug. Returns `null` if the slug is
 * unknown or its folder is missing required files.
 */
export async function getAnimationEntry(
  slug: string,
): Promise<AnimationEntry | null> {
  const folderPath = path.join(ANIMATIONS_ROOT, slug);
  const metaPath = path.join(folderPath, "meta.ts");
  const componentPath = path.join(folderPath, "component.tsx");
  const theoryPath = path.join(folderPath, "theory.mdx");

  if (
    !(await exists(metaPath)) ||
    !(await exists(componentPath)) ||
    !(await exists(theoryPath))
  ) {
    return null;
  }

  const source = await fs.readFile(componentPath, "utf-8");

  // Dynamic imports — Next/Turbopack statically analyses this directory
  // pattern and emits a chunk per matching folder, so this works at build time.
  const metaMod = (await import(`@/animations/${slug}/meta`)) as {
    meta: AnimationMeta;
  };
  const componentMod = (await import(`@/animations/${slug}/component`)) as {
    default: ComponentType;
    Preview?: ComponentType;
  };
  const theoryMod = (await import(`@/animations/${slug}/theory.mdx`)) as {
    default: ComponentType;
  };

  const author = metaMod.meta.author ?? siteConfig.author;

  return {
    ...metaMod.meta,
    author,
    slug,
    Component: componentMod.default,
    Preview: componentMod.Preview,
    Theory: theoryMod.default,
    source,
    folderPath,
  };
}

/**
 * Load every animation's metadata + components. Used by the Index bento grid
 * and the Compendium search index. Sorted by `date` descending (newest first).
 *
 * NOTE: this DOES execute every animation's module top-level code (the imports
 * + meta export). For pure component+meta files this is essentially free. If
 * you find yourself doing expensive work at module top-level in an animation,
 * move it into a useEffect or a server util.
 */
export async function getAllAnimations(): Promise<AnimationEntry[]> {
  const slugs = await getAnimationSlugs();
  const entries = await Promise.all(slugs.map(getAnimationEntry));
  return entries
    .filter((e): e is AnimationEntry => e !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Compute a `{ tag: count }` map across all animations. Drives the
 * "Browse by Tag" sidebar and the Compendium quick-tag chips.
 */
export async function getTagFrequencies(): Promise<Record<string, number>> {
  const entries = await getAllAnimations();
  const freq: Record<string, number> = {};
  for (const e of entries) {
    for (const tag of e.tags ?? []) {
      freq[tag] = (freq[tag] ?? 0) + 1;
    }
  }
  return freq;
}

/**
 * Build the client-safe search index. Strips Component / Theory / source —
 * just the metadata strings the Compendium overlay needs.
 */
export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  const entries = await getAllAnimations();
  return entries.map((e) => ({
    slug: e.slug,
    title: e.title,
    author: e.author,
    year: getYear(e.date),
    tags: e.tags ?? [],
    blurb: e.blurb,
    tileSize: e.tileSize,
  }));
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
