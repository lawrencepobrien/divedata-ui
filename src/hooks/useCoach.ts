import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coachApi, invitesApi, CreateInviteRequest } from '../api/coach';
import type { DiverInvite, RosterEntry } from '../types/coach';

export const coachKeys = {
  roster: ['coach', 'roster'] as const,
  invites: ['coach', 'invites'] as const,
};

export function useRoster(enabled: boolean = true) {
  return useQuery<RosterEntry[]>({
    queryKey: coachKeys.roster,
    queryFn: () => coachApi.listRoster(),
    enabled,
  });
}

export function useInvites() {
  return useQuery<DiverInvite[]>({
    queryKey: coachKeys.invites,
    queryFn: () => coachApi.listInvites(),
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation<DiverInvite, Error, CreateInviteRequest>({
    mutationFn: (body) => coachApi.createInvite(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: coachKeys.invites }),
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => coachApi.revokeInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: coachKeys.invites }),
  });
}

export function useClaimInvite() {
  const qc = useQueryClient();
  return useMutation<DiverInvite, Error, string>({
    mutationFn: (token) => invitesApi.claim(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}
