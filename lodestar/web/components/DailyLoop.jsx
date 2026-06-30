const STEPS = [
  {
    time: "Morning",
    title: "Set the intention",
    body: "A short brief names your one focus, an implementation intention (when, then), and one thing that is already true about you. Sixty seconds, and the day has a spine.",
    glyph: "☀", // sun
  },
  {
    time: "Midday",
    title: "Reframe the setback",
    body: "Hit a wall, journal it. Vega classifies what is really going on and turns the spiral into counter-evidence and a next move you can actually take.",
    glyph: "✎", // pencil
  },
  {
    time: "Evening",
    title: "Close the day",
    body: "A two-line review logs what moved and tomorrow's one thing. It becomes evidence, and it resets Vega's clock so she greets you warmly next time.",
    glyph: "☾", // moon
  },
];

export default function DailyLoop() {
  return (
    <section id="loop" className="border-y border-white/5 bg-deep/40">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">The daily loop</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
          A rhythm small enough to keep, strong enough to compound.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-white/10 bg-night/40 p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-star/30 bg-star/10 text-2xl text-star">
                {s.glyph}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-care">{s.time}</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-star/40 md:block">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
