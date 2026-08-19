import { client } from './client';
import { Portfolio, PortfolioDetail, PortfolioEntry, PortfolioItemType } from '../types/portfolio';

export interface AddEntryRequest {
  item_type: PortfolioItemType;
  item_id: string;
}

// base resolves the portfolio collection root: the caller's own ("/me/...")
// when ownerId is omitted, or a specific diver's ("/users/:id/...") — the
// latter also succeeds for that diver's active coach, per the backend's
// resolvePortfolioOwner.
function base(ownerId?: string): string {
  return ownerId ? `/users/${ownerId}/portfolios` : '/me/portfolios';
}

export const portfolioApi = {
  list: (ownerId?: string) => client.get<Portfolio[]>(base(ownerId)),
  get: (id: string, ownerId?: string) => client.get<PortfolioDetail>(`${base(ownerId)}/${id}`),
  create: (name: string, ownerId?: string) => client.post<Portfolio>(base(ownerId), { name }),
  rename: (id: string, name: string, ownerId?: string) =>
    client.patch<void>(`${base(ownerId)}/${id}`, { name }),
  deletePortfolio: (id: string, ownerId?: string) => client.delete<void>(`${base(ownerId)}/${id}`),
  addEntry: (portfolioId: string, body: AddEntryRequest, ownerId?: string) =>
    client.post<PortfolioEntry>(`${base(ownerId)}/${portfolioId}/entries`, body),
  removeEntry: (portfolioId: string, entryId: string, ownerId?: string) =>
    client.delete<void>(`${base(ownerId)}/${portfolioId}/entries/${entryId}`),
};
