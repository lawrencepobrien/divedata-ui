import { client } from './client';
import { DiverInvite, RosterEntry } from '../types/coach';

export interface CreateInviteRequest {
  email: string;
  name?: string;
}

export const coachApi = {
  listRoster: () => client.get<RosterEntry[]>('/coach/roster'),
  listInvites: () => client.get<DiverInvite[]>('/coach/invites'),
  createInvite: (body: CreateInviteRequest) =>
    client.post<DiverInvite>('/coach/invites', body),
  revokeInvite: (id: string) => client.delete<void>(`/coach/invites/${id}`),
};

export const invitesApi = {
  claim: (token: string) => client.post<DiverInvite>(`/invites/${token}/claim`, {}),
};
