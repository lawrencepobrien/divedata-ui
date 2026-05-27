import { Link } from 'react-router-dom';
import { Diver } from '../types/diver';

interface Props {
  diver: Diver;
  onSignOut: () => void;
}

function DiverDashboard({ diver, onSignOut }: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          Dive<span className="text-cyan-400">Data</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{diver.name}</span>
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
        <h2 className="text-2xl font-bold mb-1">Welcome back, {diver.name}</h2>
        <p className="text-slate-400 mb-8">Your diver dashboard is coming soon.</p>

        <Link
          to="/profile"
          className="inline-block mb-8 text-sm text-cyan-400 hover:text-cyan-300 transition duration-150"
        >
          View my profile →
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Country', value: diver.country || '—' },
            { label: 'City', value: diver.city || '—' },
            { label: 'Age', value: diver.age ? String(diver.age) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className="text-slate-100 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default DiverDashboard;
