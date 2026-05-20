import { Coach } from '../types/profile';

interface Props {
  coach: Coach;
  onSignOut: () => void;
}

function CoachDashboard({ coach, onSignOut }: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          Dive<span className="text-cyan-400">Data</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{coach.name}</span>
          <button
            onClick={onSignOut}
            className="text-slate-500 hover:text-slate-300 text-sm transition duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-1">Welcome, Coach {coach.name}</h2>
        <p className="text-slate-400 mb-8">Your coaching dashboard is coming soon.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Team roster', description: 'View and manage your divers' },
            { label: 'Meets', description: 'Create and manage competitions' },
          ].map(({ label, description }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-100 font-medium mb-1">{label}</p>
              <p className="text-slate-500 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default CoachDashboard;
