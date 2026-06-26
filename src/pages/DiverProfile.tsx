import { useState } from 'react';
import type { DiverProfile } from '../types/profile';
import type { Discipline, BoardType } from '../types/trendline';
import { useEventTrendline, useDiveTrendline, useDiverStats } from '../hooks/useDiver';
import { TrendlineChart } from '../components/charts/TrendlineChart';

type Tab = 'profile' | 'statistics';

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: 'platform', label: 'Platform' },
];

interface Props {
  diver: DiverProfile;
}

function StatisticsTab({ diverId }: { diverId: string }) {
  const [discipline, setDiscipline] = useState<Discipline>('platform');
  const [selectedDive, setSelectedDive] = useState<string>('');

  const { data: eventPoints = [], isLoading: loadingEvent } = useEventTrendline(diverId, discipline);
  const { data: stats } = useDiverStats(diverId);

  const diveOptions = stats?.competition ?? [];
  const parsedDive = selectedDive
    ? { diveCode: selectedDive.split('|')[0], board: selectedDive.split('|')[1] as BoardType }
    : null;

  const { data: divePoints = [], isLoading: loadingDive } = useDiveTrendline(
    diverId,
    parsedDive?.diveCode ?? null,
    parsedDive?.board ?? null,
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Event Trendline</h2>
          <div className="flex gap-1">
            {DISCIPLINES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDiscipline(value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                  discipline === value
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          {loadingEvent ? (
            <div className="flex items-center justify-center h-60 text-slate-500 text-sm">Loading…</div>
          ) : (
            <TrendlineChart points={eventPoints} height={240} />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dive Trendline</h2>
          <select
            value={selectedDive}
            onChange={(e) => setSelectedDive(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">Select a dive…</option>
            {diveOptions.map((entry) => (
              <option key={`${entry.dive_code}|${entry.board}`} value={`${entry.dive_code}|${entry.board}`}>
                {entry.dive_code} · {entry.board} ({entry.dive_count} dives, avg {entry.avg_score.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          {!selectedDive ? (
            <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
              Select a dive above to see its trendline
            </div>
          ) : loadingDive ? (
            <div className="flex items-center justify-center h-60 text-slate-500 text-sm">Loading…</div>
          ) : (
            <TrendlineChart points={divePoints} height={240} />
          )}
        </div>
      </section>
    </div>
  );
}

function DiverProfile({ diver }: Props): JSX.Element {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: { value: Tab; label: string }[] = [
    { value: 'profile', label: 'Profile' },
    ...(diver.diver_id ? [{ value: 'statistics' as Tab, label: 'Statistics' }] : []),
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">{diver.name}</h1>
        {(diver.city || diver.country) && (
          <p className="text-slate-400 text-sm">
            {[diver.city, diver.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      <div className="flex gap-1 mb-8 border-b border-slate-800 pb-0">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition duration-150 cursor-pointer ${
              tab === value
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Age', value: diver.age ? String(diver.age) : '—' },
            { label: 'FINA Age', value: diver.fina_age ? String(diver.fina_age) : '—' },
            { label: 'Gender', value: diver.gender || '—' },
            { label: 'Country', value: diver.country || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className="text-slate-100 font-medium">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'statistics' && diver.diver_id && (
        <StatisticsTab diverId={diver.diver_id} />
      )}
    </div>
  );
}

export default DiverProfile;
