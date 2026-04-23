/** Fixed-position violet + magenta radial gradient orbs that sit behind all
 *  screen content. Used on every QuizFlow screen. */
export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-[#7030EF]/20 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#DB1FFF]/10 blur-[100px]" />
    </div>
  );
}
