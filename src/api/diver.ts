import { client } from './client';
import type { DiverStats } from '../types/stats';
import type { EventTrendline, DiveTrendline, Discipline, BoardType } from '../types/trendline';
import type { CompetitionResult } from '../types/history';
import type {
  DiveScoreDetail,
  DiveScore,
  TrainingDiveListEntry,
  CreateTrainingDiveRequest,
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

  getCompetitionDiveDetail: (diverId: string, scoreId: string, signal?: AbortSignal) =>
    client.get<DiveScoreDetail>(`/divers/${diverId}/competition-dives/${scoreId}`, signal),

  getTrainingDiveDetail: (diverId: string, scoreId: string, signal?: AbortSignal) =>
    client.get<DiveScoreDetail>(`/divers/${diverId}/training-dives/${scoreId}`, signal),

  listTrainingDives: (diverId: string, signal?: AbortSignal) =>
    client.get<TrainingDiveListEntry[]>(`/divers/${diverId}/training-dives`, signal),

  createTrainingDive: (diverId: string, body: CreateTrainingDiveRequest) =>
    client.post<DiveScore>(`/divers/${diverId}/training-dives`, body),

  deleteTrainingDive: (diverId: string, scoreId: string) =>
    client.delete<void>(`/divers/${diverId}/training-dives/${scoreId}`),
};
