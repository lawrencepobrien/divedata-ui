import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, AddEntryRequest } from '../api/portfolio';
import type { Portfolio, PortfolioDetail, PortfolioEntry } from '../types/portfolio';

// ownerId scopes the cache: undefined/'me' is the caller's own portfolios,
// otherwise a specific diver's (coach view) — kept separate so a coach's
// view of a diver's portfolios never collides with the diver's own cache.
export const portfolioKeys = {
  all: (ownerId?: string) => ['portfolios', ownerId ?? 'me'] as const,
  detail: (ownerId: string | undefined, id: string) => ['portfolios', ownerId ?? 'me', id] as const,
};

export function usePortfolios(ownerId?: string) {
  return useQuery<Portfolio[]>({
    queryKey: portfolioKeys.all(ownerId),
    queryFn: () => portfolioApi.list(ownerId),
  });
}

export function usePortfolioDetail(id: string | undefined, ownerId?: string) {
  return useQuery<PortfolioDetail>({
    queryKey: portfolioKeys.detail(ownerId, id ?? ''),
    queryFn: () => portfolioApi.get(id!, ownerId),
    enabled: !!id,
  });
}

function useInvalidatePortfolios(ownerId?: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: portfolioKeys.all(ownerId) });
}

export function useCreatePortfolio(ownerId?: string) {
  const invalidate = useInvalidatePortfolios(ownerId);
  return useMutation<Portfolio, Error, string>({
    mutationFn: (name) => portfolioApi.create(name, ownerId),
    onSuccess: invalidate,
  });
}

export function useRenamePortfolio(ownerId?: string) {
  const invalidate = useInvalidatePortfolios(ownerId);
  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => portfolioApi.rename(id, name, ownerId),
    onSuccess: invalidate,
  });
}

export function useDeletePortfolio(ownerId?: string) {
  const invalidate = useInvalidatePortfolios(ownerId);
  return useMutation<void, Error, string>({
    mutationFn: (id) => portfolioApi.deletePortfolio(id, ownerId),
    onSuccess: invalidate,
  });
}

export function useAddEntry(ownerId?: string) {
  const invalidate = useInvalidatePortfolios(ownerId);
  return useMutation<PortfolioEntry, Error, { portfolioId: string; body: AddEntryRequest }>({
    mutationFn: ({ portfolioId, body }) => portfolioApi.addEntry(portfolioId, body, ownerId),
    onSuccess: invalidate,
  });
}

export function useRemoveEntry(ownerId?: string) {
  const invalidate = useInvalidatePortfolios(ownerId);
  return useMutation<void, Error, { portfolioId: string; entryId: string }>({
    mutationFn: ({ portfolioId, entryId }) => portfolioApi.removeEntry(portfolioId, entryId, ownerId),
    onSuccess: invalidate,
  });
}
