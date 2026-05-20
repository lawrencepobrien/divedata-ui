import keycloak from '../auth/keycloak';

function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-bold">
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
            Sign up
          </button>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-4">
          Dive performance,<br />
          <span className="text-cyan-400">tracked and analyzed.</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          DiveData helps competitive divers and coaches track scores, analyze
          trends, and manage teams — all in one place.
        </p>
        <button
          onClick={() => keycloak.register()}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl px-8 py-3 text-base transition duration-150 cursor-pointer"
        >
          Get started
        </button>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">For Divers</p>
          <h3 className="text-slate-100 font-semibold text-lg mb-2">Your personal dashboard</h3>
          <p className="text-slate-400 text-sm mb-4">
            View your profile, track your progress, and see where you stand.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {['Score', 'Dives', 'Trend'].map((label) => (
              <div key={label} className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className="text-slate-300 font-medium text-sm">—</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">For Coaches</p>
          <h3 className="text-slate-100 font-semibold text-lg mb-2">Manage your team</h3>
          <p className="text-slate-400 text-sm mb-4">
            Build your roster, organize meets, and monitor athlete performance.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Team roster', description: 'View and manage your divers' },
              { label: 'Meets', description: 'Create and manage competitions' },
            ].map(({ label, description }) => (
              <div key={label} className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-300 font-medium text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{description}</p>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}

export default LandingPage;
