export type PortfolioItemType = 'dive';

export interface Portfolio {
  id: string;
  name: string;
  position: number;
  entry_count: number;
}

export interface PortfolioEntrySummary {
  dive_code?: string;
  board?: string;
  total_score?: number;
  dived_at?: string;
  competition_name?: string;
  event_date?: string;
  diver_id?: string;
}

export interface PortfolioEntry {
  id: string;
  portfolio_id: string;
  item_type: PortfolioItemType;
  item_id: string;
  position: number;
  summary: PortfolioEntrySummary;
}

export interface PortfolioDetail {
  portfolio: Portfolio;
  entries: PortfolioEntry[];
  diver_id: string;
}
