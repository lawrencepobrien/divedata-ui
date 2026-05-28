import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import keycloak from './auth/keycloak';
import { profileApi } from './api/profile';
import { Profile } from './types/profile';
import Layout from './components/Layout';
import LandingPage from './landing/LandingPage';
import DiverProfile from './pages/DiverProfile';
import ProfileSetup from './pages/ProfileSetup';

type AppState = 'loading' | 'unauthenticated' | 'authenticated';

function App(): JSX.Element {
  const [appState, setAppState] = useState<AppState>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

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
        try {
          const p = await profileApi.get();
          setProfile(p);
        } catch {
          // No profile yet — that's fine, pages will handle it
        }
        setAppState('authenticated');
        navigate('/dashboard');
      })
      .catch(() => setAppState('unauthenticated'));
  }, []);

  const handleSignOut = () => {
    setProfile(null);
    keycloak.logout();
  };

  const handleProfileComplete = (p: Profile) => {
    setProfile(p);
    navigate('/profile');
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          appState === 'unauthenticated'
            ? <LandingPage />
            : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/dashboard"
        element={
          appState === 'unauthenticated'
            ? <Navigate to="/" replace />
            : <Layout onSignOut={handleSignOut}>
                <p className="text-slate-400">Welcome back.</p>
              </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          appState === 'unauthenticated'
            ? <Navigate to="/" replace />
            : <Layout onSignOut={handleSignOut}>
                {profile?.diver
                  ? <DiverProfile diver={profile.diver} />
                  : <div className="flex flex-col items-start gap-4">
                      <div>
                        <h2 className="text-xl font-semibold mb-1">No profile yet</h2>
                        <p className="text-slate-400 text-sm">Create a profile to get started.</p>
                      </div>
                      <button
                        onClick={() => navigate('/setup')}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition duration-150 cursor-pointer"
                      >
                        Create profile
                      </button>
                    </div>
                }
              </Layout>
        }
      />
      <Route
        path="/setup"
        element={
          appState === 'unauthenticated'
            ? <Navigate to="/" replace />
            : <Layout onSignOut={handleSignOut}>
                <ProfileSetup onComplete={handleProfileComplete} />
              </Layout>
        }
      />
    </Routes>
  );
}

export default App;
