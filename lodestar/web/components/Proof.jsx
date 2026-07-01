const TESTIMONIALS = [
  {
    quote:
      "I have started a hundred goal systems. This is the first one I still open on a hard day, because Vega makes the next step feel obvious.",
    name: "Maya R.",
    role: "Founder, design studio",
  },
  {
    quote:
      "The reframe is the thing. I bring it the spiral and it hands back the evidence. My self-talk has genuinely changed.",
    name: "Devin O.",
    role: "Solo SaaS builder",
  },
  {
    quote:
      "It does not feel like an app nagging me. It feels like someone is holding the vision with me. I have not missed a morning in two months.",
    name: "Priya S.",
    role: "Coach and course creator",
  },
];

export default function Proof() {
  return (
    <section className="bg-starfield">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">Proof</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Follow-through, not just intentions.
            </h2>
            <div className="mt-8 rounded-2xl border border-star/30 bg-star/10 p-6">
              <p className="font-display text-5xl font-semibold text-star">3.2x</p>
              <p className="mt-2 leading-relaxed text-muted">
                Members who complete the daily loop in week one are over three
                times more likely to still be working their goal at week eight.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-white/10 bg-deep/50 p-6">
                <blockquote className="leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-ink">{t.name}</span>
                  <span className="text-muted">, {t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">
          Illustrative figures and names shown during early access.
        </p>
      </div>
    </section>
  );
}
