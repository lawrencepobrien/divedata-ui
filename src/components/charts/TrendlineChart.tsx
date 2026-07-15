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
// Each row has one key per series; null where that series has no data on that date.
function mergeData(series: TrendlineSeries[]): Record<string, unknown>[] {
  const rowMap = new Map<string, Record<string, unknown>>();

  series.forEach((s) => {
    s.points.forEach((pt) => {
      const dateKey = pt.date ?? '__null__';
      if (!rowMap.has(dateKey)) {
        rowMap.set(dateKey, {
          _date: pt.date,
          _displayDate: formatDate(pt.date),
          _label: pt.label,
        });
      }
      rowMap.get(dateKey)![s.key] = pt.score;
      rowMap.get(dateKey)![`${s.key}__id`] = pt.id ?? null;
      rowMap.get(dateKey)![`${s.key}__source`] = pt.source ?? null;
    });
  });

  return [...rowMap.entries()]
    .sort(([a], [b]) => {
      if (a === '__null__') return 1;
      if (b === '__null__') return -1;
      return a.localeCompare(b);
    })
    .map(([, row]) => row);
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
  const hasTrainingPoints = series.some((s) => s.points.some((pt) => pt.source === 'training'));

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
          <XAxis
            dataKey="_displayDate"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#1e293b' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
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
