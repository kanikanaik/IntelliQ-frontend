"use client";

import { Suspense } from "react";
import { QuizPlayerScreen } from "@/components/quiz-player/quiz-player-screen";

function PublicQuizContent() {
  return <QuizPlayerScreen isPublic={true} />;
}

export default function PublicQuizPage() {
  return (
    <Suspense fallback={<div>Loading quiz...</div>}>
      <PublicQuizContent />
    </Suspense>
  );
}
