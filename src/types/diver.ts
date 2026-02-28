export type Position = string;
export type Direction = string;

export interface Dive {
  dive_code: string;
  direction: Direction;
  position: Position;
  height: string;
  dd: number;
  description: string;
}

export interface DiveScore {
  dive: Dive;
  voluntary: boolean;
  raw_scores: number[];
  raw_score: number;
  total_score: number;
  dive_change_history: Dive[];
}

export interface Association {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  state: string;
  country: string;
  divers: Diver[];
  association: Association;
}

export interface Meet {
  id: number;
  name: string;
  events: Event[];
  association: Association;
  start_date: string;
  end_date: string;
  sponsor: string;
  pool: string;
}

export interface Event {
  id: number;
  group: string;
  divers: Diver[];
}

export interface DiveSheet {
  id: number;
  title: string;
  dives: Dive[];
  diver: Diver;
  dive_scores: DiveScore[];
  meet: Meet;
  team: Team;
}

export interface Diver {
  id: number;
  user_id: number;
  name: string;
  dives: Dive[];
  age: number;
  gender: string;
  fina_age: number;
  country: string;
  city: string;
  teams: Team[];
  history: DiveSheet[];
}
