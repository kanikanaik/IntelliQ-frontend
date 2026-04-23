export type DesktopNavItem = {
  label: string;
  active?: boolean;
};

export type MobileNavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

export type HeroOption = {
  icon: string;
  title: string;
  description: string;
  accent: "violet" | "magenta";
};

export type TrendingQuiz = {
  id: string;
  shareId?: string | null;
  title: string;
  description: string;
  creator: string;
  questions: number;
  attempts: number;
};

export const desktopNavItems: DesktopNavItem[] = [
  { label: "Explore", active: true },
  { label: "Leaderboard" },
];

export const mobileNavItems: MobileNavItem[] = [
  { label: "Home", icon: "Home", active: true },
  { label: "Create", icon: "PlusSquare" },
  { label: "Leaderboard", icon: "Trophy" },
  { label: "Profile", icon: "User" },
];

export const heroOptions: HeroOption[] = [
  {
    icon: "Sparkles",
    title: "Create Quiz",
    description:
      "For educators and creators. Instantly generate quizzes from text, topics, or PDFs using advanced AI.",
    accent: "violet",
  },
  {
    icon: "Gamepad2",
    title: "Take Quiz",
    description:
      "For learners. Explore trending topics, test your knowledge, and climb the global leaderboard.",
    accent: "magenta",
  },
];

export const trendingQuizzes: TrendingQuiz[] = [
  {
    id: "sample-1",
    shareId: null,
    title: "Quantum Computing Basics",
    description:
      "Test your knowledge on qubits, superposition, and entanglement in this beginner-friendly assessment.",
    creator: "IntelliQ Team",
    questions: 10,
    attempts: 12400,
  },
  {
    id: "sample-2",
    shareId: null,
    title: "Cyberpunk Lore 101",
    description:
      "How well do you know the megacorps and netrunners of the dystopian future?",
    creator: "IntelliQ Team",
    questions: 12,
    attempts: 8900,
  },
  {
    id: "sample-3",
    shareId: null,
    title: "Astrophysics Trivia",
    description:
      "Black holes, dark matter, and cosmic microwave background radiation. Are you ready?",
    creator: "IntelliQ Team",
    questions: 15,
    attempts: 15200,
  },
];