import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { mediaApi, uploadDiveVideo } from '../api/media';
import type { WatchMediaResponse, DiveMedia } from '../types/media';

type Source = 'competition' | 'training';

export const mediaKeys = {
  media: (diverId: string, source: string, diveId: string) =>
    ['diver', diverId, 'dives', source, diveId, 'media'] as const,
};

/** The dive's video, or null when it has none (a 404 from the API). */
export function useDiveMedia(
  diverId: string | null | undefined,
  source: Source | null | undefined,
  diveId: string | null | undefined,
) {
  return useQuery<WatchMediaResponse | null>({
    queryKey: mediaKeys.media(diverId ?? '', source ?? '', diveId ?? ''),
    queryFn: async ({ signal }) => {
      try {
        return await mediaApi.get(diverId!, source!, diveId!, signal);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null; // no video yet
        throw e;
      }
    },
    enabled: !!diverId && !!source && !!diveId,
  });
}

interface UploadVars {
  file: File;
  onProgress?: (pct: number) => void;
}

export function useUploadDiveVideo(diverId: string, source: Source, diveId: string) {
  const qc = useQueryClient();
  return useMutation<DiveMedia, Error, UploadVars>({
    mutationFn: ({ file, onProgress }) => uploadDiveVideo(diverId, source, diveId, file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.media(diverId, source, diveId) }),
  });
}

export function useDeleteDiveMedia(diverId: string, source: Source, diveId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => mediaApi.remove(diverId, source, diveId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.media(diverId, source, diveId) }),
  });
}
