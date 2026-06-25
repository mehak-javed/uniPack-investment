"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | null;

export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "signin");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();

  if (intent === "signup") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.session) {
      return { message: "Account created. Check your email to confirm, then sign in." };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  }

  redirect("/watchlist");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
