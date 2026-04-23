"use client";

import { Timer, Pause } from "lucide-react";

interface QuizHeaderProps {
  timeDisplay: string;
  currentQuestion: number;
  totalQuestions: number;
  progress: number; // 0–100
  onPause?: () => void;
}

export function QuizHeader({
  timeDisplay,
  currentQuestion,
  totalQuestions,
  progress,
  onPause,
}: QuizHeaderProps) {
  return (
    <header className="w-full px-6 py-4 flex flex-col gap-2 z-10 bg-white/5 backdrop-blur-[20px] border-b border-white/10 sticky top-0">
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-[#f8acff]" />
          <span
            className="font-['Space_Grotesk'] text-3xl font-semibold text-white"
            style={{
              textShadow:
                "0 0 10px rgba(219,31,255,0.8), 0 0 20px rgba(219,31,255,0.5)",
            }}
          >
            {timeDisplay}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Space_Grotesk'] text-sm text-[#c6c3e4] uppercase tracking-wider">
            Question {currentQuestion} / {totalQuestions}
          </span>
          <button
            onClick={onPause}
            className="ml-4 p-2 rounded-full hover:bg-white/10 transition-colors text-[#958da2]"
            aria-label="Pause quiz"
          >
            <Pause className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="w-full max-w-5xl mx-auto h-2 rounded-full bg-white/20 mt-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#DB1FFF] relative"
          style={{
            width: `${progress}%`,
            boxShadow: "0 0 8px rgba(219,31,255,0.6)",
          }}
        />
      </div>
    </header>
  );
}
