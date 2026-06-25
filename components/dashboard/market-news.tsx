import { Card } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/format";
import type { NewsItem } from "@/lib/market/types";

export function MarketNews({
  items,
  limit = 8,
  title = "Market News",
}: {
  items: NewsItem[];
  limit?: number;
  title?: string;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No news available.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.slice(0, limit).map((n) => (
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
                    className="h-12 w-16 shrink-0 rounded object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="line-clamp-2 text-sm font-medium">{n.headline}</div>
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
  );
}
