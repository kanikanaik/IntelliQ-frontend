import { Check } from "lucide-react";
import type { WizardStep } from "./create-quiz-data";
import { GlassCard } from "@/components/shared/glass-card";

function StepNode({ step }: { step: WizardStep }) {
  if (step.state === "completed") {
    return (
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#7030EF] text-white shadow-[0_0_15px_rgba(112,48,239,0.5)]">
          <Check className="h-5 w-5" />
        </div>
        <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.1em] text-[#CBC3D8]">
          {step.label}
        </span>
      </div>
    );
  }

  if (step.state === "active") {
    return (
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#DB1FFF] bg-[#121414] font-['Space_Grotesk'] font-bold text-[#DB1FFF] shadow-[0_0_20px_rgba(219,31,255,0.25)]">
          {step.number}
        </div>
        <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.1em] text-white drop-shadow-[0_0_5px_rgba(219,31,255,0.8)]">
          {step.label}
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-center opacity-50">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#121414] font-['Space_Grotesk'] font-bold text-[#CBC3D8]">
        {step.number}
      </div>
      <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-[0.1em] text-[#CBC3D8]">
        {step.label}
      </span>
    </div>
  );
}

/** Horizontal wizard step-tracker. Renders a connecting gradient line on md+
 *  screens and a glowing leading-edge dot at the active step. */
export function CreateQuizProgress({ steps }: { steps: WizardStep[] }) {
  return (
    <GlassCard className="relative mb-8 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-xl p-6 md:flex-row">
      {/* connecting track (desktop only) */}
      <div className="absolute top-1/2 left-[10%] right-[10%] hidden h-1 -translate-y-1/2 bg-white/10 md:block">
        <div className="relative h-full w-1/3 bg-gradient-to-r from-[#7030EF] to-[#DB1FFF]">
          <div className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white blur-[2px]" />
        </div>
      </div>

      {steps.map((step) => (
        <StepNode key={step.number} step={step} />
      ))}
    </GlassCard>
  );
}
