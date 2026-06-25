/** Provider-agnostic market data shapes. UI and routes depend on these,
 *  never on a specific vendor — so we can swap Finnhub later in one place. */

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
};

export type SymbolMatch = {
  symbol: string;
  description: string;
  type: string;
};

export type CompanyProfile = {
  symbol: string;
  name: string;
  exchange: string;
  logo: string;
  marketCap: number; // absolute USD
  industry: string;
  country: string;
  currency: string;
  weburl: string;
};

export type NewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number; // unix seconds
};

export type Candle = {
  date: string; // YYYY-MM-DD
  o: number;
  h: number;
  l: number;
  c: number;
};

/** A market-data provider implementation (Finnhub, mock, …). */
export interface MarketProvider {
  getQuote(symbol: string): Promise<Quote>;
  searchSymbols(query: string): Promise<SymbolMatch[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfile>;
  getCompanyNews(symbol: string): Promise<NewsItem[]>;
  getMarketNews(): Promise<NewsItem[]>;
}
