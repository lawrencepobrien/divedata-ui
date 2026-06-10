import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import keycloak, { initKeycloak } from './auth/keycloak';
import { profileApi } from './api/profile';
import { useMe } from './hooks/useMe';
import LandingPage from './landing/LandingPage';
import Settings from './pages/Settings';
import DiverProfile from './pages/DiverProfile';
import ProfileSetup from './pages/ProfileSetup';
import { Sidebar, SidebarLayout } from './components/Sidebar';

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

function App(): JSX.Element {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => setAuthStatus(authenticated ? 'authenticated' : 'unauthenticated'))
      .catch(() => setAuthStatus('unauthenticated'));
  }, []);

  const authed = authStatus === 'authenticated';

  // Two separate concerns, both gated on a confirmed session:
  //   user    — the account record (identity, shown in the nav)
  //   profile — the diver/coach profile (may not exist yet)
  const { data: user } = useMe(authed);
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    enabled: authed,
  });

  const handleSignOut = () => keycloak.logout();

  const handleProfileComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    navigate('/profile/me');
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <LandingPage />;
  }

  const navItems = [
    { label: 'Overview', to: '/', active: pathname === '/' },
    { label: 'Profile', to: '/profile/me', active: pathname.startsWith('/profile') },
    { label: 'Settings', to: '/settings', active: pathname.startsWith('/settings') },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <nav className="shrink-0 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-lg font-bold cursor-pointer">
          Dive<span className="text-cyan-400">Data</span>
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="text-slate-400 hover:text-slate-200 text-sm transition duration-150 cursor-pointer"
          >
            {user?.full_name}
          </button>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-slate-200 text-sm transition duration-150 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      <SidebarLayout
        className="flex-1 min-h-0"
        left={
          <Sidebar side="left" title="Navigation" defaultWidth={15} storageKey="divedata.sidebar.left.rem">
            <nav className="p-3 space-y-1 text-sm">
              {navItems.map(({ label, to, active }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition duration-150 cursor-pointer ${
                    active ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </Sidebar>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-4xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.full_name}.</h2>
              </div>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <div className="max-w-4xl mx-auto px-6 py-12">
                {profile?.diver ? (
                  <DiverProfile diver={profile.diver} />
                ) : (
                  <div className="flex flex-col items-start gap-4">
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
                )}
              </div>
            }
          />
          <Route
            path="/setup"
            element={
              <div className="max-w-4xl mx-auto px-6 py-12">
                <ProfileSetup onComplete={handleProfileComplete} />
              </div>
            }
          />
          <Route path="/settings" element={<Settings user={user ?? null} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarLayout>
    </div>
  );
}

export default App;
