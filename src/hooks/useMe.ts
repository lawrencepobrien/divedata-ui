import { useQuery } from '@tanstack/react-query';
import { meApi } from '../api/me';
import { User } from '../types/user';

export const meKeys = {
  all: ['me'] as const,
};

/**
 * The authenticated user's record. Pass `enabled` so the query only runs once
 * Keycloak has confirmed the session — otherwise `/me` would 401.
 */
export function useMe(enabled: boolean) {
  return useQuery<User>({
    queryKey: meKeys.all,
    queryFn: () => meApi.get(),
    enabled,
  });
}
