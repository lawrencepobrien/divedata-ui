import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meApi } from '../api/me';
import { User } from '../types/user';
import { meKeys } from './useMe';

type UpdateMeBody = { email?: string; full_name?: string };

/**
 * Updates the authenticated user. On success the server returns the full record,
 * which we write straight into the `me` cache so the UI reflects it immediately.
 */
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UpdateMeBody>({
    mutationFn: (body) => meApi.update(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(meKeys.all, updated);
    },
  });
}
