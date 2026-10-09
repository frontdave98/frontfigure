"use client";

import { ArrowLeft } from "@carbon/icons-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const DESKTOP_QUERY = "(min-width: 1024px)";

type Props = {
  children: ReactNode;
};

export function DesktopOnlyGate({ children }: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isDesktop === null) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--ff-bg-deep)] text-sm text-[var(--ff-muted)]">
        Loading studio…
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="ff-landing-bg relative flex h-dvh flex-col overflow-hidden">
        <div className="ff-brick-pattern pointer-events-none absolute inset-0 opacity-50" />
        <div className="absolute right-3 top-3 z-20">
          <ThemeToggle className="ff-hud-panel min-h-11 min-w-11 rounded-lg" />
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="ff-hud-panel w-full max-w-md rounded-2xl px-6 py-8">
            <div className="flex justify-center">
              <BrandLockup size="md" />
            </div>
            <h1 className="mt-5 font-display text-xl font-bold text-[var(--ff-text)]">
              Studio needs a desktop screen
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ff-muted)]">
              The 3D editor uses a multi-panel layout built for larger displays.
              Open this page on a computer (at least 1024px wide) to build your
              figure.
            </p>
            <Link
              href="/"
              className="btn btn-lg ff-btn-primary mt-6 w-full gap-2"
            >
              <ArrowLeft size={20} className="ff-icon" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
