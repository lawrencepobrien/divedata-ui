import { useQuery } from '@tanstack/react-query';
import { diveTypesApi } from '../api/diveTypes';
import { ApiError } from '../api/client';
import type { DiveType } from '../types/dive';
import type { BoardType } from '../types/trendline';

// Looks up the catalog entry (degree of difficulty, name) for a dive code +
// board. A 404 just means no one has curated that dive/board yet — not an
// error — so it resolves to null rather than an error state.
export function useDiveTypeLookup(code: string | null, board: BoardType | null) {
  return useQuery<DiveType | null>({
    queryKey: ['dive-types', 'lookup', code ?? '', board ?? ''],
    queryFn: async ({ signal }) => {
      try {
        return await diveTypesApi.lookup(code!, board!, signal);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!code && !!board,
    staleTime: 5 * 60 * 1000,
  });
}
