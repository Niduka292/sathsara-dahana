"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResultsPasswordGate() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/results/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        // Full reload so the server lets the unlocked request through
        window.location.href = "/results";
        return;
      }
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message ?? "Incorrect password. Please try again.");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-14 w-full max-w-md rounded-3xl border border-blue-400/15 bg-[#060b1d]/70 p-7 shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur-md sm:p-9"
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <Lock aria-hidden="true" className="h-6 w-6" />
        </span>
        <p className="font-cinzel text-sm uppercase tracking-[0.3em] text-white/80">Results Locked</p>
        <p className="mt-3 text-sm leading-6 text-blue-100/50">Enter the password to view the selection results.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="results-password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <input
            id="results-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="current-password"
            autoFocus
            placeholder="Password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "results-password-error" : undefined}
            className="w-full rounded-xl border border-blue-400/20 bg-[#02040d]/80 px-4 py-3 pr-12 text-white placeholder:text-blue-100/30 outline-none transition-colors focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-blue-100/40 transition-colors hover:text-blue-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p id="results-password-error" role="alert" className="text-sm text-red-300/90">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!password || submitting}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-cinzel text-sm uppercase tracking-[0.25em] text-white shadow-[0_0_24px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Unlocking…" : "Unlock"}
        </button>
      </form>
    </motion.div>
  );
}
