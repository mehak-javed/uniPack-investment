import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/upgrade-button";
import { getPlan } from "@/lib/account";
import { cn } from "@/lib/utils";

const FREE = ["Live stock prices & charts", "Search any stock", "Market news & movers"];
const PRO = [
  "Everything in Free",
  "Save unlimited stocks to your watchlist",
  "Your watchlist synced to your account",
];

export default async function PricingPage() {
  const plan = await getPlan(); // null = signed out
  const isPro = plan === "pro";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Simple pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Start free. Upgrade to save stocks to your watchlist.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {/* Free */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Free</h2>
            {plan === "free" && <Badge className="bg-muted text-muted-foreground">Current</Badge>}
          </div>
          <div className="mt-2 text-3xl font-semibold">
            $0<span className="text-base font-normal text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-5 space-y-2.5 text-sm">
            {FREE.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <div className="mt-6">
            {plan ? (
              <Button variant="outline" className="w-full" disabled>
                {plan === "free" ? "Your current plan" : "Included"}
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Get started
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Pro */}
        <Card className={cn("relative p-6", !isPro && "border-primary")}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pro</h2>
            <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
          </div>
          <div className="mt-2 text-3xl font-semibold">
            $20<span className="text-base font-normal text-muted-foreground">/mo</span>
          </div>
          <ul className="mt-5 space-y-2.5 text-sm">
            {PRO.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <div className="mt-6">
            {isPro ? (
              <Button className="w-full" disabled>
                ✓ Your current plan
              </Button>
            ) : (
              <UpgradeButton />
            )}
          </div>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Test mode — use card <span className="font-mono">4242 4242 4242 4242</span>, any future
        expiry, any CVC, any ZIP.
      </p>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
      <span>{children}</span>
    </li>
  );
}
