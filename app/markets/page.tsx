import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MoversTable } from "@/components/dashboard/movers-table";
import { MarketNews } from "@/components/dashboard/market-news";
import { cn } from "@/lib/utils";
import { formatPercent, formatPrice, signClass } from "@/lib/format";
import { getMarketNews, getMovers, getQuotes } from "@/lib/market";

const INDICES = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq 100" },
  { symbol: "DIA", label: "Dow 30" },
];

export default async function MarketsPage() {
  const [indices, movers, news] = await Promise.all([
    getQuotes(INDICES.map((i) => i.symbol)),
    getMovers(),
    getMarketNews(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Markets</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {indices.map((q, i) => {
          const up = q.change >= 0;
          return (
            <Card key={q.symbol} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-muted-foreground">{INDICES[i].label}</div>
                <div className="text-xl font-semibold tabular-nums">{formatPrice(q.price)}</div>
              </div>
              <div className={cn("flex items-center gap-1 text-sm font-medium tabular-nums", signClass(q.change))}>
                {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {formatPercent(q.changePct)}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoversTable gainers={movers.gainers} losers={movers.losers} />
        </div>
        <MarketNews items={news} />
      </div>
    </div>
  );
}
