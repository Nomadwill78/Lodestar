import StarMark from "./StarMark";

const LINKS = [
  { href: "#vega", label: "Meet Vega" },
  { href: "#loop", label: "The daily loop" },
  { href: "#science", label: "The science" },
  { href: "#pricing", label: "Pricing" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <StarMark size={24} />
          <span className="text-lg font-semibold tracking-tight">Lodestar</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#pricing" className="hidden text-sm text-muted transition-colors hover:text-ink sm:block">
            Sign in
          </a>
          <a
            href="#waitlist"
            className="rounded-full bg-star px-4 py-2 text-sm font-semibold text-night transition-transform hover:scale-[1.03]"
          >
            Join waitlist
          </a>
        </div>
      </div>
    </header>
  );
}
