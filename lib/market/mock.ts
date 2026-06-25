import type {
  Candle,
  CompanyProfile,
  MarketProvider,
  NewsItem,
  Quote,
  SymbolMatch,
} from "./types";

/** Deterministic fallback used when FINNHUB_API_KEY is absent or a live call
 *  fails. Values are stable per symbol so the UI looks consistent. */

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function makeRng(seed: number) {
  let s = (seed || 1) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SEED: Record<string, Quote> = {
  NVDA: { symbol: "NVDA", price: 190.53, change: 1.92, changePct: 1.02, open: 188.61, high: 191.8, low: 187.4, prevClose: 188.61 },
  AAPL: { symbol: "AAPL", price: 229.87, change: 1.34, changePct: 0.59, open: 228.9, high: 230.5, low: 228.1, prevClose: 228.53 },
  MSFT: { symbol: "MSFT", price: 468.35, change: -2.1, changePct: -0.45, open: 470.0, high: 471.2, low: 466.9, prevClose: 470.45 },
  TSLA: { symbol: "TSLA", price: 352.18, change: -5.4, changePct: -1.51, open: 357.0, high: 358.4, low: 350.2, prevClose: 357.58 },
  AMD: { symbol: "AMD", price: 178.42, change: 2.6, changePct: 1.48, open: 176.1, high: 179.0, low: 175.8, prevClose: 175.82 },
  SPY: { symbol: "SPY", price: 612.44, change: 3.1, changePct: 0.51, open: 610.0, high: 613.2, low: 609.4, prevClose: 609.34 },
  QQQ: { symbol: "QQQ", price: 548.9, change: 2.7, changePct: 0.49, open: 546.8, high: 549.5, low: 545.9, prevClose: 546.2 },
  DIA: { symbol: "DIA", price: 451.2, change: -0.8, changePct: -0.18, open: 452.1, high: 452.8, low: 450.6, prevClose: 452.0 },
};

const NAMES: Record<string, string> = {
  NVDA: "NVIDIA Corporation",
  AAPL: "Apple Inc",
  MSFT: "Microsoft Corporation",
  TSLA: "Tesla Inc",
  AMD: "Advanced Micro Devices Inc",
  AMZN: "Amazon.com Inc",
  GOOGL: "Alphabet Inc",
  META: "Meta Platforms Inc",
};

function derive(symbol: string): Quote {
  const h = hash(symbol);
  const price = round(40 + (h % 46000) / 100);
  const changePct = round(((h % 800) / 100) - 4);
  const change = round((price * changePct) / 100);
  const prevClose = round(price - change);
  const open = round(prevClose + change * 0.3);
  const high = round(Math.max(price, open) * 1.008);
  const low = round(Math.min(price, open) * 0.992);
  return { symbol, price, change, changePct, open, high, low, prevClose };
}

const SEARCH: SymbolMatch[] = Object.entries(NAMES).map(([symbol, description]) => ({
  symbol,
  description,
  type: "Common Stock",
}));

function mockNews(seed: string, topic: string): NewsItem[] {
  const h = hash(seed);
  const headlines = [
    `${topic} shares move as investors weigh outlook`,
    `Analysts revisit ${topic} estimates ahead of earnings`,
    `${topic} in focus amid sector rotation`,
    `What's next for ${topic}? Key levels to watch`,
    `${topic} demand trends draw market attention`,
  ];
  return headlines.map((headline, i) => ({
    id: h + i,
    headline,
    summary:
      "Sample news shown in demo mode. Connect a news source for live headlines.",
    source: ["MarketWatch", "Reuters", "Bloomberg", "CNBC"][i % 4],
    url: "#",
    image: "",
    datetime: 1_750_000_000 - i * 7200,
  }));
}

/** Deterministic daily candles used when the history source is unavailable. */
export function mockCandles(symbol: string): Candle[] {
  const rng = makeRng(hash(symbol));
  const seed = SEED[symbol];
  let price = seed ? seed.price * 0.85 : 50 + (hash(symbol) % 300);
  const out: Candle[] = [];
  const today = new Date();
  const n = 130;
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    const o = price;
    const c = Math.max(5, o + (rng() - 0.46) * price * 0.03);
    const h = Math.max(o, c) + rng() * price * 0.012;
    const l = Math.min(o, c) - rng() * price * 0.012;
    out.push({ date, o: round(o), h: round(h), l: round(l), c: round(c) });
    price = c;
  }
  return out;
}

export const mock: MarketProvider = {
  async getQuote(symbol: string): Promise<Quote> {
    return SEED[symbol] ?? derive(symbol);
  },
  async searchSymbols(query: string): Promise<SymbolMatch[]> {
    const q = query.toLowerCase();
    return SEARCH.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    ).slice(0, 10);
  },
  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const h = hash(symbol);
    return {
      symbol,
      name: NAMES[symbol] ?? `${symbol} Inc`,
      exchange: "NASDAQ",
      logo: "",
      marketCap: (50 + (h % 3000)) * 1_000_000_000,
      industry: ["Technology", "Semiconductors", "Consumer Electronics", "Software"][h % 4],
      country: "US",
      currency: "USD",
      weburl: "#",
    };
  },
  async getCompanyNews(symbol: string): Promise<NewsItem[]> {
    return mockNews(symbol, symbol);
  },
  async getMarketNews(): Promise<NewsItem[]> {
    return mockNews("market", "Markets");
  },
};
