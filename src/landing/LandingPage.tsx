import keycloak from '../auth/keycloak';

const BarChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const features = [
  {
    icon: <BarChartIcon />,
    title: 'Score tracking',
    description: 'Log every dive and meet result. Keep a complete record of your competitive history in one place.',
  },
  {
    icon: <TrendUpIcon />,
    title: 'Trend analysis',
    description: 'Visualize performance over time. Identify strengths and weaknesses across competitions.',
  },
  {
    icon: <UsersIcon />,
    title: 'Team management',
    description: 'Coaches can build rosters, organize meets, and monitor individual athlete progress.',
  },
];

const diverBenefits = [
  'Personal performance dashboard',
  'Historical score records',
  'Progress tracking over time',
  'Competition history at a glance',
];

const coachBenefits = [
  'Team roster management',
  'Meet creation and organization',
  'Per-athlete performance monitoring',
  'Team-wide analytics',
];

function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <nav className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">
          Dive<span className="text-cyan-400">Data</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => keycloak.login()}
            className="text-slate-300 hover:text-slate-100 text-sm transition duration-150 cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => keycloak.register()}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-4 py-2 text-sm transition duration-150 cursor-pointer"
          >
            Sign up free
          </button>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Dive performance,<br />
          <span className="text-cyan-400">tracked and analyzed.</span>
        </h1>
        <div className="flex items-center justify-center gap-5 flex-wrap">
          <button
            onClick={() => keycloak.register()}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl px-8 py-3 text-base transition duration-150 cursor-pointer"
          >
            Get started free
          </button>
          <button
            onClick={() => keycloak.login()}
            className="text-slate-400 hover:text-slate-200 text-sm transition duration-150 cursor-pointer"
          >
            Already have an account? Sign in →
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map(({ icon, title, description }) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-cyan-400 mb-4">{icon}</div>
              <h3 className="text-slate-100 font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight">
            Dive<span className="text-cyan-400">Data</span>
          </span>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
