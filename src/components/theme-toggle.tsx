"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/lib/use-is-mounted";

/**
 * DAY · NIGHT toggle. Reads `resolvedTheme` so the active label tracks the
 * theme actually being shown (whether it came from system pref or an explicit
 * choice). First click locks in the user's choice, persisted by next-themes.
 *
 * The toggle is hidden during SSR + initial hydration to avoid a mismatch:
 * `next-themes` runs an inline `<script>` that resolves the theme before React
 * hydrates, so the first client render already knows the real theme — but the
 * server-rendered HTML cannot. We render a visibility-hidden placeholder of
 * matching dimensions during the hydration pass, then swap to the real toggle.
 */
export function ThemeToggle() {
  const mounted = useIsMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="font-mono text-[11px] uppercase tracking-[0.12em] flex items-center gap-2 select-none"
      role="group"
      aria-label="Theme"
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={mounted ? !isDark : undefined}
        className={cn(
          "transition-colors duration-200 ease",
          mounted && !isDark
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Day
      </button>
      <span aria-hidden className="text-muted-foreground">·</span>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={mounted ? isDark : undefined}
        className={cn(
          "transition-colors duration-200 ease",
          mounted && isDark
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Night
      </button>
    </div>
  );
}
