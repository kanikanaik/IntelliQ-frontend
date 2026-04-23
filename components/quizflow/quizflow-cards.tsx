"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Gamepad2, Users } from "lucide-react";
import type { HeroOption, TrendingQuiz } from "./quizflow-data";

const HERO_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Sparkles,
  Gamepad2,
};

export function HeroOptionCard({ option }: { option: HeroOption }) {
  const router = useRouter();
  const isViolet = option.accent === "violet";
  const Icon = HERO_ICONS[option.icon] ?? Sparkles;

  return (
    <button
      type="button"
      onClick={() => router.push("/login")}
      className="group relative isolate overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-[20px] transition hover:border-[#E249FF] w-full"
    >
      <div
        className={[
          "absolute inset-0 -z-10 opacity-0 transition group-hover:opacity-100",
          isViolet
            ? "bg-linear-to-br from-[#7030EF]/30 to-transparent"
            : "bg-linear-to-bl from-[#E249FF]/30 to-transparent",
        ].join(" ")}
      />

      <Icon
        className={[
          "mb-3 h-10 w-10 transition group-hover:scale-110",
          isViolet
            ? "text-[#CFBCFF] drop-shadow-[0_0_10px_rgba(207,188,255,0.55)]"
            : "text-[#F8ACFF] drop-shadow-[0_0_10px_rgba(248,172,255,0.55)]",
        ].join(" ")}
      />

      <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-white transition group-hover:text-[#F8ACFF]">
        {option.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#CBC3D8]">
        {option.description}
      </p>
    </button>
  );
}

export function TrendingQuizCard({ quiz }: { quiz: TrendingQuiz }) {
  const router = useRouter();

  const handleClick = () => {
    // If the quiz has a shareId, use it; otherwise prompt to log in
    if (quiz.shareId && quiz.shareId.trim().length > 0) {
      router.push(`/quiz/${quiz.shareId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/8 p-6 backdrop-blur-[20px] transition hover:border-[#F8ACFF] text-left w-full"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#7030EF] to-[#E249FF] opacity-60 transition group-hover:opacity-100" />

      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full border border-[#7030EF] bg-[#7030EF]/10 px-3 py-1 font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-widest text-[#CFBCFF]">
          {quiz.questions || 0} Questions
        </span>

        <div className="flex items-center gap-1 text-xs text-[#CBC3D8]">
          <Users className="h-4 w-4" />
          <span>{quiz.attempts.toLocaleString()}</span>
        </div>
      </div>

      <h3 className="font-['Space_Grotesk'] text-xl font-semibold text-white transition group-hover:text-[#F8ACFF]">
        {quiz.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#CBC3D8]">
        {quiz.description}
      </p>
      <p className="mt-3 text-xs text-[#A89FB9]">
        by <span className="text-[#CFBCFF]">{quiz.creator}</span>
      </p>
    </button>
  );
}
