import { useNavigate, useParams } from 'react-router-dom';
import { useRoster } from '../hooks/useCoach';
import PortfolioGrid from '../components/Portfolio/PortfolioGrid';

function RosterDiverDetail(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: roster = [], isLoading } = useRoster();
  const diver = roster.find((d) => d.user_id === userId);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-slate-500 text-sm">Loading…</div>;
  }

  if (!diver) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-500 text-sm">
          Diver not found — they may no longer be on your roster.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back to team
      </button>

      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-bold">{diver.name || diver.email}</h2>
        {!diver.has_profile && (
          <span className="text-xs text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
            Profile incomplete
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-8">
        {diver.email}
        {diver.has_profile && (diver.city || diver.country)
          ? ` · ${[diver.city, diver.country].filter(Boolean).join(', ')}`
          : ''}
      </p>

      <h3 className="text-lg font-semibold mb-4">Portfolios</h3>
      {diver.has_profile ? (
        <PortfolioGrid ownerId={diver.user_id} />
      ) : (
        <p className="text-slate-500 text-sm">
          This diver hasn't finished setting up their profile yet.
        </p>
      )}
    </div>
  );
}

export default RosterDiverDetail;
