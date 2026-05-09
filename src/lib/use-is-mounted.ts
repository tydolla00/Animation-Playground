"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR and the initial client hydration pass, then
 * `true` after hydration completes. Use this to gate any UI whose value
 * depends on client-only state (theme, localStorage, window dimensions) —
 * the placeholder during the false phase guarantees server/client parity
 * and avoids hydration mismatches without needing a setState-in-effect or
 * `suppressHydrationWarning`.
 *
 * `useSyncExternalStore` returns the server snapshot during both SSR and
 * the first client render, then switches to the client snapshot after the
 * hydration commit — exactly the contract we want.
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
