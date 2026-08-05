import { client } from './client';
import { Portfolio, PortfolioDetail, PortfolioEntry, PortfolioItemType } from '../types/portfolio';

export interface AddEntryRequest {
  item_type: PortfolioItemType;
  item_id: string;
}

export const portfolioApi = {
  list: () => client.get<Portfolio[]>('/me/portfolios'),
  get: (id: string) => client.get<PortfolioDetail>(`/me/portfolios/${id}`),
  create: (name: string) => client.post<Portfolio>('/me/portfolios', { name }),
  rename: (id: string, name: string) => client.patch<void>(`/me/portfolios/${id}`, { name }),
  deletePortfolio: (id: string) => client.delete<void>(`/me/portfolios/${id}`),
  addEntry: (portfolioId: string, body: AddEntryRequest) =>
    client.post<PortfolioEntry>(`/me/portfolios/${portfolioId}/entries`, body),
  removeEntry: (portfolioId: string, entryId: string) =>
    client.delete<void>(`/me/portfolios/${portfolioId}/entries/${entryId}`),
};
