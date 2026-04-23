import { QuizflowDesktopNav, QuizflowMobileNav } from "./quizflow-nav";
import { HeroSection, TrendingSection } from "./quizflow-sections";

export function QuizflowLanding() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090820] text-[#E2E2E2]">
      <BackgroundGlow />

      <QuizflowDesktopNav />

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 pb-32 pt-24 md:px-8 md:pb-24">
        <HeroSection />
        <TrendingSection />
      </main>

      <QuizflowMobileNav />
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(circle at 20% 30%, rgba(112, 48, 239, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(219, 31, 255, 0.1) 0%, transparent 50%)",
      }}
    />
  );
}
