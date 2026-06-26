import { client } from './client';
import type { DiverStats } from '../types/stats';
import type { EventTrendline, DiveTrendline, Discipline, BoardType } from '../types/trendline';
import type { CompetitionResult } from '../types/history';

export const diversApi = {
  getStats: (diverId: string, signal?: AbortSignal) =>
    client.get<DiverStats>(`/divers/${diverId}/stats`, signal),

  getEventTrendline: (diverId: string, discipline: Discipline, signal?: AbortSignal) =>
    client.get<EventTrendline>(`/divers/${diverId}/trendline/events?discipline=${discipline}`, signal),

  getDiveTrendline: (diverId: string, diveCode: string, board: BoardType, signal?: AbortSignal) =>
    client.get<DiveTrendline>(`/divers/${diverId}/trendline/dives?dive_code=${encodeURIComponent(diveCode)}&board=${encodeURIComponent(board)}`, signal),

  getHistory: (diverId: string, signal?: AbortSignal) =>
    client.get<CompetitionResult[]>(`/divers/${diverId}/history`, signal),
};
