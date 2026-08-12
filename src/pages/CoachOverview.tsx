import { useNavigate } from 'react-router-dom';
import { useRoster } from '../hooks/useCoach';

function CoachOverview(): JSX.Element {
  const { data: roster = [], isLoading } = useRoster();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Your team</h2>
      <p className="text-slate-400 mb-8">
        {roster.length === 0
          ? 'No divers on your roster yet.'
          : `${roster.length} diver${roster.length === 1 ? '' : 's'} on your roster.`}
      </p>

      {isLoading ? (
        <div className="text-slate-500 text-sm py-4">Loading…</div>
      ) : roster.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Head to the Register tab to invite your first diver.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roster.map((diver) => (
            <div
              key={diver.user_id}
              onClick={() => diver.has_profile && navigate(`/roster/${diver.user_id}`)}
              className={`bg-slate-900 border border-slate-800 rounded-xl p-5 transition duration-150 ${
                diver.has_profile ? 'hover:border-cyan-500 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-slate-100 font-medium">{diver.name || diver.email}</p>
                {!diver.has_profile && (
                  <span className="text-xs text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
                    Profile incomplete
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">{diver.email}</p>
              {diver.has_profile && (diver.city || diver.country) && (
                <p className="text-slate-500 text-xs mt-2">
                  {[diver.city, diver.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoachOverview;
