import { ExportShare } from "./ExportShare";
import { HowItWorks } from "./HowItWorks";
import { LandingCta } from "./LandingCta";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { PartsBaySection } from "./PartsBaySection";
import { StudioTour } from "./StudioTour";

export function LandingPage() {
  return (
    <div className="ff-landing-bg relative min-h-dvh">
      <div className="ff-brick-pattern pointer-events-none fixed inset-0 opacity-40" />
      <LandingHeader />
      <main className="relative z-10">
        <LandingHero />
        <HowItWorks />
        <PartsBaySection />
        <StudioTour />
        <ExportShare />
        <LandingCta />
      </main>
    </div>
  );
}
