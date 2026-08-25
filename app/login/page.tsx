"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      router.push("/");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070709] text-white selection:bg-violet-500/30">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_40%)]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* =========================================================
          PAGE CONTAINER
      ========================================================= */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-4 sm:px-8 lg:px-12">

        {/* =======================================================
            HEADER
        ======================================================= */}

        <header
          className={`flex items-center justify-between transition-all duration-700 ${
            mounted
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0"
          }`}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-3"
            aria-label="Go to NEXORA home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black shadow-lg shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105">
              N
            </span>

            <span className="text-[15px] font-bold tracking-[0.24em]">
              NEXORA
            </span>
          </button>

          {/* Register */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-white/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Create account
          </button>
        </header>

        {/* =======================================================
            MAIN
        ======================================================= */}

        <div className="flex flex-1 items-center justify-center py-5 lg:py-3">
          <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_0.85fr] lg:gap-20">

            {/* =================================================
                LEFT BRAND MESSAGE
            ================================================= */}

            <section
              className={`hidden lg:block transition-all duration-1000 ${
                mounted
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <div className="max-w-xl">

                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45 backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

                  Welcome back
                </div>

                {/* Main heading */}
                <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.045em] xl:text-[64px]">
                  Good to
                  <br />

                  <span className="login-gradient-text">
                    see you again.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-6 max-w-md text-[15px] leading-7 text-white/40">
                  Your next discovery is waiting. Sign in and continue
                  exploring products from trusted sellers across NEXORA.
                </p>

                {/* Mini feature row */}
                <div className="mt-8 flex items-center gap-6 text-xs text-white/35">
                  <MiniFeature label="Secure" />
                  <MiniFeature label="Curated" />
                  <MiniFeature label="Simple" />
                </div>

                {/* Decorative glass panel */}
                <div className="relative mt-10 h-28 max-w-[520px] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(124,58,237,0.12),transparent_35%)]" />

                  <div className="absolute left-5 top-5 text-[9px] font-semibold tracking-[0.2em] text-white/20">
                    NEXORA
                  </div>

                  <div className="absolute bottom-5 left-5 text-xs text-white/25">
                    Discover. Choose. Experience.
                  </div>

                  <div className="absolute -right-5 -top-10 h-32 w-32 rotate-12 rounded-3xl border border-violet-400/10 bg-violet-500/[0.025]" />

                  <div className="absolute right-16 -bottom-14 h-28 w-28 -rotate-12 rounded-3xl border border-indigo-400/10 bg-indigo-500/[0.02]" />
                </div>
              </div>
            </section>

            {/* =================================================
                LOGIN CARD
            ================================================= */}

            <section
              className={`mx-auto w-full max-w-[480px] transition-all duration-1000 ${
                mounted
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-[0.98] opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#0d0d10]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-7">

                {/* Card glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/[0.08] blur-3xl" />

                {/* Card content */}
                <div className="relative">

                  {/* =================================================
                      CARD HEADER
                  ================================================= */}

                  <div className="mb-7">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-violet-400">
                      YOUR ACCOUNT
                    </p>

                    <div className="flex items-end justify-between gap-4">

                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                          Welcome back
                        </h2>

                        <p className="mt-1.5 text-sm text-white/35">
                          Continue where you left off.
                        </p>
                      </div>

                      {/* =================================================
                          INTERACTIVE LOGO
                      ================================================= */}

                      <div className="group/logo relative hidden h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] text-sm font-black transition-all duration-500 hover:scale-105 hover:border-violet-400/30 hover:bg-violet-500/[0.06] hover:shadow-[0_0_24px_rgba(124,58,237,0.22)] sm:flex">

                        {/* Glow */}
                        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 via-fuchsia-500/0 to-indigo-500/0 opacity-0 blur-md transition-all duration-500 group-hover/logo:from-violet-500/20 group-hover/logo:via-fuchsia-500/10 group-hover/logo:to-indigo-500/20 group-hover/logo:opacity-100" />

                        {/* Light sweep */}
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover/logo:left-[130%]" />

                        {/* N */}
                        <span className="relative z-10 bg-white bg-clip-text text-transparent transition-all duration-500 group-hover/logo:bg-gradient-to-br group-hover/logo:from-violet-400 group-hover/logo:via-fuchsia-400 group-hover/logo:to-indigo-400 group-hover/logo:drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]">
                          N
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      LOGIN FORM
                  ================================================= */}

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-[11px] font-medium text-white/55"
                      >
                        Email address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-[44px] w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 hover:border-white/[0.14] focus:border-violet-400/50 focus:bg-white/[0.045] focus:ring-4 focus:ring-violet-500/[0.07]"
                      />
                    </div>

                    {/* Password */}
                    <div>

                      <div className="mb-1.5 flex items-center justify-between">

                        <label
                          htmlFor="password"
                          className="text-[11px] font-medium text-white/55"
                        >
                          Password
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            alert(
                              "Password recovery will be added in the next authentication update."
                            );
                          }}
                          className="text-[10px] text-white/30 transition-colors hover:text-violet-300"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="relative">

                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="h-[44px] w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 pr-14 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 hover:border-white/[0.14] focus:border-violet-400/50 focus:bg-white/[0.045] focus:ring-4 focus:ring-violet-500/[0.07]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold tracking-wider text-white/25 transition-colors hover:text-white/70"
                        >
                          {showPassword ? "HIDE" : "SHOW"}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="animate-[fadeIn_200ms_ease-out] rounded-xl border border-red-400/15 bg-red-400/[0.07] px-3.5 py-2.5 text-xs leading-5 text-red-300">
                        {error}
                      </div>
                    )}

                    {/* Sign in button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-violet-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {/* Button shine */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <span className="relative">

                        {loading ? (
                          <span className="flex items-center justify-center gap-2">

                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

                            Signing in...
                          </span>
                        ) : (
                          <>
                            Sign in

                            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  </form>

                  {/* =================================================
                      DIVIDER
                  ================================================= */}

                  <div className="my-5 flex items-center gap-3">

                    <div className="h-px flex-1 bg-white/[0.07]" />

                    <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                      New to NEXORA?
                    </span>

                    <div className="h-px flex-1 bg-white/[0.07]" />
                  </div>

                  {/* =================================================
                      REGISTER BUTTON
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="group/register relative w-full overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-xs font-medium text-white/55 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-500/[0.05] to-transparent transition-transform duration-700 group-hover/register:translate-x-full" />

                    <span className="relative">
                      Create a NEXORA account
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="mt-3 text-center text-[10px] text-white/20">
                © 2026 NEXORA · Built for the future of commerce
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* =========================================================
          GLOBAL ANIMATIONS
      ========================================================= */}

      <style jsx global>{`
        /* ---------------------------------------------------------
           Login headline
        --------------------------------------------------------- */

        @keyframes loginGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }

        .login-gradient-text {
          background: linear-gradient(
            90deg,
            #c4b5fd,
            #e9d5ff,
            #a5b4fc,
            #c4b5fd
          );
          background-size: 250% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: loginGradient 7s ease-in-out infinite;
        }

        /* ---------------------------------------------------------
           Ambient background
        --------------------------------------------------------- */

        @keyframes floatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(30px, -20px, 0) scale(1.05);
          }
        }

        @keyframes floatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-25px, 25px, 0);
          }
        }

        @keyframes floatThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(15px, 15px, 0) scale(0.95);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ambient-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          pointer-events: none;
        }

        .ambient-orb-one {
          width: 360px;
          height: 360px;
          left: -100px;
          top: 15%;
          background: rgba(124, 58, 237, 0.11);
          animation: floatOne 12s ease-in-out infinite;
        }

        .ambient-orb-two {
          width: 320px;
          height: 320px;
          right: -80px;
          top: 5%;
          background: rgba(79, 70, 229, 0.09);
          animation: floatTwo 15s ease-in-out infinite;
        }

        .ambient-orb-three {
          width: 280px;
          height: 280px;
          right: 25%;
          bottom: -140px;
          background: rgba(168, 85, 247, 0.07);
          animation: floatThree 17s ease-in-out infinite;
        }

        /* ---------------------------------------------------------
           Reduced motion
        --------------------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .login-gradient-text {
            animation: none !important;
          }

          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =============================================================
   FEATURE COMPONENT
============================================================= */

function MiniFeature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/[0.07] text-[9px] text-violet-300">
        ✓
      </span>

      {label}
    </div>
  );
}