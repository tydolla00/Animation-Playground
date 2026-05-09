import { BentoTile } from "@/components/bento-tile";
import { cn } from "@/lib/utils";
import type { AnimationEntry } from "@/lib/animations.server";

export function BentoGrid({ entries }: { entries: AnimationEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-serif text-[24px] text-muted-foreground italic">
          The archive is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-12",
        // 1 col on mobile, 2 on tablet, 4 on desktop. Dense packing fills holes
        // produced by the 2×N tiles regardless of declaration order.
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        "[grid-auto-flow:dense] [grid-auto-rows:200px]",
      )}
    >
      {entries.map((entry) => (
        <BentoTile
          key={entry.slug}
          slug={entry.slug}
          title={entry.title}
          author={entry.author}
          date={entry.date}
          tileSize={entry.tileSize}
          blurb={entry.blurb}
          livePreview={entry.livePreview}
          Preview={entry.Preview}
        />
      ))}
    </div>
  );
}
