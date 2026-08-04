import type { CoachProfile as CoachProfileType } from '../types/profile';
import { useRoster } from '../hooks/useCoach';

interface Props {
  coach: CoachProfileType;
}

function CoachProfile({ coach }: Props): JSX.Element {
  const { data: roster = [] } = useRoster();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">{coach.name}</h1>
        <p className="text-slate-400 text-sm">Coach</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Roster size</p>
          <p className="text-slate-100 font-medium">{roster.length}</p>
        </div>
      </div>
    </div>
  );
}

export default CoachProfile;
