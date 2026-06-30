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
          <a href="#vega" className="hover:text-ink">Meet Vega</a>
          <a href="#science" className="hover:text-ink">The science</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <a href="#start" className="hover:text-ink">Start free</a>
        </nav>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-content px-6 py-5 text-xs text-muted">
          © {new Date().getFullYear()} Lodestar. A Nomad product.
        </div>
      </div>
    </footer>
  );
}
