"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const headlineWords = [
  "reimagined.",
  "elevated.",
  "curated.",
  "effortless.",
];

export default function RegisterPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Headline animation */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsChanging(true);

      window.setTimeout(() => {
        setHeadlineIndex((current) => {
          return (current + 1) % headlineWords.length;
        });

        setIsChanging(false);
      }, 450);
    }, 3500);

    return () => {
      window.clearInterval(interval);
    };
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

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(form.password);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070709] text-white selection:bg-violet-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.09),transparent_38%)]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-4 sm:px-8 lg:px-12">
        {/* Header */}
        <header
          className={`flex items-center justify-between transition-all duration-700 ${
            mounted
              ? "translate-y-0 opacity-100"
              : "-translate-y-3 opacity-0"
          }`}
        >
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

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-white/60 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            Sign in
          </button>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-3 lg:py-1">
          <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            {/* Left brand section */}
            <section
              className={`hidden lg:block transition-all duration-1000 ${
                mounted
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <div className="max-w-xl">
                {/* Brand badge */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45 backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

                  The next generation marketplace
                </div>

                {/* Animated headline */}
                <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] xl:text-[62px]">
                  Shopping,
                  <br />

                  <span className="relative block h-[1.08em] overflow-hidden">
                    <span
                      key={headlineIndex}
                      className={`absolute left-0 top-0 block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent ${
                        isChanging
                          ? "headline-word-out"
                          : "headline-word-in"
                      }`}
                    >
                      {headlineWords[headlineIndex]}
                    </span>
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-md text-[15px] leading-7 text-white/40">
                  Discover exceptional products from trusted sellers through a
                  marketplace designed to make every purchase feel effortless.
                </p>

                {/* Features */}
                <div className="mt-7 flex items-center gap-6 text-xs text-white/35">
                  <MiniFeature label="Secure" />
                  <MiniFeature label="Curated" />
                  <MiniFeature label="Simple" />
                </div>
              </div>
            </section>

            {/* Registration card */}
            <section
              className={`mx-auto w-full max-w-[500px] transition-all duration-1000 ${
                mounted
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-[0.98] opacity-0"
              }`}
            >
              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#0d0d10]/90 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7">
                {/* Card glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/[0.08] blur-3xl" />

                <div className="relative">
                  {/* Card heading */}
                  <div className="mb-5">
                    <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-violet-400">
                      WELCOME TO NEXORA
                    </p>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-[26px]">
                          Create your account
                        </h2>

                        <p className="mt-1.5 text-sm text-white/35">
                          A better shopping experience starts here.
                        </p>
                      </div>

                      {/* Animated card logo */}
                      <div className="group/logo relative hidden h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] text-sm font-black transition-all duration-500 hover:scale-105 hover:border-violet-400/30 hover:bg-violet-500/[0.06] hover:shadow-[0_0_24px_rgba(124,58,237,0.22)] sm:flex">
                        {/* Soft glow */}
                        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-indigo-500/0 opacity-0 blur-md transition-all duration-500 group-hover/logo:from-violet-500/20 group-hover/logo:via-fuchsia-500/10 group-hover/logo:to-indigo-500/20 group-hover/logo:opacity-100" />

                        {/* Light sweep */}
                        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover/logo:left-[130%]" />

                        {/* N */}
                        <span className="relative z-10 bg-white text-transparent bg-clip-text transition-all duration-500 group-hover/logo:bg-gradient-to-br group-hover/logo:from-violet-400 group-hover/logo:via-fuchsia-400 group-hover/logo:to-indigo-400 group-hover/logo:drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]">
                          N
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <Input
                      label="Full name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                    />

                    <Input
                      label="Email address"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <PasswordInput
                        label="Password"
                        name="password"
                        placeholder="8+ characters"
                        value={form.password}
                        onChange={handleChange}
                        visible={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                      />

                      <PasswordInput
                        label="Confirm"
                        name="confirmPassword"
                        placeholder="Repeat password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        visible={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword((v) => !v)
                        }
                      />
                    </div>

                    {/* Password strength */}
                    {form.password && (
                      <div className="animate-[fadeIn_250ms_ease-out]">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-white/25">
                            Password strength
                          </span>

                          <span
                            className={`text-[10px] font-medium ${strength.textColor}`}
                          >
                            {strength.label}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                bar <= strength.score
                                  ? strength.barColor
                                  : "bg-white/[0.08]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl border border-red-400/15 bg-red-400/[0.07] px-3.5 py-2.5 text-xs text-red-300 animate-[fadeIn_200ms_ease-out]">
                        {error}
                      </div>
                    )}

                    {/* Terms */}
                    <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-5 text-white/30">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 h-3.5 w-3.5 shrink-0 accent-violet-500"
                      />

                      <span>
                        I agree to the{" "}
                        <span className="text-white/55 transition hover:text-white">
                          Terms
                        </span>{" "}
                        and{" "}
                        <span className="text-white/55 transition hover:text-white">
                          Privacy Policy
                        </span>
                        .
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-violet-600/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <span className="relative">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

                            Creating account...
                          </span>
                        ) : (
                          <>
                            Create account

                            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  </form>

                  {/* Login divider */}
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.07]" />

                    <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                      Already registered?
                    </span>

                    <div className="h-px flex-1 bg-white/[0.07]" />
                  </div>

                  {/* Login button */}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-xs font-medium text-white/55 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                  >
                    Sign in to NEXORA
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

      <style jsx global>{`
        /* ============================================
           HEADLINE ANIMATION
           ============================================ */

        @keyframes headlineIn {
          0% {
            opacity: 0;
            transform: translate3d(0, 28px, 0);
          }

          55% {
            opacity: 0.75;
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes headlineOut {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          100% {
            opacity: 0;
            transform: translate3d(0, -28px, 0);
          }
        }

        .headline-word-in {
          animation: headlineIn 450ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .headline-word-out {
          animation: headlineOut 450ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        /* ============================================
           BACKGROUND ANIMATION
           ============================================ */

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

        /* ============================================
           REDUCED MOTION
           ============================================ */

        @media (prefers-reduced-motion: reduce) {
          .ambient-orb {
            animation: none !important;
          }

          .headline-word-in,
          .headline-word-out {
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

/* ============================================
   INPUT
   ============================================ */

function Input({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-medium text-white/55"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === "name" ? "name" : "email"}
        className="h-[42px] w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 hover:border-white/[0.14] focus:border-violet-400/50 focus:bg-white/[0.045] focus:ring-4 focus:ring-violet-500/[0.07]"
      />
    </div>
  );
}

/* ============================================
   PASSWORD INPUT
   ============================================ */

function PasswordInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-medium text-white/55"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-[42px] w-full rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 hover:border-white/[0.14] focus:border-violet-400/50 focus:bg-white/[0.045] focus:ring-4 focus:ring-violet-500/[0.07]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold tracking-wider text-white/25 transition-colors hover:text-white/70"
        >
          {visible ? "HIDE" : "SHOW"}
        </button>
      </div>
    </div>
  );
}

/* ============================================
   FEATURE
   ============================================ */

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

/* ============================================
   PASSWORD STRENGTH
   ============================================ */

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      score,
      label: "Weak",
      barColor: "bg-red-400",
      textColor: "text-red-400",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Fair",
      barColor: "bg-amber-400",
      textColor: "text-amber-400",
    };
  }

  if (score === 3) {
    return {
      score,
      label: "Good",
      barColor: "bg-yellow-300",
      textColor: "text-yellow-300",
    };
  }

  return {
    score,
    label: "Strong",
    barColor: "bg-emerald-400",
    textColor: "text-emerald-400",
  };
}