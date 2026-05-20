import { client } from './client';
import { User } from '../types/user';

export const meApi = {
  get: () => client.get<User>('/me'),
  update: (body: { email?: string; full_name?: string }) =>
    client.patch<User>('/me', body),
  delete: () => client.delete<void>('/me'),
};
