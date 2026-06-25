import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

/** Current authed user (or null). */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The signed-in user's plan, or null if signed out. */
export async function getPlan(): Promise<Plan | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  return (data?.plan as Plan) ?? "free";
}

/** Symbols on the signed-in user's watchlist (empty if signed out). */
export async function getWatchlistSymbols(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("watchlist")
    .select("symbol")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => r.symbol as string);
}
