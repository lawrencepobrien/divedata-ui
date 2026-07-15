import type { BoardType } from './trendline';

export interface TrainingStatEntry {
  dive_code: string;
  board: BoardType;
  dive_count: number;
  avg_score: number;
  min_score: number;
  max_score: number;
  median_score: number;
  last_dived_at: string;
}

export interface CompStatEntry {
  dive_code: string;
  board: BoardType;
  dive_count: number;
  avg_score: number;
  min_score: number;
  max_score: number;
  q1_score: number;
  median_score: number;
  q3_score: number;
}

export interface DiverStats {
  diver_id: string;
  training: TrainingStatEntry[];
  competition: CompStatEntry[];
}
