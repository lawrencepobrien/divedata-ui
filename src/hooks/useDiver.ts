import { useQuery } from '@tanstack/react-query';
import { diversApi } from '../api/diver';
import type { Discipline, BoardType, TrendlinePoint } from '../types/trendline';
import type { DiverStats } from '../types/stats';

export const diverKeys = {
  stats: (diverId: string) => ['diver', diverId, 'stats'] as const,
  eventTrendline: (diverId: string, discipline: Discipline) =>
    ['diver', diverId, 'trendline', 'events', discipline] as const,
  diveTrendline: (diverId: string, diveCode: string, board: BoardType) =>
    ['diver', diverId, 'trendline', 'dives', diveCode, board] as const,
};

export function useDiverStats(diverId: string | null | undefined) {
  return useQuery<DiverStats>({
    queryKey: diverKeys.stats(diverId ?? ''),
    queryFn: () => diversApi.getStats(diverId!),
    enabled: !!diverId,
  });
}

export function useEventTrendline(diverId: string | null | undefined, discipline: Discipline) {
  return useQuery<TrendlinePoint[]>({
    queryKey: diverKeys.eventTrendline(diverId ?? '', discipline),
    queryFn: async () => {
      const data = await diversApi.getEventTrendline(diverId!, discipline);
      return data.points.map((pt) => ({
        date: pt.date,
        score: pt.score,
        label: pt.competition,
      }));
    },
    enabled: !!diverId,
  });
}

export function useDiveTrendline(
  diverId: string | null | undefined,
  diveCode: string | null,
  board: BoardType | null,
) {
  return useQuery<TrendlinePoint[]>({
    queryKey: diverKeys.diveTrendline(diverId ?? '', diveCode ?? '', board ?? '1m'),
    queryFn: async () => {
      const data = await diversApi.getDiveTrendline(diverId!, diveCode!, board!);
      return data.points.map((pt) => ({
        date: pt.date,
        score: pt.score,
        label: pt.competition,
      }));
    },
    enabled: !!diverId && !!diveCode && !!board,
  });
}
