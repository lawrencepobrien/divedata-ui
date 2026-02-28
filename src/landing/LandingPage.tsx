import { useState } from 'react';
import TextInput from '../components/Connected/TextInput/TextInput';
import { authApi } from '../api/auth';

function LandingPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('access_token', res.access_token);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
            Dive<span className="text-cyan-400">Data</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/40">
          <div className="flex flex-col gap-5">
            <TextInput
              label="Email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-1 w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed
                         text-slate-950 font-semibold rounded-lg py-2.5 text-sm
                         transition duration-150 cursor-pointer"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingPage;
