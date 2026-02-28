export type Role = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  user_name: string;
  role: Role;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}
