import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diversApi } from '../api/diver';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { DiverStats } from '../types/stats';
import type { CompetitionResult } from '../types/history';
import type {
  DiveScoreDetail,
  DiveScore,
  DiveListEntry,
  CreateDiveRequest,
} from '../types/dive';

const STALE_MS = 5 * 60 * 1000; // 5 minutes — competition data doesn't change in real time

export const diverKeys = {
  stats: (diverId: string) => ['diver', diverId, 'stats'] as const,
  history: (diverId: string) => ['diver', diverId, 'history'] as const,
  eventTrendline: (diverId: string, discipline: Discipline) =>
    ['diver', diverId, 'trendline', 'events', discipline] as const,
  diveTrendline: (diverId: string, diveCode: string, board: BoardType) =>
    ['diver', diverId, 'trendline', 'dives', diveCode, board] as const,
  diveDetail: (diverId: string, diveId: string) => ['diver', diverId, 'dives', diveId] as const,
  dives: (diverId: string) => ['diver', diverId, 'dives-list'] as const,
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
      }));
    },
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

export function useDiveDetail(
  diverId: string | null | undefined,
  diveId: string | null | undefined,
) {
  return useQuery<DiveScoreDetail>({
    queryKey: diverKeys.diveDetail(diverId ?? '', diveId ?? ''),
    queryFn: ({ signal }) => diversApi.getDiveDetail(diverId!, diveId!, signal),
    enabled: !!diverId && !!diveId,
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

export function useDives(diverId: string | null | undefined) {
  return useQuery<DiveListEntry[]>({
    queryKey: diverKeys.dives(diverId ?? ''),
    queryFn: ({ signal }) => diversApi.listDives(diverId!, signal),
    enabled: !!diverId,
    staleTime: STALE_MS,
  });
}

function invalidateDiveQueries(qc: ReturnType<typeof useQueryClient>, diverId: string) {
  qc.invalidateQueries({ queryKey: diverKeys.dives(diverId) });
  qc.invalidateQueries({ queryKey: diverKeys.stats(diverId) });
  qc.invalidateQueries({ queryKey: diverKeys.diveTrendlinePrefix(diverId) });
}

export function useCreateDive(diverId: string) {
  const qc = useQueryClient();
  return useMutation<DiveScore, Error, CreateDiveRequest>({
    mutationFn: (body) => diversApi.createDive(diverId, body),
    onSuccess: () => invalidateDiveQueries(qc, diverId),
  });
}

export function useDeleteDive(diverId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (scoreId) => diversApi.deleteDive(diverId, scoreId),
    onSuccess: () => invalidateDiveQueries(qc, diverId),
  });
}
