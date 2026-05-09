"use client";

import { Command as CommandPrimitive } from "cmdk";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { SearchIndexEntry } from "@/lib/animations-search";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Context — lets the header trigger / hotkeys open the same modal instance.   */
/* ─────────────────────────────────────────────────────────────────────────── */

type CompendiumContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CompendiumContext = createContext<CompendiumContextValue | null>(null);

export function useCompendium(): CompendiumContextValue {
  const ctx = useContext(CompendiumContext);
  if (!ctx) {
    throw new Error("useCompendium must be used inside <CompendiumProvider />");
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Provider + overlay                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const QUICK_TAG_LIMIT = 8;

export function CompendiumProvider({
  index,
  children,
}: {
  index: SearchIndexEntry[];
  children: ReactNode;
}) {
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Wrap setOpen so we can reset query on close — keeps that side effect with
  // the state transition rather than in a separate effect (avoids the
  // setState-in-effect anti-pattern).
  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (!next) setQuery("");
  }, []);

  const toggle = useCallback(() => {
    setOpenState((prev) => {
      if (prev) setQuery("");
      return !prev;
    });
  }, []);

  const value = useMemo<CompendiumContextValue>(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle],
  );

  // Hotkeys: Cmd/Ctrl+K, "/" (when not focused on a text field), ESC closes.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isCmdK = e.key === "k" && (e.metaKey || e.ctrlKey);
      const isSlash =
        e.key === "/" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)
        );
      if (isCmdK || isSlash) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") {
        setOpenState((prev) => {
          if (prev) setQuery("");
          return false;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Top-N most-used tags, derived once per index change.
  const quickTags = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const e of index) {
      for (const tag of e.tags) freq[tag] = (freq[tag] ?? 0) + 1;
    }
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, QUICK_TAG_LIMIT)
      .map(([tag]) => tag);
  }, [index]);

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push(`/exhibit/${slug}`);
    },
    [router, setOpen],
  );

  return (
    <CompendiumContext.Provider value={value}>
      {children}
      {open ? (
        <CompendiumOverlay
          query={query}
          setQuery={setQuery}
          quickTags={quickTags}
          index={index}
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
        />
      ) : null}
    </CompendiumContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Overlay UI — full-screen, editorial, hairline rows                          */
/* ─────────────────────────────────────────────────────────────────────────── */

function CompendiumOverlay({
  query,
  setQuery,
  quickTags,
  index,
  onClose,
  onSelect,
}: {
  query: string;
  setQuery: (q: string) => void;
  quickTags: string[];
  index: SearchIndexEntry[];
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compendium — search the archive"
      className={cn(
        "fixed inset-0 z-50",
        // Warm linen / espresso overlay at 0.98 opacity (PRD spec).
        "bg-background/[.98]",
        "animate-in fade-in duration-200 ease-out",
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className={cn(
          "absolute top-8 right-10 font-serif text-[32px] leading-none",
          "text-foreground hover:text-primary transition-colors duration-200 ease",
        )}
        aria-label="Close Compendium"
      >
        ×
      </button>

      <CommandPrimitive
        label="Search the archive"
        className="flex flex-col h-full pt-[14vh] px-8 md:px-16"
        shouldFilter={true}
        loop
      >
        <div className="mx-auto w-full max-w-4xl">
          <CommandPrimitive.Input
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Type to begin searching the archive..."
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "font-serif italic text-foreground",
              "text-[40px] md:text-[56px] lg:text-[72px] leading-[1.05]",
              "placeholder:text-muted-foreground/60",
              "caret-primary",
            )}
          />
          <div className="mt-6 h-px bg-border" />

          {quickTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Quick tags
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(`#${tag}`)}
                  className={cn(
                    "font-mono text-[14px] text-muted-foreground hover:text-foreground",
                    "transition-colors duration-200 ease",
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <CommandPrimitive.List className="mt-10 mx-auto w-full max-w-4xl flex-1 overflow-y-auto pb-12">
          <CommandPrimitive.Empty className="font-serif italic text-muted-foreground text-[20px] py-8">
            {query.trim().length === 0
              ? "Awaiting your query..."
              : "Nothing in the archive matches."}
          </CommandPrimitive.Empty>

          <CommandPrimitive.Group>
            {index.map((entry) => {
              const tagsString = entry.tags.map((t) => `#${t}`).join(" ");
              return (
                <CommandPrimitive.Item
                  key={entry.slug}
                  value={`${entry.title} ${entry.author} ${entry.year} ${tagsString}`}
                  onSelect={() => onSelect(entry.slug)}
                  className={cn(
                    "group/item flex items-baseline justify-between gap-6",
                    "border-b border-border py-5 cursor-pointer",
                    "transition-colors duration-150 ease",
                    "data-[selected=true]:bg-foreground data-[selected=true]:text-background",
                    "data-[selected=true]:px-6",
                  )}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-serif text-[22px] truncate">
                      {entry.title}
                    </span>
                    {entry.tags.length > 0 ? (
                      <span className="font-mono text-[12px] text-muted-foreground group-data-[selected=true]/item:text-background/70">
                        {entry.tags.map((t) => `#${t}`).join("  ")}
                      </span>
                    ) : null}
                  </div>
                  <div className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted-foreground group-data-[selected=true]/item:text-background/80 shrink-0">
                    {entry.year}
                  </div>
                </CommandPrimitive.Item>
              );
            })}
          </CommandPrimitive.Group>
        </CommandPrimitive.List>

        <div className="mx-auto w-full max-w-4xl pb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>Esc to close</span>
          <span>↑↓ navigate · ↵ open</span>
        </div>
      </CommandPrimitive>
    </div>
  );
}
