import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';

// Pointer events report CSS pixels, but the panel width is tracked in rem so it
// scales with the root font size. This is the divisor for converting px → rem.
const ROOT_FONT_PX =
  typeof window !== 'undefined'
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    : 16;

interface UseResizableOptions {
  side: 'left' | 'right';
  /** All widths are in rem. */
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  /** When set, the chosen width is persisted to localStorage under this key. */
  storageKey?: string;
  /** When false, dragging is disabled and the width stays at its current value. */
  enabled: boolean;
}

interface UseResizableResult {
  width: number;
  isDragging: boolean;
  /** Spread onto the resize handle's `onPointerDown`. */
  startResize: (e: ReactPointerEvent) => void;
}

function readStoredWidth(storageKey: string | undefined, fallback: number): number {
  if (!storageKey) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw != null ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Encapsulates drag-to-resize for a docked panel: tracks the width, clamps it to
 * [minWidth, maxWidth], and optionally persists it across reloads. The drag
 * direction is derived from `side` — a left panel grows as the pointer moves
 * right, a right panel grows as it moves left.
 */
export function useResizable({
  side,
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
  enabled,
}: UseResizableOptions): UseResizableResult {
  const clamp = useCallback(
    (w: number) => Math.min(maxWidth, Math.max(minWidth, w)),
    [minWidth, maxWidth],
  );

  const [width, setWidth] = useState<number>(() => clamp(readStoredWidth(storageKey, defaultWidth)));
  const [isDragging, setIsDragging] = useState(false);

  // Captured at drag start so pointermove can compute an absolute width from the
  // delta without re-binding listeners on every width change.
  const dragOrigin = useRef<{ startX: number; startWidth: number } | null>(null);

  const startResize = useCallback(
    (e: ReactPointerEvent) => {
      if (!enabled) return;
      e.preventDefault();
      dragOrigin.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);
    },
    [enabled, width],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => {
      const origin = dragOrigin.current;
      if (!origin) return;
      // Convert the pixel drag distance to rem before applying it.
      const delta = (e.clientX - origin.startX) / ROOT_FONT_PX;
      const next = side === 'left' ? origin.startWidth + delta : origin.startWidth - delta;
      setWidth(clamp(next));
    };

    const handleUp = () => {
      dragOrigin.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    // Suppress text selection / flickering cursor for the duration of the drag.
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isDragging, side, clamp]);

  // Persist once the drag settles (skipped mid-drag to avoid thrashing storage).
  useEffect(() => {
    if (isDragging || !storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      /* storage unavailable or over quota — width simply won't persist */
    }
  }, [isDragging, storageKey, width]);

  return { width, isDragging, startResize };
}
