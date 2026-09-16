import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TrendlinePoint } from '../../types/trendline';

export interface TrendlineSeries {
  key: string;
  label: string;
  color: string;
  points: TrendlinePoint[];
}

export interface PointClickInfo {
  id?: string;
  date: string | null;
  label: string;
  score: number;
  source?: 'competition' | 'training';
  /** The series' `key` the clicked point belongs to — lets a caller with
   *  several series (e.g. one per diver being compared) tell them apart. */
  seriesKey?: string;
}

interface Props {
  series: TrendlineSeries[];
  height?: number;
  onPointClick?: (info: PointClickInfo) => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// Merge series onto a shared sorted date axis.
// Each row has one key per series; null where that series has no data on that row.
//
// Rows are keyed by date *and* label, not date alone: a meet's prelim and final
// are separate events that usually carry the same timestamp, so keying on date
// would silently overwrite one with the other. Points that genuinely belong
// together — several dive codes from the same meet, or several divers in the
// same event — still share a label and so still share a row. Lines set
// connectNulls, so the extra rows don't introduce gaps.
function mergeData(series: TrendlineSeries[]): Record<string, unknown>[] {
  const rowMap = new Map<string, Record<string, unknown>>();

  series.forEach((s) => {
    s.points.forEach((pt) => {
      const dateKey = pt.date ?? '__null__';
      const rowKey = `${dateKey}||${pt.label}`;
      if (!rowMap.has(rowKey)) {
        rowMap.set(rowKey, {
          // _key is the XAxis dataKey and must be unique per row. Using the
          // display date there instead looks fine but silently breaks the
          // tooltip: Recharts resolves the hovered category by *value*, so
          // every row sharing a "Nov 2024" label returned the first such
          // row's data. The axis shows _displayDate via tickFormatter.
          _key: rowKey,
          _date: pt.date,
          _displayDate: formatDate(pt.date),
          _label: pt.label,
        });
      }
      rowMap.get(rowKey)![s.key] = pt.score;
      rowMap.get(rowKey)![`${s.key}__id`] = pt.id ?? null;
      rowMap.get(rowKey)![`${s.key}__source`] = pt.source ?? null;
    });
  });

  return [...rowMap.entries()]
    .sort(([a], [b]) => {
      const aNull = a.startsWith('__null__');
      const bNull = b.startsWith('__null__');
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      return a.localeCompare(b);
    })
    .map(([, row]) => row);
}

// Recharts defaults the Y domain to [0, max], which pins a 270-360 event
// trendline to the very top of the plot. Fit the axis to the data instead,
// padding evenly above and below so the line sits in the middle. The bounds
// are rounded outward to a round step so the ticks stay readable.
function niceStep(span: number): number {
  if (span >= 200) return 25;
  if (span >= 100) return 10;
  if (span >= 40) return 5;
  if (span >= 10) return 2;
  return 1;
}

function yDomain(series: TrendlineSeries[]): [number, number] {
  const values = series
    .flatMap((s) => s.points.map((pt) => pt.score))
    .filter((v): v is number => Number.isFinite(v));
  if (values.length === 0) return [0, 1];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  // One point, or several identical ones, leaves no span to pad against.
  const pad = span > 0 ? span * 0.25 : Math.max(Math.abs(max) * 0.1, 1);
  const step = niceStep(span + pad * 2);
  // Scores are never negative, so the floor stops at 0 even if that costs
  // some of the centering on a series that runs close to zero.
  return [Math.max(0, Math.floor((min - pad) / step) * step), Math.ceil((max + pad) / step) * step];
}

function ChartLegend({
  payload,
  series,
}: {
  payload?: { dataKey: string; color: string }[];
  series: TrendlineSeries[];
}) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-4 justify-center pt-3">
      {payload.map((entry) => {
        const s = series.find((s) => s.key === entry.dataKey);
        return (
          <div key={entry.dataKey} className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 rounded-full"
              style={{ background: entry.color, height: 2 }}
            />
            <span className="text-slate-400 text-xs">{s?.label ?? entry.dataKey}</span>
          </div>
        );
      })}
    </div>
  );
}

function MultiTooltip({
  active,
  payload,
  series,
}: {
  active?: boolean;
  payload?: { payload: Record<string, unknown> }[];
  series: TrendlineSeries[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-300 font-medium mb-0.5">{String(row._label || row._displayDate)}</p>
      <p className="text-slate-500 text-xs mb-2">{formatDate(row._date as string)}</p>
      {series.map((s) =>
        row[s.key] != null ? (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-slate-400 text-xs">{s.label}:</span>
            <span className="text-sm font-semibold" style={{ color: s.color }}>
              {(row[s.key] as number).toFixed(2)}
            </span>
          </div>
        ) : null,
      )}
    </div>
  );
}

// Training points render as a hollow ring in the series color instead of a
// solid dot — same line, same color, visually distinct marker so a single
// series can mix training and competition scores without splitting the line.
const CHART_BG = '#0f172a'; // slate-950, matches the app background the ring "punches through" to

function seriesDot(color: string, seriesKey: string, baseRadius: number) {
  return (props: any) => {
    const { cx, cy, index, payload } = props;
    if (payload?.[seriesKey] == null) return null; // no point for this series at this row — no dot
    const isTraining = payload?.[`${seriesKey}__source`] === 'training';
    return (
      <circle
        key={`dot-${seriesKey}-${index}`}
        cx={cx}
        cy={cy}
        r={isTraining ? baseRadius + 1 : baseRadius}
        fill={isTraining ? CHART_BG : color}
        stroke={color}
        strokeWidth={isTraining ? 2 : 0}
      />
    );
  };
}

function seriesActiveDot(color: string, seriesKey: string, baseRadius: number, onClick?: (info: PointClickInfo) => void) {
  return (props: any) => {
    const { cx, cy, index, payload } = props;
    if (payload?.[seriesKey] == null) return null;
    const isTraining = payload?.[`${seriesKey}__source`] === 'training';
    return (
      <circle
        key={`active-dot-${seriesKey}-${index}`}
        cx={cx}
        cy={cy}
        r={isTraining ? baseRadius + 1 : baseRadius}
        fill={isTraining ? CHART_BG : color}
        stroke={color}
        strokeWidth={isTraining ? 2 : 0}
        style={onClick ? { cursor: 'pointer' } : undefined}
        onClick={onClick ? () => onClick({
          id: payload[`${seriesKey}__id`] as string | undefined,
          date: payload._date as string | null,
          label: payload._label as string,
          score: payload[seriesKey] as number,
          source: (payload[`${seriesKey}__source`] ?? undefined) as
            | 'competition'
            | 'training'
            | undefined,
          seriesKey,
        }) : undefined}
      />
    );
  };
}

export function TrendlineChart({ series, height = 240, onPointClick }: Props) {
  const hasData = series.some((s) => s.points.length > 0);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-slate-500 text-sm"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const data = mergeData(series);
  const tickLabels = new Map(data.map((row) => [row._key as string, row._displayDate as string]));
  const hasTrainingPoints = series.some((s) => s.points.some((pt) => pt.source === 'training'));

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
          <XAxis
            dataKey="_key"
            tickFormatter={(value: string) => tickLabels.get(value) ?? ''}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain(series)}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<MultiTooltip series={series} />} cursor={{ stroke: '#334155' }} />
          <Legend content={(props) => <ChartLegend {...(props as any)} series={series} />} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={seriesDot(s.color, s.key, 3)}
              activeDot={seriesActiveDot(s.color, s.key, 5, onPointClick)}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {hasTrainingPoints && (
        <div className="flex items-center justify-center gap-4 pt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
            Competition
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-slate-400" style={{ background: CHART_BG }} />
            Training
          </span>
        </div>
      )}
    </div>
  );
}
