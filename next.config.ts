import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Turbopack-compatible MDX setup. Plugins MUST be specified as strings (not
 * function refs) so they can be passed across the JS↔Rust boundary; see the
 * "Using Plugins with Turbopack" section of the Next.js MDX guide.
 */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          theme: { light: "vitesse-light", dark: "vitesse-black" },
          keepBackground: false,
          defaultLang: "tsx",
        },
      ],
    ],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withMDX(nextConfig);
