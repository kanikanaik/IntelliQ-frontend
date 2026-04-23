"use client";

import { Brain, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

interface AIInsightsCardProps {
  strengths: string[];
  strengthsSummary: string;
  focusAreas: string[];
  focusSummary: string;
}

export function AIInsightsCard({
  strengths,
  strengthsSummary,
  focusAreas,
  focusSummary,
}: AIInsightsCardProps) {
  return (
    <GlassCard className="rounded-xl p-8 flex-grow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(112,48,239,0.2),transparent_70%)]" />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Space_Grotesk'] font-semibold text-3xl text-white">
          AI Insights
        </h2>
        <Brain className="h-8 w-8 text-[#DB1FFF]" />
      </div>
      <div className="space-y-6">
        {/* Strengths */}
        <div>
          <h4 className="font-['Space_Grotesk'] text-sm font-medium text-[#f8acff] uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full border border-[#7030EF] bg-[#7030EF]/10 text-white font-['Manrope'] text-sm"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[#cbc3d8] font-['Manrope'] text-base">
            {strengthsSummary}
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Focus Areas */}
        <div>
          <h4 className="font-['Space_Grotesk'] text-sm font-medium text-[#cfbcff] uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Focus Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((a) => (
              <span
                key={a}
                className="px-3 py-1 rounded-full border border-[#958da2] bg-[#1e2020]/30 text-[#cbc3d8] font-['Manrope'] text-sm"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[#cbc3d8] font-['Manrope'] text-base">
            {focusSummary}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
