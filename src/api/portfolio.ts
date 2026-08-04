import { client } from './client';
import { Portfolio, PortfolioEntry, PortfolioFolder, PortfolioItemType } from '../types/portfolio';

export interface CreateFolderRequest {
  name: string;
  parent_id?: string;
}

export interface AddEntryRequest {
  item_type: PortfolioItemType;
  item_id: string;
}

export const portfolioApi = {
  get: () => client.get<Portfolio>('/me/portfolio'),
  createFolder: (body: CreateFolderRequest) =>
    client.post<PortfolioFolder>('/me/portfolio/folders', body),
  renameFolder: (id: string, name: string) =>
    client.patch<void>(`/me/portfolio/folders/${id}`, { name }),
  moveFolder: (id: string, parentId: string | null) =>
    client.patch<void>(`/me/portfolio/folders/${id}`, { parent_id: parentId }),
  deleteFolder: (id: string) => client.delete<void>(`/me/portfolio/folders/${id}`),
  addEntry: (folderId: string, body: AddEntryRequest) =>
    client.post<PortfolioEntry>(`/me/portfolio/folders/${folderId}/entries`, body),
  removeEntry: (entryId: string) => client.delete<void>(`/me/portfolio/entries/${entryId}`),
};
