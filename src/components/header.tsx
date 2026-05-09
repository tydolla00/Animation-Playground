"use client";

import Link from "next/link";
import { useCompendium } from "@/components/compendium";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";

export function Header() {
  const { setOpen } = useCompendium();
  return (
    <header className="h-20 border-b border-border bg-background sticky top-0 z-30">
      <div className="h-full mx-auto flex items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-serif text-[22px] tracking-tight text-foreground hover:text-primary transition-colors duration-200 ease"
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-serif text-[15px] uppercase tracking-[0.08em] text-foreground hover:text-primary transition-colors duration-200 ease flex items-center gap-2"
            aria-label="Open Compendium search (⌘K)"
          >
            <span>Compendium</span>
            <kbd className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground border border-border px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
