import { useState } from 'react';
import { useDiveMedia, useUploadDiveVideo, useDeleteDiveMedia } from '../../hooks/useDiveMedia';
import { validateVideoFile } from '../../api/media';
import VideoFilePicker from './VideoFilePicker';

interface Props {
  diverId: string;
  diveId: string;
  /** Coach viewing a roster diver's dive: can watch, but not upload/remove. */
  readOnly?: boolean;
}

/** Video section for an existing dive: shows the player if a video exists, otherwise
 *  an upload button. Handles upload progress and removal. */
export default function DiveVideoUpload({ diverId, diveId, readOnly = false }: Props) {
  const { data, isLoading } = useDiveMedia(diverId, diveId);
  const upload = useUploadDiveVideo(diverId, diveId);
  const remove = useDeleteDiveMedia(diverId, diveId);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const media = data?.media ?? null;
  const watchUrl = data?.watch_url ?? null;

  function handleSelect(file: File) {
    setError(null);
    const validationError = validateVideoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setProgress(0);
    upload.mutate(
      { file, onProgress: setProgress },
      {
        onError: (e) => setError(e instanceof Error ? e.message : 'Upload failed'),
        onSettled: () => setProgress(null),
      },
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Video</p>

      {isLoading ? (
        <p className="text-slate-600 text-sm">Loading…</p>
      ) : media && watchUrl ? (
        <div className="space-y-3">
          <video
            src={watchUrl}
            controls
            className="w-full rounded-xl border border-slate-800 bg-black"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {remove.isPending ? 'Removing…' : 'Remove video'}
            </button>
          )}
        </div>
      ) : media && media.status === 'pending' ? (
        <div className="space-y-2">
          <p className="text-amber-400 text-sm">
            {readOnly
              ? "This diver's video upload hasn't finished yet."
              : "A previous upload for this dive didn't finish."}
          </p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              className="text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {remove.isPending ? 'Clearing…' : 'Clear it and upload again'}
            </button>
          )}
        </div>
      ) : readOnly ? (
        <p className="text-slate-600 text-sm">No video for this dive.</p>
      ) : progress !== null ? (
        <UploadProgress progress={progress} />
      ) : (
        <VideoFilePicker onSelect={handleSelect} label="Upload a video" />
      )}

      {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-1">
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full bg-cyan-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-slate-500 text-xs">Uploading… {progress}%</p>
    </div>
  );
}
