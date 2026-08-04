import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePortfolio,
  useCreateFolder,
  useRenameFolder,
  useDeleteFolder,
  useRemoveEntry,
} from '../../hooks/usePortfolio';
import type { PortfolioEntry, PortfolioFolder } from '../../types/portfolio';

interface Props {
  diverId: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function entryLabel(entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return entry.summary.competition_name ?? 'Competition';
  }
  return [entry.summary.dive_code, entry.summary.board].filter(Boolean).join(' · ') || 'Dive';
}

function entryMeta(entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return entry.summary.event_date ? formatDate(entry.summary.event_date) : '';
  }
  return entry.summary.total_score != null ? entry.summary.total_score.toFixed(2) : '—';
}

function entryHref(diverId: string, entry: PortfolioEntry): string {
  if (entry.item_type === 'competition') {
    return `/profile/${diverId}/competitions/${entry.item_id}`;
  }
  const source = entry.item_type === 'training_dive' ? 'training' : 'competition';
  return `/profile/${diverId}/dives/${source}/${entry.item_id}`;
}

function PortfolioTree({ diverId }: Props): JSX.Element {
  const { data, isLoading } = usePortfolio();
  const createFolder = useCreateFolder();

  const [newRootName, setNewRootName] = useState('');
  const [creatingRoot, setCreatingRoot] = useState(false);

  if (isLoading) {
    return <div className="text-slate-500 text-sm py-4">Loading…</div>;
  }

  const folders = data?.folders ?? [];
  const entries = data?.entries ?? [];

  const childFolders = (parentId: string | undefined) =>
    folders
      .filter((f) => f.parent_id === parentId)
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
  const entriesFor = (folderId: string) =>
    entries.filter((e) => e.folder_id === folderId).sort((a, b) => a.position - b.position);

  const roots = childFolders(undefined);

  const handleCreateRoot = () => {
    if (!newRootName.trim()) return;
    createFolder.mutate(
      { name: newRootName.trim() },
      { onSuccess: () => { setNewRootName(''); setCreatingRoot(false); } },
    );
  };

  return (
    <div>
      {roots.length === 0 && (
        <p className="text-slate-500 text-sm mb-4">
          No folders yet. Create one to start organizing your best dives and competitions.
        </p>
      )}

      <div className="flex flex-col gap-1 mb-4">
        {roots.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            depth={0}
            diverId={diverId}
            childFolders={childFolders}
            entriesFor={entriesFor}
          />
        ))}
      </div>

      {creatingRoot ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoot()}
            placeholder="Folder name"
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm
                       placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button onClick={handleCreateRoot} className="text-cyan-400 hover:text-cyan-300 text-sm cursor-pointer">
            Add
          </button>
          <button
            onClick={() => { setCreatingRoot(false); setNewRootName(''); }}
            className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setCreatingRoot(true)}
          className="text-cyan-400 hover:text-cyan-300 text-sm cursor-pointer transition-colors"
        >
          + New folder
        </button>
      )}
    </div>
  );
}

interface FolderNodeProps {
  folder: PortfolioFolder;
  depth: number;
  diverId: string;
  childFolders: (parentId: string | undefined) => PortfolioFolder[];
  entriesFor: (folderId: string) => PortfolioEntry[];
}

function FolderNode({ folder, depth, diverId, childFolders, entriesFor }: FolderNodeProps): JSX.Element {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);
  const [addingSub, setAddingSub] = useState(false);
  const [subName, setSubName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();
  const createFolder = useCreateFolder();
  const removeEntry = useRemoveEntry();

  const subFolders = childFolders(folder.id);
  const items = entriesFor(folder.id);
  const isEmpty = subFolders.length === 0 && items.length === 0;

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === folder.name) {
      setRenaming(false);
      setName(folder.name);
      return;
    }
    renameFolder.mutate({ id: folder.id, name: trimmed }, { onSuccess: () => setRenaming(false) });
  };

  const handleAddSub = () => {
    if (!subName.trim()) return;
    createFolder.mutate(
      { name: subName.trim(), parent_id: folder.id },
      { onSuccess: () => { setSubName(''); setAddingSub(false); setExpanded(true); } },
    );
  };

  return (
    <div style={{ marginLeft: depth ? '1.25rem' : 0 }}>
      <div className="group flex items-center gap-2 py-1">
        <button
          onClick={() => setExpanded((e) => !e)}
          disabled={isEmpty}
          className="text-slate-500 w-4 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-default"
        >
          {isEmpty ? '·' : expanded ? '▾' : '▸'}
        </button>

        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-2 py-0.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        ) : (
          <span className="text-slate-200 text-sm font-medium">{folder.name}</span>
        )}

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-xs">
          <button onClick={() => setAddingSub(true)} className="text-slate-500 hover:text-cyan-400 cursor-pointer">
            + subfolder
          </button>
          <button onClick={() => setRenaming(true)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
            Rename
          </button>
          {confirmingDelete ? (
            <>
              <span className="text-slate-400">Delete?</span>
              <button
                onClick={() => deleteFolder.mutate(folder.id)}
                className="text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-slate-500 hover:text-rose-400 cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-1 border-l border-slate-800 ml-2 pl-3">
          {subFolders.map((sub) => (
            <FolderNode
              key={sub.id}
              folder={sub}
              depth={depth + 1}
              diverId={diverId}
              childFolders={childFolders}
              entriesFor={entriesFor}
            />
          ))}

          {items.map((entry) => (
            <div key={entry.id} className="group flex items-center justify-between py-1">
              <button
                onClick={() => navigate(entryHref(diverId, entry))}
                className="text-left text-slate-400 hover:text-cyan-400 text-sm truncate transition-colors cursor-pointer"
              >
                {entryLabel(entry)}
                <span className="text-slate-600 ml-2">{entryMeta(entry)}</span>
              </button>
              <button
                onClick={() => removeEntry.mutate(entry.id)}
                className="text-slate-600 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-4 shrink-0"
              >
                Remove
              </button>
            </div>
          ))}

          {addingSub && (
            <div className="flex items-center gap-2 py-1">
              <input
                autoFocus
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                placeholder="Subfolder name"
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs
                           placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button onClick={handleAddSub} className="text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer">
                Add
              </button>
              <button
                onClick={() => { setAddingSub(false); setSubName(''); }}
                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PortfolioTree;
