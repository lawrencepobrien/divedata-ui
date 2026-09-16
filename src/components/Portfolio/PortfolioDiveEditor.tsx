import { useMemo, useState } from 'react';
import DiveLogSection from '../DiveLogSection';
import { useAddEntry } from '../../hooks/usePortfolio';
import { useRoster } from '../../hooks/useCoach';
import type { PortfolioEntry } from '../../types/portfolio';

interface Props {
  portfolioId: string;
  /** Set when a coach is managing a diver's portfolio (/users/:id/portfolios). */
  ownerId?: string;
  /** The portfolio owner's diver profile — blank for a coach's own portfolio. */
  diverId?: string;
  entries: PortfolioEntry[];
}

/**
 * The profile's log-and-browse dive interface, rewired so each row files its
 * dive into this portfolio instead of linking to the dive page. Shown only
 * while the portfolio is in edit mode.
 */
function PortfolioDiveEditor({ portfolioId, ownerId, diverId, entries }: Props): JSX.Element {
  const addEntry = useAddEntry(ownerId);
  // A coach's own portfolio has no single diver, so pick one off the roster.
  // The roster query only runs in that case — a diver has no roster to fetch.
  const needsPicker = !diverId;
  const { data: roster = [], isLoading: loadingRoster } = useRoster(needsPicker);
  const [pickedDiverId, setPickedDiverId] = useState<string | null>(null);

  const activeDiverId = diverId ?? pickedDiverId ?? undefined;

  const addedIds = useMemo(() => new Set(entries.map((e) => e.item_id)), [entries]);

  const handleAdd = (diveId: string) => {
    addEntry.mutate({ portfolioId, body: { item_type: 'dive', item_id: diveId } });
  };

  return (
    <div className="border border-cyan-900/40 bg-slate-900/40 rounded-xl p-5 mb-8">
      <p className="text-slate-400 text-sm">
        Pick a dive below to add it to this portfolio. Dives you log here are added automatically.
      </p>

      {needsPicker && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Diver</p>
          {loadingRoster ? (
            <p className="text-slate-500 text-sm">Loading roster…</p>
          ) : roster.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No divers on your roster yet — add one from the Team page first.
            </p>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {roster.map((d) => (
                <button
                  key={d.diver_id}
                  onClick={() => setPickedDiverId(d.diver_id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                    pickedDiverId === d.diver_id
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.name || d.email}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {addEntry.isError && (
        <p className="text-rose-400 text-xs mt-3">
          {addEntry.error instanceof Error ? addEntry.error.message : 'Failed to add dive.'}
        </p>
      )}

      {activeDiverId ? (
        <DiveLogSection
          key={activeDiverId}
          diverId={activeDiverId}
          title="Add dives"
          subtitle="Log a new dive, or add an existing one to this portfolio."
          selection={{
            addedIds,
            onAdd: handleAdd,
            pendingId: addEntry.isPending ? addEntry.variables?.body.item_id : null,
          }}
          onDiveLogged={handleAdd}
        />
      ) : (
        needsPicker &&
        !loadingRoster &&
        roster.length > 0 && (
          <p className="text-slate-500 text-sm mt-4">Choose a diver to see their dives.</p>
        )
      )}
    </div>
  );
}

export default PortfolioDiveEditor;
