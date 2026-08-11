import { client } from './client';
import type { DiveMedia, AttachMediaResponse, WatchMediaResponse } from '../types/media';

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB — matches the backend limit.

/** Returns a user-facing error message if the file isn't an acceptable video, else null. */
export function validateVideoFile(file: File): string | null {
  if (!file.type.startsWith('video/')) return 'Please choose a video file.';
  if (file.size > MAX_VIDEO_BYTES) return 'Video must be under 500 MB.';
  return null;
}

const mediaPath = (diverId: string, diveId: string) => `/divers/${diverId}/dives/${diveId}/media`;

export const mediaApi = {
  // Start an upload: creates a pending row and returns a presigned PUT URL.
  attach: (diverId: string, diveId: string) =>
    client.post<AttachMediaResponse>(mediaPath(diverId, diveId), {}),
  // Confirm the upload landed and flip the row to 'ready'.
  complete: (diverId: string, diveId: string) =>
    client.post<DiveMedia>(`${mediaPath(diverId, diveId)}/complete`, {}),
  // Fetch the dive's video (404 = none — callers handle that).
  get: (diverId: string, diveId: string, signal?: AbortSignal) =>
    client.get<WatchMediaResponse>(mediaPath(diverId, diveId), signal),
  remove: (diverId: string, diveId: string) =>
    client.delete<void>(mediaPath(diverId, diveId)),
};

/**
 * PUT the file straight to MinIO via the presigned URL. Uses XMLHttpRequest (not
 * fetch) because only XHR reports upload progress. Deliberately sends NO Authorization
 * header — the presigned URL is self-authorizing, and an extra header breaks it.
 */
function putToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    // Must start with "video/" — the backend's complete step rejects anything else.
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(file);
  });
}

/** The full attach -> upload -> complete flow for one dive's video. */
export async function uploadDiveVideo(
  diverId: string,
  diveId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<DiveMedia> {
  const { upload_url } = await mediaApi.attach(diverId, diveId);
  await putToPresignedUrl(upload_url, file, onProgress);
  return mediaApi.complete(diverId, diveId);
}
