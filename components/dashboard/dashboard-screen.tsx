"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  LayoutDashboard,
  Wand2,
  Brain,
  Trophy,
  Sparkles,
  Home,
  Gamepad2,
  PlusSquare,
  User,
  TrendingUp,
  Plus,
  LogOut,
  Flame,
  Star,
  Clock,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { GlassCard } from "@/components/shared/glass-card";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SUGGESTED_QUIZZES = [
  {
    category: "Technology",
    title: "Quantum Computing Basics",
    difficulty: "Beginner",
    questions: 10,
    participants: "12.4k",
  },
  {
    category: "Pop Culture",
    title: "Cyberpunk Lore 101",
    difficulty: "Intermediate",
    questions: 15,
    participants: "8.2k",
  },
  {
    category: "Science",
    title: "Astrophysics Deep Dive",
    difficulty: "Advanced",
    questions: 20,
    participants: "5.6k",
  },
];

const RECENT_ACTIVITY = [
  {
    title: "Quantum Computing Basics",
    score: "90%",
    date: "Today",
    badge: "🥇",
  },
  {
    title: "History of the Internet",
    score: "75%",
    date: "Yesterday",
    badge: "🥈",
  },
  {
    title: "Neural Networks 101",
    score: "85%",
    date: "3 days ago",
    badge: "🥇",
  },
];
function UserAvatar({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  if (image && image.startsWith("http")) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
    );
  }

  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full border border-white/20 bg-linear-to-br from-[#7030EF]/40 to-[#DB1FFF]/40 flex items-center justify-center font-['Space_Grotesk'] font-bold text-white text-sm">
      {initials}
    </div>
  );
}
export function DashboardScreen() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] ?? "Creator";

  return (
    <div
      className="text-[#e2e2e2] min-h-screen flex flex-col font-['Manrope'] overflow-x-hidden pt-16 md:pt-0 pb-20 md:pb-0"
      style={{ backgroundColor: "#090820" }}
    >
      <AmbientBackground />

      {/* Desktop Top Nav */}
      <nav className="hidden md:flex flex-row justify-between items-center w-full px-8 h-16 border-b border-white/10 bg-[#090820]/80 backdrop-blur-[20px] z-50 fixed top-0 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black text-white font-['Space_Grotesk'] tracking-wider uppercase"
            style={{ textShadow: "0 0 15px #7030EF" }}
          >
            INTELLIQ
          </Link>
          <div className="flex items-center gap-6 font-['Space_Grotesk'] text-white uppercase tracking-wider text-sm">
            <Link
              href="/"
              className="text-slate-400 hover:text-[#DB1FFF] transition-colors py-2"
            >
              Explore
            </Link>
            <Link
              href="/leaderboard"
              className="text-slate-400 hover:text-[#DB1FFF] transition-colors py-2"
            >
              Leaderboard
            </Link>
            <Link
              href="/dashboard"
              className="text-[#DB1FFF] border-b-2 border-[#DB1FFF] pb-1 py-2"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/70">
            <button className="hover:bg-white/5 hover:text-white rounded-full p-2 transition-all">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="hover:bg-white/5 hover:text-red-400 rounded-full p-2 transition-all"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <Link
            href="/create-quiz"
            className="flex items-center gap-2 rounded-full px-5 py-2 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:brightness-110"
            style={{
              background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
              boxShadow: "0 0 20px rgba(219,31,255,0.3)",
            }}
          >
            <Plus className="h-4 w-4" />
            Create Quiz
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 w-full max-w-7xl mx-auto mt-0 md:mt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col py-8 gap-4 fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-[#090820]/60 backdrop-blur-2xl z-40">
          <div className="px-6 mb-4 flex items-center gap-4">
            <UserAvatar name={user?.name} image={user?.image} />
            <div>
              <div className="text-base font-bold text-white font-['Space_Grotesk'] truncate max-w-[130px]">
                {user?.name ?? "Loading..."}
              </div>
              <div className="text-xs text-[#DB1FFF] font-['Space_Grotesk'] uppercase tracking-wider truncate max-w-[130px]">
                {user?.email ?? ""}
              </div>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-1 font-['Space_Grotesk'] font-medium text-sm">
            {[
              {
                Icon: LayoutDashboard,
                label: "Dashboard",
                href: "/dashboard",
                active: true,
              },
              { Icon: Wand2, label: "My Quizzes", href: "/", active: false },
              {
                Icon: Brain,
                label: "AI Generator",
                href: "/create-quiz",
                active: false,
              },
              {
                Icon: Trophy,
                label: "Rankings",
                href: "/leaderboard",
                active: false,
              },
            ].map(({ Icon, label, href, active }) => (
              <Link
                key={label}
                href={href}
                className={`px-4 py-3 flex items-center gap-3 hover:translate-x-1 transition-transform duration-200
                  ${
                    active
                      ? "bg-linear-to-r from-[#7030EF]/20 to-transparent text-[#DB1FFF] border-l-4 border-[#DB1FFF]"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-4 mt-auto flex flex-col gap-2">
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="w-full flex items-center justify-center gap-2 text-[#CBC3D8] font-['Space_Grotesk'] font-semibold text-sm py-2 rounded-lg hover:bg-white/5 hover:text-red-400 transition-all uppercase tracking-wider border border-white/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64 px-4 sm:px-8 py-8">
          {/* Welcome Banner */}
          <div className="mb-8">
            <h1 className="font-['Space_Grotesk'] text-4xl font-bold text-white mb-1">
              Welcome back,{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #7030EF, #DB1FFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {firstName}
              </span>{" "}
              👋
            </h1>
            <p className="text-[#CBC3D8] font-['Manrope'] text-base">
              Here's your activity overview and suggested quizzes.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Global Rating",
                value: "#42",
                icon: Trophy,
                color: "#DB1FFF",
                glow: "rgba(219,31,255,0.2)",
              },
              {
                label: "Quizzes Taken",
                value: "34",
                icon: Gamepad2,
                color: "#7030EF",
                glow: "rgba(112,48,239,0.2)",
              },
              {
                label: "Total XP",
                value: "5,230",
                icon: Star,
                color: "#FBBF24",
                glow: "rgba(251,191,36,0.2)",
              },
              {
                label: "Win Streak",
                value: "7🔥",
                icon: Flame,
                color: "#FB923C",
                glow: "rgba(251,146,60,0.2)",
              },
            ].map(({ label, value, icon: Icon, color, glow }) => (
              <GlassCard
                key={label}
                className="rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-['Space_Grotesk'] text-xs text-[#CBC3D8] uppercase tracking-wider">
                    {label}
                  </span>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div
                  className="font-['Space_Grotesk'] text-3xl font-bold text-white"
                  style={{ textShadow: `0 0 15px ${glow}` }}
                >
                  {value}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Global Ratings Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <GlassCard className="rounded-xl p-6 lg:col-span-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(219,31,255,0.15),transparent_70%)]" />
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-[#DB1FFF]" />
                <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">
                  Global Rating
                </h2>
              </div>
              <div className="text-center py-4">
                <div
                  className="font-['Space_Grotesk'] text-6xl font-black text-white mb-1"
                  style={{ textShadow: "0 0 20px rgba(219,31,255,0.5)" }}
                >
                  #42
                </div>
                <div className="font-['Space_Grotesk'] text-sm text-[#DB1FFF] uppercase tracking-wider">
                  World Rank
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-green-400 text-sm">
                  <ArrowUp className="h-4 w-4" />
                  <span>3 positions this week</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#CBC3D8]">Win rate</span>
                  <span className="text-white font-semibold">78%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full w-[78%]"
                    style={{
                      background: "linear-gradient(to right, #7030EF, #DB1FFF)",
                    }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/create-quiz" className="group">
                <GlassCard className="h-full rounded-xl p-6 transition hover:border-[#7030EF] cursor-pointer">
                  <div
                    className="mb-4 h-12 w-12 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #7030EF20, #7030EF40)",
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-[#CFBCFF]" />
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-1 group-hover:text-[#CFBCFF] transition-colors">
                    Create Quiz
                  </h3>
                  <p className="text-sm text-[#CBC3D8]">
                    Generate a new AI-powered quiz from your content
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[#7030EF] font-['Space_Grotesk'] font-semibold">
                    Get started <ChevronRight className="h-3 w-3" />
                  </div>
                </GlassCard>
              </Link>
              <Link href="/login" className="group">
                <GlassCard className="h-full rounded-xl p-6 transition hover:border-[#DB1FFF] cursor-pointer">
                  <div
                    className="mb-4 h-12 w-12 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #DB1FFF20, #DB1FFF40)",
                    }}
                  >
                    <Gamepad2 className="h-6 w-6 text-[#F8ACFF]" />
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-white mb-1 group-hover:text-[#F8ACFF] transition-colors">
                    Take Quiz
                  </h3>
                  <p className="text-sm text-[#CBC3D8]">
                    Browse trending quizzes and climb the leaderboard
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[#DB1FFF] font-['Space_Grotesk'] font-semibold">
                    Browse all <ChevronRight className="h-3 w-3" />
                  </div>
                </GlassCard>
              </Link>
              <Link href="/leaderboard" className="group sm:col-span-2">
                <GlassCard className="rounded-xl p-4 transition hover:border-[#FBBF24] cursor-pointer flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(251,191,36,0.15)",
                      border: "1px solid rgba(251,191,36,0.3)",
                    }}
                  >
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-white">
                      View Leaderboard
                    </h3>
                    <p className="text-xs text-[#CBC3D8]">
                      See where you rank against the world
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </GlassCard>
              </Link>
            </div>
          </div>

          {/* Suggested Quizzes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#DB1FFF]" />
                Suggested for You
              </h2>
              <Link
                href="/"
                className="font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-widest text-[#CFBCFF] hover:text-[#F8ACFF] transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUGGESTED_QUIZZES.map((quiz) => (
                <Link key={quiz.title} href="/quiz-player">
                  <GlassCard className="rounded-xl p-5 hover:border-[#F8ACFF] transition-colors group cursor-pointer">
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#7030EF] to-[#E249FF] opacity-60 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                    <div className="flex items-start justify-between mb-3">
                      <span className="rounded-full border border-[#7030EF] bg-[#7030EF]/10 px-2.5 py-0.5 font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-widest text-[#CFBCFF]">
                        {quiz.category}
                      </span>
                      <span className="text-xs text-[#CBC3D8] font-['Space_Grotesk']">
                        {quiz.questions}Q
                      </span>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-base font-semibold text-white mb-1 group-hover:text-[#F8ACFF] transition-colors">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-[#CBC3D8]">
                        {quiz.participants} participants
                      </span>
                      <span
                        className="text-[10px] font-['Space_Grotesk'] px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            quiz.difficulty === "Beginner"
                              ? "rgba(74,222,128,0.1)"
                              : quiz.difficulty === "Intermediate"
                                ? "rgba(251,191,36,0.1)"
                                : "rgba(219,31,255,0.1)",
                          color:
                            quiz.difficulty === "Beginner"
                              ? "#4ADE80"
                              : quiz.difficulty === "Intermediate"
                                ? "#FBBF24"
                                : "#DB1FFF",
                          border: `1px solid ${quiz.difficulty === "Beginner" ? "rgba(74,222,128,0.3)" : quiz.difficulty === "Intermediate" ? "rgba(251,191,36,0.3)" : "rgba(219,31,255,0.3)"}`,
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#CFBCFF]" />
                Recent Activity
              </h2>
            </div>
            <GlassCard className="rounded-xl overflow-hidden">
              {RECENT_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${i < RECENT_ACTIVITY.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <span className="text-2xl">{item.badge}</span>
                  <div className="flex-1">
                    <h4 className="font-['Space_Grotesk'] text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                    <span className="text-xs text-[#CBC3D8]">{item.date}</span>
                  </div>
                  <div
                    className="font-['Space_Grotesk'] text-lg font-bold"
                    style={{
                      color: parseInt(item.score) >= 85 ? "#4ADE80" : "#FBBF24",
                    }}
                  >
                    {item.score}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-[#090820]/90 backdrop-blur-[20px] border-t border-white/10">
        {[
          { Icon: Home, label: "Home", href: "/" },
          { Icon: PlusSquare, label: "Create", href: "/create-quiz" },
          { Icon: Trophy, label: "Leaders", href: "/leaderboard" },
          { Icon: User, label: "Profile", href: "/dashboard" },
        ].map(({ Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 opacity-60 hover:opacity-100 transition-all"
          >
            <Icon size={20} />
            <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase">
              {label}
            </span>
          </Link>
        ))}
        <button
          onClick={() => signOut().then(() => router.push("/login"))}
          className="flex flex-col items-center justify-center gap-1 w-16 text-slate-500 opacity-60 hover:opacity-100 transition-all hover:text-red-400"
          title="Sign out"
        >
          <LogOut size={20} />
          <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase">
            Logout
          </span>
        </button>
      </nav>
    </div>
  );
}
