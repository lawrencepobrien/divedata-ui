import { useQuery } from '@tanstack/react-query';
import { diversApi } from '../api/diver';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { DiverStats } from '../types/stats';
import type { CompetitionResult } from '../types/history';

const STALE_MS = 5 * 60 * 1000; // 5 minutes — competition data doesn't change in real time

export const diverKeys = {
  stats: (diverId: string) => ['diver', diverId, 'stats'] as const,
  history: (diverId: string) => ['diver', diverId, 'history'] as const,
  eventTrendline: (diverId: string, discipline: Discipline) =>
    ['diver', diverId, 'trendline', 'events', discipline] as const,
  diveTrendline: (diverId: string, diveCode: string, board: BoardType) =>
    ['diver', diverId, 'trendline', 'dives', diveCode, board] as const,
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
      }));
    },
    enabled: !!diverId && !!diveCode && !!board,
    staleTime: STALE_MS,
  });
}
