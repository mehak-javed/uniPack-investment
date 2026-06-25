"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate, type AuthState } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    authenticate,
    null,
  );

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Link href="/" className="mb-6 text-sm text-muted-foreground hover:text-foreground">
        ← Back to uniPACK
      </Link>
      <Card className="p-6">
        <h1 className="text-xl font-semibold">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Welcome back — sign in to access your watchlist."
            : "Sign up to start tracking stocks."}
        </p>

        <form action={action} className="mt-5 space-y-3">
          <input type="hidden" name="intent" value={mode} />
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          {state?.error && <p className="text-sm text-negative">{state.error}</p>}
          {state?.message && <p className="text-sm text-positive">{state.message}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </Card>
    </div>
  );
}
