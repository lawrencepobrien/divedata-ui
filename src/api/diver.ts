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

export const diversApi = {
  getStats: (diverId: string, signal?: AbortSignal) =>
    client.get<DiverStats>(`/divers/${diverId}/stats`, signal),

  getEventTrendline: (diverId: string, discipline: Discipline, signal?: AbortSignal) =>
    client.get<EventTrendline>(`/divers/${diverId}/trendline/events?discipline=${discipline}`, signal),

  getDiveTrendline: (diverId: string, diveCode: string, board: BoardType, signal?: AbortSignal) =>
    client.get<DiveTrendline>(`/divers/${diverId}/trendline/dives?dive_code=${encodeURIComponent(diveCode)}&board=${encodeURIComponent(board)}`, signal),

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
