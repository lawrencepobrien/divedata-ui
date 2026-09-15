import { useEffect, useRef, useState } from 'react';

export interface DiveFilters {
  dateFrom: string; // yyyy-mm-dd, '' = unbounded
  dateTo: string;
  competitions: Set<string>; // empty = no restriction
  directions: Set<string>;
  boards: Set<string>;
}

export const EMPTY_DIVE_FILTERS: DiveFilters = {
  dateFrom: '',
  dateTo: '',
  competitions: new Set(),
  directions: new Set(),
  boards: new Set(),
};

export function countActiveFilters(f: DiveFilters): number {
  return (
    (f.dateFrom ? 1 : 0) +
    (f.dateTo ? 1 : 0) +
    (f.competitions.size > 0 ? 1 : 0) +
    (f.directions.size > 0 ? 1 : 0) +
    (f.boards.size > 0 ? 1 : 0)
  );
}

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

interface Props {
  filters: DiveFilters;
  onChange: (filters: DiveFilters) => void;
  availableCompetitions: string[];
  availableDirections: string[];
  availableBoards: string[];
}

export default function DiveFilterPanel({
  filters,
  onChange,
  availableCompetitions,
  availableDirections,
  availableBoards,
}: Props): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
          activeCount > 0 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
        }`}
      >
        Filters
        {activeCount > 0 && (
          <span className="bg-slate-950/20 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl z-20 flex flex-col gap-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Date range</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-slate-600 text-xs">to</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <CheckboxGroup
            label="Competitions"
            options={availableCompetitions}
            selected={filters.competitions}
            emptyText="No competitions logged yet."
            onToggle={(value) => onChange({ ...filters, competitions: toggle(filters.competitions, value) })}
          />

          <CheckboxGroup
            label="Direction"
            options={availableDirections}
            selected={filters.directions}
            emptyText="No dives logged yet."
            onToggle={(value) => onChange({ ...filters, directions: toggle(filters.directions, value) })}
          />

          <CheckboxGroup
            label="Board"
            options={availableBoards}
            selected={filters.boards}
            emptyText="No dives logged yet."
            onToggle={(value) => onChange({ ...filters, boards: toggle(filters.boards, value) })}
          />

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange(EMPTY_DIVE_FILTERS)}
              className="text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer transition-colors self-start"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  emptyText,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  emptyText: string;
  onToggle: (value: string) => void;
}): JSX.Element {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">{label}</p>
      {options.length === 0 ? (
        <p className="text-slate-600 text-xs">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selected.has(option)}
                onChange={() => onToggle(option)}
                className="accent-cyan-500 cursor-pointer"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
