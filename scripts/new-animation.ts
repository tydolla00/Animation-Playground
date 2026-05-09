/**
 * CLI scaffolder for new animations.
 *
 * Usage:
 *   pnpm new "Magnetic Button Interaction"
 *   pnpm new magnetic-button
 *
 * Creates `src/animations/<slug>/{index.tsx, theory.mdx}` from templates,
 * pre-fills the metadata, and prints the existing tag set so authors reach
 * for established tag names by default.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ANIMATIONS_DIR = path.join(ROOT, "src/animations");
const PUBLIC_DIR = path.join(ROOT, "public/animations");

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listExistingTags(): Promise<string[]> {
  if (!(await exists(ANIMATIONS_DIR))) return [];
  const dirents = await fs.readdir(ANIMATIONS_DIR, { withFileTypes: true });
  const tags = new Set<string>();
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    const metaPath = path.join(ANIMATIONS_DIR, d.name, "meta.ts");
    try {
      const src = await fs.readFile(metaPath, "utf-8");
      const m = src.match(/tags:\s*\[([^\]]*)\]/);
      if (!m) continue;
      const items = m[1].split(",");
      for (const raw of items) {
        const t = raw.trim().replace(/^['"]|['"]$/g, "");
        if (t) tags.add(t);
      }
    } catch {
      // skip
    }
  }
  return [...tags].sort();
}

const META_TEMPLATE = (title: string, date: string) => `import { defineMeta } from "@/lib/animations";

export const meta = defineMeta({
  title: ${JSON.stringify(title)},
  date: "${date}",
  tags: [],
  tileSize: "sm",
  // blurb: "Short editorial caption for 'feature' or 'text' tiles.",
  // livePreview: true, // opt into the sibling Preview component on the bento tile
});
`;

const COMPONENT_TEMPLATE = (title: string, date: string, componentName: string) => `"use client";

export default function ${componentName}() {
  return (
    <div className="min-h-screen w-full grid place-items-center bg-surface text-foreground">
      <div className="text-center">
        <h2 className="font-serif text-[32px]">${title}</h2>
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground mt-3">
          New exhibit · ${date}
        </p>
      </div>
    </div>
  );
}
`;

const THEORY_TEMPLATE = () => `## The Technique

Begin here. What does this animation actually do, in plain prose? A reader
should grasp the essential effect without watching the live demo.

## Why It Works

Explain the mechanism. Reach for code only when prose alone won't carry the
point. Fenced code blocks render as syntax-highlighted excerpts — keep them
short, surgical, and focused on what's interesting.

\`\`\`tsx
// Drop in the snippet that earns its place.
\`\`\`

## Implementation Notes

Caveats, browser quirks, performance footnotes, edge cases you discovered.
The reader of this archive will be future-you debugging this technique six
months from now — write to that audience.

## Inspiration

Where the idea came from. A link, a person, a moment of seeing it in the wild.
`;

const PREVIEW_README = `Preview component contract:
- JSX + Tailwind utilities + Motion variants only
- No <style> tags, no .css/.scss imports
- No document/window event listeners
- No setting body/html styles or classes
- No custom @keyframes (use Tailwind's animation utilities or Motion)

If your preview can't follow this, ship a screenshot instead by saving a
PNG/WebP at public/animations/<slug>/preview.webp and removing this file.
`;

function slugToComponent(title: string): string {
  // PascalCase from a human title.
  return (
    title
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") || "Untitled"
  );
}

async function main() {
  const arg = process.argv.slice(2).join(" ").trim();
  if (!arg) {
    console.error('Usage: pnpm new "Magnetic Button Interaction"');
    process.exit(1);
  }

  const slug = slugify(arg);
  const title = arg.includes("-") || arg.includes("_") ? titleize(slug) : arg;
  const folder = path.join(ANIMATIONS_DIR, slug);

  if (await exists(folder)) {
    console.error(`✗ src/animations/${slug} already exists. Pick another slug.`);
    process.exit(1);
  }

  await fs.mkdir(folder, { recursive: true });
  await fs.mkdir(path.join(PUBLIC_DIR, slug), { recursive: true });

  const date = todayISO();
  const componentName = slugToComponent(title);
  await fs.writeFile(path.join(folder, "meta.ts"), META_TEMPLATE(title, date));
  await fs.writeFile(
    path.join(folder, "component.tsx"),
    COMPONENT_TEMPLATE(title, date, componentName),
  );
  await fs.writeFile(path.join(folder, "theory.mdx"), THEORY_TEMPLATE());

  // Drop a README explaining the public preview convention.
  await fs.writeFile(
    path.join(PUBLIC_DIR, slug, "README.md"),
    `Place \`preview.webp\` (or .png/.avif/.jpg) here for the bento tile.\n\n${PREVIEW_README}`,
  );

  const existing = await listExistingTags();

  console.log(`\n✓ Created src/animations/${slug}/`);
  console.log(`  - meta.ts`);
  console.log(`  - component.tsx`);
  console.log(`  - theory.mdx`);
  console.log(`  - public/animations/${slug}/  (drop preview.webp here)`);
  console.log(`\n  Title: ${title}`);
  console.log(`  Date:  ${date}`);
  console.log(`  Slug:  ${slug}\n`);
  if (existing.length > 0) {
    console.log("  Existing tags (reach for these first):");
    console.log("    " + existing.map((t) => `#${t}`).join("  "));
    console.log("");
  }
  console.log("  Edit the meta block in index.tsx to set tileSize and tags.");
  console.log("  Then visit http://localhost:3000/exhibit/" + slug);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
