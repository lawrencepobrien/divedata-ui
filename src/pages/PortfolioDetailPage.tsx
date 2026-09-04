import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePortfolioDetail,
  useRenamePortfolio,
  useDeletePortfolio,
  useRemoveEntry,
} from '../hooks/usePortfolio';
import { useSharedPortfolioDetail } from '../hooks/usePortfolioShare';
import { useRoster } from '../hooks/useCoach';
import Breadcrumbs, { type Crumb } from '../components/Breadcrumbs';
import DiverTrendlines from '../components/DiverTrendlines';
import SharePortfolioButton from '../components/Portfolio/SharePortfolioButton';
import type { PortfolioEntry } from '../types/portfolio';

function entryScore(entry: PortfolioEntry): string {
  return entry.summary.total_score != null ? entry.summary.total_score.toFixed(2) : '—';
}

function entryDate(entry: PortfolioEntry): string | null {
  const iso = entry.summary.dived_at;
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function entryHref(entry: PortfolioEntry): string | null {
  // A coach's own portfolio can hold dives from several divers, so the link
  // target comes from the entry's own summary rather than a single
  // portfolio-level diver id.
  const diverId = entry.summary.diver_id;
  return diverId ? `/profile/${diverId}/dives/${entry.item_id}` : null;
}

type Tab = 'dives' | 'statistics';

const TABS: { value: Tab; label: string }[] = [
  { value: 'dives', label: 'Dives' },
  { value: 'statistics', label: 'Statistics' },
];

const BOARD_ORDER = ['1m', '3m', '5m', '7.5m', '10m'];

function groupByBoard(entries: PortfolioEntry[]): [string, PortfolioEntry[]][] {
  const groups = new Map<string, PortfolioEntry[]>();
  entries.forEach((entry) => {
    const board = entry.summary.board ?? 'Other';
    if (!groups.has(board)) groups.set(board, []);
    groups.get(board)!.push(entry);
  });
  return [...groups.entries()].sort(([a], [b]) => {
    const ai = BOARD_ORDER.indexOf(a);
    const bi = BOARD_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

interface Props {
  /** Read-only view of a portfolio someone else shared with the caller. */
  shared?: boolean;
}

function PortfolioDetailPage({ shared = false }: Props): JSX.Element {
  const { id, userId: ownerId } = useParams<{ id: string; userId?: string }>();
  const navigate = useNavigate();
  const ownDetail = usePortfolioDetail(shared ? undefined : id, ownerId);
  const sharedDetail = useSharedPortfolioDetail(shared ? id : undefined);
  const { data, isLoading, isError } = shared ? sharedDetail : ownDetail;
  const { data: roster = [] } = useRoster(!!ownerId);
  // The owner can share a portfolio only when viewing it as themself — not
  // through the coach-manages-a-diver's-portfolio path, and not a shared
  // (read-only) view of someone else's.
  const canManage = !ownerId && !shared;

  const renamePortfolio = useRenamePortfolio(ownerId);
  const deletePortfolio = useDeletePortfolio(ownerId);
  const removeEntry = useRemoveEntry(ownerId);

  const [tab, setTab] = useState<Tab>('dives');
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Cancelling (Escape, or the × button) unmounts/blurs the input — this
  // flag tells the blur handler that was a dismissal, not a commit, so it
  // doesn't save whatever was left typed.
  const cancelledRenameRef = useRef(false);

  const diverId = data?.diver_id;
  // Statistics needs one fixed diver to chart — blank for a coach's own
  // portfolio, which can mix dives from several divers.
  const availableTabs = diverId ? TABS : TABS.filter((t) => t.value !== 'statistics');
  const backHref = shared ? '/shared' : ownerId ? `/roster/${ownerId}` : '/';
  const portfolioHref = shared
    ? `/shared/${id}`
    : ownerId
      ? `/roster/${ownerId}/portfolios/${id}`
      : `/portfolios/${id}`;
  const portfolioName = data?.portfolio.name ?? 'Portfolio';
  const breadcrumbs: Crumb[] = shared
    ? [{ label: 'Shared with you', href: '/shared' }, { label: portfolioName }]
    : ownerId
      ? [
          { label: 'Team', href: '/' },
          { label: roster.find((d) => d.user_id === ownerId)?.name ?? 'Diver', href: backHref },
          { label: portfolioName },
        ]
      : [{ label: 'Portfolios', href: '/' }, { label: portfolioName }];
  // Same trail, but with the portfolio itself as a link — carried via router
  // state into the dive detail page so its breadcrumb can show "came from
  // this portfolio" instead of falling back to the generic diver/home trail.
  const diveBreadcrumbPrefix: Crumb[] = breadcrumbs.map((c, i) =>
    i === breadcrumbs.length - 1 ? { ...c, href: portfolioHref } : c,
  );

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

  const handleRenameBlur = () => {
    if (cancelledRenameRef.current) {
      cancelledRenameRef.current = false;
      return;
    }
    handleRename();
  };

  const cancelRenaming = () => {
    cancelledRenameRef.current = true;
    setRenaming(false);
  };

  const handleDelete = () => {
    if (!id) return;
    deletePortfolio.mutate(id, { onSuccess: () => navigate(backHref) });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {isLoading && <div className="text-slate-500 text-sm">Loading…</div>}
      {isError && <div className="text-rose-400 text-sm">Failed to load portfolio.</div>}

      {data && (
        <>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleRenameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    else if (e.key === 'Escape') cancelRenaming();
                  }}
                  className="text-2xl font-bold bg-transparent text-slate-100 border-0 border-b-2 border-cyan-500
                             p-0 m-0 leading-8 focus:outline-none focus:ring-0"
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={cancelRenaming}
                  aria-label="Cancel rename"
                  title="Cancel"
                  className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold leading-8">{data.portfolio.name}</h1>
                {!shared && (
                  <button
                    onClick={startRenaming}
                    aria-label="Rename portfolio"
                    title="Rename portfolio"
                    className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {!shared && (
              <div className="flex items-center gap-4">
                {canManage && id && <SharePortfolioButton portfolioId={id} />}
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
            )}
          </div>

          {data.entries.length === 0 ? (
            <p className="text-slate-500 text-sm">
              {shared
                ? 'Nothing in this portfolio yet.'
                : 'Nothing here yet — add dives and competitions from their detail pages.'}
            </p>
          ) : (
            <>
              <div role="tablist" className="flex gap-6 border-b border-slate-800 mb-8">
                {availableTabs.map(({ value, label }) => (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => setTab(value)}
                    className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                      tab === value
                        ? 'border-cyan-500 text-slate-100'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'statistics' && diverId && id && (
                <DiverTrendlines diverId={diverId} fixedPortfolioId={id} />
              )}

              {tab === 'dives' && (
                <div className="flex flex-col gap-8">
                  {groupByBoard(data.entries).map(([board, entries]) => (
                    <div key={board}>
                      <h2 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
                        {board}
                      </h2>
                      <div className="flex flex-col gap-3">
                        {entries.map((entry) => {
                          const href = entryHref(entry);
                          return (
                          <div
                            key={entry.id}
                            className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-xl transition duration-150"
                          >
                            <button
                              onClick={() =>
                                href &&
                                navigate(href, {
                                  state: { breadcrumbPrefix: diveBreadcrumbPrefix },
                                })
                              }
                              disabled={!href}
                              className={`flex items-center gap-4 w-full pl-5 pr-16 py-4 text-left ${
                                href ? 'cursor-pointer' : 'cursor-default'
                              }`}
                            >
                              <span className="font-mono text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                                {entry.summary.dive_code ?? '—'}
                              </span>
                              {entryDate(entry) && (
                                <span className="text-slate-500 text-sm">{entryDate(entry)}</span>
                              )}
                              <span className="text-slate-500 text-sm ml-auto shrink-0">{entryScore(entry)}</span>
                            </button>
                            {!shared && (
                              <button
                                onClick={() => id && removeEntry.mutate({ portfolioId: id, entryId: entry.id })}
                                className="absolute top-1/2 -translate-y-1/2 right-5 text-slate-600 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PortfolioDetailPage;
