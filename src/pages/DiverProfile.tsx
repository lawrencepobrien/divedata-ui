import { useNavigate } from 'react-router-dom';
import type { DiverProfile } from '../types/profile';
import { useDives, useDeleteDive } from '../hooks/useDiver';

interface Props {
  diver: DiverProfile;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function DiverProfile({ diver }: Props): JSX.Element {
  const navigate = useNavigate();

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

      {diver.id && (
        <DiveLogSection diverId={diver.id} onAdd={() => navigate('/profile/me/dives/new')} />
      )}
    </div>
  );
}

function DiveLogSection({ diverId, onAdd }: { diverId: string; onAdd: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { data: dives = [], isLoading } = useDives(diverId);
  const deleteDive = useDeleteDive(diverId);

  return (
    <div className="mt-10">
      <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-900/40 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Logged Dives</h2>
          <p className="text-slate-400 text-sm">Dives you've logged outside of competition.</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-4 py-2.5 text-sm transition duration-150 cursor-pointer shrink-0"
        >
          + Add dive
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm py-4">Loading…</div>
      ) : dives.length === 0 ? (
        <p className="text-slate-500 text-sm">No dives logged yet.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {dives.map((dive) => (
            <div
              key={dive.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors"
            >
              <button
                onClick={() => navigate(`/profile/${diverId}/dives/${dive.id}`)}
                className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
              >
                <span className="text-slate-200 text-sm font-mono">{dive.dive_code}</span>
                <span className="text-slate-500 text-xs font-mono">{dive.board}</span>
                <span className="text-slate-500 text-xs">{formatDate(dive.dived_at)}</span>
                <span className="text-cyan-400 text-sm font-medium ml-auto">
                  {dive.total_score != null ? dive.total_score.toFixed(2) : '—'}
                </span>
              </button>
              <button
                onClick={() => deleteDive.mutate(dive.id)}
                disabled={deleteDive.isPending}
                className="text-slate-600 hover:text-rose-400 text-xs ml-4 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiverProfile;
