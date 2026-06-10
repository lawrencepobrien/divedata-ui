import { useQuery } from '@tanstack/react-query';
import { diversApi } from '../api/diver';
import { Diver } from '../types/diver';

export const diverKeys = {
  byId: (id: number) => ['diver', id] as const,
};

export function useDiver(id: number) {
  return useQuery<Diver>({
    queryKey: diverKeys.byId(id),
    queryFn: () => diversApi.getById(id),
    enabled: Number.isFinite(id),
  });
}
