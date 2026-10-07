import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meApi } from '../api/me';
import keycloak from '../auth/keycloak';

/**
 * Permanently deletes the authenticated account. The server removes the
 * Keycloak user too (which kills its sessions), so on success we just drop
 * local auth state and go back to the landing page — a normal logout would
 * send an id_token_hint for a user that no longer exists.
 */
export function useDeleteMe() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => meApi.delete(),
    onSuccess: () => {
      queryClient.clear();
      keycloak.clearToken();
      window.location.assign('/');
    },
  });
}
