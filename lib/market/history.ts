import type { Candle } from "./types";

/** Free, keyless daily price history from Yahoo Finance's chart API.
 *  Finnhub's free tier doesn't include candles, so we use this for the chart. */

type YahooChart = {
  chart?: {
    result?: {
      timestamp?: number[];
      indicators?: {
        quote?: {
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
        }[];
      };
    }[];
  };
};

export async function getCandlesYahoo(
  symbol: string,
  range = "6mo",
  interval = "1d",
): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?range=${range}&interval=${interval}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }, // Yahoo rate-limits requests with no UA
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol} failed: ${res.status}`);

  const json = (await res.json()) as YahooChart;
  const result = json.chart?.result?.[0];
  const t = result?.timestamp;
  const q = result?.indicators?.quote?.[0];
  if (!t || !q || !q.close) throw new Error("Yahoo returned no usable data");

  const out: Candle[] = [];
  for (let i = 0; i < t.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close[i];
    if (o == null || h == null || l == null || c == null) continue;
    out.push({
      date: new Date(t[i] * 1000).toISOString().slice(0, 10),
      o,
      h,
      l,
      c,
    });
  }
  if (out.length === 0) throw new Error("Yahoo returned empty series");
  return out;
}
