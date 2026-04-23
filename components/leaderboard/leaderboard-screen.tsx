"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Wand2,
  Brain,
  Trophy,
  PlusSquare,
  User,
  Home,
  LogOut,
  Loader2,
} from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  status?: string;
  isCurrentUser?: boolean;
}

function UserAvatar({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={36}
        height={36}
        className="rounded-full object-cover"
      />
    );
  }
  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#7030EF] to-[#DB1FFF] flex items-center justify-center text-white font-bold text-sm font-['Space_Grotesk']">
      {initials}
    </div>
  );
}

export function LeaderboardScreen() {
  const [activeFilter, setActiveFilter] = useState<"weekly" | "all-time">(
    "weekly",
  );
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(
        (
          data: Array<{
            rank: number;
            userName: string;
            userId: string;
            quizTitle: string;
            percentage: number;
          }>,
        ) => {
          const mapped: LeaderboardEntry[] = data.map((d) => ({
            rank: d.rank,
            name: d.userName,
            points: d.percentage,
            status: d.quizTitle,
            isCurrentUser: d.userId === user?.id,
          }));
          setRows(mapped);
        },
      )
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

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
              className="text-[#DB1FFF] border-b-2 border-[#DB1FFF] pb-1 py-2"
            >
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name} image={user?.image} />
            <div className="hidden md:block">
              <p className="font-['Space_Grotesk'] text-sm font-semibold text-white truncate max-w-[120px]">
                {user?.name ?? ""}
              </p>
              <p className="font-['Space_Grotesk'] text-xs text-[#CBC3D8] truncate max-w-[120px]">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut().then(() => router.push("/login"))}
            className="flex items-center gap-2 font-['Space_Grotesk'] text-sm text-[#CBC3D8] hover:text-red-400 px-3 py-2 rounded-lg hover:bg-white/5 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </nav>

      <div className="flex flex-1 w-full max-w-7xl mx-auto mt-0 md:mt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col py-8 gap-4 fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-[#090820]/60 backdrop-blur-2xl z-40">
          <div className="px-6 mb-4 flex items-center gap-4">
            <UserAvatar name={user?.name} image={user?.image} />
            <div>
              <div className="text-xl font-bold text-white font-['Space_Grotesk'] truncate max-w-[140px]">
                {user?.name ?? "..."}
              </div>
              <div className="text-xs text-[#DB1FFF] font-['Space_Grotesk'] truncate max-w-[140px]">
                {user?.email ?? ""}
              </div>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-2 font-['Space_Grotesk'] font-medium text-sm">
            {[
              { Icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
              { Icon: Wand2, label: "My Quizzes", href: "/" },
              { Icon: Brain, label: "AI Generator", href: "/create-quiz" },
            ].map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-slate-400 px-4 py-3 hover:bg-white/5 hover:translate-x-1 transition-transform duration-200 flex items-center gap-3"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <Link
              href="/leaderboard"
              className="bg-linear-to-r from-[#7030EF]/20 to-transparent text-[#DB1FFF] border-l-4 border-[#DB1FFF] px-4 py-3 flex items-center gap-3 hover:translate-x-1 transition-transform duration-200"
            >
              <Trophy className="h-5 w-5" />
              Rankings
            </Link>
          </nav>
          <div className="px-4 mt-auto">
            <button
              onClick={() => signOut().then(() => router.push("/login"))}
              className="w-full flex items-center justify-center gap-2 text-[#CBC3D8] font-['Space_Grotesk'] font-semibold text-sm py-2 rounded-lg hover:bg-white/5 hover:text-red-400 transition border border-white/10 uppercase tracking-wider"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64 px-4 sm:px-8 py-8 flex flex-col items-center">
          {/* Header */}
          <div className="w-full max-w-3xl flex flex-col items-center mb-8 text-center">
            <h1 className="font-['Space_Grotesk'] text-5xl font-bold text-white mb-2 tracking-tight">
              Global{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #7030EF, #DB1FFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Rankings
              </span>
            </h1>
            <p className="font-['Manrope'] text-lg text-slate-400 max-w-lg">
              Compete with the best minds. Climb the ranks and claim your spot
              at the top.
            </p>

            {/* Filter Tabs */}
            <div className="mt-6 flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
              {(["weekly", "all-time"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-full font-['Space_Grotesk'] text-sm font-medium transition-all capitalize
                    ${
                      activeFilter === f
                        ? "bg-[#7030EF]/20 border border-[#7030EF]/50 text-white shadow-[0_0_15px_rgba(112,48,239,0.25)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {f === "all-time" ? "All-time" : "Weekly"}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="w-full max-w-3xl flex flex-col gap-4 pb-24 md:pb-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 text-[#DB1FFF] animate-spin" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 text-[#CBC3D8]">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-[#7030EF]/40" />
                <p>No quiz attempts yet. Be the first!</p>
                <Link
                  href="/create-quiz"
                  className="mt-4 inline-block text-[#DB1FFF] underline"
                >
                  Create a Quiz
                </Link>
              </div>
            ) : (
              <>
                {top3.map((entry) => (
                  <LeaderboardRow key={entry.rank} entry={entry} size="large" />
                ))}
                {rest.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 my-2 opacity-50 px-4">
                      <div className="h-px bg-white/20 flex-1" />
                      <div className="text-xs text-white/50 font-['Space_Grotesk'] uppercase tracking-widest">
                        More Contenders
                      </div>
                      <div className="h-px bg-white/20 flex-1" />
                    </div>
                    {rest.map((entry) => (
                      <LeaderboardRow
                        key={entry.rank}
                        entry={entry}
                        size="small"
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-[#090820]/90 backdrop-blur-[20px] border-t border-white/10 rounded-t-2xl shadow-[0_-10px_40px_rgba(219,31,255,0.15)]">
        {[
          { Icon: Home, label: "Home", href: "/", active: false },
          {
            Icon: PlusSquare,
            label: "Create",
            href: "/create-quiz",
            active: false,
          },
          {
            Icon: Trophy,
            label: "Leaderboard",
            href: "/leaderboard",
            active: true,
          },
          { Icon: User, label: "Profile", href: "/dashboard", active: false },
        ].map(({ Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 w-16 active:scale-90 transition-transform duration-150
              ${active ? "text-[#DB1FFF] drop-shadow-[0_0_8px_#DB1FFF] scale-110" : "text-slate-500 opacity-60 hover:opacity-100"}`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase">
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
