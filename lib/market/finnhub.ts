import type {
  CompanyProfile,
  MarketProvider,
  NewsItem,
  Quote,
  SymbolMatch,
} from "./types";

const BASE = "https://finnhub.io/api/v1";

function token(): string {
  const t = process.env.FINNHUB_API_KEY;
  if (!t) throw new Error("FINNHUB_API_KEY is not set");
  return t.trim();
}

async function get<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}token=${token()}`, {
    cache: "no-store",
  });
  if (res.status === 429) throw new Error("Finnhub rate limit hit (429)");
  if (!res.ok) throw new Error(`Finnhub ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type FinnhubQuote = {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
};
type FinnhubSearch = {
  result: { symbol: string; description: string; type: string }[];
};
type FinnhubProfile = {
  name?: string;
  ticker?: string;
  exchange?: string;
  logo?: string;
  marketCapitalization?: number; // in millions
  finnhubIndustry?: string;
  country?: string;
  currency?: string;
  weburl?: string;
};
type FinnhubNews = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
};

export const finnhub: MarketProvider = {
  async getQuote(symbol: string): Promise<Quote> {
    const d = await get<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!d || !d.c) throw new Error(`No quote for ${symbol}`);
    return {
      symbol,
      price: d.c,
      change: d.d ?? 0,
      changePct: d.dp ?? 0,
      open: d.o || d.c,
      high: d.h || d.c,
      low: d.l || d.c,
      prevClose: d.pc || d.c,
    };
  },

  async searchSymbols(query: string): Promise<SymbolMatch[]> {
    const d = await get<FinnhubSearch>(`/search?q=${encodeURIComponent(query)}`);
    return (d.result ?? [])
      .filter((r) => r.type === "Common Stock" || r.type === "")
      .slice(0, 10)
      .map((r) => ({ symbol: r.symbol, description: r.description, type: r.type }));
  },

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const d = await get<FinnhubProfile>(
      `/stock/profile2?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!d || !d.name) throw new Error(`No profile for ${symbol}`);
    return {
      symbol,
      name: d.name,
      exchange: d.exchange ?? "",
      logo: d.logo ?? "",
      marketCap: (d.marketCapitalization ?? 0) * 1_000_000,
      industry: d.finnhubIndustry ?? "",
      country: d.country ?? "",
      currency: d.currency ?? "USD",
      weburl: d.weburl ?? "",
    };
  },

  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    const to = new Date();
    const from = new Date(to.getTime() - 14 * 24 * 60 * 60 * 1000);
    const d = await get<FinnhubNews[]>(
      `/company-news?symbol=${encodeURIComponent(symbol)}&from=${ymd(from)}&to=${ymd(to)}`,
    );
    return (d ?? []).filter((n) => n.headline).slice(0, 12);
  },

  async getMarketNews(): Promise<NewsItem[]> {
    const d = await get<FinnhubNews[]>(`/news?category=general`);
    return (d ?? []).filter((n) => n.headline).slice(0, 12);
  },
};
