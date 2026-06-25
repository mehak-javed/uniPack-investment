import { cn } from "@/lib/utils";

type Candle = { o: number; h: number; l: number; c: number };

type Props = {
  candles: Candle[];
  lastPrice: number;
  labels?: string[];
  height?: number;
  className?: string;
};

/** Pure-SVG candlestick chart with a right-side price axis and last-price tag. */
export function CandlestickChart({
  candles,
  lastPrice,
  labels,
  height = 340,
  className,
}: Props) {
  const W = 1000;
  const H = height;
  const padL = 6;
  const padR = 58;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  let max = Math.max(...candles.map((c) => c.h));
  let min = Math.min(...candles.map((c) => c.l));
  const pad = (max - min || 1) * 0.06;
  max += pad;
  min -= pad;
  const span = max - min || 1;

  const x = (i: number) => padL + ((i + 0.5) * plotW) / candles.length;
  const y = (p: number) => padT + ((max - p) / span) * plotH;
  const cw = Math.max(2, (plotW / candles.length) * 0.62);

  const ticks = 5;
  const tickVals = Array.from(
    { length: ticks },
    (_, i) => min + (span * i) / (ticks - 1),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-auto w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Price candlestick chart"
    >
      {tickVals.map((tv, i) => (
        <g key={`t${i}`}>
          <line
            x1={padL}
            x2={padL + plotW}
            y1={y(tv)}
            y2={y(tv)}
            className="stroke-border"
            strokeWidth={1}
            strokeDasharray="2 5"
            opacity={0.6}
          />
          <text
            x={W - padR + 6}
            y={y(tv) + 4}
            className="fill-muted-foreground"
            fontSize={12}
          >
            {tv.toFixed(2)}
          </text>
        </g>
      ))}

      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const bodyTop = y(Math.max(c.o, c.c));
        const bodyH = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
        return (
          <g
            key={`c${i}`}
            className={up ? "fill-positive stroke-positive" : "fill-negative stroke-negative"}
          >
            <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} strokeWidth={1.2} />
            <rect x={x(i) - cw / 2} y={bodyTop} width={cw} height={bodyH} rx={1} />
          </g>
        );
      })}

      {/* Last price marker */}
      <line
        x1={padL}
        x2={padL + plotW}
        y1={y(lastPrice)}
        y2={y(lastPrice)}
        className="stroke-foreground"
        strokeWidth={1}
        strokeDasharray="4 3"
        opacity={0.5}
      />
      <rect
        x={W - padR}
        y={y(lastPrice) - 10}
        width={padR}
        height={20}
        rx={3}
        className="fill-primary"
      />
      <text
        x={W - padR + 6}
        y={y(lastPrice) + 4}
        className="fill-primary-foreground"
        fontSize={12}
        fontWeight={600}
      >
        {lastPrice.toFixed(2)}
      </text>

      {labels?.map((lb, i) => (
        <text
          key={`l${i}`}
          x={padL + ((i + 0.5) / labels.length) * plotW}
          y={H - 6}
          className="fill-muted-foreground"
          fontSize={12}
          textAnchor="middle"
        >
          {lb}
        </text>
      ))}
    </svg>
  );
}
