import { useNavigate } from 'react-router-dom';
import { useCompetitionHistory } from '../hooks/useDiver';

interface Props {
  diverId: string;
}

export default function HistoryPage({ diverId }: Props) {
  const navigate = useNavigate();
  const { data: history = [], isLoading } = useCompetitionHistory(diverId);

  if (isLoading) {
    return <div className="text-slate-500 text-sm py-8">Loading…</div>;
  }
  if (history.length === 0) {
    return <p className="text-slate-500 text-sm">No competition history yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Competition History</h1>
      <div className="flex flex-col gap-4">
        {history.map((comp) => (
          <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <button
                onClick={() => navigate(`/profile/${diverId}/competitions/${comp.id}`)}
                className="font-medium text-left hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {comp.name}
              </button>
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
                  {event.dives.map((dive) => (
                    <button
                      key={dive.id}
                      onClick={() => navigate(`/profile/${diverId}/dives/competition/${dive.id}`)}
                      className="flex items-center justify-between w-full px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    >
                      <span className="text-slate-400 text-sm font-mono">
                        {dive.dive_code} · {dive.board}
                      </span>
                      <span className="text-cyan-400 text-sm font-medium">
                        {dive.total_score != null ? dive.total_score.toFixed(2) : '—'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
