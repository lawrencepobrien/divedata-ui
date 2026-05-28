import { client } from './client';
import { Profile } from '../types/profile';

export interface CreateDiverRequest {
  age: number;
  fina_age: number;
  gender: string;
  country: string;
  city: string;
}

export const profileApi = {
  get: () => client.get<Profile>('/me/profile'),
  createDiver: (body: CreateDiverRequest) =>
    client.post<Profile>('/me/profile/diver', body),
  createCoach: () =>
    client.post<Profile>('/me/profile/coach', {}),
};
