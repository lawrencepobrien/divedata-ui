import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portfolioShareApi } from '../api/portfolioShare';
import { coachApi } from '../api/coach';
import type { IncomingShare, OutgoingShare } from '../types/portfolioShare';
import type { CoachSummary } from '../types/portfolioShare';
import type { PortfolioDetail } from '../types/portfolio';

export const portfolioShareKeys = {
  incoming: ['portfolio-shares', 'incoming'] as const,
  outgoing: (portfolioId: string) => ['portfolio-shares', 'outgoing', portfolioId] as const,
  sharedDetail: (portfolioId: string) => ['portfolio-shares', 'shared-detail', portfolioId] as const,
  myCoaches: ['coach', 'mine'] as const,
};

export function useIncomingShares(enabled: boolean = true) {
  return useQuery<IncomingShare[]>({
    queryKey: portfolioShareKeys.incoming,
    queryFn: () => portfolioShareApi.listIncoming(),
    enabled,
  });
}

export function useAcceptShare() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (shareId) => portfolioShareApi.accept(shareId),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioShareKeys.incoming }),
  });
}

export function useDeclineShare() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (shareId) => portfolioShareApi.decline(shareId),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioShareKeys.incoming }),
  });
}

export function useOutgoingShares(portfolioId: string | undefined) {
  return useQuery<OutgoingShare[]>({
    queryKey: portfolioShareKeys.outgoing(portfolioId ?? ''),
    queryFn: () => portfolioShareApi.listOutgoing(portfolioId!),
    enabled: !!portfolioId,
  });
}

export function useCreateShare(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (recipientUserId) => portfolioShareApi.create(portfolioId, recipientUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioShareKeys.outgoing(portfolioId) }),
  });
}

export function useRevokeShare(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (shareId) => portfolioShareApi.revoke(portfolioId, shareId),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioShareKeys.outgoing(portfolioId) }),
  });
}

export function useSharedPortfolioDetail(portfolioId: string | undefined) {
  return useQuery<PortfolioDetail>({
    queryKey: portfolioShareKeys.sharedDetail(portfolioId ?? ''),
    queryFn: () => portfolioShareApi.getSharedDetail(portfolioId!),
    enabled: !!portfolioId,
  });
}

export function useMyCoaches(enabled: boolean = true) {
  return useQuery<CoachSummary[]>({
    queryKey: portfolioShareKeys.myCoaches,
    queryFn: () => coachApi.listMyCoaches(),
    enabled,
  });
}
