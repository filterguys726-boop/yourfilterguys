"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
  nextUrl?: string;
};

function hasClientSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function AuthForm({ mode, nextUrl = "/account" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const configured = hasClientSupabaseEnv();
  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
      setError("Add Supabase environment variables to enable authentication.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabase();
      const result = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              },
              emailRedirectTo: `${window.location.origin}/account`
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        throw result.error;
      }

      if (isSignup && !result.data.session) {
        setMessage("Check your email to confirm your account.");
        return;
      }

      window.location.assign(nextUrl);
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!configured) {
      setError("Add Supabase environment variables to enable password reset.");
      return;
    }

    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/account/profile`
        }
      );

      if (resetError) {
        throw resetError;
      }

      setMessage("Password reset email sent.");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="surface mx-auto max-w-md p-6" onSubmit={submit}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-ink text-white">
          {isSignup ? (
            <UserPlus aria-hidden className="h-5 w-5" />
          ) : (
            <LogIn aria-hidden className="h-5 w-5" />
          )}
        </span>
        <div>
          <h1 className="text-2xl font-black text-ink">
            {isSignup ? "Create account" : "Log in"}
          </h1>
          <p className="text-sm text-slate-600">
            {isSignup
              ? "Track orders and claim past purchases."
              : "Access your order history and profile."}
          </p>
        </div>
      </div>

      {!configured ? (
        <p className="mt-5 rounded-md bg-orange-50 p-3 text-sm font-semibold text-shopred">
          Supabase Auth is not configured yet. Add the public Supabase URL and
          anon key to `.env.local`.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {isSignup ? (
          <label className="grid gap-2">
            <span className="label">Full name</span>
            <input
              className="field"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
            />
          </label>
        ) : null}
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input
            className="field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="label">Password</span>
          <span className="relative">
            <input
              className="field pr-12"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink focus-ring"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff aria-hidden className="h-4 w-4" />
              ) : (
                <Eye aria-hidden className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-orange-50 p-3 text-sm font-semibold text-shopred">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-semibold text-bay">
          {message}
        </p>
      ) : null}

      <button className="button-primary mt-6 w-full" type="submit" disabled={loading}>
        {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
        {isSignup ? "Create account" : "Log in"}
      </button>

      {!isSignup ? (
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-electric hover:bg-blue-50"
          onClick={resetPassword}
          disabled={loading}
        >
          <Mail aria-hidden className="h-4 w-4" />
          Send password reset
        </button>
      ) : null}

      <p className="mt-5 text-center text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "New customer?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-bold text-electric"
        >
          {isSignup ? "Log in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
