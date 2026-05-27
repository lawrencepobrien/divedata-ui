import { Diver } from '../types/diver';

interface Props {
  diver: Diver;
  onSignOut: () => void;
  onBack?: () => void;
}

function DiverProfile({ diver, onSignOut, onBack }: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          Dive<span className="text-cyan-400">Data</span>
        </span>
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-slate-300 text-sm transition duration-150 cursor-pointer"
            >
              ← Back
            </button>
          )}
          <span className="text-slate-400 text-sm">{diver.name}</span>
          <button
            onClick={onSignOut}
            className="text-slate-500 hover:text-slate-300 text-sm transition duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{diver.name}</h1>
          {(diver.city || diver.country) && (
            <p className="text-slate-400 text-sm">
              {[diver.city, diver.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
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

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Teams</h2>
          {diver.teams?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {diver.teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-slate-500 text-sm">
                      {[team.state, team.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">{team.code}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No teams yet.</p>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Dive Repertoire</h2>
          {diver.dives?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {diver.dives.map((dive) => (
                <div
                  key={dive.dive_code}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{dive.description}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {[dive.direction, dive.position].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-mono mb-0.5">{dive.dive_code}</p>
                    <p className="text-cyan-400 text-sm font-semibold">{dive.dd} DD</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No dives added yet.</p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Competition History</h2>
          {diver.history?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {diver.history.map((sheet) => (
                <div key={sheet.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{sheet.meet?.name || '—'}</p>
                      <p className="text-slate-500 text-sm">{sheet.team?.name || '—'}</p>
                    </div>
                    {sheet.meet?.start_date && (
                      <p className="text-slate-500 text-xs">
                        {new Date(sheet.meet.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {sheet.dive_scores?.length > 0 && (
                    <div className="flex flex-col gap-1 border-t border-slate-800 pt-3 mt-1">
                      {sheet.dive_scores.map((ds, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">{ds.dive.description}</span>
                          <span className="text-cyan-400 text-sm font-medium">
                            {ds.total_score.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No competition history yet.</p>
          )}
        </section>

      </main>
    </div>
  );
}

export default DiverProfile;
