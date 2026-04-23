import { Sparkles, Zap, Plus } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

type ReviewHeaderProps = {
  qualityScore: number;
};

/** Page header for the review screen — shows "AI Generation Complete" label,
 *  the page title, a quality-score pill, and an "Add Manual" button. */
export function ReviewHeader({ qualityScore }: ReviewHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-[#494456]/30 pb-4 md:flex-row md:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#E249FF]" />
          <span className="font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F8ACFF]">
            AI Generation Complete
          </span>
        </div>
        <h1 className="font-['Space_Grotesk'] text-4xl font-semibold text-[#E2E2E2]">
          Review Questions
        </h1>
        <p className="mt-2 max-w-2xl text-base text-[#CBC3D8]">
          The AI has generated a 10-question quiz based on your prompt. Review,
          edit, or regenerate individual items before publishing.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quality score pill */}
        <GlassCard className="flex items-center gap-2 rounded-full px-4 py-2">
          <span className="font-['Space_Grotesk'] text-xs text-[#CBC3D8]">
            Quality Score
          </span>
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-[#E249FF]" />
            <span className="ml-1 font-['Space_Grotesk'] text-2xl font-semibold text-[#E2E2E2]">
              {qualityScore}%
            </span>
          </div>
        </GlassCard>

        {/* Add manual question */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-4 py-2 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-[0.1em] text-[#E2E2E2] backdrop-blur-[20px] transition hover:bg-white/[0.05]"
        >
          <Plus className="h-4 w-4" />
          Add Manual
        </button>
      </div>
    </header>
  );
}
