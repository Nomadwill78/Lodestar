import Link from "next/link";
import StarMark from "./StarMark";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <StarMark size={22} />
          <span className="font-semibold">Lodestar</span>
          <span className="ml-2 text-sm text-muted">Manifesting for people who actually do the work.</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/#vega" className="hover:text-ink">Meet Vega</Link>
          <Link href="/#science" className="hover:text-ink">The science</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/disclaimer" className="hover:text-ink">Disclaimer</Link>
        </nav>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-content flex-col gap-1 px-6 py-5 text-xs text-muted">
          <p>© {new Date().getFullYear()} Lodestar. A Nomad product.</p>
          <p>Lodestar is a personal development tool, not therapy or medical care. <Link href="/disclaimer" className="text-star underline">Learn more</Link>.</p>
        </div>
      </div>
    </footer>
  );
}
