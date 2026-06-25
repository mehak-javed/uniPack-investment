"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({
  symbol,
  initialWatched,
  size,
}: {
  symbol: string;
  initialWatched: boolean;
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const [watched, setWatched] = useState(initialWatched);
  const [pending, start] = useTransition();

  function toggle() {
    start(async () => {
      const res = watched
        ? await removeFromWatchlist(symbol)
        : await addToWatchlist(symbol);

      if ("needsAuth" in res) return router.push("/login");
      if ("needsUpgrade" in res) return router.push("/pricing");
      if ("ok" in res) {
        setWatched(!watched);
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant={watched ? "secondary" : "outline"}
      size={size}
      onClick={toggle}
      disabled={pending}
    >
      <Star className={cn("h-4 w-4", watched && "fill-current text-primary")} />
      {watched ? "Watching" : "Watchlist"}
    </Button>
  );
}
