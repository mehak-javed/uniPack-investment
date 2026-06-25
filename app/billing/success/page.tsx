import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let ok = false;
  let message = "We couldn't confirm your payment.";

  if (session_id && process.env.STRIPE_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const userId = session.client_reference_id || session.metadata?.user_id;
      if ((session.payment_status === "paid" || session.status === "complete") && userId) {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({
            plan: "pro",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
            subscription_status: "active",
          })
          .eq("id", userId);
        ok = true;
        message = "Your Pro subscription is active. You can now save stocks to your watchlist.";
      }
    } catch (err) {
      console.error("[billing/success]", err);
      message = "Something went wrong confirming your subscription.";
    }
  } else if (!session_id) {
    message = "Missing checkout session.";
  } else {
    message = "Billing isn't fully configured (missing Stripe or Supabase service-role key).";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8 text-center">
        {ok ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-positive" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-negative" />
        )}
        <h1 className="mt-4 text-xl font-semibold">
          {ok ? "Welcome to Pro 🎉" : "Payment not confirmed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/watchlist">
            <Button>Go to watchlist</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">Pricing</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
