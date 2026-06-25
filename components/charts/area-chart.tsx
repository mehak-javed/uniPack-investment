import { cn } from "@/lib/utils";

type Tone = "primary" | "positive" | "negative";

type Props = {
  /** y-values, evenly spaced along x. */
  data: number[];
  /** Unique id for the gradient def (avoid collisions when multiple charts share a page). */
  id: string;
  tone?: Tone;
  height?: number;
  className?: string;
  showLine?: boolean;
};

const toneVar: Record<Tone, string> = {
  primary: "var(--primary)",
  positive: "var(--positive)",
  negative: "var(--negative)",
};

const strokeClass: Record<Tone, string> = {
  primary: "stroke-primary",
  positive: "stroke-positive",
  negative: "stroke-negative",
};

/** Lightweight filled area/sparkline. Labels are rendered by the caller (as HTML). */
export function AreaChart({
  data,
  id,
  tone = "primary",
  height = 160,
  className,
  showLine = true,
}: Props) {
  const W = 1000;
  const H = height;
  const padT = 8;
  const padB = 6;
  const plotH = H - padT - padB;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => padT + ((max - v) / span) * plotH;

  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area =
    `M 0,${H} L ` +
    data.map((v, i) => `${x(i)},${y(v)}`).join(" L ") +
    ` L ${W},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      style={{ height }}
      role="img"
      aria-label="Area chart"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: toneVar[tone], stopOpacity: 0.38 }} />
          <stop offset="100%" style={{ stopColor: toneVar[tone], stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      {showLine && (
        <polyline
          points={line}
          fill="none"
          className={strokeClass[tone]}
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
