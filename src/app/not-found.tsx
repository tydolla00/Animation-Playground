import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-6">
          Entry No. — / —
        </p>
        <h1 className="font-serif text-[48px] md:text-[64px] leading-[1.05] text-foreground italic">
          Not in the archive.
        </h1>
        <p className="mt-6 font-serif text-[18px] text-muted-foreground">
          The exhibit you sought has either not yet been catalogued, or never
          existed at all. The curator regrets the inconvenience.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 font-serif uppercase tracking-[0.08em] text-[15px] text-primary hover:text-foreground transition-colors duration-200 ease"
        >
          ← Return to archive
        </Link>
      </div>
    </div>
  );
}
