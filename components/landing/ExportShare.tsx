const ROWS = [
  {
    title: "Local save",
    body: "Autosave writes to this browser. Refresh and the figure is still there.",
  },
  {
    title: "Project file",
    body: "Export or import a Frontfigure file to move a scene between machines.",
  },
  {
    title: "GLB",
    body: "Download a mesh you can open in any common GLB viewer.",
  },
] as const;

export function ExportShare() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
        Export & share
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Leave with the figure.
      </h2>
      <ul className="mt-8 divide-y divide-[var(--ff-border)]">
        {ROWS.map((row) => (
          <li
            key={row.title}
            className="ff-landing-step grid gap-1 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-8"
          >
            <h3 className="font-display text-lg font-bold">{row.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--ff-muted)]">
              {row.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
