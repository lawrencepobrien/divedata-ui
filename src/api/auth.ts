import { authClient } from './authClient';
import { User, LoginResponse } from '../types/auth';

export const authApi = {
  login: (email: string, password: string) =>
    authClient.post<LoginResponse>('/auth/login', { email, password }),
  signup: (email: string, userName: string, password: string) =>
    authClient.post<User>('/auth/signup', { email, user_name: userName, password }),
  me: () => authClient.get<User>('/auth/me'),
};
