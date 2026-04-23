import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { NeonButton } from "@/components/shared/neon-button";

/** Sticky action bar at the bottom of the wizard — Back (ghost) on the left,
 *  Continue (neon gradient) on the right. */
export function CreateQuizFooter() {
  return (
    <GlassCard className="mt-8 flex items-center justify-between rounded-xl border-t border-white/10 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#CBC3D8] transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <Link href="/review-questions">
        <NeonButton className="flex items-center gap-2 rounded-lg px-8 py-3 text-[11px]">
          Continue to Settings
          <ArrowRight className="h-4 w-4" />
        </NeonButton>
      </Link>
    </GlassCard>
  );
}
