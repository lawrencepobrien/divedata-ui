import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import keycloak from './auth/keycloak';
import { profileApi } from './api/profile';
import { Profile } from './types/profile';
import LandingPage from './landing/LandingPage';
import ProfileSetup from './pages/ProfileSetup';
import DiverDashboard from './pages/DiverDashboard';
import CoachDashboard from './pages/CoachDashboard';
import DiverProfile from './pages/DiverProfile';

type AppState = 'loading' | 'unauthenticated' | 'needs-setup' | 'authenticated';

function App(): JSX.Element {
  const [appState, setAppState] = useState<AppState>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      })
      .then(async (authenticated) => {
        if (!authenticated) {
          setAppState('unauthenticated');
          return;
        }
        const p = await profileApi.get();
        if (!p.type) {
          setAppState('needs-setup');
          navigate('/setup');
        } else {
          setProfile(p);
          setAppState('authenticated');
          navigate('/dashboard');
        }
      })
      .catch(() => setAppState('unauthenticated'));
  }, []);

  const handleSignOut = () => {
    setProfile(null);
    keycloak.logout();
  };

  const handleProfileComplete = (p: Profile) => {
    setProfile(p);
    setAppState('authenticated');
    navigate('/dashboard');
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
        path="/setup"
        element={
          appState === 'needs-setup'
            ? <ProfileSetup onComplete={handleProfileComplete} />
            : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/dashboard"
        element={
          appState === 'unauthenticated' ? <Navigate to="/" replace /> :
          appState === 'needs-setup' ? <Navigate to="/setup" replace /> :
          profile?.type === 'diver'
            ? <DiverDashboard diver={profile.diver!} onSignOut={handleSignOut} />
            : <CoachDashboard coach={profile.coach!} onSignOut={handleSignOut} />
        }
      />
      <Route
        path="/profile"
        element={
          appState !== 'authenticated' || profile?.type !== 'diver'
            ? <Navigate to="/dashboard" replace />
            : <DiverProfile
                diver={profile.diver!}
                onSignOut={handleSignOut}
                onBack={() => navigate('/dashboard')}
              />
        }
      />
    </Routes>
  );
}

export default App;
