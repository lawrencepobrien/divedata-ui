import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDives, useDeleteDive, useCompetitionHistory } from '../hooks/useDiver';
import LogDiveModal from './LogDiveModal';
import DiveFilterPanel, { EMPTY_DIVE_FILTERS, type DiveFilters } from './DiveFilterPanel';
import { getDiveDirection } from '../lib/diveCode';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

type Source = 'training' | 'competition';
type Filter = 'both' | Source;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'training', label: 'Training' },
  { value: 'competition', label: 'Competition' },
];

interface Row {
  id: string;
  diveCode: string;
  board: string;
  direction: string | null;
  totalScore: number | null;
  divedAt: string | null;
  source: Source;
  competitionName?: string;
}

type SortKey = 'diveCode' | 'board' | 'divedAt' | 'competitionName' | 'totalScore';
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; className: string; defaultDir: SortDir }[] = [
  { key: 'diveCode', label: 'Dive code', className: 'w-24 shrink-0', defaultDir: 'asc' },
  { key: 'board', label: 'Board', className: 'w-16 shrink-0', defaultDir: 'asc' },
  { key: 'divedAt', label: 'Date', className: 'w-28 shrink-0', defaultDir: 'desc' },
  { key: 'competitionName', label: 'Competition', className: 'flex-1 min-w-0', defaultDir: 'asc' },
  { key: 'totalScore', label: 'Score', className: 'w-20 shrink-0 text-right', defaultDir: 'desc' },
];

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

interface Props {
  diverId: string;
}

export default function DiveLogSection({ diverId }: Props): JSX.Element {
  const navigate = useNavigate();
  const { data: trainingDives = [], isLoading: loadingTraining } = useDives(diverId);
  const { data: history = [], isLoading: loadingHistory } = useCompetitionHistory(diverId);
  const deleteDive = useDeleteDive(diverId);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('both');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DiveFilters>(EMPTY_DIVE_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('divedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(COLUMNS.find((c) => c.key === key)!.defaultDir);
    }
  };

  const rows = useMemo<Row[]>(() => {
    const training: Row[] = trainingDives.map((d) => ({
      id: d.id,
      diveCode: d.dive_code,
      board: d.board,
      direction: getDiveDirection(d.dive_code),
      totalScore: d.total_score,
      divedAt: d.dived_at,
      source: 'training',
    }));
    const competition: Row[] = history.flatMap((comp) =>
      comp.events.flatMap((event) =>
        event.dives.map((dive) => ({
          id: dive.id,
          diveCode: dive.dive_code,
          board: dive.board,
          direction: getDiveDirection(dive.dive_code),
          totalScore: dive.total_score,
          divedAt: comp.event_date,
          source: 'competition' as const,
          competitionName: comp.name,
        })),
      ),
    );
    return [...training, ...competition];
  }, [trainingDives, history]);

  const availableCompetitions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.competitionName).filter((n): n is string => !!n))).sort(),
    [rows],
  );
  const availableDirections = useMemo(
    () => Array.from(new Set(rows.map((r) => r.direction).filter((d): d is string => !!d))).sort(),
    [rows],
  );
  const availableBoards = useMemo(() => Array.from(new Set(rows.map((r) => r.board))).sort(), [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'both' && r.source !== filter) return false;
      if (query) {
        const haystack = `${r.diveCode} ${r.board} ${r.competitionName ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.dateFrom && (!r.divedAt || r.divedAt < filters.dateFrom)) return false;
      if (filters.dateTo && (!r.divedAt || r.divedAt.slice(0, 10) > filters.dateTo)) return false;
      if (filters.competitions.size > 0 && (!r.competitionName || !filters.competitions.has(r.competitionName)))
        return false;
      if (filters.directions.size > 0 && (!r.direction || !filters.directions.has(r.direction))) return false;
      if (filters.boards.size > 0 && !filters.boards.has(r.board)) return false;
      return true;
    });
  }, [rows, filter, search, filters]);

  const sortedRows = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filteredRows].sort((a, b) => dir * compareValues(a[sortKey], b[sortKey]));
  }, [filteredRows, sortKey, sortDir]);

  const isLoading = loadingTraining || loadingHistory;

  return (
    <div className="mt-10">
      <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-900/40 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Dives</h2>
          <p className="text-slate-400 text-sm">Training and competition dives.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-4 py-2.5 text-sm transition duration-150 cursor-pointer shrink-0"
        >
          + Log
        </button>
      </div>

      <LogDiveModal diverId={diverId} open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dive code, board, competition…"
          className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs w-64 max-w-full
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-150"
        />
        <div className="flex gap-1.5">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                filter === value ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <DiveFilterPanel
          filters={filters}
          onChange={setFilters}
          availableCompetitions={availableCompetitions}
          availableDirections={availableDirections}
          availableBoards={availableBoards}
        />
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm py-4">Loading…</div>
      ) : rows.length === 0 ? (
        <p className="text-slate-500 text-sm">No dives logged yet.</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-slate-500 text-sm">No dives match your search/filters.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900/60">
            {COLUMNS.map(({ key, label, className }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs font-medium uppercase tracking-wide transition-colors cursor-pointer ${className} ${
                  key === 'totalScore' ? 'justify-end' : ''
                }`}
              >
                {label}
                {sortKey === key && <span className="text-cyan-400">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </button>
            ))}
            <span className="w-[52px] shrink-0" aria-hidden="true" />
          </div>

          <div className="divide-y divide-slate-800">
            {sortedRows.map((row) => (
              <div
                key={`${row.source}-${row.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
              >
                <button
                  onClick={() => navigate(`/profile/${diverId}/dives/${row.id}`)}
                  className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
                >
                  <span className="w-24 shrink-0 text-slate-200 text-sm font-mono">{row.diveCode}</span>
                  <span className="w-16 shrink-0 text-slate-500 text-xs font-mono">{row.board}</span>
                  <span className="w-28 shrink-0 text-slate-500 text-xs">{formatDate(row.divedAt)}</span>
                  <span className="flex-1 min-w-0">
                    {row.source === 'competition' && (
                      <span className="text-xs text-cyan-400/80 bg-cyan-500/10 rounded-full px-2 py-0.5 truncate max-w-[140px] inline-block">
                        {row.competitionName}
                      </span>
                    )}
                  </span>
                  <span className="w-20 shrink-0 text-cyan-400 text-sm font-medium text-right">
                    {row.totalScore != null ? row.totalScore.toFixed(2) : '—'}
                  </span>
                </button>
                <span className="w-[52px] shrink-0 flex justify-end">
                  {row.source === 'training' && (
                    <button
                      onClick={() => deleteDive.mutate(row.id)}
                      disabled={deleteDive.isPending}
                      className="text-slate-600 hover:text-rose-400 text-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
