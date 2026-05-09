import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  /* ─────────────────────────────────────────────────────────────────────── */
  /* Bento tile preview contract                                             */
  /*                                                                         */
  /* Every `src/animations/*\/Preview.tsx` runs in-tree alongside the rest   */
  /* of the chrome — no isolation. To prevent style/behaviour bleed, we      */
  /* enforce a strict subset:                                                */
  /*   - JSX + Tailwind utilities + Motion variants only                    */
  /*   - No <style> tags                                                     */
  /*   - No CSS imports                                                      */
  /*   - No document/window event listeners                                  */
  /*   - No mutations to document.body                                       */
  /* If a preview can't follow this, ship a screenshot instead.              */
  /* ─────────────────────────────────────────────────────────────────────── */
  {
    files: ["src/animations/*/Preview.tsx", "src/animations/*/preview.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*.css", "*.scss", "*.module.css", "*.module.scss"],
              message:
                "Preview components cannot import stylesheets — they share the document with the bento grid chrome.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='style']",
          message:
            "No <style> tags in Preview components — declare animations via Tailwind utilities or Motion variants.",
        },
        {
          selector:
            "CallExpression[callee.object.name='document'][callee.property.name='addEventListener']",
          message:
            "No document listeners in Preview components — they pollute the chrome's event surface.",
        },
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name='addEventListener']",
          message:
            "No window listeners in Preview components — they pollute the chrome's event surface.",
        },
        {
          selector:
            "MemberExpression[object.object.name='document'][object.property.name='body']",
          message:
            "No document.body mutations in Preview components — they leak into the bento grid chrome.",
        },
      ],
    },
  },
]);

export default eslintConfig;
