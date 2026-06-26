import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendlinePoint } from '../../types/trendline';

interface Props {
  points: TrendlinePoint[];
  height?: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const pt: TrendlinePoint = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-300 font-medium mb-0.5">{pt.label}</p>
      <p className="text-slate-500 text-xs mb-1">{formatDate(pt.date)}</p>
      <p className="text-cyan-400 font-semibold">{pt.score.toFixed(2)}</p>
    </div>
  );
}

export function TrendlineChart({ points, height = 240 }: Props) {
  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-500 text-sm"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const data = points.map((pt) => ({ ...pt, displayDate: formatDate(pt.date) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
        <XAxis
          dataKey="displayDate"
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155' }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#22d3ee', r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
