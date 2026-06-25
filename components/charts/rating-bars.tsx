import { cn } from "@/lib/utils";
import type { RatingBar } from "@/lib/mock-dashboard";

type Props = {
  data: RatingBar[];
  height?: number;
  className?: string;
};

/** Stacked Buy / Hold / Sell bars across time (Buy at bottom). */
export function RatingBars({ data, height = 180, className }: Props) {
  const W = 1000;
  const H = height;
  const gap = (W / data.length) * 0.32;
  const bw = W / data.length - gap;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      style={{ height }}
      role="img"
      aria-label="Analyst ratings over time"
    >
      {data.map((d, i) => {
        const x = i * (W / data.length) + gap / 2;
        const buyH = (d.buy / 100) * H;
        const holdH = (d.hold / 100) * H;
        const sellH = (d.sell / 100) * H;
        let yPos = H;
        const segs = [
          { h: buyH, cls: "fill-positive" },
          { h: holdH, cls: "fill-warning" },
          { h: sellH, cls: "fill-negative" },
        ];
        return (
          <g key={i}>
            {segs.map((s, j) => {
              yPos -= s.h;
              return (
                <rect
                  key={j}
                  x={x}
                  y={yPos}
                  width={bw}
                  height={Math.max(0, s.h - 1)}
                  rx={1.5}
                  className={s.cls}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
