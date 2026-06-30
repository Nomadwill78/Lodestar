import StarMark from "./StarMark";

export default function Hero() {
  return (
    <section id="top" className="bg-starfield relative overflow-hidden">
      <div className="mx-auto grid max-w-content items-center gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        {/* Copy */}
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-star/30 bg-star/10 px-3 py-1 text-xs font-medium text-star">
            <StarMark size={13} />
            Grounded in cognitive science, not mysticism
          </div>

          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Manifesting for people who actually do the work.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Lodestar is an AI guide that turns your goals into daily focus,
            rewires the beliefs holding you back, and maps the path from where
            you are to where you are going.
          </p>

          <div id="start" className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="rounded-full bg-star px-6 py-3 text-base font-semibold text-night transition-transform hover:scale-[1.03]"
            >
              Start free
            </a>
            <a
              href="#vega"
              className="rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-star/50 hover:text-star"
            >
              Talk to Vega
            </a>
          </div>

          <p className="mt-5 text-sm text-muted">
            No card to start. Your first morning brief is one conversation away.
          </p>
        </div>

        {/* Vega art */}
        <div className="relative flex justify-center md:justify-end">
          <div className="absolute inset-0 -z-0 mx-auto h-72 w-72 animate-breathe rounded-full bg-star/20 blur-3xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vega/splash.png"
            alt="Vega, the Lodestar guide, surrounded by soft golden light"
            className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl shadow-black/40"
          />
        </div>
      </div>
    </section>
  );
}
