import { MarketNews } from "@/components/dashboard/market-news";
import { getMarketNews } from "@/lib/market";

export default async function NewsPage() {
  const news = await getMarketNews();
  return (
    <div className="mx-auto max-w-[800px] space-y-5 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Market News</h1>
      <MarketNews items={news} limit={12} title="Latest headlines" />
    </div>
  );
}
