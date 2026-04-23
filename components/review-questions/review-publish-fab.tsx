"use client";

import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";

type ReviewPublishFabProps = {
  totalQuestions: number;
};

/** Floating action button anchored to the bottom-right. Shows total question
 *  count above a neon "Publish Quiz" CTA. */
export function ReviewPublishFab({ totalQuestions }: ReviewPublishFabProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {/* Total counter */}
      <div className="flex items-center gap-2 rounded-full border border-white/[0.15] bg-[#1E2020]/80 px-4 py-2 backdrop-blur-[20px]">
        <span className="font-['Space_Grotesk'] text-xs text-[#CBC3D8]">
          Total:
        </span>
        <span className="font-['Space_Grotesk'] text-2xl font-semibold text-[#E2E2E2]">
          {totalQuestions}
        </span>
      </div>

      {/* Publish CTA */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7030EF] to-[#DB1FFF] px-8 py-4 font-['Space_Grotesk'] text-xl font-semibold text-white shadow-[0_0_30px_rgba(219,31,255,0.4)] transition hover:scale-105 hover:from-[#5b22c7] hover:to-[#be16e0] active:scale-95"
      >
        <Rocket className="h-5 w-5" />
        Publish Quiz
      </button>
    </div>
  );
}
