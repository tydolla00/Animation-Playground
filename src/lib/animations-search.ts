import type { TileSize } from "./animations";

/**
 * Lightweight search-index entry — pure data, safe to serialize across
 * the server/client boundary. Built by the layout via `getSearchIndex()`
 * and handed to the client-side Compendium overlay.
 */
export type SearchIndexEntry = {
  slug: string;
  title: string;
  author: string;
  year: string;
  tags: readonly string[];
  blurb?: string;
  tileSize: TileSize;
};
