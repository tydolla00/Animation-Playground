import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAnimationEntry,
  getAnimationSlugs,
} from "@/lib/animations.server";
import { formatByline } from "@/lib/animations";
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
    title: entry.title,
    description: entry.blurb ?? `${entry.title} — an exhibit in ${siteConfig.name}.`,
  };
}

export default async function ExhibitPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getAnimationEntry(slug);
  if (!entry) notFound();

  const Theory = entry.Theory;
  const tags = entry.tags ?? [];

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-[760px] px-6 md:px-10 py-16 md:py-24">
        {/* Top metadata bar */}
        <div className="flex items-baseline justify-between mb-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors duration-200 ease"
          >
            ← Return to archive
          </Link>
          <span>Exhibit · {entry.slug}</span>
        </div>

        {/* Title + byline */}
        <header className="mb-12">
          <h1 className="font-serif text-[48px] md:text-[64px] leading-[1.05] text-foreground">
            {entry.title}
          </h1>
          <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
            By {entry.author} · {formatByline(entry.date)}
          </p>
          {tags.length > 0 ? (
            <p className="mt-3 font-mono text-[12px] text-muted-foreground">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="hover:text-foreground transition-colors duration-200 ease mr-3"
                >
                  #{tag}
                </Link>
              ))}
            </p>
          ) : null}
        </header>

        {/* "View Live" prominent CTA — opens the bare /embed/[slug] in a new tab */}
        <div className="mb-12 border-t border-b border-border py-5 flex items-center justify-between">
          <span className="font-serif italic text-[15px] text-muted-foreground">
            The interactive exhibit lives in its own room.
          </span>
          <Link
            href={`/embed/${entry.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-serif uppercase tracking-[0.08em] text-[15px] text-primary hover:text-foreground transition-colors duration-200 ease"
          >
            View Live →
          </Link>
        </div>

        {/* Editorial body — MDX with inline code excerpts. */}
        <div className="editorial-prose">
          <Theory />
        </div>

        {/* Footer link to source */}
        <footer className="mt-24 pt-8 border-t border-border flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors duration-200 ease"
          >
            ← Return to archive
          </Link>
          {siteConfig.github ? (
            <a
              href={`${siteConfig.github}/tree/main/src/animations/${entry.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors duration-200 ease"
            >
              View source on GitHub
            </a>
          ) : null}
        </footer>
      </article>
    </main>
  );
}
