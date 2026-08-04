import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, CreateFolderRequest, AddEntryRequest } from '../api/portfolio';
import type { Portfolio, PortfolioEntry, PortfolioFolder } from '../types/portfolio';

export const portfolioKeys = {
  all: ['portfolio'] as const,
};

export function usePortfolio(enabled = true) {
  return useQuery<Portfolio>({
    queryKey: portfolioKeys.all,
    queryFn: () => portfolioApi.get(),
    enabled,
  });
}

function useInvalidatePortfolio() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: portfolioKeys.all });
}

export function useCreateFolder() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<PortfolioFolder, Error, CreateFolderRequest>({
    mutationFn: (body) => portfolioApi.createFolder(body),
    onSuccess: invalidate,
  });
}

export function useRenameFolder() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<void, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) => portfolioApi.renameFolder(id, name),
    onSuccess: invalidate,
  });
}

export function useMoveFolder() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<void, Error, { id: string; parentId: string | null }>({
    mutationFn: ({ id, parentId }) => portfolioApi.moveFolder(id, parentId),
    onSuccess: invalidate,
  });
}

export function useDeleteFolder() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<void, Error, string>({
    mutationFn: (id) => portfolioApi.deleteFolder(id),
    onSuccess: invalidate,
  });
}

export function useAddEntry() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<PortfolioEntry, Error, { folderId: string; body: AddEntryRequest }>({
    mutationFn: ({ folderId, body }) => portfolioApi.addEntry(folderId, body),
    onSuccess: invalidate,
  });
}

export function useRemoveEntry() {
  const invalidate = useInvalidatePortfolio();
  return useMutation<void, Error, string>({
    mutationFn: (entryId) => portfolioApi.removeEntry(entryId),
    onSuccess: invalidate,
  });
}
