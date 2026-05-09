/**
 * Global MDX component overrides — applied to every .mdx file in the repo.
 * Per the @next/mdx App Router contract, this file MUST live at the project root.
 *
 * See https://nextjs.org/docs/app/building-your-application/configuring/mdx
 */
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
