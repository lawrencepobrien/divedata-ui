import { useNavigate, useParams } from 'react-router-dom';
import { useCompetitionHistory } from '../hooks/useDiver';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CompetitionDetailPage() {
  const navigate = useNavigate();
  const { diverId, competitionId } = useParams<{ diverId: string; competitionId: string }>();

  const { data: history = [], isLoading, isError } = useCompetitionHistory(diverId);

  const competition = history.find((c) => c.id === competitionId);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back
      </button>

      {isLoading && (
        <div className="text-slate-500 text-sm">Loading…</div>
      )}

      {isError && (
        <div className="text-rose-400 text-sm">Failed to load competition.</div>
      )}

      {!isLoading && !isError && !competition && (
        <div className="text-slate-500 text-sm">Competition not found.</div>
      )}

      {competition && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{competition.name}</h1>
            {competition.event_date && (
              <p className="text-slate-400 text-sm">{formatDate(competition.event_date)}</p>
            )}
          </div>

          {competition.events.map((event) => (
            <div key={event.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">
                {event.discipline === 'platform' ? 'Platform' : event.discipline}
              </p>
              <div className="flex flex-col gap-2">
                {event.dives.map((dive, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800 last:border-0">
                    <span className="text-slate-300 text-sm font-mono">
                      {dive.dive_code}
                      <span className="text-slate-600 ml-2">· {dive.board}</span>
                    </span>
                    <span className="text-cyan-400 text-sm font-semibold">
                      {dive.total_score != null ? dive.total_score.toFixed(2) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
