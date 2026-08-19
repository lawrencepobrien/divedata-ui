import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client';
import { mediaApi, uploadDiveVideo } from '../api/media';
import type { WatchMediaResponse, DiveMedia } from '../types/media';

export const mediaKeys = {
  media: (diverId: string, diveId: string) => ['diver', diverId, 'dives', diveId, 'media'] as const,
};

/** The dive's video, or null when it has none (a 404 from the API). */
export function useDiveMedia(
  diverId: string | null | undefined,
  diveId: string | null | undefined,
) {
  return useQuery<WatchMediaResponse | null>({
    queryKey: mediaKeys.media(diverId ?? '', diveId ?? ''),
    queryFn: async ({ signal }) => {
      try {
        return await mediaApi.get(diverId!, diveId!, signal);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null; // no video yet
        throw e;
      }
    },
    enabled: !!diverId && !!diveId,
  });
}

interface UploadVars {
  file: File;
  onProgress?: (pct: number) => void;
}

export function useUploadDiveVideo(diverId: string, diveId: string) {
  const qc = useQueryClient();
  return useMutation<DiveMedia, Error, UploadVars>({
    mutationFn: ({ file, onProgress }) => uploadDiveVideo(diverId, diveId, file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.media(diverId, diveId) }),
  });
}

export function useDeleteDiveMedia(diverId: string, diveId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => mediaApi.remove(diverId, diveId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.media(diverId, diveId) }),
  });
}
