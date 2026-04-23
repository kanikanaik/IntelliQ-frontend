import type { ReviewQuestion } from "./review-data";
import { ReviewQuestionCard } from "./review-question-card";

/** Responsive bento grid — 1 col on mobile, 2 on md, 3 on xl. */
export function ReviewQuestionsGrid({
  questions,
}: {
  questions: ReviewQuestion[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questions.map((q) => (
        <ReviewQuestionCard key={q.id} question={q} />
      ))}
    </div>
  );
}
