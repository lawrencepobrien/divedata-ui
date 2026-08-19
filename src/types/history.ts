import type { BoardType, Discipline } from './trendline';

export interface CompDive {
  id: string;
  dive_code: string;
  board: BoardType;
  total_score: number | null;
}

export interface CompEvent {
  discipline: Discipline;
  dives: CompDive[];
}

export interface CompetitionResult {
  name: string;
  event_date: string | null;
  events: CompEvent[];
}
