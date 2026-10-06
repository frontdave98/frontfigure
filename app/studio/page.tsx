import { DesktopOnlyGate } from "@/components/studio/DesktopOnlyGate";
import { StudioShell } from "@/components/studio/StudioShell";

export default function StudioPage() {
  return (
    <DesktopOnlyGate>
      <StudioShell />
    </DesktopOnlyGate>
  );
}
