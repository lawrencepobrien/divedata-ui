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

interface Props {
  series: TrendlineSeries[];
  height?: number;
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

export function TrendlineChart({ series, height = 240 }: Props) {
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

  return (
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
            dot={{ fill: s.color, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: s.color, r: 5, strokeWidth: 0 }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
