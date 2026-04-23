"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { ArrowRight, Flag, Loader2 } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { QuizHeader } from "@/components/quiz-player/quiz-header";
import {
  QuestionCard,
  type QuizOption,
} from "@/components/quiz-player/question-card";

interface ApiOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
interface ApiQuestion {
  id: string;
  text: string;
  type: "MCQ" | "MULTI_SELECT";
  options: ApiOption[];
  explanation?: string;
  points: number;
}

const QUESTION_TIME = 60;

export function QuizPlayerScreen({ isPublic }: { isPublic?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const quizId = searchParams.get("quizId");
  const shareId = params?.shareId as string | undefined;

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Play state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<
    { questionId: string; selected: string[] }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz + start attempt
  useEffect(() => {
    if (!quizId && !shareId) {
      setLoadError("No quiz ID provided");
      setIsLoading(false);
      return;
    }

    async function init() {
      try {
        console.info("[quiz-player] init", {
          isPublic,
          quizId,
          shareId,
        });

        // Start attempt (public flow sends shareId, private flow sends quizId)
        const attemptRes = await fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shareId ? { shareId } : { quizId }),
        });
        if (!attemptRes.ok) {
          const d = await attemptRes.json();
          throw new Error(d.error || "Failed to start attempt");
        }
        const attempt = await attemptRes.json();
        setAttemptId(attempt.id);

        // Load quiz questions
        const endpoint =
          isPublic || shareId
            ? `/api/quiz/share/${shareId}`
            : `/api/quiz/${quizId}`;
        const quizRes = await fetch(endpoint);
        if (!quizRes.ok) throw new Error("Failed to load quiz");
        const quiz = await quizRes.json();
        setQuizTitle(quiz.title ?? "Quiz");
        setQuestions(quiz.questions ?? []);
        console.info("[quiz-player] quiz loaded", {
          title: quiz.title,
          questionCount: quiz.questions?.length ?? 0,
        });
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [quizId, shareId, isPublic]);

  const current = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0;

  const goNext = useCallback(async () => {
    if (!current) return;

    const updatedAnswers = [
      ...answers,
      { questionId: current.id, selected: selectedIds },
    ];
    setAnswers(updatedAnswers);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedIds([]);
      setTimeLeft(QUESTION_TIME);
    } else {
      // Submit
      if (!attemptId) return;
      setIsSubmitting(true);
      try {
        const timeTaken = totalQuestions * QUESTION_TIME - timeLeft;
        const res = await fetch(`/api/attempt/${attemptId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeTaken, answers: updatedAnswers }),
        });
        if (!res.ok) throw new Error("Submit failed");
        router.push(`/results?attemptId=${attemptId}`);
      } catch {
        router.push(`/results?attemptId=${attemptId}`);
      }
    }
  }, [
    current,
    currentIndex,
    totalQuestions,
    selectedIds,
    answers,
    attemptId,
    timeLeft,
    router,
  ]);

  // Timer
  useEffect(() => {
    if (isLoading || !current || isPaused) return;
    if (timeLeft <= 0) {
      goNext();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, isPaused, isLoading, current, goNext]);

  const handleSelect = (id: string) => {
    if (!current) return;
    if (current.type === "MULTI_SELECT") {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Loading / error states
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#090820" }}
      >
        <AmbientBackground />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-12 w-12 text-[#DB1FFF] animate-spin" />
          <p className="font-['Space_Grotesk'] text-white">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#090820" }}
      >
        <AmbientBackground />
        <div className="z-10 text-center">
          <p className="text-red-400 mb-4">
            {loadError || "No questions found"}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[#DB1FFF] underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const options: QuizOption[] = current.options.map((o) => ({
    id: o.id,
    text: o.text,
  }));

  return (
    <div
      className="text-[#e2e2e2] min-h-screen flex flex-col relative"
      style={{ backgroundColor: "#090820" }}
    >
      <AmbientBackground />

      <QuizHeader
        timeDisplay={formatTime(timeLeft)}
        currentQuestion={currentIndex + 1}
        totalQuestions={totalQuestions}
        progress={progress}
        onPause={() => setIsPaused((p) => !p)}
      />

      <main className="grow flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <QuestionCard
            category={quizTitle}
            question={current.text}
            options={options}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            isMultiSelect={current.type === "MULTI_SELECT"}
          />

          <div className="flex justify-center mt-2">
            <button
              onClick={goNext}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="px-8 py-4 rounded-full flex items-center gap-2 group hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: "linear-gradient(90deg, #7030EF 0%, #DB1FFF 100%)",
                boxShadow: "0 0 20px rgba(219,31,255,0.4)",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="font-['Space_Grotesk'] font-semibold text-xl text-white">
                    Submitting...
                  </span>
                </>
              ) : (
                <>
                  <span className="font-['Space_Grotesk'] font-semibold text-xl text-white">
                    {currentIndex < totalQuestions - 1
                      ? "Lock Answer"
                      : "Submit Quiz"}
                  </span>
                  <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full p-6 flex justify-between items-center text-[#958da2]/50 font-['Space_Grotesk'] text-sm z-10">
        <button className="flex items-center gap-1 hover:text-white transition-colors">
          <Flag className="h-4 w-4" /> Report Issue
        </button>
        <span>
          {current.points} pt{current.points !== 1 ? "s" : ""} this question
        </span>
      </footer>
    </div>
  );
}

//   {
//     category: "Computer Science",
//     question:
//       "What is the time complexity of searching in a balanced binary search tree?",
//     hint: "Consider the worst-case scenario for a self-balancing tree like an AVL or Red-Black tree.",
//     options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
//     correctIndex: 2,
//   },
//   {
//     category: "Computer Science",
//     question: "Which data structure uses LIFO order?",
//     hint: "Think about the order elements are removed.",
//     options: ["Queue", "Stack", "Heap", "Linked List"],
//     correctIndex: 1,
//   },
//   {
//     category: "Computer Science",
//     question: "What does TCP stand for in networking?",
//     hint: "It's a core protocol that ensures reliable data transmission.",
//     options: [
//       "Terminal Control Protocol",
//       "Transmission Control Protocol",
//       "Transfer Communication Protocol",
//       "Transport Core Protocol",
//     ],
//     correctIndex: 1,
//   },
//   {
//     category: "Computer Science",
//     question:
//       "Which sorting algorithm has the best average-case time complexity?",
//     hint: "Consider divide-and-conquer approaches.",
//     options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
//     correctIndex: 2,
//   },
// ];

// const QUESTION_TIME = 30; // seconds per question

// export function QuizPlayerScreen() {
//   const router = useRouter();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
//   const [answers, setAnswers] = useState<(number | null)[]>(
//     new Array(SAMPLE_QUESTIONS.length).fill(null),
//   );
//   const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
//   const [isPaused, setIsPaused] = useState(false);

//   const totalQuestions = SAMPLE_QUESTIONS.length;
//   const current = SAMPLE_QUESTIONS[currentIndex];
//   const progress = Math.round((currentIndex / totalQuestions) * 100);

//   const goNext = useCallback(() => {
//     const updated = [...answers];
//     updated[currentIndex] = selectedIndex;
//     setAnswers(updated);

//     if (currentIndex < totalQuestions - 1) {
//       setCurrentIndex((i) => i + 1);
//       setSelectedIndex(updated[currentIndex + 1] ?? null);
//       setTimeLeft(QUESTION_TIME);
//     } else {
//       // Store answers in sessionStorage and navigate to results
//       sessionStorage.setItem(
//         "quiz_results",
//         JSON.stringify({ answers: updated, questions: SAMPLE_QUESTIONS }),
//       );
//       router.push("/results");
//     }
//   }, [answers, currentIndex, selectedIndex, totalQuestions, router]);

//   // Timer
//   useEffect(() => {
//     if (isPaused) return;
//     if (timeLeft <= 0) {
//       goNext();
//       return;
//     }
//     const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
//     return () => clearInterval(id);
//   }, [timeLeft, isPaused, goNext]);

//   const formatTime = (s: number) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
//   };

//   const handleSelect = (index: number) => {
//     setSelectedIndex(index);
//   };

//   return (
//     <div
//       className="text-[#e2e2e2] min-h-screen flex flex-col relative"
//       style={{ backgroundColor: "#090820" }}
//     >
//       <AmbientBackground />

//       <QuizHeader
//         timeDisplay={formatTime(timeLeft)}
//         currentQuestion={currentIndex + 1}
//         totalQuestions={totalQuestions}
//         progress={progress}
//         onPause={() => setIsPaused((p) => !p)}
//       />

//       <main className="flex-grow flex items-center justify-center p-6 z-10">
//         <div className="w-full max-w-3xl flex flex-col gap-8">
//           <QuestionCard
//             category={current.category}
//             question={current.question}
//             hint={current.hint}
//             options={current.options}
//             selectedIndex={selectedIndex}
//             onSelect={handleSelect}
//           />

//           {/* Lock Answer Button */}
//           <div className="flex justify-center mt-2">
//             <button
//               onClick={goNext}
//               disabled={selectedIndex === null}
//               className="px-8 py-4 rounded-full flex items-center gap-2 group hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
//               style={{
//                 background: "linear-gradient(90deg, #7030EF 0%, #DB1FFF 100%)",
//                 boxShadow: "0 0 20px rgba(219,31,255,0.4)",
//               }}
//             >
//               <span className="font-['Space_Grotesk'] font-semibold text-xl text-white">
//                 {currentIndex < totalQuestions - 1
//                   ? "Lock Answer"
//                   : "Submit Quiz"}
//               </span>
//               <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
//             </button>
//           </div>
//         </div>
//       </main>

//       <footer className="w-full p-6 flex justify-between items-center text-[#958da2]/50 font-['Space_Grotesk'] text-sm z-10">
//         <button className="flex items-center gap-1 hover:text-white transition-colors">
//           <Flag className="h-4 w-4" />
//           Report Issue
//         </button>
//         <span>500 pts potential</span>
//       </footer>
//     </div>
//   );
// }
