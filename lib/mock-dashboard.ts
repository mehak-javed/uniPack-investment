/**
 * Deterministic mock data for the dashboard UI (frontend-first build).
 * Uses a seeded RNG so the server and client render identical markup
 * (no hydration mismatch). Replaced by the live market-data layer later.
 */

export type Candle = { o: number; h: number; l: number; c: number };
export type RatingBar = { buy: number; hold: number; sell: number };
export type Holding = {
  date: string;
  symbol: string;
  name: string;
  position: "Long" | "Short";
  shares: number;
  entry: number;
  mark: number;
  pnl: number;
  value: number;
  status: "Open" | "Watching";
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function genCandles(count: number, start: number, seed: number): Candle[] {
  const rng = makeRng(seed);
  const out: Candle[] = [];
  let price = start;
  for (let i = 0; i < count; i++) {
    const o = price;
    const drift = (rng() - 0.44) * 5; // slight upward bias
    const c = Math.max(150, o + drift);
    const h = Math.max(o, c) + rng() * 2.6;
    const l = Math.min(o, c) - rng() * 2.6;
    out.push({
      o: round(o),
      h: round(h),
      l: round(l),
      c: round(c),
    });
    price = c;
  }
  return out;
}

function genSeries(count: number, start: number, growth: number, seed: number): number[] {
  const rng = makeRng(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < count; i++) {
    v = v * (1 + growth + (rng() - 0.5) * 0.05);
    out.push(round(v));
  }
  return out;
}

function genRatings(count: number, seed: number): RatingBar[] {
  const rng = makeRng(seed);
  return Array.from({ length: count }, () => {
    const buy = 30 + Math.floor(rng() * 45);
    const sell = 5 + Math.floor(rng() * 25);
    const hold = 100 - buy - sell;
    return { buy, hold, sell };
  });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export const featured = {
  symbol: "NVDA",
  name: "NVIDIA Corporation",
  exchange: "NASDAQ",
  timeframe: "4H",
  price: 190.53,
  change: 1.92,
  changePct: 1.02,
  open: 188.61,
  high: 191.8,
  low: 187.4,
  close: 190.53,
  volume: "138.6M",
};

export const priceCandles = genCandles(52, 168, 20260224);

export const portfolio = {
  balance: 96658.56,
  changePct: 11.2,
  cash: 12658.24,
  invested: 84000.32,
};

export const portfolioSeries = genSeries(11, 70000, 0.028, 7781);

export const ownership = {
  holders: 5235,
  institutionalPct: 67.3,
};

export const analystRatings = genRatings(13, 5150);
export const ratingSummary = { buy: 38, hold: 9, sell: 4, label: "Strong Buy" };

export const longShortSeries = genSeries(40, 50, 0.004, 99221).map((v) =>
  Math.max(28, Math.min(78, v - 8)),
);
export const longShortPoint = { date: "Sep 2026", long: 65.4, short: 34.6 };

export const holdings: Holding[] = [
  { date: "2026-02-21", symbol: "NVDA", name: "NVIDIA Corp", position: "Long", shares: 120, entry: 154.4, mark: 190.53, pnl: 4335.6, value: 22863.6, status: "Open" },
  { date: "2026-01-18", symbol: "AAPL", name: "Apple Inc", position: "Long", shares: 85, entry: 212.1, mark: 229.87, pnl: 1510.45, value: 19538.95, status: "Open" },
  { date: "2026-01-05", symbol: "MSFT", name: "Microsoft Corp", position: "Long", shares: 40, entry: 441.2, mark: 468.35, pnl: 1086.0, value: 18734.0, status: "Open" },
  { date: "2025-12-12", symbol: "TSLA", name: "Tesla Inc", position: "Long", shares: 60, entry: 388.9, mark: 352.18, pnl: -2203.2, value: 21130.8, status: "Open" },
  { date: "2025-11-30", symbol: "AMD", name: "Advanced Micro Devices", position: "Long", shares: 95, entry: 168.5, mark: 178.42, pnl: 942.4, value: 16949.9, status: "Open" },
];
