import { Diver } from './diver';

export interface Coach {
  id: number;
  user_id: number;
  name: string;
}

export type ProfileType = 'diver' | 'coach';

export interface Profile {
  type: ProfileType | null;
  diver?: Diver;
  coach?: Coach;
}
