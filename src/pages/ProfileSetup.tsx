import { useState } from 'react';
import { profileApi, CreateDiverRequest } from '../api/profile';
import { Profile } from '../types/profile';
import TextInput from '../components/Connected/TextInput/TextInput';

type Step = 'choose' | 'diver-form' | 'coach-form';

interface Props {
  onComplete: (profile: Profile) => void;
}

function ProfileSetup({ onComplete }: Props): JSX.Element {
  const [step, setStep] = useState<Step>('choose');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [diverAge, setDiverAge] = useState('');
  const [diverFinaAge, setDiverFinaAge] = useState('');
  const [diverGender, setDiverGender] = useState('');
  const [diverCountry, setDiverCountry] = useState('');
  const [diverCity, setDiverCity] = useState('');

  const handleCreateDiver = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: CreateDiverRequest = {
        age: parseInt(diverAge) || 0,
        fina_age: parseInt(diverFinaAge) || 0,
        gender: diverGender,
        country: diverCountry,
        city: diverCity,
      };
      const profile = await profileApi.createDiver(body);
      onComplete(profile);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoach = async () => {
    setError(null);
    setLoading(true);
    try {
      const profile = await profileApi.createCoach();
      onComplete(profile);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Set up your profile</h2>
        <p className="text-slate-400 text-sm">Choose how you'll be using DiveData.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

        {step === 'choose' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setStep('diver-form')}
              className="group flex flex-col gap-1 border border-slate-700 hover:border-cyan-500
                         rounded-xl p-5 text-left transition duration-150 cursor-pointer"
            >
              <span className="text-slate-100 font-semibold group-hover:text-cyan-400 transition duration-150">
                I'm a Diver
              </span>
              <span className="text-slate-500 text-sm">
                Track your dives, scores, and competition history
              </span>
            </button>

            <button
              onClick={() => setStep('coach-form')}
              className="group flex flex-col gap-1 border border-slate-700 hover:border-cyan-500
                         rounded-xl p-5 text-left transition duration-150 cursor-pointer"
            >
              <span className="text-slate-100 font-semibold group-hover:text-cyan-400 transition duration-150">
                I'm a Coach
              </span>
              <span className="text-slate-500 text-sm">
                Manage your team's roster, meets, and dive sheets
              </span>
            </button>
          </div>
        )}

        {step === 'diver-form' && (
          <div className="flex flex-col gap-5">
            <button
              onClick={() => { setStep('choose'); setError(null); }}
              className="text-slate-500 hover:text-slate-300 text-sm text-left transition duration-150 cursor-pointer"
            >
              ← Back
            </button>
            <p className="text-slate-300 font-medium">Diver details</p>

            <div className="grid grid-cols-2 gap-4">
              <TextInput label="Age" type="number" onChange={(e) => setDiverAge(e.target.value)} />
              <TextInput label="FINA age" type="number" onChange={(e) => setDiverFinaAge(e.target.value)} />
            </div>

            <TextInput label="Gender" onChange={(e) => setDiverGender(e.target.value)} />
            <TextInput label="Country" onChange={(e) => setDiverCountry(e.target.value)} />
            <TextInput label="City" onChange={(e) => setDiverCity(e.target.value)} />

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleCreateDiver}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed
                         text-slate-950 font-semibold rounded-lg py-2.5 text-sm
                         transition duration-150 cursor-pointer"
            >
              {loading ? 'Creating profile…' : 'Create diver profile'}
            </button>
          </div>
        )}

        {step === 'coach-form' && (
          <div className="flex flex-col gap-5">
            <button
              onClick={() => { setStep('choose'); setError(null); }}
              className="text-slate-500 hover:text-slate-300 text-sm text-left transition duration-150 cursor-pointer"
            >
              ← Back
            </button>
            <p className="text-slate-300 font-medium">Coach details</p>
            <p className="text-slate-500 text-sm">
              Your name is taken from your account automatically.
            </p>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleCreateCoach}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed
                         text-slate-950 font-semibold rounded-lg py-2.5 text-sm
                         transition duration-150 cursor-pointer"
            >
              {loading ? 'Creating profile…' : 'Create coach profile'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfileSetup;
