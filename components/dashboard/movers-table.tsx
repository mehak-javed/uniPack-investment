import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPercent, formatPrice, signClass } from "@/lib/format";
import type { Quote } from "@/lib/market/types";

export function MoversTable({
  gainers,
  losers,
}: {
  gainers: Quote[];
  losers: Quote[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <h2 className="text-base font-semibold">Market Movers</h2>
        <span className="text-xs text-muted-foreground">
          Top gainers &amp; losers today
        </span>
      </div>
      <div className="grid divide-border md:grid-cols-2 md:divide-x">
        <MoverList title="Gainers" quotes={gainers} />
        <MoverList title="Losers" quotes={losers} />
      </div>
    </Card>
  );
}

function MoverList({ title, quotes }: { title: string; quotes: Quote[] }) {
  return (
    <div>
      <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <ul>
        {quotes.map((q) => (
          <li key={q.symbol} className="border-t border-border first:border-t-0">
            <Link
              href={`/stocks/${q.symbol}`}
              className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/50"
            >
              <span className="font-semibold">{q.symbol}</span>
              <span className="flex items-center gap-4 tabular-nums">
                <span>{formatPrice(q.price)}</span>
                <span
                  className={cn(
                    "w-20 text-right text-sm font-medium",
                    signClass(q.change),
                  )}
                >
                  {formatPercent(q.changePct)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
