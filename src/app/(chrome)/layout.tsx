import { CompendiumProvider } from "@/components/compendium";
import { Header } from "@/components/header";
import { getSearchIndex } from "@/lib/animations.server";

export default async function ChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const index = await getSearchIndex();
  return (
    <CompendiumProvider index={index}>
      <Header />
      <div className="flex-1 flex flex-col">{children}</div>
    </CompendiumProvider>
  );
}
