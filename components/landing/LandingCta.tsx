import { ArrowRight } from "@carbon/icons-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";

export function LandingCta() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pb-24">
      <div className="ff-hud-panel flex flex-col items-start gap-5 rounded-2xl px-5 py-8 sm:px-8 sm:py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandLockup size="md" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--ff-muted)]">
            Open the studio on a desktop screen and start snapping bricks.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Link
            href="/studio"
            className="btn btn-lg ff-btn-primary ff-landing-cta min-h-12 w-full gap-2 px-8"
          >
            Enter Studio
            <ArrowRight size={20} className="ff-icon" />
          </Link>
          <p className="text-center text-[11px] text-[var(--ff-muted)]">
            Studio requires a desktop screen
          </p>
        </div>
      </div>
      <p className="mt-8 text-center text-[11px] text-[var(--ff-muted)]">
        Frontfigure — brick figure studio
      </p>
    </section>
  );
}
