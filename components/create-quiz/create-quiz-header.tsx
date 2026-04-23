import Link from "next/link";
import { X } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

/** Fixed top bar for the wizard flow — suppresses the main nav and shows
 *  only the brand logo + an "Exit Creator" escape hatch. */
export function CreateQuizHeader() {
  return (
    <GlassCard className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-8 rounded-none border-x-0 border-t-0">
      <div className="font-['Space_Grotesk'] text-2xl font-black uppercase tracking-[0.12em] text-white drop-shadow-[0_0_15px_#7030EF]">
        IntelliQ
      </div>
      <button
        type="button"
        className="flex items-center gap-2 font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-[0.1em] text-[#CBC3D8] transition hover:text-white"
      >
        <X className="h-4 w-4" />
        Exit Creator
      </button>
    </GlassCard>
  );
}
