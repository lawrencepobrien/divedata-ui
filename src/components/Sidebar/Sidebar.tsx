import { ReactNode } from 'react';
import { useResizable } from './useResizable';

interface SidebarProps {
  /** Which edge the panel docks to. Default 'left'. */
  side?: 'left' | 'right';
  /** Controlled visibility. When false the panel renders nothing. Default true. */
  open?: boolean;
  /** Providing this makes the panel "exitable" — renders a × button in the header. */
  onClose?: () => void;
  /** Enables the drag-to-resize handle on the inner edge. Default true. */
  resizable?: boolean;
  /** Widths are in rem. */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Persists the resized width across reloads under this localStorage key. */
  storageKey?: string;
  /** Optional header label. The header row appears if `title` or `onClose` is set. */
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * A docked, optionally-resizable side panel. Lives as a flex child so it pushes
 * sibling content rather than overlaying it — which is what lets several panels
 * (on either side) coexist. Every variant the app needs is a prop combination:
 *   - permanent: omit `onClose`
 *   - exitable:  pass `onClose`
 *   - left/right: `side`
 *   - resizable:  `resizable` (default on)
 */
function Sidebar({
  side = 'left',
  open = true,
  onClose,
  resizable = true,
  defaultWidth = 17.5,
  minWidth = 12.5,
  maxWidth = 30,
  storageKey,
  title,
  className = '',
  children,
}: SidebarProps): JSX.Element | null {
  const { width, isDragging, startResize } = useResizable({
    side,
    defaultWidth,
    minWidth,
    maxWidth,
    storageKey,
    enabled: resizable,
  });

  if (!open) return null;

  const borderSide = side === 'left' ? 'border-r' : 'border-l';
  const showHeader = title != null || onClose != null;

  return (
    <aside
      style={{ width: `${width}rem` }}
      className={`relative flex flex-col shrink-0 bg-slate-900 ${borderSide} border-slate-800 ${className}`}
    >
      {showHeader && (
        <div className="flex items-center justify-between gap-2 h-12 shrink-0 px-4 border-b border-slate-800">
          <span className="text-sm font-semibold text-slate-200 truncate">{title}</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="text-slate-500 hover:text-slate-200 text-xl leading-none transition duration-150 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">{children}</div>

      {resizable && (
        <div
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startResize}
          className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} h-full w-1 cursor-col-resize transition-colors duration-150 ${
            isDragging ? 'bg-cyan-500' : 'bg-transparent hover:bg-cyan-500/60'
          }`}
        />
      )}
    </aside>
  );
}

export default Sidebar;
