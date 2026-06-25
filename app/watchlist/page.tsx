import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist-button";
import { getPlan, getSessionUser, getWatchlistSymbols } from "@/lib/account";
import { getQuotes } from "@/lib/market";
import { cn } from "@/lib/utils";
import { formatPercent, formatPrice, signClass } from "@/lib/format";

export default async function WatchlistPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="p-8 text-center">
          <Star className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold">Your watchlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view and manage the stocks you&apos;re watching.
          </p>
          <Link href="/login" className="mt-5 inline-block">
            <Button>Sign in</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const [symbols, plan] = await Promise.all([getWatchlistSymbols(), getPlan()]);
  const quotes = symbols.length ? await getQuotes(symbols) : [];
  const bySymbol = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

  return (
    <div className="mx-auto max-w-[1000px] space-y-5 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Watchlist</h1>
        <Badge
          className={cn(
            plan === "pro"
              ? "bg-positive-bg text-positive"
              : "bg-muted text-muted-foreground",
          )}
        >
          {plan === "pro" ? "Pro" : "Free"} plan
        </Badge>
      </div>

      {plan !== "pro" && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-primary p-4">
          <div className="text-sm">
            <span className="font-medium">Saving stocks is a Pro feature.</span>{" "}
            <span className="text-muted-foreground">
              Upgrade to add stocks to your watchlist.
            </span>
          </div>
          <Link href="/pricing">
            <Button size="sm">Upgrade — $20/mo</Button>
          </Link>
        </Card>
      )}

      {symbols.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {plan === "pro"
              ? "No stocks yet. Search for a ticker and tap Watchlist to add it."
              : "Upgrade to Pro to start building your watchlist."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Change</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => {
                const q = bySymbol[sym];
                return (
                  <tr key={sym} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/stocks/${sym}`} className="font-semibold hover:underline">
                        {sym}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {q ? formatPrice(q.price) : "—"}
                    </td>
                    <td className={cn("px-4 py-3 font-medium tabular-nums", q && signClass(q.change))}>
                      {q ? formatPercent(q.changePct) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <WatchlistButton symbol={sym} initialWatched size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
