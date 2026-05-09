import type { Metadata } from "next";
import { BentoGrid } from "@/components/bento-grid";
import { TagSidebar } from "@/components/tag-sidebar";
import {
  getAllAnimations,
  getTagFrequencies,
} from "@/lib/animations.server";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — The Curator's Desk`,
  description: siteConfig.description,
};

type Props = { searchParams: Promise<{ tag?: string }> };

export default async function CuratorsDeskPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedTag = params.tag ?? null;

  const [allEntries, tagFrequencies] = await Promise.all([
    getAllAnimations(),
    getTagFrequencies(),
  ]);

  const entries = selectedTag
    ? allEntries.filter((e) => (e.tags ?? []).includes(selectedTag))
    : allEntries;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <TagSidebar tagFrequencies={tagFrequencies} selected={selectedTag} />
          </aside>

          <section>
            {selectedTag ? (
              <div className="mb-10 pb-6 border-b border-border flex items-baseline justify-between">
                <h1 className="font-serif text-[28px] text-foreground italic">
                  Filed under <span className="not-italic">#{selectedTag}</span>
                </h1>
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>
            ) : null}

            <BentoGrid entries={entries} />
          </section>
        </div>
      </div>
    </main>
  );
}
