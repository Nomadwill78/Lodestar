const ARC = [
  { src: "/vega/tier-radiant.png", label: "Present" },
  { src: "/vega/tier-hopeful.png", label: "Reaching" },
  { src: "/vega/tier-concerned.png", label: "Worried" },
  { src: "/vega/tier-panicked-loving.png", label: "Meltdown" },
];

export default function MeetVega() {
  return (
    <section id="vega" className="bg-starfield">
      <div className="mx-auto max-w-content px-6 py-20 md:py-28">
        <div className="grid items-center gap-14 md:grid-cols-2">
          {/* Art + arc */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-star">Meet Vega</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              A guide who remembers your dream when you forget it.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              Vega is the face of Lodestar. Calm, direct, and on your side. She
              holds your north star, reflects your real progress back to you, and
              meets you with warmth every time you return. Her presence shifts
              with how long you have been away, and the moment you come back, she
              is relieved, never scolding.
            </p>

            <div className="mt-9 grid grid-cols-4 gap-3">
              {ARC.map((a) => (
                <figure key={a.label} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.src}
                    alt={`Vega looking ${a.label.toLowerCase()}`}
                    className="aspect-square w-full rounded-xl border border-white/10 object-cover"
                  />
                  <figcaption className="mt-2 text-xs text-muted">{a.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Chat exchange */}
          <div className="rounded-3xl border border-white/10 bg-deep/60 p-6 shadow-2xl shadow-black/30 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vega/headshot.png" alt="Vega" className="h-11 w-11 rounded-full object-cover" />
              <div>
                <p className="font-semibold leading-none">Vega</p>
                <p className="mt-1 text-xs text-care">online</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Bubble from="member">
                I pitched three investors this week and got nothing. Maybe I am
                not cut out for this.
              </Bubble>
              <Bubble from="vega">
                Three pitches in one week is not failure, it is data. A month ago
                you froze before a single call. That is the real trend line.
              </Bubble>
              <Bubble from="vega">
                Here is what is true: you showed up prepared, three times. Let's
                tighten one line in the ask, then book the next pitch now, while
                the nerve is still warm.
              </Bubble>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ from, children }) {
  const isVega = from === "vega";
  return (
    <div className={isVega ? "flex justify-start" : "flex justify-end"}>
      <p
        className={
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed " +
          (isVega
            ? "rounded-tl-sm border border-star/30 bg-star/10 text-ink"
            : "rounded-tr-sm bg-white/5 text-muted")
        }
      >
        {children}
      </p>
    </div>
  );
}
