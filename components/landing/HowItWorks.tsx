const STEPS = [
  { n: "01", title: "Pick", body: "Load a brick, plate, slope, or sphere from the bay." },
  { n: "02", title: "Snap", body: "Click the grid. Studs lock. Rotate 90° when you need a turn." },
  { n: "03", title: "Color", body: "Solid or glass. Saved swatches stay on this device." },
  { n: "04", title: "Export", body: "Download GLB when the figure is ready to leave the studio." },
] as const;

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
        How it works
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Four moves. One figure.
      </h2>
      <ol className="mt-8 divide-y divide-[var(--ff-border)] md:flex md:divide-x md:divide-y-0">
        {STEPS.map((step) => (
          <li key={step.n} className="ff-landing-step flex gap-4 py-5 md:flex-1 md:flex-col md:px-5 md:py-0 first:md:pl-0 last:md:pr-0">
            <span className="font-display text-sm font-extrabold tabular-nums text-[var(--ff-accent)]">
              {step.n}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ff-muted)]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
