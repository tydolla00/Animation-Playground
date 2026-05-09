import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAnimationEntry,
  getAnimationSlugs,
} from "@/lib/animations.server";
import { siteConfig } from "@/config/site";

type Params = { slug: string };
type Props = { params: Promise<Params> };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAnimationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getAnimationEntry(slug);
  if (!entry) return {};
  return {
    title: `${entry.title} — Live`,
    description: entry.blurb ?? `Live demo: ${entry.title}.`,
    robots: { index: false }, // canonical version is the /exhibit page
  };
}

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getAnimationEntry(slug);
  if (!entry) notFound();

  const Component = entry.Component;

  return (
    <main className="min-h-screen w-screen flex items-stretch justify-stretch">
      {/* The animation owns the entire viewport. The wrapper does no styling
          beyond ensuring full-screen — no padding, no nav, no chrome. */}
      <div className="flex-1">
        <Component />
      </div>
      {/* Tiny corner watermark so a stranger landing on the bare URL knows
          where it came from. Hidden when printed. */}
      <a
        href={`/exhibit/${entry.slug}`}
        className="fixed bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors duration-200 ease bg-background/70 backdrop-blur-sm px-2 py-1 print:hidden"
      >
        ← {siteConfig.shortName}
      </a>
    </main>
  );
}
