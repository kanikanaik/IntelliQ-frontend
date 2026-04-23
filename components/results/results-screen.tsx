"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, Trophy, Loader2 } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { ScoreRing } from "@/components/results/score-ring";

interface AttemptResult {
  id: string;
  score: number;
  totalPoints: number;
  timeTaken: number | null;
  completedAt: string | null;
  quiz: { id: string; title: string };
  answers: Array<{
    id: string;
    isCorrect: boolean;
    question: { text: string; explanation?: string };
  }>;
}

export function ResultsScreen() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID");
      setLoading(false);
      return;
    }
    fetch(`/api/attempt/${attemptId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load results");
        return r.json();
      })
      .then((data) => setResult(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#090820" }}
      >
        <AmbientBackground />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-12 w-12 text-[#DB1FFF] animate-spin" />
          <p className="font-['Space_Grotesk'] text-white">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#090820" }}
      >
        <AmbientBackground />
        <div className="z-10 text-center">
          <p className="text-red-400 mb-4">{error || "No results found"}</p>
          <Link href="/dashboard" className="text-[#DB1FFF] underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const percentage =
    result.totalPoints > 0
      ? Math.round((result.score / result.totalPoints) * 100)
      : 0;
  const correct = result.answers.filter((a) => a.isCorrect).length;
  const incorrect = result.answers.length - correct;
  const label =
    percentage >= 90
      ? "Excellent!"
      : percentage >= 70
        ? "Great Job!"
        : percentage >= 50
          ? "Good Effort"
          : "Keep Practicing";

  return (
    <div
      className="min-h-screen font-['Manrope'] text-[#e2e2e2] overflow-x-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#090820" }}
    >
      <AmbientBackground />

      <main className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-['Space_Grotesk'] text-5xl font-bold text-white">
            Quiz Complete!
          </h1>
          <p className="font-['Manrope'] text-lg text-[#cbc3d8]">
            {result.quiz.title}
          </p>
        </div>

        {/* Score + Answers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Score ring */}
          <div className="md:col-span-5">
            <ScoreRing
              percentage={percentage}
              correct={correct}
              incorrect={incorrect}
              label={label}
            />
          </div>

          {/* Right: Answer breakdown */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="rounded-xl p-6 bg-white/5 backdrop-blur-[20px] border border-white/10">
              <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-4">
                Answer Review
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {result.answers.map((a, i) => (
                  <div
                    key={a.id}
                    className={`rounded-lg p-3 border text-sm ${a.isCorrect ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`font-semibold shrink-0 ${a.isCorrect ? "text-green-400" : "text-red-400"}`}
                      >
                        {i + 1}.
                      </span>
                      <div>
                        <p className="text-[#E2E2E2]">{a.question.text}</p>
                        {!a.isCorrect && a.question.explanation && (
                          <p className="text-xs text-[#CBC3D8]/70 mt-1 italic">
                            {a.question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.timeTaken != null && (
              <div className="rounded-xl p-4 bg-white/5 border border-white/10 text-sm text-[#CBC3D8]">
                Time taken:{" "}
                <span className="text-white font-semibold">
                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="flex-1 py-4 px-6 rounded-lg font-['Space_Grotesk'] font-semibold text-lg text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10"
              >
                <Home className="h-5 w-5" /> Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="flex-1 py-4 px-6 rounded-lg font-['Space_Grotesk'] font-bold text-lg text-white flex items-center justify-center gap-2 transition hover:brightness-110"
                style={{
                  background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                  boxShadow: "0 0 20px rgba(219,31,255,0.3)",
                }}
              >
                <Trophy className="h-5 w-5" /> Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const REWARDS = [
  {
    icon: "star",
    iconColor: "#DB1FFF",
    borderColor: "rgba(219,31,255,0.3)",
    bgColor: "rgba(219,31,255,0.2)",
    title: "XP Earned",
    subtitle: "+450 XP",
    valueDisplay: "+450",
  },
  {
    icon: "local_fire_department",
    iconColor: "#7030EF",
    borderColor: "rgba(112,48,239,0.3)",
    bgColor: "rgba(112,48,239,0.2)",
    title: "New Badge",
    subtitle: "Cyber Scholar",
    valueDisplay: "🏅",
  },
];

// export function ResultsScreen() {
//   return (
//     <div
//       className="min-h-screen font-['Manrope'] text-[#e2e2e2] overflow-x-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
//       style={{ backgroundColor: "#090820" }}
//     >
//       <AmbientBackground />

//       <main className="w-full max-w-4xl mx-auto space-y-8 relative z-10">
//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h1 className="font-['Space_Grotesk'] text-5xl font-bold text-white">
//             Quiz Complete!
//           </h1>
//           <p className="font-['Manrope'] text-lg text-[#cbc3d8]">
//             Cybernetics 101 - Master Class
//           </p>
//         </div>

//         {/* Bento Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Left Column */}
//           <div className="md:col-span-5 flex flex-col gap-6">
//             <ScoreRing
//               percentage={85}
//               correct={17}
//               incorrect={3}
//               label="Excellent"
//             />
//             <RewardsCard rewards={REWARDS} />
//           </div>

//           {/* Right Column */}
//           <div className="md:col-span-7 flex flex-col gap-6">
//             <AIInsightsCard
//               strengths={[
//                 "Neural Networks",
//                 "Data Structures",
//                 "Algorithm Efficiency",
//               ]}
//               strengthsSummary="Your understanding of deep learning concepts is exceptional. You answered all neural network questions in under 15 seconds."
//               focusAreas={["Quantum Computing Basics", "Ethical AI"]}
//               focusSummary="Review the modules on Quantum Superposition. You missed 2 questions in this category. We recommend the 'Quantum Foundations' quick quiz."
//             />

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Link
//                 href="/"
//                 className="flex-1 py-4 px-6 rounded-lg font-['Space_Grotesk'] font-semibold text-xl text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
//                 style={{
//                   background: "rgba(255,255,255,0.05)",
//                   backdropFilter: "blur(20px)",
//                   border: "1px solid rgba(255,255,255,0.15)",
//                 }}
//               >
//                 <Home className="h-5 w-5" />
//                 Back to Home
//               </Link>
//               <Link
//                 href="/leaderboard"
//                 className="flex-1 py-4 px-6 rounded-lg font-['Space_Grotesk'] font-semibold text-xl text-white flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
//                 style={{
//                   background: "linear-gradient(135deg, #7030EF, #DB1FFF)",
//                   boxShadow: "0 0 20px rgba(219,31,255,0.4)",
//                   border: "1px solid rgba(255,255,255,0.2)",
//                 }}
//               >
//                 <Trophy className="h-5 w-5" />
//                 Leaderboard
//               </Link>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Score ring animation */}
//       <style>{`
//         @keyframes scoreProgress { 0% { stroke-dasharray: 0 100; } }
//       `}</style>
//     </div>
//   );
// }
