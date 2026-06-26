import { client } from './client';
import type { DiverStats } from '../types/stats';
import type { EventTrendline, DiveTrendline, Discipline, BoardType } from '../types/trendline';

export const diversApi = {
  getStats: (diverId: string) =>
    client.get<DiverStats>(`/divers/${diverId}/stats`),

  getEventTrendline: (diverId: string, discipline: Discipline) =>
    client.get<EventTrendline>(`/divers/${diverId}/trendline/events?discipline=${discipline}`),

  getDiveTrendline: (diverId: string, diveCode: string, board: BoardType) =>
    client.get<DiveTrendline>(`/divers/${diverId}/trendline/dives?dive_code=${encodeURIComponent(diveCode)}&board=${encodeURIComponent(board)}`),
};
