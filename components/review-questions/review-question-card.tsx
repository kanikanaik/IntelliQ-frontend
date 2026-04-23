import {
  CheckCircle2,
  Pencil,
  RefreshCw,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import type { ReviewQuestion, AnswerOption } from "./review-data";
import { GlassCard } from "@/components/shared/glass-card";

// ─── Answer option rows ───────────────────────────────────────────────────────

function CorrectOption({ option }: { option: AnswerOption }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E249FF]/50 bg-[#E249FF]/10 p-3 backdrop-blur-[20px]">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E249FF] bg-[#E249FF] font-['Space_Grotesk'] text-[11px] font-semibold text-[#4C005A]">
        {option.letter}
      </div>
      <span className="text-sm text-[#E2E2E2]">{option.text}</span>
      <CheckCircle2 className="ml-auto h-[18px] w-[18px] text-[#E249FF]" />
    </div>
  );
}

function WrongOption({ option }: { option: AnswerOption }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-[20px] transition hover:bg-white/5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#494456] font-['Space_Grotesk'] text-[11px] font-semibold text-[#494456]">
        {option.letter}
      </div>
      <span className="text-sm text-[#CBC3D8]">{option.text}</span>
    </div>
  );
}

/** Vertical list for ≤ 3 options, 2×2 grid for 4 options. */
function AnswerOptions({ options }: { options: AnswerOption[] }) {
  if (options.length <= 3) {
    return (
      <div className="mt-auto space-y-2">
        {options.map((opt) =>
          opt.isCorrect ? (
            <CorrectOption key={opt.letter} option={opt} />
          ) : (
            <WrongOption key={opt.letter} option={opt} />
          ),
        )}
      </div>
    );
  }

  // 4-option 2×2 grid
  return (
    <div className="mt-auto grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <div
          key={opt.letter}
          className={[
            "flex flex-col gap-2 rounded-lg border p-3 backdrop-blur-[20px] transition",
            opt.isCorrect
              ? "border-[#E249FF]/50 bg-[#E249FF]/10"
              : "border-white/15 bg-white/10 hover:bg-white/5",
          ].join(" ")}
        >
          <div className="flex w-full justify-between">
            <div
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full border font-['Space_Grotesk'] text-[11px] font-semibold",
                opt.isCorrect
                  ? "border-[#E249FF] bg-[#E249FF] text-[#4C005A]"
                  : "border-[#494456] text-[#494456]",
              ].join(" ")}
            >
              {opt.letter}
            </div>
            {opt.isCorrect && (
              <CheckCircle2 className="h-[18px] w-[18px] text-[#E249FF]" />
            )}
          </div>
          <span
            className={`text-sm ${opt.isCorrect ? "text-[#E2E2E2]" : "text-[#CBC3D8]"}`}
          >
            {opt.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Card action buttons ──────────────────────────────────────────────────────

function CardActions() {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        title="Edit"
        className="p-1 text-[#CBC3D8] transition hover:text-[#E2E2E2]"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        type="button"
        title="Regenerate"
        className="p-1 text-[#CBC3D8] transition hover:text-[#E249FF]"
      >
        <RefreshCw className="h-5 w-5" />
      </button>
      <button
        type="button"
        title="Delete"
        className="p-1 text-[#CBC3D8] transition hover:text-[#FFB4AB]"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

// ─── Card state variants ──────────────────────────────────────────────────────

function RegeneratingCard({ question }: { question: ReviewQuestion }) {
  return (
    <GlassCard className="relative flex flex-col overflow-hidden rounded-xl p-4">
      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-[#7030EF]/10 to-[#E249FF]/10" />

      <div className="relative z-10 mb-4 flex items-start justify-between">
        <span className="rounded-full border border-[#494456]/30 bg-[#333535] px-3 py-1 font-['Space_Grotesk'] text-xs font-medium text-[#E2E2E2]">
          Q{question.number}
        </span>
        <div className="pointer-events-none flex gap-2 opacity-50">
          <Pencil className="h-5 w-5" />
          <RefreshCw className="h-5 w-5" />
          <Trash2 className="h-5 w-5" />
        </div>
      </div>

      <div className="relative z-10 mb-4 flex grow items-center justify-center py-6">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#E249FF]" />
          <span className="font-['Space_Grotesk'] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E249FF]">
            Regenerating...
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-auto space-y-2 opacity-30 blur-sm pointer-events-none">
        <div className="h-12 rounded-lg bg-white/10" />
        <div className="h-12 rounded-lg bg-white/10" />
        <div className="h-12 rounded-lg bg-white/10" />
      </div>
    </GlassCard>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/** Single question card with three visual states:
 *  - `normal`       — default glass style
 *  - `selected`     — magenta border + neon glow + checkmark badge
 *  - `regenerating` — pulsing AI-thinking overlay with spinner */
export function ReviewQuestionCard({ question }: { question: ReviewQuestion }) {
  if (question.state === "regenerating") {
    return <RegeneratingCard question={question} />;
  }

  const isSelected = question.state === "selected";

  return (
    <GlassCard
      className={[
        "relative flex flex-col rounded-xl p-4 transition-colors duration-300",
        isSelected
          ? "border-2 border-[#E249FF] shadow-[0_0_20px_rgba(219,31,255,0.25)]"
          : "hover:border-[#958DA2]",
      ].join(" ")}
    >
      {/* Selected check badge */}
      {isSelected && (
        <div className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#E249FF] shadow-[0_0_10px_#e249ff]">
          <Check className="h-3.5 w-3.5 text-[#4C005A]" />
        </div>
      )}

      {/* Card header */}
      <div className="mb-4 flex items-start justify-between">
        <span
          className={[
            "rounded-full border px-3 py-1 font-['Space_Grotesk'] text-xs font-medium",
            isSelected
              ? "border-[#E249FF]/30 bg-[#E249FF]/20 text-[#E249FF]"
              : "border-[#494456]/30 bg-[#333535] text-[#E2E2E2]",
          ].join(" ")}
        >
          Q{question.number}
        </span>
        <CardActions />
      </div>

      {/* Question text */}
      <div className="mb-4 grow">
        <p className="text-lg font-medium leading-7 text-[#E2E2E2]">
          {question.question}
        </p>
      </div>

      <AnswerOptions options={question.options} />
    </GlassCard>
  );
}
