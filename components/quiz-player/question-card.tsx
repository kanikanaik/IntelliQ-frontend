"use client";

import { Brain } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export interface QuizOption {
  id: string;
  text: string;
}

interface QuestionCardProps {
  category: string;
  question: string;
  hint?: string;
  options: QuizOption[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  isMultiSelect?: boolean;
}

export function QuestionCard({
  category,
  question,
  hint,
  options,
  selectedIds,
  onSelect,
  isMultiSelect = false,
}: QuestionCardProps) {
  return (
    <>
      {/* Question Card */}
      <GlassCard className="rounded-xl p-8 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(112,48,239,0.2)_0%,transparent_70%)] opacity-50 pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7030EF] bg-[#7030EF]/5 mb-4">
          <Brain className="h-4 w-4 text-[#7030EF]" />
          <span className="font-['Space_Grotesk'] text-xs text-[#e9ddff] uppercase tracking-wider">
            {category}
          </span>
        </div>
        <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold text-white mb-4 relative z-10 leading-tight">
          {question}
        </h1>
        {hint && (
          <p className="font-['Manrope'] text-lg text-[#cbc3d8] max-w-2xl relative z-10">
            {hint}
          </p>
        )}
        {isMultiSelect && (
          <p className="mt-2 text-xs text-[#DB1FFF]/80 font-['Space_Grotesk'] uppercase tracking-wider">
            Select all that apply
          </p>
        )}
      </GlassCard>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, i) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`rounded-lg p-4 flex items-center gap-4 text-left transition-all duration-200 group
                backdrop-blur-[20px] border
                ${
                  isSelected
                    ? "border-[#DB1FFF] bg-[#DB1FFF]/10 shadow-[0_0_20px_rgba(219,31,255,0.3),inset_0_0_15px_rgba(219,31,255,0.2)]"
                    : "border-white/15 bg-white/5 hover:border-[#DB1FFF]/50 hover:shadow-[inset_0_0_15px_rgba(219,31,255,0.2)] hover:bg-white/8"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border font-['Space_Grotesk'] font-semibold text-lg transition-colors shrink-0
                  ${
                    isSelected
                      ? "border-[#DB1FFF] text-[#DB1FFF] bg-[#DB1FFF]/10"
                      : "border-white/20 text-white group-hover:border-[#f8acff]"
                  }`}
              >
                {OPTION_LABELS[i]}
              </div>
              <span className="font-['Manrope'] text-lg text-white grow">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
