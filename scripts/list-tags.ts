/**
 * `pnpm lint:tags` — print all unique tags across `src/animations/*` with
 * their frequency. Useful to spot drift like `transform` vs `transforms`.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ANIMATIONS_DIR = path.join(process.cwd(), "src/animations");

async function main() {
  let dirents: import("node:fs").Dirent[];
  try {
    dirents = await fs.readdir(ANIMATIONS_DIR, { withFileTypes: true });
  } catch {
    console.log("No src/animations folder yet.");
    return;
  }

  const counts: Record<string, number> = {};
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
        if (t) counts[t] = (counts[t] ?? 0) + 1;
      }
    } catch {
      // skip
    }
  }

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0) {
    console.log("No tags declared yet.");
    return;
  }
  console.log(`\n${sorted.length} unique tags across the archive:\n`);
  const longest = Math.max(...sorted.map(([t]) => t.length));
  for (const [tag, count] of sorted) {
    console.log(`  #${tag.padEnd(longest)}  ${count}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
