"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Award } from "lucide-react";

interface Reward {
  icon: string;
  iconColor: string;
  borderColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  valueDisplay: string;
}

interface RewardsCardProps {
  rewards: Reward[];
}

export function RewardsCard({ rewards }: RewardsCardProps) {
  return (
    <GlassCard className="rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7030EF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <h3 className="font-['Space_Grotesk'] font-semibold text-2xl text-white mb-4 flex items-center gap-2">
        <Award className="h-6 w-6 text-[#DB1FFF]" />
        Rewards Unlocked
      </h3>
      <div className="space-y-4">
        {rewards.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border"
                style={{ background: r.bgColor, borderColor: r.borderColor }}
              >
                <Award className="h-5 w-5" style={{ color: r.iconColor }} />
              </div>
              <div>
                <p className="font-['Space_Grotesk'] text-sm font-medium text-white">
                  {r.title}
                </p>
                <p className="font-['Manrope'] text-sm text-[#cbc3d8]">
                  {r.subtitle}
                </p>
              </div>
            </div>
            <span
              className="font-['Space_Grotesk'] font-bold text-xl"
              style={{ color: r.iconColor }}
            >
              {r.valueDisplay}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
