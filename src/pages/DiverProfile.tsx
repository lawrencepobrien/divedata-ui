import type { DiverProfile } from '../types/profile';
import DiveLogSection from '../components/DiveLogSection';

interface Props {
  diver: DiverProfile;
}

function DiverProfile({ diver }: Props): JSX.Element {
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

      {diver.id && <DiveLogSection diverId={diver.id} />}
    </div>
  );
}

export default DiverProfile;
