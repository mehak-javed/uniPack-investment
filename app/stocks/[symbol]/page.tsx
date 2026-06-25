import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/watchlist-button";
import { cn } from "@/lib/utils";
import {
  formatCompact,
  formatPercent,
  formatPrice,
  formatSignedPrice,
  formatTimeAgo,
  signClass,
} from "@/lib/format";
import {
  getCompanyNews,
  getCompanyProfile,
  getQuote,
  hasLiveData,
} from "@/lib/market";
import { getWatchlistSymbols } from "@/lib/account";

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const sym = decodeURIComponent(symbol).toUpperCase();

  const [quote, profile, news, watched] = await Promise.all([
    getQuote(sym),
    getCompanyProfile(sym),
    getCompanyNews(sym),
    getWatchlistSymbols(),
  ]);
  const isWatched = watched.includes(sym);

  const rangePct =
    quote.high > quote.low
      ? ((quote.price - quote.low) / (quote.high - quote.low)) * 100
      : 50;

  const stats: { label: string; value: string }[] = [
    { label: "Open", value: formatPrice(quote.open) },
    { label: "High", value: formatPrice(quote.high) },
    { label: "Low", value: formatPrice(quote.low) },
    { label: "Prev Close", value: formatPrice(quote.prevClose) },
    {
      label: "Market Cap",
      value: profile.marketCap ? `$${formatCompact(profile.marketCap)}` : "—",
    },
    { label: "Industry", value: profile.industry || "—" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logo}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg bg-white object-contain p-1"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-card-elevated text-lg font-bold text-primary">
                {sym.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                {profile.name}
              </h1>
              <div className="text-sm text-muted-foreground">
                {sym} · {profile.exchange || "—"}
              </div>
            </div>
          </div>

          <WatchlistButton symbol={sym} initialWatched={isWatched} />
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="text-4xl font-semibold tabular-nums">
            {formatPrice(quote.price)}
          </span>
          {hasLiveData ? (
            <Badge className="mb-1 bg-positive-bg text-positive">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
              LIVE
            </Badge>
          ) : (
            <Badge className="mb-1 bg-muted text-muted-foreground">DEMO</Badge>
          )}
          <span
            className={cn(
              "mb-1 text-base font-medium tabular-nums",
              signClass(quote.change),
            )}
          >
            {formatSignedPrice(quote.change)} ({formatPercent(quote.changePct)})
          </span>
        </div>

        {/* Day range */}
        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Day Low {formatPrice(quote.low)}</span>
            <span>Day High {formatPrice(quote.high)}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-muted">
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
              style={{ left: `calc(${Math.max(0, Math.min(100, rangePct))}% - 6px)` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-card p-3">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 font-medium tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Latest news</h2>
          {news.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent news.</p>
          ) : (
            <ul className="divide-y divide-border">
              {news.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 py-3 hover:opacity-80"
                  >
                    {n.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.image}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded-md object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-sm font-medium">
                        {n.headline}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {n.source} · {formatTimeAgo(n.datetime)}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">About</h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Exchange" value={profile.exchange || "—"} />
            <Row label="Industry" value={profile.industry || "—"} />
            <Row label="Country" value={profile.country || "—"} />
            <Row label="Currency" value={profile.currency || "—"} />
            <Row
              label="Market Cap"
              value={profile.marketCap ? `$${formatCompact(profile.marketCap)}` : "—"}
            />
          </dl>
          {profile.weburl && profile.weburl !== "#" && (
            <a
              href={profile.weburl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
