"use client";

import { ArrowRight } from "@carbon/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";

const HeroViewport = dynamic(
  () => import("./HeroViewport").then((m) => m.HeroViewport),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-xs text-[var(--ff-muted)]">
        Loading bricks…
      </div>
    ),
  },
);

export function LandingHero() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col md:flex-row md:items-center">
      <div
        aria-hidden
        className="relative h-[42dvh] min-h-[260px] w-full md:order-2 md:h-[min(72vh,640px)] md:w-[54%]"
      >
        <HeroViewport />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-14 pt-2 sm:px-8 md:w-[46%] md:px-10 md:py-16 lg:px-6">
        <BrandLockup size="hero" priority />
        <h1
          className="mt-4 max-w-md font-display font-bold leading-snug text-[var(--ff-text)] sm:mt-5"
          style={{ fontSize: "clamp(1.25rem, 3.4vw, 1.875rem)" }}
        >
          Build custom brick figures in a game-like 3D studio.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--ff-muted)] sm:mt-4 sm:text-base">
          No account. Save locally or share a project file. Glass parts, custom
          sizes, and export GLB when your figure is ready.
        </p>
        <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/studio"
            className="btn btn-lg ff-btn-primary ff-landing-cta min-h-12 w-full gap-2 px-8 sm:w-auto"
          >
            Enter Studio
            <ArrowRight size={20} className="ff-icon" />
          </Link>
          <p className="text-center text-[11px] text-[var(--ff-muted)] sm:text-left">
            Studio requires a desktop screen
          </p>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-[10px] font-medium uppercase tracking-wider text-[var(--ff-muted)] sm:mt-8 sm:gap-x-4 sm:text-xs">
          <li>No account</li>
          <li className="text-[var(--ff-border)]" aria-hidden>
            ·
          </li>
          <li>Local + file save</li>
          <li className="text-[var(--ff-border)]" aria-hidden>
            ·
          </li>
          <li>Export GLB</li>
          <li className="text-[var(--ff-border)]" aria-hidden>
            ·
          </li>
          <li>Glass &amp; custom parts</li>
        </ul>
      </div>
    </section>
  );
}
