export interface DiverProfile {
  id: string;
  user_id: string;
  diver_id: string | null;
  name: string;
  age: number;
  gender: string;
  fina_age: number;
  country: string;
  city: string;
}

export interface CoachProfile {
  id: string;
  user_id: string;
  name: string;
}

export type ProfileType = 'diver' | 'coach';

export interface Profile {
  type: ProfileType | null;
  diver?: DiverProfile;
  coach?: CoachProfile;
}
