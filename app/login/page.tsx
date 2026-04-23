"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (err) {
      setError(err.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
    // on success the browser redirects — no need to reset loading
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error: err } = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Sign up failed. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } else {
      const { error: err } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: "#090820",
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(112,48,239,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(219,31,255,0.1) 0%, transparent 50%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-block font-['Space_Grotesk'] text-3xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_15px_#7030EF]"
          >
            INTELLIQ
          </Link>
          <p className="mt-2 font-['Manrope'] text-sm text-[#CBC3D8]">
            Your AI-powered quiz platform
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-xl border border-white/10 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className="flex-1 rounded-lg py-2 font-['Space_Grotesk'] text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? {
                        background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                        color: "#fff",
                      }
                    : { color: "#CBC3D8" }
                }
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#DB1FFF]" />
            <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-white">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white px-6 py-3.5 font-['Space_Grotesk'] text-sm font-semibold text-[#090820] transition hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#090820]" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-['Space_Grotesk'] text-xs text-[#CBC3D8]">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block font-['Space_Grotesk'] text-xs font-medium uppercase tracking-widest text-[#CBC3D8]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-['Manrope'] text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-['Space_Grotesk'] text-xs font-medium uppercase tracking-widest text-[#CBC3D8]">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-['Manrope'] text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-['Space_Grotesk'] text-xs font-medium uppercase tracking-widest text-[#CBC3D8]">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-['Manrope'] text-sm text-[#E2E2E2] placeholder-[#CBC3D8]/50 outline-none transition focus:border-[#DB1FFF] focus:ring-1 focus:ring-[#DB1FFF]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(90deg, #7030EF, #DB1FFF)",
                boxShadow: "0 0 20px rgba(219,31,255,0.3)",
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-['Manrope'] text-xs text-[#CBC3D8]">
          By continuing, you agree to our{" "}
          <span className="cursor-pointer text-[#CFBCFF] hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="cursor-pointer text-[#CFBCFF] hover:underline">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
