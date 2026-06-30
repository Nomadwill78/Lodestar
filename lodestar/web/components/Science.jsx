const MECHANISMS = [
  {
    name: "Reticular activating system",
    plain:
      "Name a goal clearly and your brain starts filtering the world for it. The opportunities were always there. Now you notice them.",
  },
  {
    name: "Priming",
    plain:
      "What you read first thing shapes what you reach for all day. A morning brief sets the frame before the noise does.",
  },
  {
    name: "Implementation intentions",
    plain:
      "Goals stated as when, then are far more likely to happen. Lodestar writes your intentions in that exact form.",
  },
  {
    name: "Cognitive reframing and self-efficacy",
    plain:
      "Belief is built from evidence, not pep talks. Vega reflects your own track record back so the limiting story loses its grip.",
  },
];

export default function Science() {
  return (
    <section id="science" className="bg-starfield">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">The moat</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            We sell the mechanism, not the magic.
          </h2>
          <p className="mt-5 leading-relaxed text-muted">
            Every part of Lodestar maps to something real about how attention,
            belief, and behavior actually work. No crystals, no vague energy.
            Here is what is under the hood, in plain English.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {MECHANISMS.map((m) => (
            <div key={m.name} className="bg-night p-8">
              <h3 className="text-lg font-semibold text-star">{m.name}</h3>
              <p className="mt-3 leading-relaxed text-muted">{m.plain}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
