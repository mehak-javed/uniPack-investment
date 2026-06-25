import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/market";

/** GET /api/search?q=apple → { results: SymbolMatch[] } */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json({ results: [] });
  try {
    const results = await searchSymbols(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[/api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
