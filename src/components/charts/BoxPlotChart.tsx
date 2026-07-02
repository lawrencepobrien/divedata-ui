import { useEffect, useRef, useState } from 'react';

export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

export interface BoxPlotSeries {
  key: string;
  label: string;
  color: string;
  // Quartiles are precomputed in the DB (dd_mv_diver_imported_stats) and passed in.
  stats: BoxStats | null;
}

interface Props {
  series: BoxPlotSeries[];
}

// Measure the container width so the SVG can scale responsively.
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

const ROW_HEIGHT = 110; // vertical space per dive (box + number labels)
const BOX_THICKNESS = 46;

export function BoxPlotChart({ series }: Props) {
  const { ref, width } = useContainerWidth();

  const boxes = series.filter(
    (s): s is BoxPlotSeries & { stats: BoxStats } => s.stats !== null,
  );

  if (boxes.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height: 200 }}>
        No data available
      </div>
    );
  }

  const totalPoints = boxes.reduce((n, b) => n + b.stats.count, 0);

  // X domain (scores) across all boxes, padded 6% each side.
  const allMin = Math.min(...boxes.map((b) => b.stats.min));
  const allMax = Math.max(...boxes.map((b) => b.stats.max));
  const span = allMax - allMin || 1;
  const xMin = allMin - span * 0.06;
  const xMax = allMax + span * 0.06;

  const margin = { top: 10, right: 20, bottom: 30, left: 90 };
  const plotW = Math.max(width - margin.left - margin.right, 0);
  const plotH = boxes.length * ROW_HEIGHT;
  const height = margin.top + plotH + margin.bottom;

  // Score -> pixel x.
  const xScale = (v: number) => margin.left + plotW * ((v - xMin) / (xMax - xMin));

  // ~5 x-axis ticks.
  const tickCount = 5;
  const ticks = Array.from(
    { length: tickCount },
    (_, i) => xMin + ((xMax - xMin) * i) / (tickCount - 1),
  );

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <p className="text-slate-500 text-xs mb-2">
        Total data points: <span className="text-slate-300 font-medium">{totalPoints}</span>
      </p>
      {width > 0 && (
        <svg width={width} height={height}>
          {/* X grid + tick labels */}
          {ticks.map((t, i) => {
            const x = xScale(t);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={margin.top} y2={margin.top + plotH} stroke="#1e293b" strokeDasharray="4 4" />
                <text x={x} y={height - 12} textAnchor="middle" fontSize={13} fill="#64748b">
                  {t.toFixed(0)}
                </text>
              </g>
            );
          })}

          {boxes.map((b, i) => {
            const cy = margin.top + ROW_HEIGHT * i + ROW_HEIGHT / 2;
            const top = cy - BOX_THICKNESS / 2;
            const bottom = cy + BOX_THICKNESS / 2;
            const { min, q1, median, q3, max, count } = b.stats;
            const labelY = bottom + 14; // number labels sit under the box
            return (
              <g key={b.key}>
                <title>{`${b.label}\nmax ${max.toFixed(2)}\nQ3 ${q3.toFixed(2)}\nmedian ${median.toFixed(2)}\nQ1 ${q1.toFixed(2)}\nmin ${min.toFixed(2)}\nn=${count}`}</title>

                {/* Dive label (y-axis) */}
                <text x={margin.left - 10} y={cy - 4} textAnchor="end" fontSize={11} fill="#94a3b8">
                  {b.label}
                </text>
                <text x={margin.left - 10} y={cy + 9} textAnchor="end" fontSize={10} fill="#64748b">
                  n={count}
                </text>

                {/* Whisker (min → max) with caps */}
                <line x1={xScale(min)} x2={xScale(max)} y1={cy} y2={cy} stroke={b.color} strokeWidth={1.5} />
                <line x1={xScale(min)} x2={xScale(min)} y1={cy - BOX_THICKNESS / 4} y2={cy + BOX_THICKNESS / 4} stroke={b.color} strokeWidth={1.5} />
                <line x1={xScale(max)} x2={xScale(max)} y1={cy - BOX_THICKNESS / 4} y2={cy + BOX_THICKNESS / 4} stroke={b.color} strokeWidth={1.5} />

                {/* Interquartile box (Q1 → Q3) */}
                <rect
                  x={xScale(q1)}
                  y={top}
                  width={Math.max(xScale(q3) - xScale(q1), 1)}
                  height={BOX_THICKNESS}
                  fill={b.color}
                  fillOpacity={0.18}
                  stroke={b.color}
                  strokeWidth={1.5}
                  rx={2}
                />

                {/* Median */}
                <line x1={xScale(median)} x2={xScale(median)} y1={top} y2={bottom} stroke={b.color} strokeWidth={2} />

                {/* Median value above the box */}
                <text x={xScale(median)} y={top - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill={b.color}>
                  {median.toFixed(1)}
                </text>

                {/* min / Q1 / Q3 / max values below the box */}
                <text x={xScale(min)} y={labelY} textAnchor="middle" fontSize={10} fill="#64748b">
                  {min.toFixed(1)}
                </text>
                <text x={xScale(q1)} y={labelY} textAnchor="middle" fontSize={10} fill="#94a3b8">
                  {q1.toFixed(1)}
                </text>
                <text x={xScale(q3)} y={labelY} textAnchor="middle" fontSize={10} fill="#94a3b8">
                  {q3.toFixed(1)}
                </text>
                <text x={xScale(max)} y={labelY} textAnchor="middle" fontSize={10} fill="#64748b">
                  {max.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
