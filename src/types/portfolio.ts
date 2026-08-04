export type PortfolioItemType = 'training_dive' | 'competition_dive' | 'competition';

export interface PortfolioFolder {
  id: string;
  parent_id?: string;
  name: string;
  position: number;
}

export interface PortfolioEntrySummary {
  dive_code?: string;
  board?: string;
  total_score?: number;
  dived_at?: string;
  competition_name?: string;
  event_date?: string;
}

export interface PortfolioEntry {
  id: string;
  folder_id: string;
  item_type: PortfolioItemType;
  item_id: string;
  position: number;
  summary: PortfolioEntrySummary;
}

export interface Portfolio {
  folders: PortfolioFolder[];
  entries: PortfolioEntry[];
}
