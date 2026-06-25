import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist-button";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { MoversTable } from "@/components/dashboard/movers-table";
import { MarketNews } from "@/components/dashboard/market-news";
import { cn } from "@/lib/utils";
import { formatPercent, formatPrice, formatSignedPrice, signClass } from "@/lib/format";
import {
  getCandles,
  getCompanyProfile,
  getMarketNews,
  getMovers,
  getQuote,
  getQuotes,
  hasLiveData,
} from "@/lib/market";
import type { Candle, CompanyProfile, Quote } from "@/lib/market";
import { getWatchlistSymbols } from "@/lib/account";

const FEATURED = "NVDA";
const INDICES = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq 100" },
  { symbol: "DIA", label: "Dow 30" },
];

export default async function DashboardPage() {
  const [quote, profile, candles, indices, movers, news, watched] =
    await Promise.all([
      getQuote(FEATURED),
      getCompanyProfile(FEATURED),
      getCandles(FEATURED),
      getQuotes(INDICES.map((i) => i.symbol)),
      getMovers(),
      getMarketNews(),
      getWatchlistSymbols(),
    ]);
  const isWatched = watched.includes(quote.symbol);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {indices.map((q, i) => (
          <IndexCard key={q.symbol} label={INDICES[i].label} quote={q} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SpotlightBar quote={quote} profile={profile} />
          <ChartCard
            quote={quote}
            candles={candles}
            live={hasLiveData}
            watched={isWatched}
          />
        </div>
        <MarketNews items={news} />
      </div>

      <MoversTable gainers={movers.gainers} losers={movers.losers} />
    </div>
  );
}

function IndexCard({ label, quote }: { label: string; quote: Quote }) {
  const up = quote.change >= 0;
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{formatPrice(quote.price)}</div>
      </div>
      <div
        className={cn(
          "flex items-center gap-1 text-sm font-medium tabular-nums",
          signClass(quote.change),
        )}
      >
        {up ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        {formatPercent(quote.changePct)}
      </div>
    </Card>
  );
}

function SpotlightBar({ quote, profile }: { quote: Quote; profile: CompanyProfile }) {
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
      <Link href={`/stocks/${quote.symbol}`} className="flex items-center gap-3">
        {profile.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logo}
            alt=""
            className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
          />
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-card-elevated text-sm font-bold text-primary">
            {quote.symbol.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold leading-tight hover:underline">
            {profile.name}{" "}
            <span className="text-muted-foreground">({quote.symbol})</span>
          </div>
          <div className="text-xs text-muted-foreground">{profile.exchange || "—"}</div>
        </div>
      </Link>
      <Badge className="bg-muted text-muted-foreground">1D</Badge>
      <div className="ml-auto flex items-center gap-4 text-sm tabular-nums">
        <Ohlc label="O" value={quote.open} />
        <Ohlc label="H" value={quote.high} tone="text-positive" />
        <Ohlc label="L" value={quote.low} tone="text-negative" />
        <Ohlc label="C" value={quote.price} />
        <span className="text-muted-foreground">
          Prev <span className="text-foreground">{quote.prevClose.toFixed(2)}</span>
        </span>
      </div>
    </Card>
  );
}

function Ohlc({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <span className="text-muted-foreground">
      {label} <span className={cn("text-foreground", tone)}>{value.toFixed(2)}</span>
    </span>
  );
}

function ChartCard({
  quote,
  candles,
  live,
  watched,
}: {
  quote: Quote;
  candles: Candle[];
  live: boolean;
  watched: boolean;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold tabular-nums">
              {formatPrice(quote.price)}
            </span>
            {live ? (
              <Badge className="bg-positive-bg text-positive">
                <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
                LIVE
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground">DEMO</Badge>
            )}
          </div>
          <div
            className={cn(
              "mt-1 text-sm font-medium tabular-nums",
              signClass(quote.change),
            )}
          >
            {formatSignedPrice(quote.change)} ({formatPercent(quote.changePct)})
          </div>
        </div>
        <WatchlistButton symbol={quote.symbol} initialWatched={watched} />
      </div>
      <CandlestickChart
        candles={candles}
        lastPrice={quote.price}
        labels={monthLabels(candles)}
        className="mt-4"
      />
    </Card>
  );
}

/** Distinct month abbreviations across the candle series, for the x-axis. */
function monthLabels(candles: Candle[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const c of candles) {
    const key = c.date.slice(0, 7);
    if (!seen.has(key)) {
      seen.add(key);
      labels.push(
        new Date(`${c.date}T00:00:00`).toLocaleDateString("en-US", { month: "short" }),
      );
    }
  }
  return labels;
}
