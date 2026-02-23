"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (mode === "signup") {
      const name = String(formData.get("name") ?? "").trim();
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create account");
        setLoading(false);
        return;
      }
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (loginResult?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="text-2xl font-semibold text-slate-900">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <p className="mt-2 text-sm text-slate-600">Trip planning and budget tracking in one place.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <div>
            <label className="mb-1 block text-sm text-slate-700">Name</label>
            <input name="name" required className="input" />
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm text-slate-700">Email</label>
          <input name="email" type="email" required className="input" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Password</label>
          <input name="password" type="password" minLength={6} required className="input" />
        </div>

        {error ? <p className="rounded-xl bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        <button disabled={loading} className="btn-primary w-full" type="submit">
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}