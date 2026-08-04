export type InviteStatus = 'pending' | 'claimed' | 'revoked';

export interface DiverInvite {
  id: string;
  coach_id: string;
  token: string;
  email: string;
  name?: string;
  status: InviteStatus;
  claimed_by?: string;
  claimed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface RosterEntry {
  user_id: string;
  name: string;
  email: string;
  has_profile: boolean;
  age: number;
  gender: string;
  country: string;
  city: string;
}
