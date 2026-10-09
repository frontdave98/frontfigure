export function StudioTour() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
        Studio HUD
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Palette, grid, inspector.
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--ff-muted)]">
        No account. The scene autosaves in this browser. Open it on a desktop
        screen (1024px+) to build.
      </p>

      <div className="ff-hud-panel mt-8 grid gap-3 rounded-2xl p-3 sm:p-4 md:grid-cols-[7.5rem_minmax(0,1fr)_8.5rem]">
        <div className="ff-well rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Bay
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 md:grid-cols-2">
            {["#C41E3A", "#0055BF", "#237841", "#F5CD2F", "#A0A5A9", "#1B2A34"].map(
              (c) => (
                <span
                  key={c}
                  className="h-7 rounded-md"
                  style={{ background: c }}
                />
              ),
            )}
          </div>
        </div>

        <div className="relative min-h-44 overflow-hidden rounded-xl border border-[var(--ff-border)] bg-[var(--ff-viewport-clear)] sm:min-h-52">
          <div className="ff-brick-pattern absolute inset-0 opacity-60" />
          <div className="absolute left-[18%] top-[38%] h-10 w-16 rounded-sm bg-[#C41E3A] shadow-md" />
          <div className="absolute left-[38%] top-[46%] h-4 w-20 rounded-sm bg-[#F5CD2F] shadow-md" />
          <div className="absolute left-[52%] top-[28%] h-12 w-12 rounded-full bg-[#0055BF] shadow-md" />
          <p className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Viewport
          </p>
        </div>

        <div className="ff-well rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ff-muted)]">
            Inspect
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["#C41E3A", "#0055BF", "#237841", "#FFFFFF", "#1B2A34"].map((c) => (
              <span
                key={c}
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ background: c }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--ff-muted)]">
            Solid or glass. Rotate Y in 90° clicks.
          </p>
        </div>
      </div>
    </section>
  );
}
