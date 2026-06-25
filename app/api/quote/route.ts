import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market";

/** GET /api/quote?symbols=NVDA,AAPL  →  { quotes: Quote[] }
 *  Keeps the Finnhub key server-side and applies the shared cache. */
export async function GET(req: NextRequest) {
  const raw =
    req.nextUrl.searchParams.get("symbols") ??
    req.nextUrl.searchParams.get("symbol") ??
    "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "Provide ?symbols=AAPL,MSFT" },
      { status: 400 },
    );
  }

  try {
    const quotes = await getQuotes(symbols);
    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("[/api/quote]", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 502 });
  }
}
