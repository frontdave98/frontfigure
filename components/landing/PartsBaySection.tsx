"use client";

import { useState } from "react";
import { familySwatch, PartGlyph } from "@/components/brand/PartGlyph";
import { PART_FAMILIES, type PartFamily } from "@/lib/bricks/families";

export function PartsBaySection() {
  const [family, setFamily] = useState<PartFamily>("brick");
  const selected = PART_FAMILIES.find((f) => f.id === family) ?? PART_FAMILIES[0];
  const swatch = familySwatch(selected.id);

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ff-accent)]">
        Parts bay
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
        Ten shapes. Tap one.
      </h2>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--ff-muted)]">
        Same catalog as the studio. Custom width and depth go to 10 on brick,
        plate, and cube.
      </p>

      <div className="ff-well mt-8 flex items-center gap-3 rounded-xl px-3 py-3 sm:px-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
          style={{
            background: swatch,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <PartGlyph
            family={selected.id}
            active
            color="rgba(255,255,255,0.95)"
            size="lg"
          />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ff-accent)]">
            Loaded
          </p>
          <p className="font-display text-lg font-bold leading-tight">
            {selected.label}
          </p>
          <p className="text-sm text-[var(--ff-muted)]">{selected.hint}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {PART_FAMILIES.map((f) => {
          const active = family === f.id;
          const color = familySwatch(f.id);
          return (
            <button
              key={f.id}
              type="button"
              title={`${f.label} · ${f.hint}`}
              className={`ff-palette-item flex min-h-16 min-w-0 flex-col items-center gap-1 rounded-lg p-1 sm:min-h-[4.5rem] ${
                active ? "is-active" : ""
              }`}
              onClick={() => setFamily(f.id)}
            >
              <span
                className="flex h-10 w-full items-center justify-center rounded-md sm:h-11"
                style={{
                  background: active
                    ? `color-mix(in srgb, ${color} 34%, var(--ff-panel))`
                    : `color-mix(in srgb, ${color} 14%, var(--ff-panel-2))`,
                  boxShadow: active
                    ? `inset 0 0 0 1px ${color}`
                    : "inset 0 1px 2px rgba(0,0,0,0.12)",
                }}
              >
                <PartGlyph family={f.id} active={active} color={color} />
              </span>
              <span
                className={`w-full text-center text-[10px] font-semibold leading-[1.15] ${
                  active ? "text-[var(--ff-text)]" : "text-[var(--ff-muted)]"
                }`}
              >
                {f.id === "round-plate" ? "R-plate" : f.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
