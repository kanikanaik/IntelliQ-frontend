import { AmbientBackground } from "@/components/shared/ambient-background";
import { ReviewHeader } from "./review-header";
import { ReviewQuestionsGrid } from "./review-questions-grid";
import { ReviewPublishFab } from "./review-publish-fab";
import {
  SAMPLE_QUESTIONS,
  TOTAL_QUESTIONS,
  QUALITY_SCORE,
} from "./review-data";

/** Top-level composition for the Review AI Questions screen. Import this in
 *  app/review-questions/page.tsx. */
export function ReviewQuestionsScreen() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#121414] text-[#E2E2E2]">
      <AmbientBackground />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 pb-32">
        <ReviewHeader qualityScore={QUALITY_SCORE} />
        <ReviewQuestionsGrid questions={SAMPLE_QUESTIONS} />
      </main>

      <ReviewPublishFab totalQuestions={TOTAL_QUESTIONS} />
    </div>
  );
}
