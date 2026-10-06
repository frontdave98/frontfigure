"use client";

import { ArrowRight } from "@carbon/icons-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const BRICKS = [
  { left: "12%", top: "18%", w: 72, h: 40, color: "#C41E3A", rot: -8 },
  { left: "28%", top: "30%", w: 110, h: 36, color: "#0055BF", rot: 4 },
  { left: "48%", top: "22%", w: 56, h: 56, color: "#F5CD2F", rot: -3 },
  { left: "22%", top: "46%", w: 140, h: 28, color: "#237841", rot: 2 },
  { left: "52%", top: "44%", w: 88, h: 32, color: "#FE8A18", rot: 6 },
  { left: "36%", top: "58%", w: 64, h: 24, color: "#E4CD9E", rot: -5 },
  { left: "58%", top: "60%", w: 96, h: 28, color: "#A0A5A9", rot: 3 },
] as const;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LandingPage() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const setParallax = useCallback(
    (clientX: number, clientY: number) => {
      const el = fieldRef.current;
      if (!el || reduceMotion || prefersReducedMotion()) return;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.setProperty("--ff-px", String(x.toFixed(3)));
      el.style.setProperty("--ff-py", String(y.toFixed(3)));
    },
    [reduceMotion],
  );

  const resetParallax = useCallback(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.setProperty("--ff-px", "0");
    el.style.setProperty("--ff-py", "0");
  }, []);

  return (
    <div className="ff-landing-bg relative flex min-h-dvh flex-col overflow-hidden">
      <div className="ff-brick-pattern pointer-events-none absolute inset-0 opacity-70" />

      <div className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4">
        <ThemeToggle className="ff-hud-panel min-h-11 min-w-11 rounded-lg sm:min-h-0 sm:min-w-0" />
      </div>

      <div
        ref={fieldRef}
        aria-hidden
        className="ff-hero-field absolute inset-x-0 top-0 h-[42dvh] md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[58%]"
        style={{ "--ff-px": "0", "--ff-py": "0" } as CSSProperties}
        onMouseMove={(e) => setParallax(e.clientX, e.clientY)}
        onMouseLeave={resetParallax}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) setParallax(t.clientX, t.clientY);
        }}
        onTouchEnd={resetParallax}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ff-bg-deep)] md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-[var(--ff-bg-deep)]" />
        <BrickHeroVisual reduceMotion={reduceMotion} />
      </div>

      <main className="relative z-20 mt-[38dvh] flex flex-1 flex-col justify-end px-5 pb-10 pt-6 sm:px-8 sm:pb-14 md:mt-0 md:max-w-[48%] md:justify-center md:px-14 md:py-16 lg:px-20">
        <p
          className="font-display font-extrabold tracking-tight text-[var(--ff-accent)]"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
        >
          Frontfigure
        </p>
        <h1
          className="mt-4 max-w-md font-display font-bold leading-snug text-[var(--ff-text)] sm:mt-5"
          style={{ fontSize: "clamp(1.35rem, 3.6vw, 1.875rem)" }}
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
            className="btn btn-lg ff-btn-primary ff-landing-cta w-full gap-2 px-8 sm:w-auto"
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
      </main>
    </div>
  );
}

function BrickHeroVisual({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="ff-hero-bricks absolute inset-0">
      {BRICKS.map((b, i) => (
        <div
          key={i}
          className={`ff-hero-brick absolute rounded-md ${reduceMotion ? "" : "ff-brick-float"}`}
          style={
            {
              left: b.left,
              top: b.top,
              width: b.w,
              height: b.h,
              background: b.color,
              "--ff-rot": `${b.rot}deg`,
              "--ff-delay": `${i * 0.35}s`,
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.25), 0 14px 28px rgba(0,0,0,0.4)",
            } as CSSProperties
          }
        >
          <div className="absolute inset-x-2 top-1 flex justify-around">
            {Array.from({ length: Math.max(1, Math.floor(b.w / 28)) }).map(
              (_, si) => (
                <span
                  key={si}
                  className="h-2.5 w-2.5 rounded-full bg-black/15 shadow-inner"
                />
              ),
            )}
          </div>
        </div>
      ))}
      <div className="absolute bottom-[14%] left-[12%] right-[10%] h-px bg-gradient-to-r from-transparent via-[var(--ff-accent)]/50 to-transparent md:bottom-[18%] md:left-[20%] md:right-[12%]" />
    </div>
  );
}
