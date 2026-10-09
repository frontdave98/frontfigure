import { ArrowRight } from "@carbon/icons-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ff-border)] bg-[color-mix(in_srgb,var(--ff-panel)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="min-w-0 hover:brightness-110">
          <BrandLockup size="sm" />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="min-h-11 min-w-11 rounded-lg sm:min-h-9 sm:min-w-9" />
          <Link
            href="/studio"
            className="btn btn-sm ff-btn-primary ff-landing-cta min-h-11 gap-1.5 px-3 sm:min-h-9"
          >
            Studio
            <ArrowRight size={16} className="ff-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
}
