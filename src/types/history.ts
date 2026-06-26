import type { BoardType, Discipline } from './trendline';

export interface CompDive {
  dive_code: string;
  board: BoardType;
  total_score: number | null;
}

export interface CompEvent {
  id: string;
  discipline: Discipline;
  dives: CompDive[];
}

export interface CompetitionResult {
  id: string;
  name: string;
  event_date: string | null;
  events: CompEvent[];
}
