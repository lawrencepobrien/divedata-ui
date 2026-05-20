import { client } from './client';
import { Profile } from '../types/profile';
import { Diver } from '../types/diver';

export interface CreateDiverRequest {
  name: string;
  age: number;
  fina_age: number;
  gender: string;
  country: string;
  city: string;
}

export interface CreateCoachRequest {
  name: string;
}

export const profileApi = {
  get: () => client.get<Profile>('/me/profile'),
  createDiver: (body: CreateDiverRequest) =>
    client.post<Diver>('/me/profile/diver', body),
  createCoach: (body: CreateCoachRequest) =>
    client.post<{ id: number; user_id: number; name: string }>('/me/profile/coach', body),
};
