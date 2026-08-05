import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolios, useCreatePortfolio } from '../../hooks/usePortfolio';

function PortfolioGrid(): JSX.Element {
  const { data: portfolios = [], isLoading } = usePortfolios();
  const createPortfolio = useCreatePortfolio();
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    createPortfolio.mutate(name.trim(), {
      onSuccess: (portfolio) => {
        setName('');
        setCreating(false);
        navigate(`/portfolios/${portfolio.id}`);
      },
    });
  };

  if (isLoading) {
    return <div className="text-slate-500 text-sm py-4">Loading…</div>;
  }

  return (
    <div>
      {portfolios.length === 0 && !creating && (
        <p className="text-slate-500 text-sm mb-4">
          No portfolios yet. Create one to start curating your best dives and competitions.
        </p>
      )}

      {createPortfolio.isError && (
        <p className="text-rose-400 text-sm mb-4">
          {createPortfolio.error instanceof Error ? createPortfolio.error.message : 'Failed to create portfolio'}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <button
            key={portfolio.id}
            onClick={() => navigate(`/portfolios/${portfolio.id}`)}
            className="group flex flex-col justify-between text-left bg-slate-900 border border-slate-800 hover:border-cyan-500
                       rounded-2xl p-6 aspect-[4/3] transition duration-150 cursor-pointer"
          >
            <span className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition duration-150">
              {portfolio.name}
            </span>
            <span className="text-slate-500 text-sm">
              {portfolio.entry_count} item{portfolio.entry_count === 1 ? '' : 's'}
            </span>
          </button>
        ))}

        <div
          className={`flex flex-col justify-center gap-3 border border-dashed rounded-2xl p-6 aspect-[4/3] transition duration-150 ${
            creating ? 'border-slate-700' : 'border-slate-800 hover:border-slate-600'
          }`}
        >
          {creating ? (
            <>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Portfolio name"
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm
                           placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <div className="flex items-center gap-3 text-sm">
                <button onClick={handleCreate} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                  Create
                </button>
                <button
                  onClick={() => { setCreating(false); setName(''); }}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer h-full"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="text-sm">New portfolio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioGrid;
