import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** Semi-transparent glass surface used throughout the QuizFlow design system.
 *  bg-white/10 + backdrop-blur + thin white border. */
export function GlassCard({
  children,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-[20px] border border-white/[0.15] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
