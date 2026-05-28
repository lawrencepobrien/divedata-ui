import { Diver } from './diver';

export interface Coach {
  id: string;
  user_id: string;
  name: string;
}

export type ProfileType = 'diver' | 'coach';

export interface Profile {
  type: ProfileType | null;
  diver?: Diver;
  coach?: Coach;
}
