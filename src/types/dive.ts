export interface JudgeScoreDetail {
  judge_order: number;
  score: number;
}

export interface Scores {
  total: number | null;
  judges: JudgeScoreDetail[];
}

export interface DiveScoreDetail {
  id: string;
  source: 'competition' | 'training';
  dive_code: string;
  description: string;
  board: string;
  dive_order: number;
  scores: Scores | null;
  dived_at: string | null;
  competition: string;
}

export interface DiveScore {
  id: string;
  diver_id: string;
  dive_code: string;
  board: string;
  scores: Scores | null;
  dived_at: string;
  created_at: string;
}

export interface DiveListEntry {
  id: string;
  dive_code: string;
  board: string;
  total_score: number | null;
  dived_at: string;
}

export interface CreateDiveRequest {
  dive_code: string;
  board: string;
  total_score: number | null;
  dived_at: string;
  judge_scores: number[];
}

export interface DiveType {
  id: string;
  code: string;
  board: string;
  name: string | null;
  difficulty: number | null;
}
