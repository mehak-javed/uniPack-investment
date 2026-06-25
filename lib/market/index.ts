import { cached } from "@/lib/cache";
import { finnhub } from "./finnhub";
import { getCandlesYahoo } from "./history";
import { mock, mockCandles } from "./mock";
import type { Candle, CompanyProfile, NewsItem, Quote, SymbolMatch } from "./types";

export type { Candle, CompanyProfile, NewsItem, Quote, SymbolMatch } from "./types";

/** True when a Finnhub key is configured; the UI uses this to show LIVE vs DEMO. */
export const hasLiveData = Boolean(process.env.FINNHUB_API_KEY?.trim());

async function withFallback<T>(
  label: string,
  live: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (!hasLiveData) return fallback();
  try {
    return await live();
  } catch (err) {
    console.error(`[market] live ${label} failed, using mock:`, err);
    return fallback();
  }
}

export function getQuote(symbol: string): Promise<Quote> {
  const s = symbol.toUpperCase();
  return cached(`quote:${s}`, 15_000, () =>
    withFallback("quote", () => finnhub.getQuote(s), () => mock.getQuote(s)),
  );
}

export function getQuotes(symbols: string[]): Promise<Quote[]> {
  return Promise.all(symbols.map((s) => getQuote(s)));
}

export function searchSymbols(query: string): Promise<SymbolMatch[]> {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  return cached(`search:${q.toLowerCase()}`, 60_000, () =>
    withFallback("search", () => finnhub.searchSymbols(q), () => mock.searchSymbols(q)),
  );
}

export function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const s = symbol.toUpperCase();
  return cached(`profile:${s}`, 60 * 60_000, () =>
    withFallback("profile", () => finnhub.getCompanyProfile(s), () => mock.getCompanyProfile(s)),
  );
}

export function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  const s = symbol.toUpperCase();
  return cached(`news:${s}`, 5 * 60_000, () =>
    withFallback("company-news", () => finnhub.getCompanyNews(s), () => mock.getCompanyNews(s)),
  );
}

export function getMarketNews(): Promise<NewsItem[]> {
  return cached(`news:market`, 5 * 60_000, () =>
    withFallback("market-news", () => finnhub.getMarketNews(), () => mock.getMarketNews()),
  );
}

/** Daily price history (Stooq is free + keyless, so we try it regardless of the
 *  Finnhub key; falls back to deterministic candles if unavailable). */
export function getCandles(symbol: string): Promise<Candle[]> {
  const s = symbol.toUpperCase();
  return cached(`candles:${s}`, 60 * 60_000, async () => {
    try {
      return await getCandlesYahoo(s);
    } catch (err) {
      console.error(`[market] candles failed for ${s}, using mock:`, err);
      return mockCandles(s);
    }
  });
}

/** A small universe of liquid names used to compute dashboard movers. */
const MOVERS_UNIVERSE = [
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA",
  "AMD", "NFLX", "INTC", "CRM", "AVGO", "QCOM", "DIS",
];

export async function getMovers(): Promise<{ gainers: Quote[]; losers: Quote[] }> {
  const quotes = await getQuotes(MOVERS_UNIVERSE);
  const sorted = [...quotes].sort((a, b) => b.changePct - a.changePct);
  return {
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  };
}
