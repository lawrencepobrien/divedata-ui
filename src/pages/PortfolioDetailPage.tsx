import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import {
  usePortfolioDetail,
  useRenamePortfolio,
  useDeletePortfolio,
  useRemoveEntry,
} from '../hooks/usePortfolio';
import type { PortfolioEntry } from '../types/portfolio';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function entryLabel(entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return entry.summary.competition_name ?? 'Competition';
  }
  return [entry.summary.dive_code, entry.summary.board].filter(Boolean).join(' · ') || 'Dive';
}

function entryMeta(entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return entry.summary.event_date ? formatDate(entry.summary.event_date) : '';
  }
  return entry.summary.total_score != null ? entry.summary.total_score.toFixed(2) : '—';
}

function entryHref(diverId: string, entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return `/profile/${diverId}/competitions/${entry.item_id}`;
  }
  const source = entry.item_type === 'training_dive' ? 'training' : 'competition';
  return `/profile/${diverId}/dives/${source}/${entry.item_id}`;
}

function PortfolioDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePortfolioDetail(id);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => profileApi.get() });

  const renamePortfolio = useRenamePortfolio();
  const deletePortfolio = useDeletePortfolio();
  const removeEntry = useRemoveEntry();

  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const diverId = profile?.diver?.diver_id;

  const startRenaming = () => {
    if (!data) return;
    setName(data.portfolio.name);
    setRenaming(true);
  };

  const handleRename = () => {
    if (!id || !name.trim()) {
      setRenaming(false);
      return;
    }
    renamePortfolio.mutate({ id, name: name.trim() }, { onSuccess: () => setRenaming(false) });
  };

  const handleDelete = () => {
    if (!id) return;
    deletePortfolio.mutate(id, { onSuccess: () => navigate('/') });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back to portfolios
      </button>

      {isLoading && <div className="text-slate-500 text-sm">Loading…</div>}
      {isError && <div className="text-rose-400 text-sm">Failed to load portfolio.</div>}

      {data && (
        <>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            {renaming ? (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-2xl font-bold
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            ) : (
              <h1
                onClick={startRenaming}
                className="text-2xl font-bold cursor-pointer hover:text-cyan-400 transition-colors"
                title="Click to rename"
              >
                {data.portfolio.name}
              </h1>
            )}

            {confirmingDelete ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">Delete this portfolio?</span>
                <button onClick={handleDelete} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-slate-500 hover:text-rose-400 text-sm cursor-pointer transition-colors"
              >
                Delete portfolio
              </button>
            )}
          </div>

          {data.entries.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Nothing here yet — add dives and competitions from their detail pages.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl p-6 aspect-[4/3] transition duration-150"
                >
                  <button
                    onClick={() => diverId && navigate(entryHref(diverId, entry))}
                    disabled={!diverId}
                    className="flex flex-col justify-between h-full w-full text-left cursor-pointer"
                  >
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      {entry.item_type === 'competition' ? 'Competition' : 'Dive'}
                    </span>
                    <span className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                      {entryLabel(entry)}
                    </span>
                    <span className="text-slate-500 text-sm">{entryMeta(entry)}</span>
                  </button>
                  <button
                    onClick={() => id && removeEntry.mutate({ portfolioId: id, entryId: entry.id })}
                    className="absolute top-3 right-3 text-slate-600 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PortfolioDetailPage;
