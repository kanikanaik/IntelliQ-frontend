"use client";

interface ScoreRingProps {
  percentage: number;
  correct: number;
  incorrect: number;
  label: string;
}

export function ScoreRing({
  percentage,
  correct,
  incorrect,
  label,
}: ScoreRingProps) {
  // SVG circle circumference: 2 * pi * r where r=15.9155 => ~100
  const strokeDash = `${percentage}, 100`;

  return (
    <div
      className="flex flex-col items-center justify-center relative overflow-hidden rounded-xl p-8"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(219,31,255,0.1),transparent_70%)]" />
      <h2 className="font-['Space_Grotesk'] font-semibold text-2xl text-white mb-6 relative z-10">
        Total Score
      </h2>
      <div className="relative w-48 h-48 mb-4">
        <svg
          className="block mx-auto max-w-full max-h-[250px]"
          viewBox="0 0 36 36"
        >
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#DB1FFF" />
              <stop offset="100%" stopColor="#7030EF" />
            </linearGradient>
          </defs>
          <path
            className="fill-none stroke-[3.8]"
            style={{ stroke: "rgba(255,255,255,0.1)" }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="fill-none stroke-[2.8]"
            style={{
              stroke: "url(#scoreGradient)",
              strokeLinecap: "round",
              strokeDasharray: strokeDash,
              filter: "drop-shadow(0 0 8px rgba(219,31,255,0.8))",
              animation: "scoreProgress 2s ease-out forwards",
            }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span
            className="font-['Space_Grotesk'] text-4xl font-bold text-white"
            style={{ textShadow: "0 0 15px rgba(219,31,255,0.6)" }}
          >
            {percentage}%
          </span>
          <span className="font-['Space_Grotesk'] text-sm text-[#f8acff] tracking-widest uppercase">
            {label}
          </span>
        </div>
      </div>
      <div className="flex justify-between w-full mt-4 text-[#cbc3d8] font-['Manrope'] text-base">
        <span>
          Correct: <span className="text-white font-bold">{correct}</span>
        </span>
        <span>
          Incorrect: <span className="text-white font-bold">{incorrect}</span>
        </span>
      </div>
    </div>
  );
}
