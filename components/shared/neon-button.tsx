import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

type NeonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#7030EF] to-[#DB1FFF] text-white shadow-[0_4px_15px_rgba(219,31,255,0.4)] hover:shadow-[0_6px_20px_rgba(219,31,255,0.6)]",
  ghost:
    "bg-white/5 border border-white/10 text-[#CBC3D8] hover:text-white hover:bg-white/10",
  outline: "border border-[#DB1FFF]/50 text-[#DB1FFF] hover:bg-[#DB1FFF]/10",
};

/** Gradient neon button — primary uses the violet→magenta gradient,
 *  ghost and outline are lighter glass-style variants. */
export function NeonButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: NeonButtonProps) {
  return (
    <button
      type={type}
      className={`font-['Space_Grotesk'] font-bold uppercase tracking-[0.1em] transition-all ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
