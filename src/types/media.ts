export interface DiveMedia {
  id: string;
  diver_id: string;
  dive_source: 'competition' | 'training';
  dive_id: string;
  object_key: string;
  content_type?: string;
  size_bytes?: number;
  status: 'pending' | 'ready';
  created_at: string;
}

/** Response from starting an upload — carries the presigned URL to PUT bytes to. */
export interface AttachMediaResponse {
  media: DiveMedia;
  upload_url: string;
  expires_in_seconds: number;
}

/** Response from fetching a dive's video — watch_url is present only when ready. */
export interface WatchMediaResponse {
  media: DiveMedia;
  watch_url?: string;
  expires_in_seconds?: number;
}
