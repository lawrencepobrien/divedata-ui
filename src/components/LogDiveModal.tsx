import { useEffect, useState } from 'react';
import { useCreateDive, useCreateCompetitionDives } from '../hooks/useDiver';
import DiveForm, { Field, inputClass } from './DiveForm';
import VideoFilePicker from './DiveVideo/VideoFilePicker';
import { validateVideoFile, uploadDiveVideo } from '../api/media';
import type { CreateDiveRequest } from '../types/dive';
import type { BoardType } from '../types/trendline';

const BOARD_OPTIONS: BoardType[] = ['1m', '3m', '5m', '7.5m', '10m'];

type Mode = 'dive' | 'competition';

const MODES: { value: Mode; label: string }[] = [
  { value: 'dive', label: 'Dive' },
  { value: 'competition', label: 'Competition' },
];

interface Props {
  diverId: string;
  open: boolean;
  onClose: () => void;
}

export default function LogDiveModal({ diverId, open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('dive');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Log</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:text-slate-200 text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div role="tablist" className="flex gap-1.5 mb-6 flex-wrap">
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              role="tab"
              aria-selected={mode === value}
              onClick={() => setMode(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                mode === value ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Both forms stay mounted, stacked in the same grid cell, so the
            modal is always as tall as the larger of the two — switching
            modes never snaps the height up or down. The inactive one is
            hidden with visibility (not display) so it still occupies space. */}
        <div className="grid">
          <div className={`col-start-1 row-start-1 ${mode === 'dive' ? '' : 'invisible pointer-events-none'}`}>
            <DiveModeForm diverId={diverId} onDone={onClose} />
          </div>
          <div className={`col-start-1 row-start-1 ${mode === 'competition' ? '' : 'invisible pointer-events-none'}`}>
            <CompetitionForm diverId={diverId} onDone={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Logs a single dive — training or competition, toggled by the radio button
// below rather than as a separate top-level mode.
function DiveModeForm({ diverId, onDone }: { diverId: string; onDone: () => void }) {
  const createDive = useCreateDive(diverId);
  const [isCompetition, setIsCompetition] = useState(false);
  const [compName, setCompName] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compEvent, setCompEvent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (payload: CreateDiveRequest) => {
    if (isCompetition && !compName.trim()) {
      setError('Competition name is required.');
      return;
    }
    setError(null);

    const finalPayload: CreateDiveRequest = isCompetition
      ? {
          ...payload,
          competition_name: compName.trim(),
          competition_location: compLocation.trim() || undefined,
          competition_event: compEvent.trim() || undefined,
        }
      : payload;

    createDive.mutate(finalPayload, {
      onSuccess: async (created) => {
        if (isCompetition || !videoFile) {
          onDone();
          return;
        }
        try {
          setUploadProgress(0);
          await uploadDiveVideo(diverId, created.id, videoFile, setUploadProgress);
          onDone();
        } catch (err) {
          setUploadProgress(null);
          setVideoError(
            err instanceof Error
              ? `${err.message} — your dive was saved; you can add the video from the dive page.`
              : 'Video upload failed — your dive was saved; add the video from the dive page.',
          );
        }
      },
    });
  };

  return (
    <DiveForm
      submitLabel="Log dive"
      submittingLabel={uploadProgress !== null ? 'Uploading video…' : 'Saving…'}
      isSubmitting={createDive.isPending || uploadProgress !== null}
      errorMessage={
        error ?? (createDive.isError ? (createDive.error instanceof Error ? createDive.error.message : 'Failed to save dive') : null)
      }
      onSubmit={handleSubmit}
    >
      <Field label="Type">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="dive-type"
              checked={!isCompetition}
              onChange={() => setIsCompetition(false)}
              className="accent-cyan-500"
            />
            Training
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="dive-type"
              checked={isCompetition}
              onChange={() => setIsCompetition(true)}
              className="accent-cyan-500"
            />
            Competition
          </label>
        </div>
      </Field>

      {isCompetition ? (
        <>
          <Field label="Competition name">
            <input
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. State Championships"
              className={inputClass}
            />
          </Field>
          <Field label="Location (optional)">
            <input value={compLocation} onChange={(e) => setCompLocation(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Round (optional)">
            <input
              value={compEvent}
              onChange={(e) => setCompEvent(e.target.value)}
              placeholder="e.g. Final"
              className={inputClass}
            />
          </Field>
        </>
      ) : (
        <Field label="Video (optional)">
          {videoFile ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm truncate max-w-[70%]">{videoFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoError(null);
                }}
                className="text-slate-500 hover:text-rose-400 text-xs cursor-pointer transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <VideoFilePicker
              label="Attach a video"
              onSelect={(f) => {
                const err = validateVideoFile(f);
                if (err) {
                  setVideoError(err);
                  return;
                }
                setVideoError(null);
                setVideoFile(f);
              }}
            />
          )}
          <p className="text-slate-600 text-xs mt-1">
            Optional — attach a clip of the dive. It uploads after the dive is saved.
          </p>
          {uploadProgress !== null && <p className="text-cyan-400 text-xs mt-1">Uploading video… {uploadProgress}%</p>}
          {videoError && <p className="text-rose-400 text-xs mt-1">{videoError}</p>}
        </Field>
      )}
    </DiveForm>
  );
}

interface CompetitionDiveRow {
  diveCode: string;
  totalScore: string;
}

// Logs a whole competition event (one board/discipline) at once.
function CompetitionForm({ diverId, onDone }: { diverId: string; onDone: () => void }) {
  const createCompetition = useCreateCompetitionDives(diverId);
  const [compName, setCompName] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compEvent, setCompEvent] = useState('');
  const [board, setBoard] = useState<BoardType>('3m');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<CompetitionDiveRow[]>([{ diveCode: '', totalScore: '' }]);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (i: number, patch: Partial<CompetitionDiveRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, { diveCode: '', totalScore: '' }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const canSubmit =
    compName.trim().length > 0 &&
    date.length > 0 &&
    rows.length > 0 &&
    rows.every((r) => r.diveCode.trim().length > 0 && r.totalScore.trim() !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    createCompetition.mutate(
      {
        competition_name: compName.trim(),
        competition_location: compLocation.trim() || undefined,
        competition_event: compEvent.trim() || undefined,
        board,
        dived_at: new Date(date).toISOString(),
        dives: rows.map((r) => ({
          dive_code: r.diveCode.trim().toUpperCase(),
          total_score: Number(r.totalScore),
          judge_scores: [],
        })),
      },
      {
        onSuccess: () => onDone(),
        onError: (err) => setError(err instanceof Error ? err.message : 'Failed to save competition'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <Field label="Competition name">
          <input
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
            placeholder="e.g. State Championships"
            className={inputClass}
          />
        </Field>
        <Field label="Location (optional)">
          <input value={compLocation} onChange={(e) => setCompLocation(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Round (optional)">
          <input
            value={compEvent}
            onChange={(e) => setCompEvent(e.target.value)}
            placeholder="e.g. Final"
            className={inputClass}
          />
        </Field>
        <Field label="Board">
          <div className="flex gap-1.5 flex-wrap">
            {BOARD_OPTIONS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBoard(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
                  board === b ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>

        <Field label="Dives">
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.diveCode}
                  onChange={(e) =>
                    updateRow(i, { diveCode: e.target.value.toUpperCase().replace(/[^0-9A-E]/g, '') })
                  }
                  placeholder="Dive code"
                  className={`${inputClass} uppercase`}
                />
                <input
                  type="number"
                  step="0.1"
                  value={row.totalScore}
                  onChange={(e) => updateRow(i, { totalScore: e.target.value })}
                  placeholder="Score"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="text-slate-600 hover:text-rose-400 text-xs cursor-pointer transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="self-start text-cyan-400 hover:text-cyan-300 text-xs cursor-pointer transition-colors"
            >
              + Add another dive
            </button>
          </div>
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit || createCompetition.isPending}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                     text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition duration-150 cursor-pointer"
        >
          {createCompetition.isPending ? 'Saving…' : `Log ${rows.length} dive${rows.length === 1 ? '' : 's'}`}
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </form>
  );
}
