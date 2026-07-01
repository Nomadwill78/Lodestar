// A faithful mock of the in-app Life Map dashboard, built in the same
// indigo + gold language so the marketing artifact matches the product.

const MOMENTUM = [2, 1, 3, 0, 2, 4, 1, 0, 3, 2, 5, 1, 2, 3];

export default function LifeMap() {
  return (
    <section className="border-y border-white/5 bg-deep/40">
      <div className="mx-auto grid max-w-content items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">The Life Map</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            One screen that holds the whole picture.
          </h2>
          <p className="mt-5 leading-relaxed text-muted">
            Your north star, the goals moving under it, the blockers in the way,
            and the momentum you are building from your own logged evidence.
            Vega reads this map every morning so the daily focus is never random.
          </p>
          <ul className="mt-7 space-y-3 text-muted">
            <Bullet>North star you set once and return to often</Bullet>
            <Bullet>Goals with the metric that means done</Bullet>
            <Bullet>Momentum built from real wins, not streaks for their own sake</Bullet>
            <Bullet>Patterns Vega surfaces from what you actually do</Bullet>
          </ul>
        </div>

        {/* Dashboard mock */}
        <div className="rounded-3xl border border-white/10 bg-night p-5 shadow-2xl shadow-black/40 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Your Life Map</p>

          {/* North star hero */}
          <div className="mt-3 rounded-2xl border border-star/40 bg-star/10 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-star">North star</p>
            <p className="mt-2 text-xl font-semibold leading-snug">
              Build a studio that supports me and three people I trust.
            </p>
          </div>

          {/* Momentum */}
          <div className="mt-4 rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-semibold">Momentum, last 14 days</p>
            <div className="mt-4 flex h-16 items-end gap-1.5">
              {MOMENTUM.map((v, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={"w-full rounded-sm " + (v === 0 ? "bg-white/10" : "bg-star/80")}
                    style={{ height: `${8 + (v / 5) * 48}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted">
              <span><span className="font-semibold text-ink">19</span> wins</span>
              <span><span className="font-semibold text-ink">4</span> setbacks</span>
              <span><span className="font-semibold text-ink">28</span> entries</span>
            </div>
          </div>

          {/* Goals */}
          <div className="mt-4 space-y-2.5">
            <Goal title="Ship the booking flow" meta="2 of 4 screens done. Target Aug 12" />
            <Goal title="Reach 20 paying clients" meta="11 of 20. Target this quarter" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-star" />
      <span>{children}</span>
    </li>
  );
}

function Goal({ title, meta }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-sm text-muted">{meta}</p>
    </div>
  );
}
