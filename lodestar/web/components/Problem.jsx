export default function Problem() {
  return (
    <section className="border-y border-white/5 bg-deep/40">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">The honest problem</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
          You have read the books. You believe the idea. Nothing turns it into a system.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card
            n="01"
            title="The books inspire, then stop"
            body="You finish the chapter fired up. A week later the notebook is closed and the vision is a memory."
          />
          <Card
            n="02"
            title="Nothing systematizes it"
            body="Vision boards and affirmations have no feedback loop. There is no daily mechanism, just hope on a good day."
          />
          <Card
            n="03"
            title="Goals fade by week two"
            body="Motivation is not the problem. The drop-off is structural. Without a daily loop, the goal quietly slips off the radar."
          />
        </div>
      </div>
    </section>
  );
}

function Card({ n, title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-night/40 p-7">
      <div className="font-display text-2xl font-semibold text-star/70">{n}</div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-3 leading-relaxed text-muted">{body}</p>
    </div>
  );
}
