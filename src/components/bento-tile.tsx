import Link from "next/link";
import Image from "next/image";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { getYear, type TileSize } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Bento tile — async server component                                         */
/*                                                                             */
/* Five tile vocabularies (sm | wide | tall | feature | text) map to grid      */
/* spans. The grid container is a 4-column CSS grid with                       */
/* `grid-auto-flow: dense` so tiles pack tightly regardless of declaration     */
/* order.                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

const TILE_SPANS: Record<TileSize, string> = {
  sm: "md:col-span-1 md:row-span-1",
  wide: "md:col-span-2 md:row-span-1",
  tall: "md:col-span-1 md:row-span-2",
  feature: "md:col-span-2 md:row-span-2",
  text: "md:col-span-1 md:row-span-1",
};

export type BentoTileProps = {
  slug: string;
  title: string;
  author: string;
  date: string;
  tileSize: TileSize;
  blurb?: string;
  livePreview?: boolean;
  Preview?: ComponentType;
};

/** Looks for a committed `public/animations/<slug>/preview.<ext>`. */
async function resolvePreviewSrc(slug: string): Promise<string | null> {
  const exts = ["webp", "avif", "png", "jpg", "jpeg"] as const;
  for (const ext of exts) {
    try {
      await fs.access(
        path.join(process.cwd(), "public", "animations", slug, `preview.${ext}`),
      );
      return `/animations/${slug}/preview.${ext}`;
    } catch {
      // continue
    }
  }
  return null;
}

export async function BentoTile({
  slug,
  title,
  author,
  date,
  tileSize,
  blurb,
  livePreview,
  Preview,
}: BentoTileProps) {
  const year = getYear(date);
  const previewSrc = livePreview && Preview ? null : await resolvePreviewSrc(slug);

  return (
    <Link
      href={`/exhibit/${slug}`}
      className={cn(
        "group relative flex flex-col bg-background border border-border",
        "transition-colors duration-200 ease",
        "hover:border-foreground/40",
        "mt-7", // breathing room for absolute author/year labels above
        TILE_SPANS[tileSize],
      )}
    >
      <div className="absolute -top-6 left-0 right-0 flex justify-between font-serif italic text-[13px] text-foreground pointer-events-none">
        <span>{author}</span>
        <span className="font-mono not-italic text-muted-foreground tracking-[0.15em]">
          {year}
        </span>
      </div>

      {tileSize === "feature" ? (
        <FeatureBody
          title={title}
          blurb={blurb}
          previewSrc={previewSrc}
          showLive={!!(livePreview && Preview)}
          Preview={Preview}
        />
      ) : tileSize === "text" ? (
        <TextBody title={title} blurb={blurb} />
      ) : (
        <DefaultBody
          title={title}
          previewSrc={previewSrc}
          showLive={!!(livePreview && Preview)}
          Preview={Preview}
        />
      )}
    </Link>
  );
}

function DefaultBody({
  title,
  previewSrc,
  showLive,
  Preview,
}: {
  title: string;
  previewSrc: string | null;
  showLive: boolean;
  Preview?: ComponentType;
}) {
  return (
    <>
      <div className="relative w-full overflow-hidden bg-surface flex-1 min-h-0">
        {showLive && Preview ? (
          <div className="absolute inset-0">
            <Preview />
          </div>
        ) : previewSrc ? (
          <Image
            src={previewSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover",
              "transition-transform duration-[400ms]",
              "[transition-timing-function:var(--ease-out-quart)]",
              "motion-safe:group-hover:scale-[1.03]",
            )}
          />
        ) : (
          <PreviewPlaceholder />
        )}
      </div>
      <div className="px-4 py-3 border-t border-border">
        <h3 className="font-serif text-[18px] leading-tight text-foreground">
          {title}
        </h3>
      </div>
    </>
  );
}

function FeatureBody({
  title,
  blurb,
  previewSrc,
  showLive,
  Preview,
}: {
  title: string;
  blurb?: string;
  previewSrc: string | null;
  showLive: boolean;
  Preview?: ComponentType;
}) {
  return (
    <div className="grid grid-cols-2 flex-1 min-h-0">
      <div className="relative bg-surface overflow-hidden">
        {showLive && Preview ? (
          <div className="absolute inset-0">
            <Preview />
          </div>
        ) : previewSrc ? (
          <Image
            src={previewSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-[400ms]",
              "[transition-timing-function:var(--ease-out-quart)]",
              "motion-safe:group-hover:scale-[1.03]",
            )}
          />
        ) : (
          <PreviewPlaceholder />
        )}
      </div>
      <div className="flex flex-col justify-between p-6 border-l border-border min-h-0">
        <h3 className="font-serif text-[28px] leading-[1.1] text-foreground">
          {title}
        </h3>
        {blurb ? (
          <p className="font-serif text-[15px] leading-snug text-muted-foreground italic mt-4">
            {blurb}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TextBody({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="flex flex-col flex-1 p-5 justify-end min-h-0">
      <div className="h-px w-12 bg-foreground mb-6" />
      <h3 className="font-serif text-[22px] leading-[1.15] text-foreground">
        {title}
      </h3>
      {blurb ? (
        <p className="font-body text-[14px] text-muted-foreground mt-3 leading-snug">
          {blurb}
        </p>
      ) : null}
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
      <span className="font-serif italic text-[64px]">*</span>
    </div>
  );
}
