import { useNavigate, useParams } from 'react-router-dom';
import { useDiveDetail } from '../hooks/useDiver';
import { annotateJudgeScores, scoreMultiplier } from '../lib/diveScoring';
import AddToPortfolioButton from '../components/Portfolio/AddToPortfolioButton';
import DiveVideoUpload from '../components/DiveVideo/DiveVideoUpload';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DiveDetailPage() {
  const navigate = useNavigate();
  const { diverId, source, scoreId } = useParams<{
    diverId: string;
    source: 'competition' | 'training';
    scoreId: string;
  }>();

  const { data: dive, isLoading, isError } = useDiveDetail(
    diverId,
    source,
    scoreId,
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors cursor-pointer"
        >
          ← Back
        </button>
        {dive && source && (
          <AddToPortfolioButton
            itemType={source === 'training' ? 'training_dive' : 'competition_dive'}
            itemId={dive.id}
          />
        )}
      </div>

      {isLoading && (
        <div className="text-slate-500 text-sm">Loading…</div>
      )}

      {isError && (
        <div className="text-rose-400 text-sm">Failed to load dive detail.</div>
      )}

      {dive && (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              {dive.dive_code && (
                <span className="text-3xl font-bold font-mono">{dive.dive_code}</span>
              )}
              {dive.description && (
                <span className="text-slate-400 text-lg">{dive.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm flex-wrap">
              {dive.source === 'competition' && dive.competition && (
                <span>{dive.competition}</span>
              )}
              {dive.source === 'competition' && dive.competition && dive.dived_at && (
                <span>·</span>
              )}
              {dive.dived_at && <span>{formatDate(dive.dived_at)}</span>}
              <span>·</span>
              <span className="font-mono">{dive.board}</span>
              {dive.source === 'training' && (
                <>
                  <span>·</span>
                  <span className="text-slate-600">Training</span>
                </>
              )}
            </div>
          </div>

          {/* Judge scores */}
          {dive.judge_scores.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Judge Scores</p>
              <div className="flex gap-2 flex-wrap">
                {annotateJudgeScores(dive.judge_scores, (js) => js.score).map(({ item: js, dropped, dropSide }, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-sm font-mono font-semibold ${
                      dropped
                        ? 'border-slate-800 bg-slate-900 text-slate-600'
                        : 'border-slate-700 bg-slate-800 text-slate-100'
                    }`}
                  >
                    <span>{js.score.toFixed(1)}</span>
                    {dropped && (
                      <span className="text-xs font-sans text-slate-700 font-normal">
                        dropped ({dropSide})
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {dive.judge_scores.length < 3 && (
                <p className="text-slate-600 text-xs mt-3">
                  Fewer than 3 judges — score is scaled ×{scoreMultiplier(dive.judge_scores.length).toFixed(2)} instead of dropping outliers.
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-600 text-sm">No individual judge scores recorded.</p>
          )}

          {/* Total */}
          <div className="border-t border-slate-800 pt-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Total Score</p>
            <p className="text-4xl font-bold text-cyan-400">
              {dive.total_score != null ? dive.total_score.toFixed(2) : '—'}
            </p>
          </div>

          {/* Video */}
          {diverId && source && scoreId && (
            <div className="border-t border-slate-800 pt-6">
              <DiveVideoUpload diverId={diverId} source={source} diveId={scoreId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
