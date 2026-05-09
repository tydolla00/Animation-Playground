"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TAG_DISPLAY_LIMIT = 12;

export function TagSidebar({
  tagFrequencies,
  selected,
}: {
  tagFrequencies: Record<string, number>;
  selected: string | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const sorted = Object.entries(tagFrequencies).sort(([, a], [, b]) => b - a);
  const visible = showAll ? sorted : sorted.slice(0, TAG_DISPLAY_LIMIT);

  return (
    <nav
      aria-label="Browse by tag"
      className="font-body text-[14px] flex flex-col gap-1"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
        Browse by tag
      </div>
      <Link
        href="/"
        className={cn(
          "py-1.5 px-3 -mx-3 transition-colors duration-200 ease",
          "border-l-2",
          selected === null
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        All entries
      </Link>
      {visible.map(([tag, count]) => (
        <Link
          key={tag}
          href={`/?tag=${encodeURIComponent(tag)}`}
          className={cn(
            "py-1.5 px-3 -mx-3 transition-colors duration-200 ease",
            "border-l-2 flex items-baseline justify-between gap-3",
            selected === tag
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <span>#{tag}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
        </Link>
      ))}
      {sorted.length > TAG_DISPLAY_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground mt-3 px-0 text-left transition-colors duration-200 ease"
        >
          {showAll ? "Show less" : `Show all (${sorted.length})`}
        </button>
      ) : null}
    </nav>
  );
}
