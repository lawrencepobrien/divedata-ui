import { client } from './client';
import type { DiverStats } from '../types/stats';
import type { EventTrendline, DiveTrendline, Discipline, BoardType } from '../types/trendline';
import type { CompetitionResult } from '../types/history';
import type {
  DiveScoreDetail,
  DiveScore,
  DiveListEntry,
  CreateDiveRequest,
} from '../types/dive';

// portfolioParam builds the trailing "&portfolio_id=..." query fragment,
// or '' when scoping is off — appended to an already-built query string.
function portfolioParam(portfolioId?: string): string {
  return portfolioId ? `&portfolio_id=${encodeURIComponent(portfolioId)}` : '';
}

export const diversApi = {
  getStats: (diverId: string, portfolioId?: string, signal?: AbortSignal) =>
    client.get<DiverStats>(
      `/divers/${diverId}/stats${portfolioId ? `?portfolio_id=${encodeURIComponent(portfolioId)}` : ''}`,
      signal,
    ),

  getEventTrendline: (diverId: string, discipline: Discipline, portfolioId?: string, signal?: AbortSignal) =>
    client.get<EventTrendline>(
      `/divers/${diverId}/trendline/events?discipline=${discipline}${portfolioParam(portfolioId)}`,
      signal,
    ),

  getDiveTrendline: (
    diverId: string,
    diveCode: string,
    board: BoardType,
    portfolioId?: string,
    signal?: AbortSignal,
  ) =>
    client.get<DiveTrendline>(
      `/divers/${diverId}/trendline/dives?dive_code=${encodeURIComponent(diveCode)}&board=${encodeURIComponent(board)}${portfolioParam(portfolioId)}`,
      signal,
    ),

  getHistory: (diverId: string, signal?: AbortSignal) =>
    client.get<CompetitionResult[]>(`/divers/${diverId}/history`, signal),

  getDiveDetail: (diverId: string, diveId: string, signal?: AbortSignal) =>
    client.get<DiveScoreDetail>(`/divers/${diverId}/dives/${diveId}`, signal),

  listDives: (diverId: string, signal?: AbortSignal) =>
    client.get<DiveListEntry[]>(`/divers/${diverId}/dives`, signal),

  createDive: (diverId: string, body: CreateDiveRequest) =>
    client.post<DiveScore>(`/divers/${diverId}/dives`, body),

  deleteDive: (diverId: string, scoreId: string) =>
    client.delete<void>(`/divers/${diverId}/dives/${scoreId}`),
};
