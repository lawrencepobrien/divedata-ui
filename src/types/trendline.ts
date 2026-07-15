export type Discipline = '1m' | '3m' | 'platform';
export type BoardType = '1m' | '3m' | '5m' | '7.5m' | '10m';

// Normalized shape consumed by TrendlineChart — independent of API contract.
export interface TrendlinePoint {
  date: string | null;  // ISO date string from the API, null if unknown
  score: number;
  label: string;        // competition name
  id?: string;          // opaque ID for navigating to a detail view
  source?: 'competition' | 'training';
}

export interface EventTrendline {
  diver_id: string;
  discipline: Discipline;
  points: Array<{
    competition_id: string;
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
    id: string;
    date: string | null;
    competition: string;
    score: number;
    source: 'competition' | 'training';
  }>;
}
