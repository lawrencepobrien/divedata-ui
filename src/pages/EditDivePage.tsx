import { useNavigate, useParams } from 'react-router-dom';
import { useDiveDetail, useUpdateDive } from '../hooks/useDiver';
import DiveForm from '../components/DiveForm';
import type { BoardType } from '../types/trendline';
import type { CreateDiveRequest } from '../types/dive';

export default function EditDivePage() {
  const { diverId, scoreId: diveId } = useParams<{ diverId: string; scoreId: string }>();
  const navigate = useNavigate();
  const { data: dive, isLoading, isError } = useDiveDetail(diverId, diveId);
  const updateDive = useUpdateDive(diverId ?? '');

  const handleSubmit = (payload: CreateDiveRequest) => {
    if (!diverId || !diveId) return;
    updateDive.mutate(
      { diveId, body: payload },
      { onSuccess: () => navigate(`/profile/${diverId}/dives/${diveId}`) },
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-1">Edit Dive</h1>
      <p className="text-slate-400 text-sm mb-8">Update this dive's recorded details.</p>

      {isLoading && <div className="text-slate-500 text-sm">Loading…</div>}
      {isError && <div className="text-rose-400 text-sm">Failed to load dive.</div>}

      {dive && dive.source === 'competition' && (
        <p className="text-slate-500 text-sm">
          Competition-sourced dives can't be edited here — they come from the scraped results.
        </p>
      )}

      {dive && dive.source === 'training' && (
        <DiveForm
          initialValues={{
            diveCode: dive.dive_code,
            board: dive.board as BoardType,
            date: dive.dived_at ? dive.dived_at.slice(0, 10) : undefined,
            totalScore:
              dive.scores?.judges && dive.scores.judges.length > 0
                ? ''
                : dive.scores?.total != null
                  ? String(dive.scores.total)
                  : '',
            judgeScores: dive.scores?.judges?.map((j) => String(j.score)) ?? [],
          }}
          submitLabel="Save changes"
          submittingLabel="Saving…"
          isSubmitting={updateDive.isPending}
          errorMessage={
            updateDive.isError
              ? updateDive.error instanceof Error
                ? updateDive.error.message
                : 'Failed to save changes'
              : null
          }
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
