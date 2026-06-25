import { NextResponse } from "next/server";
import { getProPriceId, getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/** POST /api/checkout → { url } : creates a Stripe Checkout Session for Pro. */
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Billing isn't configured yet (STRIPE_SECRET_KEY missing)." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first.", code: "auth" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const price = await getProPriceId();
    // Derive the origin from the request so checkout redirects work on any
    // deployed domain; fall back to an explicit env var, then localhost.
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3100";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
