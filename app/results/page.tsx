import { Suspense } from "react";
import { ResultsScreen } from "@/components/results/results-screen";

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsScreen />
    </Suspense>
  );
}
