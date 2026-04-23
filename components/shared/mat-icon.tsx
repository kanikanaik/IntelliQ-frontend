import type { CSSProperties } from "react";

type MatIconProps = {
  name: string;
  className?: string;
  style?: CSSProperties;
};

/** Renders a single Material Symbols Outlined glyph. Requires the font to be
 *  loaded globally (see app/layout.tsx). */
export function MatIcon({ name, className = "", style }: MatIconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      aria-hidden="true"
      style={style}
    >
      {name}
    </span>
  );
}
