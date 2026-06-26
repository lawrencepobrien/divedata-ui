export type Discipline = '1m' | '3m' | 'platform';
export type BoardType = '1m' | '3m' | '5m' | '7.5m' | '10m';

// Normalized shape consumed by TrendlineChart — independent of API contract.
export interface TrendlinePoint {
  date: string | null;  // ISO date string from the API, null if unknown
  score: number;
  label: string;        // competition name
}

export interface EventTrendline {
  diver_id: string;
  discipline: Discipline;
  points: Array<{
    date: string | null;
    competition: string;
    score: number;
    dive_count: number;
  }>;
}

export interface DiveTrendline {
  diver_id: string;
  dive_code: string;
  board: BoardType;
  points: Array<{
    date: string | null;
    competition: string;
    score: number;
  }>;
}
