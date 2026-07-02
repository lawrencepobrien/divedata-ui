import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import type { DiverProfile } from '../types/profile';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { CompStatEntry } from '../types/stats';
import { useEventTrendline, useDiverStats, useCompetitionHistory, diverKeys } from '../hooks/useDiver';
import { TrendlineChart, type TrendlineSeries } from '../components/charts/TrendlineChart';
import { BoxPlotChart, type BoxPlotSeries } from '../components/charts/BoxPlotChart';
import { diversApi } from '../api/diver';

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: 'platform', label: 'Platform' },
];

// Board order for the grouped dive selector.
const BOARD_ORDER: BoardType[] = ['1m', '3m', '5m', '7.5m', '10m'];

// Dive groups, keyed by the first digit of the dive code.
const DIVE_GROUPS: { digit: string; label: string }[] = [
  { digit: '1', label: 'Forward' },
  { digit: '2', label: 'Back' },
  { digit: '3', label: 'Reverse' },
  { digit: '4', label: 'Inward' },
  { digit: '5', label: 'Twist' },
  { digit: '6', label: 'Armstand' },
];

const SERIES_COLORS = [
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#a78bfa', // violet
  '#fb923c', // orange
];

interface SelectedDive {
  diveCode: string;
  board: BoardType;
}

interface Props {
  diver: DiverProfile;
}

function StatisticsTab({ diverId }: { diverId: string }) {
  const [discipline, setDiscipline] = useState<Discipline>('platform');
  const [selectedDives, setSelectedDives] = useState<SelectedDive[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [showBoxPlot, setShowBoxPlot] = useState(false);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const { data: eventPoints = [], isLoading: loadingEvent } = useEventTrendline(diverId, discipline);
  const { data: stats } = useDiverStats(diverId);

  const diveOptions = stats?.competition ?? [];

  // Nested map: board -> dive group digit -> entries.
  const grouped = useMemo(() => {
    const map: Partial<Record<BoardType, Partial<Record<string, CompStatEntry[]>>>> = {};
    diveOptions.forEach((e) => {
      const digit = e.dive_code[0];
      if (!map[e.board]) map[e.board] = {};
      const boardMap = map[e.board]!;
      if (!boardMap[digit]) boardMap[digit] = [];
      boardMap[digit]!.push(e);
    });
    return map;
  }, [diveOptions]);

  const toggleDive = (entry: CompStatEntry) => {
    setSelectedDives((prev) => {
      const exists = prev.findIndex(
        (d) => d.diveCode === entry.dive_code && d.board === entry.board,
      );
      if (exists !== -1) return prev.filter((_, i) => i !== exists);
      if (prev.length >= SERIES_COLORS.length) return prev;
      return [...prev, { diveCode: entry.dive_code, board: entry.board }];
    });
  };

  const diveQueries = useQueries({
    queries: selectedDives.map((d) => ({
      queryKey: diverKeys.diveTrendline(diverId, d.diveCode, d.board),
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<TrendlinePoint[]> => {
        const data = await diversApi.getDiveTrendline(diverId, d.diveCode, d.board, signal);
        return data.points.map((pt) => ({
          date: pt.date,
          score: pt.score,
          label: pt.competition,
        }));
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const diveSeries: TrendlineSeries[] = selectedDives.map((d, i) => ({
    key: `${d.diveCode}|${d.board}`,
    label: `${d.diveCode} · ${d.board}`,
    color: SERIES_COLORS[i],
    points: diveQueries[i]?.data ?? [],
  }));

  // Box plot reads the precomputed quartiles from the diver stats view rather than
  // recomputing them from raw scores.
  const boxSeries: BoxPlotSeries[] = selectedDives.map((d, i) => {
    const entry = diveOptions.find(
      (e) => e.dive_code === d.diveCode && e.board === d.board,
    );
    return {
      key: `${d.diveCode}|${d.board}`,
      label: `${d.diveCode} · ${d.board}`,
      color: SERIES_COLORS[i],
      stats: entry
        ? {
            min: entry.min_score,
            q1: entry.q1_score,
            median: entry.median_score,
            q3: entry.q3_score,
            max: entry.max_score,
            count: entry.dive_count,
          }
        : null,
    };
  });

  const loadingDives = diveQueries.some((q) => q.isLoading);

  const eventSeries: TrendlineSeries[] = [
    { key: 'score', label: discipline, color: SERIES_COLORS[0], points: eventPoints },
  ];

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
            <TrendlineChart series={eventSeries} height={240} />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dive Trendline</h2>
          {selectedDives.length > 0 && (
            <button
              onClick={() => setSelectedDives([])}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-slate-200 transition duration-150 cursor-pointer"
            >
              Deselect all
            </button>
          )}
        </div>
        <div className="flex gap-5">
          {/* Grouped dive selector */}
          <div className="w-56 shrink-0 border border-slate-700 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            {diveOptions.length === 0 ? (
              <p className="text-slate-500 text-xs p-3">No competition dives yet.</p>
            ) : (
              BOARD_ORDER.filter((b) => grouped[b] && Object.keys(grouped[b]!).length).map((board) => (
                <div key={board}>
                  <div className="bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide sticky top-0 z-10">
                    {board}
                  </div>
                  {DIVE_GROUPS.filter((g) => grouped[board]![g.digit]?.length).map((g) => {
                    const groupKey = `${board}|${g.digit}`;
                    const isOpen = openGroups.has(groupKey);
                    const entries = grouped[board]![g.digit]!;
                    // Colors of any selected dives in this group, for the collapsed indicator.
                    const selectedColors = entries
                      .map((entry) =>
                        selectedDives.findIndex(
                          (d) => d.diveCode === entry.dive_code && d.board === entry.board,
                        ),
                      )
                      .filter((idx) => idx !== -1)
                      .map((idx) => SERIES_COLORS[idx]);
                    return (
                      <div key={g.digit}>
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <span
                            className={`text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          >
                            ▸
                          </span>
                          <span className={selectedColors.length && !isOpen ? 'text-slate-100' : ''}>
                            {g.label}
                          </span>
                          {!isOpen && selectedColors.length > 0 && (
                            <span className="flex items-center gap-1">
                              {selectedColors.map((c, i) => (
                                <span
                                  key={i}
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: c }}
                                />
                              ))}
                            </span>
                          )}
                          <span className="text-slate-600 ml-auto">{entries.length}</span>
                        </button>
                        {isOpen &&
                          entries.map((entry) => {
                            const selIdx = selectedDives.findIndex(
                              (d) => d.diveCode === entry.dive_code && d.board === entry.board,
                            );
                            const isSelected = selIdx !== -1;
                            const color = isSelected ? SERIES_COLORS[selIdx] : null;
                            return (
                              <button
                                key={`${entry.dive_code}|${entry.board}`}
                                onClick={() => toggleDive(entry)}
                                className={`w-full text-left pl-8 pr-3 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer hover:bg-slate-800/60 ${
                                  isSelected ? 'bg-slate-800/40' : ''
                                }`}
                              >
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 border"
                                  style={
                                    color
                                      ? { background: color, borderColor: color }
                                      : { borderColor: '#475569' }
                                  }
                                />
                                <span className={isSelected ? 'text-slate-100' : 'text-slate-400'}>
                                  {entry.dive_code}
                                </span>
                                <span className="text-slate-600 ml-auto">
                                  avg {entry.avg_score.toFixed(1)}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Chart */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {selectedDives.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
                Select one or more dives to compare
              </div>
            ) : loadingDives ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">Loading…</div>
            ) : (
              <TrendlineChart series={diveSeries} height={240} />
            )}
          </div>
        </div>
      </section>

      <section>
        <button
          onClick={() => setShowBoxPlot((v) => !v)}
          className="flex items-center gap-2 text-lg font-semibold mb-4 cursor-pointer group"
        >
          <span className={`text-slate-500 text-sm transition-transform ${showBoxPlot ? 'rotate-90' : ''}`}>
            ▸
          </span>
          <span className="group-hover:text-slate-300 transition-colors">Score Distribution</span>
        </button>
        {showBoxPlot && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            {selectedDives.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
                Select one or more dives to compare distributions
              </div>
            ) : (
              <BoxPlotChart series={boxSeries} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function HistoryTab({ diverId }: { diverId: string }) {
  const { data: history = [], isLoading } = useCompetitionHistory(diverId);

  if (isLoading) {
    return <div className="text-slate-500 text-sm py-8">Loading…</div>;
  }
  if (history.length === 0) {
    return <p className="text-slate-500 text-sm">No competition history yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {history.map((comp) => (
        <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="font-medium">{comp.name}</p>
            {comp.event_date && (
              <p className="text-slate-500 text-xs shrink-0 ml-4">
                {new Date(comp.event_date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            )}
          </div>
          {comp.events.map((event) => (
            <div key={event.id} className="border-t border-slate-800 pt-3 mt-2">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">
                {event.discipline === 'platform' ? 'Platform' : event.discipline}
              </p>
              <div className="flex flex-col gap-1">
                {event.dives.map((dive, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm font-mono">
                      {dive.dive_code} · {dive.board}
                    </span>
                    <span className="text-cyan-400 text-sm font-medium">
                      {dive.total_score != null ? dive.total_score.toFixed(2) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DiverProfile({ diver }: Props): JSX.Element {
  const { section } = useParams<{ section?: string }>();
  const view = section === 'history' || section === 'statistics' ? section : 'profile';

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{diver.name}</h1>
        {(diver.city || diver.country) && (
          <p className="text-slate-400 text-sm">
            {[diver.city, diver.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {view === 'profile' && (
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

      {view === 'history' && diver.diver_id && (
        <HistoryTab diverId={diver.diver_id} />
      )}

      {view === 'statistics' && diver.diver_id && (
        <StatisticsTab diverId={diver.diver_id} />
      )}
    </div>
  );
}

export default DiverProfile;
