/** Presentation helpers for prices, percentages and large numbers. */

export function formatPrice(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Signed currency, e.g. "+$12.40" / "-$3.10". */
export function formatSignedPrice(value: number, currency = "USD"): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatPrice(Math.abs(value), currency)}`;
}

/** Signed percentage, e.g. "+1.24%" / "−0.50%". */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

/** Compact large numbers for market cap / volume, e.g. "2.94T", "1.2B". */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

/** Tailwind text-color class for a gain/loss value. */
export function signClass(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-muted-foreground";
}

/** Relative time from a unix-seconds timestamp, e.g. "3h ago". */
export function formatTimeAgo(unixSeconds: number): string {
  const diff = Date.now() / 1000 - unixSeconds;
  if (diff < 60) return "just now";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
