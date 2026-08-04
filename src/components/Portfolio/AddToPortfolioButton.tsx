import { useState } from 'react';
import { usePortfolio, useAddEntry, useCreateFolder } from '../../hooks/usePortfolio';
import type { PortfolioFolder, PortfolioItemType } from '../../types/portfolio';

interface Props {
  itemType: PortfolioItemType;
  itemId: string;
}

function flattenFolders(folders: PortfolioFolder[]): { folder: PortfolioFolder; depth: number }[] {
  const byParent = new Map<string | undefined, PortfolioFolder[]>();
  folders.forEach((f) => {
    const list = byParent.get(f.parent_id) ?? [];
    list.push(f);
    byParent.set(f.parent_id, list);
  });

  const out: { folder: PortfolioFolder; depth: number }[] = [];
  const walk = (parentId: string | undefined, depth: number) => {
    const children = (byParent.get(parentId) ?? [])
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
    children.forEach((f) => {
      out.push({ folder: f, depth });
      walk(f.id, depth + 1);
    });
  };
  walk(undefined, 0);
  return out;
}

function AddToPortfolioButton({ itemType, itemId }: Props): JSX.Element {
  const { data } = usePortfolio();
  const addEntry = useAddEntry();
  const createFolder = useCreateFolder();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [added, setAdded] = useState(false);

  const flat = flattenFolders(data?.folders ?? []);

  const handleAdd = () => {
    if (!selected) return;
    addEntry.mutate(
      { folderId: selected, body: { item_type: itemType, item_id: itemId } },
      { onSuccess: () => { setAdded(true); setOpen(false); } },
    );
  };

  const handleCreateAndAdd = () => {
    if (!newFolderName.trim()) return;
    createFolder.mutate(
      { name: newFolderName.trim() },
      {
        onSuccess: (folder) => {
          addEntry.mutate(
            { folderId: folder.id, body: { item_type: itemType, item_id: itemId } },
            {
              onSuccess: () => {
                setAdded(true);
                setOpen(false);
                setCreatingNew(false);
                setNewFolderName('');
              },
            },
          );
        },
      },
    );
  };

  if (added && !open) {
    return (
      <button
        onClick={() => setAdded(false)}
        className="text-cyan-400 text-sm cursor-pointer"
      >
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
    <div className="flex items-center gap-2 flex-wrap">
      {creatingNew ? (
        <>
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
            placeholder="New folder name"
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button onClick={handleCreateAndAdd} className="text-cyan-400 hover:text-cyan-300 text-sm cursor-pointer">
            Create &amp; add
          </button>
        </>
      ) : (
        <>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Choose a folder…</option>
            {flat.map(({ folder, depth }) => (
              <option key={folder.id} value={folder.id}>
                {'—'.repeat(depth)} {folder.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selected || addEntry.isPending}
            className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed text-sm cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => setCreatingNew(true)}
            className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer"
          >
            + New folder
          </button>
        </>
      )}
      <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer">
        Cancel
      </button>
    </div>
  );
}

export default AddToPortfolioButton;
