import Link from "next/link";
import StarMark from "./StarMark";
import Footer from "./Footer";

// Shared shell for legal/static pages: brand header, readable prose column,
// and the site footer. Prose elements are styled via arbitrary variants.
export default function LegalPage({ title, updated, children }) {
  return (
    <>
      <header className="border-b border-white/5 bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <StarMark size={24} />
            <span className="text-lg font-semibold tracking-tight">Lodestar</span>
          </Link>
          <Link href="/" className="text-sm text-muted transition-colors hover:text-ink">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {updated ? <p className="mt-3 text-sm text-muted">Last updated {updated}</p> : null}
        <div className="mt-10 space-y-5 leading-relaxed text-muted [&_a]:text-star [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}
