"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { heroOptions, type TrendingQuiz } from "./quizflow-data";
import { HeroOptionCard, TrendingQuizCard } from "./quizflow-cards";

export function HeroSection() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="max-w-4xl bg-linear-to-r from-[#CFBCFF] to-[#F8ACFF] bg-clip-text font-['Space_Grotesk'] text-5xl font-bold leading-tight text-transparent drop-shadow-[0_0_15px_rgba(207,188,255,0.3)] md:text-6xl">
        Master the Future of Learning
      </h1>

      <p className="max-w-3xl text-lg leading-8 text-[#CBC3D8]">
        Generate AI-powered assessments instantly or dive into thousands of
        curated knowledge nodes. Your cognitive upgrade begins here.
      </p>

      <div className="mt-3 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        {heroOptions.map((option) => (
          <HeroOptionCard key={option.title} option={option} />
        ))}
      </div>
    </section>
  );
}

export function TrendingSection() {
  const [quizzes, setQuizzes] = useState<TrendingQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingQuizzes() {
      try {
        setLoading(true);
        const response = await fetch("/api/quizzes?limit=6&sort=attempts");

        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
        }

        const data = (await response.json()) as
          | { quizzes?: TrendingQuiz[] }
          | TrendingQuiz[];

        const payload = Array.isArray(data) ? data : data.quizzes ?? [];
        setQuizzes(payload);
        console.info("[landing] trending quizzes loaded", {
          count: payload.length,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError(err instanceof Error ? err.message : "Failed to load quizzes");
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingQuizzes();
  }, []);

  return (
    <section className="mt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-['Space_Grotesk'] text-3xl font-semibold text-white md:text-4xl">
          <TrendingUp className="h-6 w-6 text-[#F8ACFF] drop-shadow-[0_0_8px_rgba(248,172,255,0.8)]" />
          <span>Trending Quizzes</span>
        </h2>

        <a
          href="/"
          className="font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-widest text-[#CFBCFF] transition hover:text-[#F8ACFF]"
        >
          View All
        </a>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg bg-linear-to-br from-[#2A2A3E] to-[#3A3A4E]"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="rounded-lg border border-[#CFBCFF]/20 bg-[#2A2A3E]/50 p-8 text-center text-[#CBC3D8]">
          No quizzes available yet. Create the first one!
        </div>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quizzes.map((quiz) => (
            <TrendingQuizCard
              key={quiz.id}
              quiz={{
                id: quiz.id,
                shareId: quiz.shareId,
                title: quiz.title,
                description: quiz.description,
                creator: quiz.creator,
                questions: quiz.questions,
                attempts: quiz.attempts,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
