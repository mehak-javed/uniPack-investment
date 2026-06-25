import { cn } from "@/lib/utils";

type Props = {
  /** 0–100 */
  value: number;
  centerTop: string;
  centerBottom?: string;
  className?: string;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

/** A 270° gauge with a value arc and centered label. */
export function Gauge({ value, centerTop, centerBottom, className }: Props) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 88;
  const startA = -135;
  const endA = 135;
  const valueA = startA + (Math.max(0, Math.min(100, value)) / 100) * (endA - startA);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gauge"
    >
      <path
        d={arc(cx, cy, r, startA, endA)}
        fill="none"
        className="stroke-muted"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <path
        d={arc(cx, cy, r, startA, valueA)}
        fill="none"
        className="stroke-primary"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={34}
        fontWeight={700}
      >
        {centerTop}
      </text>
      {centerBottom && (
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={12}
        >
          {centerBottom}
        </text>
      )}
    </svg>
  );
}
