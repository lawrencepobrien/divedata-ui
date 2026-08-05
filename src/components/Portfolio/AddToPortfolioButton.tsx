import { useState } from 'react';
import { usePortfolios, useAddEntry, useCreatePortfolio } from '../../hooks/usePortfolio';
import type { PortfolioItemType } from '../../types/portfolio';

interface Props {
  itemType: PortfolioItemType;
  itemId: string;
}

function AddToPortfolioButton({ itemType, itemId }: Props): JSX.Element {
  const { data: portfolios = [] } = usePortfolios();
  const addEntry = useAddEntry();
  const createPortfolio = useCreatePortfolio();

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (portfolioId: string) => {
    setError(null);
    addEntry.mutate(
      { portfolioId, body: { item_type: itemType, item_id: itemId } },
      {
        onSuccess: () => { setAdded(true); setOpen(false); },
        onError: (err) => setError(err instanceof Error ? err.message : 'Failed to add'),
      },
    );
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;
    setError(null);
    createPortfolio.mutate(newName.trim(), {
      onSuccess: (portfolio) => {
        setNewName('');
        handleAdd(portfolio.id);
      },
      onError: (err) => setError(err instanceof Error ? err.message : 'Failed to create portfolio'),
    });
  };

  if (added && !open) {
    return (
      <button onClick={() => setAdded(false)} className="text-cyan-400 text-sm cursor-pointer">
        Added to portfolio ✓
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-slate-200 text-sm transition-colors cursor-pointer"
      >
        + Add to portfolio
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {portfolios.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {portfolios.map((portfolio) => (
            <button
              key={portfolio.id}
              onClick={() => handleAdd(portfolio.id)}
              disabled={addEntry.isPending}
              className="text-slate-300 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500 rounded-lg px-3 py-1 text-sm
                         transition-colors cursor-pointer disabled:opacity-50"
            >
              {portfolio.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          autoFocus={portfolios.length === 0}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
          placeholder="New portfolio name"
          className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <button
          onClick={handleCreateAndAdd}
          disabled={!newName.trim() || createPortfolio.isPending}
          className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed text-sm cursor-pointer"
        >
          Create &amp; add
        </button>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer">
          Cancel
        </button>
      </div>

      {error && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}

export default AddToPortfolioButton;
