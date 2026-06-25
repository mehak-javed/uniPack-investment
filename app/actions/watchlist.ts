"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WatchResult =
  | { ok: true }
  | { needsAuth: true }
  | { needsUpgrade: true }
  | { error: string };

export async function addToWatchlist(symbol: string): Promise<WatchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  // Gate: saving to the watchlist is a Pro feature.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (profile?.plan !== "pro") return { needsUpgrade: true };

  const { error } = await supabase
    .from("watchlist")
    .insert({ user_id: user.id, symbol: symbol.toUpperCase() });
  // Ignore unique-violation (already saved)
  if (error && error.code !== "23505") return { error: error.message };

  revalidatePath("/watchlist");
  revalidatePath("/");
  return { ok: true };
}

export async function removeFromWatchlist(symbol: string): Promise<WatchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.id)
    .eq("symbol", symbol.toUpperCase());
  if (error) return { error: error.message };

  revalidatePath("/watchlist");
  revalidatePath("/");
  return { ok: true };
}
