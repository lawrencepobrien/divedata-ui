import { useNavigate } from 'react-router-dom';

// Stands in for the old per-competition detail view. Competitions no longer
// have a stable id to look one up by (see migration 000030 — dd_competitions
// was folded onto dd_dives), and the real replacement experience hasn't been
// designed yet. Every "view competition" link in the app points here for now.
export default function CompetitionPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back
      </button>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-300 font-medium mb-1">Competition details are being redesigned</p>
        <p className="text-slate-500 text-sm">Check back soon.</p>
      </div>
    </div>
  );
}
