import { client } from './client';
import { IncomingShare, OutgoingShare, PortfolioShare } from '../types/portfolioShare';
import { PortfolioDetail } from '../types/portfolio';

export const portfolioShareApi = {
  listOutgoing: (portfolioId: string) =>
    client.get<OutgoingShare[]>(`/me/portfolios/${portfolioId}/shares`),
  create: (portfolioId: string, recipientUserId: string) =>
    client.post<PortfolioShare>(`/me/portfolios/${portfolioId}/shares`, {
      recipient_user_id: recipientUserId,
    }),
  revoke: (portfolioId: string, shareId: string) =>
    client.delete<void>(`/me/portfolios/${portfolioId}/shares/${shareId}`),
  listIncoming: () => client.get<IncomingShare[]>('/me/portfolio-shares'),
  accept: (shareId: string) => client.post<void>(`/me/portfolio-shares/${shareId}/accept`, {}),
  decline: (shareId: string) => client.post<void>(`/me/portfolio-shares/${shareId}/decline`, {}),
  getSharedDetail: (portfolioId: string) =>
    client.get<PortfolioDetail>(`/me/shared-portfolios/${portfolioId}`),
};
