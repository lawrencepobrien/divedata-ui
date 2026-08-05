import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, AddEntryRequest } from '../api/portfolio';
import type { Portfolio, PortfolioDetail, PortfolioEntry } from '../types/portfolio';

export const portfolioKeys = {
  all: ['portfolios'] as const,
  detail: (id: string) => ['portfolios', id] as const,
};

export function usePortfolios() {
  return useQuery<Portfolio[]>({
    queryKey: portfolioKeys.all,
    queryFn: () => portfolioApi.list(),
  });
}

export function usePortfolioDetail(id: string | undefined) {
  return useQuery<PortfolioDetail>({
    queryKey: portfolioKeys.detail(id ?? ''),
    queryFn: () => portfolioApi.get(id!),
    enabled: !!id,
  });
}

function useInvalidatePortfolios() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: portfolioKeys.all });
}

export function useCreatePortfolio() {
  const invalidate = useInvalidatePortfolios();
  return useMutation<Portfolio, Error, string>({
    mutationFn: (name) => portfolioApi.create(name),
    onSuccess: invalidate,
  });
}

export function useRenamePortfolio() {
  const invalidate = useInvalidatePortfolios();
  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => portfolioApi.rename(id, name),
    onSuccess: invalidate,
  });
}

export function useDeletePortfolio() {
  const invalidate = useInvalidatePortfolios();
  return useMutation<void, Error, string>({
    mutationFn: (id) => portfolioApi.deletePortfolio(id),
    onSuccess: invalidate,
  });
}

export function useAddEntry() {
  const invalidate = useInvalidatePortfolios();
  return useMutation<PortfolioEntry, Error, { portfolioId: string; body: AddEntryRequest }>({
    mutationFn: ({ portfolioId, body }) => portfolioApi.addEntry(portfolioId, body),
    onSuccess: invalidate,
  });
}

export function useRemoveEntry() {
  const invalidate = useInvalidatePortfolios();
  return useMutation<void, Error, { portfolioId: string; entryId: string }>({
    mutationFn: ({ portfolioId, entryId }) => portfolioApi.removeEntry(portfolioId, entryId),
    onSuccess: invalidate,
  });
}
