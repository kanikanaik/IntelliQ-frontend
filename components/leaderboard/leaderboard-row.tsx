"use client";

import { Trophy, ArrowUp } from "lucide-react";

type RankTier = "gold" | "silver" | "bronze" | "current" | "default";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  status?: string; // e.g. "Online", "2 hrs ago"
  isCurrentUser?: boolean;
  rankTier?: RankTier;
  avatarSeed?: string; // used for placeholder initials
}

const RANK_STYLES: Record<
  RankTier,
  { bar: string; rankText: string; border: string; glow: string; bg: string }
> = {
  gold: {
    bar: "#FBBF24",
    rankText: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]",
    border: "1px solid rgba(255,215,0,0.4)",
    glow: "0 0 30px rgba(255,215,0,0.2)",
    bg: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,215,0,0.05))",
  },
  silver: {
    bar: "#CBD5E1",
    rankText: "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]",
    border: "1px solid rgba(192,192,192,0.4)",
    glow: "0 0 20px rgba(192,192,192,0.2)",
    bg: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(192,192,192,0.05))",
  },
  bronze: {
    bar: "#FB923C",
    rankText: "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]",
    border: "1px solid rgba(205,127,50,0.4)",
    glow: "0 0 20px rgba(205,127,50,0.2)",
    bg: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(205,127,50,0.05))",
  },
  current: {
    bar: "#DB1FFF",
    rankText: "text-[#DB1FFF] drop-shadow-[0_0_5px_rgba(219,31,255,0.5)]",
    border: "2px solid #DB1FFF",
    glow: "inset 0 0 15px rgba(219,31,255,0.2), 0 0 15px rgba(219,31,255,0.2)",
    bg: "rgba(219,31,255,0.05)",
  },
  default: {
    bar: "transparent",
    rankText: "text-slate-400",
    border: "1px solid rgba(255,255,255,0.15)",
    glow: "none",
    bg: "rgba(255,255,255,0.05)",
  },
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  size?: "large" | "small";
}

export function LeaderboardRow({ entry, size = "small" }: LeaderboardRowProps) {
  const tier: RankTier = entry.isCurrentUser
    ? "current"
    : entry.rank === 1
      ? "gold"
      : entry.rank === 2
        ? "silver"
        : entry.rank === 3
          ? "bronze"
          : "default";

  const styles = RANK_STYLES[tier];
  const avatarSize = size === "large" ? "w-14 h-14" : "w-10 h-10";
  const initials = entry.name.slice(0, 2).toUpperCase();

  const pointsColor =
    tier === "gold"
      ? "text-yellow-400"
      : tier === "silver"
        ? "text-slate-200"
        : tier === "bronze"
          ? "text-orange-300"
          : tier === "current"
            ? "text-white"
            : "text-white";

  return (
    <div
      className={`rounded-xl flex items-center gap-4 relative overflow-hidden transition-transform hover:-translate-y-0.5
        ${tier === "current" ? "scale-[1.02] z-10" : ""}
        ${size === "large" ? "p-4" : "p-3"}
        backdrop-blur-[20px]`}
      style={{
        background: styles.bg,
        border: styles.border,
        boxShadow: styles.glow,
      }}
    >
      {/* Left accent bar for top-3 and current */}
      {tier !== "default" && (
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{
            background: styles.bar,
            boxShadow: `0 0 10px ${styles.bar}`,
          }}
        />
      )}

      {/* Rank number */}
      <div
        className={`w-10 text-center font-['Space_Grotesk'] font-semibold text-xl ${styles.rankText}`}
      >
        {entry.rank}
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`${avatarSize} rounded-full border-2 flex items-center justify-center font-['Space_Grotesk'] font-bold text-white bg-gradient-to-br from-[#7030EF]/40 to-[#DB1FFF]/40`}
          style={{
            borderColor:
              styles.bar !== "transparent"
                ? styles.bar
                : "rgba(255,255,255,0.2)",
          }}
        >
          {initials}
        </div>
        {tier === "gold" && (
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-black">
            <Trophy className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-['Space_Grotesk'] font-semibold text-white flex items-center gap-2 ${size === "large" ? "text-lg" : ""}`}
        >
          {entry.name}
          {entry.isCurrentUser && (
            <span className="text-[10px] bg-[#DB1FFF]/20 text-[#DB1FFF] px-2 py-0.5 rounded border border-[#DB1FFF]/50 uppercase tracking-wider font-['Space_Grotesk']">
              You
            </span>
          )}
        </h3>
        {entry.status && (
          <div
            className={`text-xs font-['Space_Grotesk'] flex items-center gap-1 ${entry.isCurrentUser ? "text-[#7030EF]" : "text-slate-500"}`}
          >
            {entry.status === "Online" && (
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_#4ADE80]" />
            )}
            {entry.isCurrentUser && (
              <ArrowUp className="h-3 w-3 text-green-400" />
            )}
            {entry.status}
          </div>
        )}
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div
          className={`font-['Space_Grotesk'] font-semibold text-xl tracking-wider ${pointsColor}`}
        >
          {entry.points.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400 uppercase font-['Space_Grotesk']">
          PTS
        </div>
      </div>
    </div>
  );
}
