export type ShareStatus = 'pending' | 'accepted' | 'declined';

export interface CoachSummary {
  user_id: string;
  name: string;
  email: string;
}

export interface PortfolioShare {
  id: string;
  portfolio_id: string;
  recipient_id: string;
  status: ShareStatus;
  created_at: string;
}

export interface OutgoingShare {
  id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_email: string;
  status: ShareStatus;
  created_at: string;
  responded_at?: string;
}

export interface IncomingShare {
  id: string;
  portfolio_id: string;
  portfolio_name: string;
  owner_user_id: string;
  owner_name: string;
  status: ShareStatus;
  created_at: string;
  responded_at?: string;
}
