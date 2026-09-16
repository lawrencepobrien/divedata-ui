import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useRoster } from '../hooks/useCoach';
import { diverKeys } from '../hooks/useDiver';
import { diversApi } from '../api/diver';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { DiverStats, CompStatEntry } from '../types/stats';
import { TrendlineChart, type TrendlineSeries, type PointClickInfo } from '../components/charts/TrendlineChart';
import { BoxPlotChart, type BoxPlotSeries } from '../components/charts/BoxPlotChart';

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: 'platform', label: 'Platform' },
];

const BOARD_ORDER: BoardType[] = ['1m', '3m', '5m', '7.5m', '10m'];

const DIVE_GROUPS: { digit: string; label: string }[] = [
  { digit: '1', label: 'Forward' },
  { digit: '2', label: 'Back' },
  { digit: '3', label: 'Reverse' },
  { digit: '4', label: 'Inward' },
  { digit: '5', label: 'Twist' },
  { digit: '6', label: 'Armstand' },
];

const SERIES_COLORS = ['#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];
const MAX_DIVERS = SERIES_COLORS.length;
const MIN_DIVERS = 2;

interface SelectedDive {
  diveCode: string;
  board: BoardType;
}

interface Summary {
  totalDives: number;
  avgScore: number;
  bestScore: number;
}

function summarize(stats: DiverStats | undefined): Summary | null {
  const entries = [...(stats?.competition ?? []), ...(stats?.training ?? [])];
  const totalDives = entries.reduce((sum, e) => sum + e.dive_count, 0);
  if (totalDives === 0) return null;
  const avgScore = entries.reduce((sum, e) => sum + e.avg_score * e.dive_count, 0) / totalDives;
  const bestScore = entries.reduce((max, e) => Math.max(max, e.max_score), -Infinity);
  return { totalDives, avgScore, bestScore };
}

export default function ComparePage(): JSX.Element {
  const navigate = useNavigate();
  const { data: roster = [], isLoading: loadingRoster } = useRoster();
  const [selected, setSelected] = useState<string[]>([]);
  const [discipline, setDiscipline] = useState<Discipline>('platform');
  const [selectedDive, setSelectedDive] = useState<SelectedDive | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [showBoxPlot, setShowBoxPlot] = useState(false);

  useEffect(() => {
    if (selected.length === 0 && roster.length > 0) {
      setSelected(roster.slice(0, MIN_DIVERS).map((d) => d.diver_id));
    }
  }, [roster, selected.length]);

  const rosterById = useMemo(() => new Map(roster.map((d) => [d.diver_id, d])), [roster]);
  const nameFor = (diverId: string) => rosterById.get(diverId)?.name || rosterById.get(diverId)?.email || diverId;

  // A dive selected under one lineup of divers may not exist for a different
  // lineup — avoid comparing a stale selection against divers who never did it.
  const setSlot = (index: number, diverId: string) => {
    setSelected((prev) => prev.map((id, i) => (i === index ? diverId : id)));
    setSelectedDive(null);
  };

  const removeSlot = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
    setSelectedDive(null);
  };

  const addSlot = () => {
    const next = roster.find((d) => !selected.includes(d.diver_id));
    if (next) setSelected((prev) => [...prev, next.diver_id]);
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const eventQueries = useQueries({
    queries: selected.map((diverId) => ({
      queryKey: diverKeys.eventTrendline(diverId, discipline),
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<TrendlinePoint[]> => {
        const data = await diversApi.getEventTrendline(diverId, discipline, undefined, signal);
        return data.points.map((pt) => ({ date: pt.date, score: pt.score, label: pt.competition }));
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const statsQueries = useQueries({
    queries: selected.map((diverId) => ({
      queryKey: diverKeys.statsDetail(diverId, undefined),
      queryFn: ({ signal }: { signal: AbortSignal }) => diversApi.getStats(diverId, undefined, signal),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoadingCharts = eventQueries.some((q) => q.isLoading);

  const series: TrendlineSeries[] = selected.map((diverId, i) => ({
    key: diverId,
    label: nameFor(diverId),
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: eventQueries[i]?.data ?? [],
  }));

  const handlePointClick = (info: PointClickInfo) => {
    if (info.seriesKey) navigate(`/profile/${info.seriesKey}/competitions`);
  };

  // Union of every dive any selected diver has logged — a diver missing a
  // given dive just renders as "no data" in that dive's trendline/box row.
  const diveOptions = useMemo(() => {
    const seen = new Map<string, CompStatEntry>();
    statsQueries.forEach((q) => {
      (q.data?.competition ?? []).forEach((e) => seen.set(`${e.dive_code}|${e.board}`, e));
      (q.data?.training ?? []).forEach((e) => {
        const key = `${e.dive_code}|${e.board}`;
        if (!seen.has(key)) {
          seen.set(key, {
            dive_code: e.dive_code,
            board: e.board,
            dive_count: e.dive_count,
            avg_score: e.avg_score,
            min_score: e.min_score,
            max_score: e.max_score,
            q1_score: NaN,
            median_score: e.median_score,
            q3_score: NaN,
          });
        }
      });
    });
    return [...seen.values()];
  }, [statsQueries]);

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

  const diveTrendlineQueries = useQueries({
    queries: selected.map((diverId) => ({
      queryKey: diverKeys.diveTrendline(diverId, selectedDive?.diveCode ?? '', selectedDive?.board ?? '1m'),
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<TrendlinePoint[]> => {
        const data = await diversApi.getDiveTrendline(diverId, selectedDive!.diveCode, selectedDive!.board, undefined, signal);
        return data.points.map((pt) => ({
          date: pt.date,
          score: pt.score,
          label: pt.competition,
          id: pt.id,
          source: pt.source,
        }));
      },
      enabled: !!selectedDive,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const loadingDiveTrendlines = diveTrendlineQueries.some((q) => q.isLoading);

  const diveSeries: TrendlineSeries[] = selected.map((diverId, i) => ({
    key: diverId,
    label: nameFor(diverId),
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: diveTrendlineQueries[i]?.data ?? [],
  }));

  const handleDivePointClick = (info: PointClickInfo) => {
    if (info.seriesKey && info.id) navigate(`/profile/${info.seriesKey}/dives/${info.id}`);
  };

  // Only real competition entries carry quartiles — training-only entries in
  // diveOptions above use NaN q1/q3 sentinels, so look this up against each
  // diver's raw competition stats rather than the merged diveOptions.
  const boxSeries: BoxPlotSeries[] = selected.map((diverId, i) => {
    const entry = (statsQueries[i]?.data?.competition ?? []).find(
      (e) => e.dive_code === selectedDive?.diveCode && e.board === selectedDive?.board,
    );
    return {
      key: diverId,
      label: nameFor(diverId),
      color: SERIES_COLORS[i % SERIES_COLORS.length],
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

  const toggleDive = (entry: CompStatEntry) => {
    setSelectedDive((prev) =>
      prev && prev.diveCode === entry.dive_code && prev.board === entry.board
        ? null
        : { diveCode: entry.dive_code, board: entry.board },
    );
  };

  if (loadingRoster) {
    return <div className="max-w-5xl mx-auto px-6 py-12 text-slate-500 text-sm">Loading…</div>;
  }

  if (roster.length < MIN_DIVERS) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Compare divers</h1>
        <p className="text-slate-500 text-sm">You need at least two divers on your roster to compare.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-1">Compare divers</h1>
      <p className="text-slate-400 mb-8">See how divers on your roster stack up against each other.</p>

      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {selected.map((diverId, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            <select
              value={diverId}
              onChange={(e) => setSlot(i, e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer"
            >
              {roster
                .filter((d) => d.diver_id === diverId || !selected.includes(d.diver_id))
                .map((d) => (
                  <option key={d.diver_id} value={d.diver_id}>
                    {d.name || d.email}
                  </option>
                ))}
            </select>
            {selected.length > MIN_DIVERS && (
              <button
                onClick={() => removeSlot(i)}
                className="text-slate-600 hover:text-rose-400 text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {selected.length < MAX_DIVERS && selected.length < roster.length && (
          <button
            onClick={addSlot}
            className="text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer transition-colors"
          >
            + Add diver
          </button>
        )}
      </div>

      <section className="mb-8">
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
          {isLoadingCharts ? (
            <div className="flex items-center justify-center h-60 text-slate-500 text-sm">Loading…</div>
          ) : (
            <TrendlineChart series={series} height={280} onPointClick={handlePointClick} />
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Dive Trendline</h2>
        <div className="flex gap-5">
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
                    const isGroupSelected = entries.some(
                      (entry) => selectedDive?.diveCode === entry.dive_code && selectedDive?.board === entry.board,
                    );
                    return (
                      <div key={g.digit}>
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <span className={`text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
                          <span className={isGroupSelected && !isOpen ? 'text-cyan-400' : ''}>{g.label}</span>
                          <span className="text-slate-600 ml-auto">{entries.length}</span>
                        </button>
                        {isOpen &&
                          entries.map((entry) => {
                            const isSelected =
                              selectedDive?.diveCode === entry.dive_code && selectedDive?.board === entry.board;
                            return (
                              <button
                                key={`${entry.dive_code}|${entry.board}`}
                                onClick={() => toggleDive(entry)}
                                className={`w-full text-left pl-8 pr-3 py-2 text-xs flex items-center gap-2 transition-colors cursor-pointer hover:bg-slate-800/60 ${
                                  isSelected ? 'bg-slate-800/40' : ''
                                }`}
                              >
                                <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>{entry.dive_code}</span>
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

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
            {selectedDive === null ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
                Select a dive to compare across divers
              </div>
            ) : loadingDiveTrendlines ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">Loading…</div>
            ) : (
              <TrendlineChart series={diveSeries} height={240} onPointClick={handleDivePointClick} />
            )}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <button
          onClick={() => setShowBoxPlot((v) => !v)}
          className="flex items-center gap-2 text-lg font-semibold mb-4 cursor-pointer group"
        >
          <span className={`text-slate-500 text-sm transition-transform ${showBoxPlot ? 'rotate-90' : ''}`}>▸</span>
          <span className="group-hover:text-slate-300 transition-colors">Score Distribution</span>
        </button>
        {showBoxPlot && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            {selectedDive === null ? (
              <div className="flex items-center justify-center h-60 text-slate-500 text-sm">
                Select a dive to compare score distributions
              </div>
            ) : (
              <BoxPlotChart series={boxSeries} />
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selected.map((diverId, i) => {
            const summary = summarize(statsQueries[i]?.data);
            return (
              <div
                key={diverId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 border-l-4"
                style={{ borderLeftColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
              >
                <p className="text-slate-100 font-medium mb-3 truncate">{nameFor(diverId)}</p>
                {statsQueries[i]?.isLoading ? (
                  <p className="text-slate-500 text-xs">Loading…</p>
                ) : !summary ? (
                  <p className="text-slate-500 text-xs">No dives logged yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total dives</span>
                      <span className="text-slate-200 font-medium">{summary.totalDives}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg score</span>
                      <span className="text-cyan-400 font-medium">{summary.avgScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Best score</span>
                      <span className="text-cyan-400 font-medium">{summary.bestScore.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
