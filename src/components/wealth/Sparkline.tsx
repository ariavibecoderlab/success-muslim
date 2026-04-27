interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** stroke color (CSS) */
  color?: string;
  /** Optional gradient fill below the line. */
  fill?: boolean;
  className?: string;
}

/**
 * Tiny dependency-free sparkline. Renders a smoothed polyline from a number[]
 * with optional gradient fill underneath. Designed for inline metric headers.
 */
export default function Sparkline({
  data,
  width = 120,
  height = 28,
  color = 'hsl(var(--primary))',
  fill = true,
  className,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const padY = 2;
  const usableH = height - padY * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = padY + usableH - ((v - min) / range) * usableH;
    return [x, y] as const;
  });

  // Smooth path using simple Catmull-Rom-ish approximation with quadratic curves.
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const midX = (px + cx) / 2;
    d += ` Q ${px},${py} ${midX},${(py + cy) / 2}`;
    d += ` T ${cx},${cy}`;
  }

  const areaD = `${d} L ${width},${height} L 0,${height} Z`;
  const lastIdx = points.length - 1;
  const gradId = `sparkGrad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[lastIdx][0]} cy={points[lastIdx][1]} r={2} fill={color} />
    </svg>
  );
}
