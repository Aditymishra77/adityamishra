"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

interface AuthResponse {
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("architect@enterprise.dev");
  const [password, setPassword] = useState("secret123");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, fullName: "Enterprise Architect" };

      const response = await apiRequest<AuthResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("access_token", response.token);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-16">
      <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Auth Module</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{mode === "login" ? "Sign in" : "Register"}</h1>
        </div>

        <label className="block text-sm text-zinc-200">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>

        <label className="block text-sm text-zinc-200">
          Password
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button type="submit" className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
        >
          Switch to {mode === "login" ? "register" : "login"}
        </button>
      </form>
    </main>
  );
}
