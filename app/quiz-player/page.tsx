import { Suspense } from "react";
import { QuizPlayerScreen } from "@/components/quiz-player/quiz-player-screen";

export default function QuizPlayerPage() {
  return (
    <Suspense>
      <QuizPlayerScreen />
    </Suspense>
  );
}
