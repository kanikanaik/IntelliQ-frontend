type IconProps = {
  className?: string;
};

export type QuizflowIconName =
  | "sparkles"
  | "gamepad"
  | "bell"
  | "userCircle"
  | "flame"
  | "users"
  | "home"
  | "addBox"
  | "trophy"
  | "person";

function baseProps(className?: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function QuizflowIcon({
  name,
  className,
}: {
  name: QuizflowIconName;
  className?: string;
}) {
  switch (name) {
    case "sparkles":
      return (
        <svg {...baseProps(className)}>
          <path d="M12 3l1.6 3.8L17.5 8.4l-3.9 1.6L12 14l-1.6-4L6.5 8.4l3.9-1.6L12 3z" />
          <path d="M18.5 13.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2z" />
          <path d="M4.5 14.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" />
        </svg>
      );
    case "gamepad":
      return (
        <svg {...baseProps(className)}>
          <path d="M7 9h10a4 4 0 013.8 5l-1.1 3.2a2.6 2.6 0 01-4.5.8l-1.4-1.6h-3.6l-1.4 1.6a2.6 2.6 0 01-4.5-.8L3.2 14A4 4 0 017 9z" />
          <path d="M8 13v3" />
          <path d="M6.5 14.5h3" />
          <circle
            cx="16.3"
            cy="13.5"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="18.3"
            cy="15.2"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...baseProps(className)}>
          <path d="M15 17H5l1.2-1.6A4.8 4.8 0 007 12.5V10a3 3 0 116 0v2.5c0 1 .3 2 .8 2.9L15 17z" />
          <path d="M9 18.5a1.5 1.5 0 003 0" />
        </svg>
      );
    case "userCircle":
      return (
        <svg {...baseProps(className)}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="9.2" r="2.3" />
          <path d="M7.8 17.2a5 5 0 018.4 0" />
        </svg>
      );
    case "flame":
      return (
        <svg {...baseProps(className)}>
          <path d="M12 3.5c.6 2.5-.4 3.8-1.5 5.1C9.2 10 8 11.3 8 13.4A4 4 0 0012 17.5a4 4 0 004-4.1c0-2.3-1.3-3.9-2.7-5.4-.8-.9-1.6-1.8-1.3-4.5z" />
          <path d="M12 10.5c.2 1-.2 1.6-.6 2.1-.4.5-.9 1.1-.9 2.1A1.5 1.5 0 0012 16.2a1.5 1.5 0 001.5-1.5c0-1.2-.7-2-.9-2.3-.3-.3-.6-.8-.6-1.9z" />
        </svg>
      );
    case "users":
      return (
        <svg {...baseProps(className)}>
          <circle cx="8.3" cy="9.2" r="2.1" />
          <circle cx="15.8" cy="9.8" r="1.9" />
          <path d="M5.3 15.8a3.2 3.2 0 016 0" />
          <path d="M13.2 15.8a2.8 2.8 0 015.2 0" />
        </svg>
      );
    case "home":
      return (
        <svg {...baseProps(className)}>
          <path d="M4 11.3L12 5l8 6.3" />
          <path d="M6.5 10.5V19h11v-8.5" />
        </svg>
      );
    case "addBox":
      return (
        <svg {...baseProps(className)}>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...baseProps(className)}>
          <path d="M8 5h8v2.5A4 4 0 0112 11a4 4 0 01-4-3.5V5z" />
          <path d="M8 7H6a2 2 0 000 4h2" />
          <path d="M16 7h2a2 2 0 010 4h-2" />
          <path d="M12 11v3" />
          <path d="M9.5 18h5" />
        </svg>
      );
    case "person":
      return (
        <svg {...baseProps(className)}>
          <circle cx="12" cy="8.8" r="2.2" />
          <path d="M7.8 17.2a5 5 0 018.4 0" />
        </svg>
      );
    default:
      return <span className={className} />;
  }
}

export function IconButton({
  icon,
  className,
}: {
  icon: QuizflowIconName;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className ?? "inline-flex items-center justify-center"}
      aria-label={icon}
    >
      <QuizflowIcon name={icon} className="h-5 w-5" />
    </button>
  );
}

export function SmallIcon({
  name,
  className,
}: {
  name: QuizflowIconName;
  className?: string;
}) {
  return <QuizflowIcon name={name} className={className ?? "h-4 w-4"} />;
}

export function HeroIcon({
  name,
  className,
}: {
  name: QuizflowIconName;
  className?: string;
}) {
  return <QuizflowIcon name={name} className={className ?? "h-10 w-10"} />;
}

export function MobileIcon({
  name,
  className,
}: {
  name: QuizflowIconName;
  className?: string;
}) {
  return <QuizflowIcon name={name} className={className ?? "h-5 w-5"} />;
}

export function UtilityIcon({
  name,
  className,
}: {
  name: QuizflowIconName;
  className?: string;
}) {
  return <QuizflowIcon name={name} className={className ?? "h-5 w-5"} />;
}

export function TrendIcon({ className }: IconProps) {
  return <QuizflowIcon name="flame" className={className ?? "h-5 w-5"} />;
}

export function ParticipantsIcon({ className }: IconProps) {
  return <QuizflowIcon name="users" className={className ?? "h-4 w-4"} />;
}
