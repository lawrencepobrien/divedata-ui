import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diversApi } from '../api/diver';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { DiverStats } from '../types/stats';
import type { CompetitionResult } from '../types/history';
import type {
  DiveScoreDetail,
  DiveScore,
  TrainingDiveListEntry,
  CreateTrainingDiveRequest,
} from '../types/dive';

const STALE_MS = 5 * 60 * 1000; // 5 minutes — competition data doesn't change in real time

export const diverKeys = {
  stats: (diverId: string) => ['diver', diverId, 'stats'] as const,
  history: (diverId: string) => ['diver', diverId, 'history'] as const,
  eventTrendline: (diverId: string, discipline: Discipline) =>
    ['diver', diverId, 'trendline', 'events', discipline] as const,
  diveTrendline: (diverId: string, diveCode: string, board: BoardType) =>
    ['diver', diverId, 'trendline', 'dives', diveCode, board] as const,
  diveDetail: (diverId: string, source: string, scoreId: string) =>
    ['diver', diverId, 'dives', source, scoreId] as const,
  trainingDives: (diverId: string) => ['diver', diverId, 'training-dives'] as const,
  diveTrendlinePrefix: (diverId: string) => ['diver', diverId, 'trendline', 'dives'] as const,
};

export function useCompetitionHistory(diverId: string | null | undefined) {
  return useQuery<CompetitionResult[]>({
    queryKey: diverKeys.history(diverId ?? ''),
    queryFn: ({ signal }) => diversApi.getHistory(diverId!, signal),
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

export function useDiverStats(diverId: string | null | undefined) {
  return useQuery<DiverStats>({
    queryKey: diverKeys.stats(diverId ?? ''),
    queryFn: ({ signal }) => diversApi.getStats(diverId!, signal),
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

export function useEventTrendline(diverId: string | null | undefined, discipline: Discipline) {
  return useQuery<TrendlinePoint[]>({
    queryKey: diverKeys.eventTrendline(diverId ?? '', discipline),
    queryFn: async ({ signal }) => {
      const data = await diversApi.getEventTrendline(diverId!, discipline, signal);
      return data.points.map((pt) => ({
        date: pt.date,
        score: pt.score,
        label: pt.competition,
        id: pt.competition_id,
      }));
    },
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

export function useDiveDetail(
  diverId: string | null | undefined,
  source: 'competition' | 'training' | null | undefined,
  scoreId: string | null | undefined,
) {
  return useQuery<DiveScoreDetail>({
    queryKey: diverKeys.diveDetail(diverId ?? '', source ?? '', scoreId ?? ''),
    queryFn: ({ signal }) => {
      if (source === 'training') {
        return diversApi.getTrainingDiveDetail(diverId!, scoreId!, signal);
      }
      return diversApi.getCompetitionDiveDetail(diverId!, scoreId!, signal);
    },
    enabled: !!diverId && !!source && !!scoreId,
    staleTime: STALE_MS,
  });
}

export function useDiveTrendline(
  diverId: string | null | undefined,
  diveCode: string | null,
  board: BoardType | null,
) {
  return useQuery<TrendlinePoint[]>({
    queryKey: diverKeys.diveTrendline(diverId ?? '', diveCode ?? '', board ?? '1m'),
    queryFn: async ({ signal }) => {
      const data = await diversApi.getDiveTrendline(diverId!, diveCode!, board!, signal);
      return data.points.map((pt) => ({
        date: pt.date,
        score: pt.score,
        label: pt.competition,
        id: pt.id,
        source: pt.source,
      }));
    },
    enabled: !!diverId && !!diveCode && !!board,
    staleTime: STALE_MS,
  });
}

export function useTrainingDives(diverId: string | null | undefined) {
  return useQuery<TrainingDiveListEntry[]>({
    queryKey: diverKeys.trainingDives(diverId ?? ''),
    queryFn: ({ signal }) => diversApi.listTrainingDives(diverId!, signal),
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

function invalidateTrainingQueries(qc: ReturnType<typeof useQueryClient>, diverId: string) {
  qc.invalidateQueries({ queryKey: diverKeys.trainingDives(diverId) });
  qc.invalidateQueries({ queryKey: diverKeys.stats(diverId) });
  qc.invalidateQueries({ queryKey: diverKeys.diveTrendlinePrefix(diverId) });
}

export function useCreateTrainingDive(diverId: string) {
  const qc = useQueryClient();
  return useMutation<DiveScore, Error, CreateTrainingDiveRequest>({
    mutationFn: (body) => diversApi.createTrainingDive(diverId, body),
    onSuccess: () => invalidateTrainingQueries(qc, diverId),
  });
}

export function useDeleteTrainingDive(diverId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (scoreId) => diversApi.deleteTrainingDive(diverId, scoreId),
    onSuccess: () => invalidateTrainingQueries(qc, diverId),
  });
}
