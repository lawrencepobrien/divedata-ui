import './App.css';
import { useState, useEffect } from 'react';
import keycloak from './auth/keycloak';
import { meApi } from './api/me';
import { User } from './types/user';
import LandingPage from './landing/LandingPage';

type AppState = 'loading' | 'unauthenticated' | 'authenticated';

function App(): JSX.Element {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      })
      .then(async (authenticated) => {
        if (!authenticated) {
          setAppState('unauthenticated');
          return;
        }
        const me = await meApi.get();
        setUser(me);
        setAppState('authenticated');
      })
      .catch(() => setAppState('unauthenticated'));
  }, []);

  const handleSignOut = () => {
    setUser(null);
    keycloak.logout();
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (appState === 'unauthenticated') {
    return <LandingPage />;
  }

  // Authenticated — dashboard goes here
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          Dive<span className="text-cyan-400">Data</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user?.full_name}</span>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-slate-200 text-sm transition duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-400">Welcome back, {user?.full_name}.</p>
      </div>
    </div>
  );
}

export default App;
