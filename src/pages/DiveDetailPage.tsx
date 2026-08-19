import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile';
import { useDiveDetail } from '../hooks/useDiver';
import { useRoster } from '../hooks/useCoach';
import { annotateJudgeScores, scoreMultiplier } from '../lib/diveScoring';
import AddToPortfolioButton from '../components/Portfolio/AddToPortfolioButton';
import DiveVideoUpload from '../components/DiveVideo/DiveVideoUpload';
import Breadcrumbs, { type Crumb } from '../components/Breadcrumbs';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DiveDetailPage() {
  const { diverId, scoreId } = useParams<{
    diverId: string;
    scoreId: string;
  }>();
  const location = useLocation();
  // Set by PortfolioDetailPage when navigating here from one of its entries,
  // so the trail can show the actual portfolio instead of the generic
  // diver/home fallback below — absent for any other entry point (trends
  // chart click, direct URL, etc).
  const breadcrumbPrefix = (location.state as { breadcrumbPrefix?: Crumb[] } | null)?.breadcrumbPrefix;

  const { data: dive, isLoading, isError } = useDiveDetail(
    diverId,
    scoreId,
  );

  // Add-to-portfolio and video upload/management are self-service only —
  // a coach viewing a roster diver's dive can see it, but not act on it.
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => profileApi.get() });
  const isOwner = !!diverId && profile?.diver?.id === diverId;

  // Only need roster data (for the diver's name) once we know the viewer
  // isn't the dive's owner, and only as a fallback when we didn't arrive
  // with a breadcrumbPrefix already — avoids a doomed /coach/roster call
  // for every diver loading their own dive.
  const { data: roster = [] } = useRoster(!breadcrumbPrefix && profile !== undefined && !isOwner);
  const rosterDiver = !isOwner ? roster.find((d) => d.diver_id === diverId) : undefined;

  const diveLabel = dive?.dive_code || dive?.description || 'Dive';
  const breadcrumbs: Crumb[] = breadcrumbPrefix
    ? [...breadcrumbPrefix, { label: diveLabel }]
    : profile === undefined
      ? [{ label: diveLabel }]
      : isOwner
        ? [{ label: 'Home', href: '/' }, { label: diveLabel }]
        : [
            { label: 'Team', href: '/' },
            {
              label: rosterDiver?.name ?? 'Diver',
              href: rosterDiver ? `/roster/${rosterDiver.user_id}` : '/',
            },
            { label: diveLabel },
          ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Breadcrumbs items={breadcrumbs} />
        {dive && isOwner && (
          <AddToPortfolioButton itemType="dive" itemId={dive.id} />
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
          {dive.scores && dive.scores.judges.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Judge Scores</p>
              <div className="flex gap-2 flex-wrap">
                {annotateJudgeScores(dive.scores.judges, (js) => js.score).map(({ item: js, dropped, dropSide }, i) => (
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
              {dive.scores.judges.length < 3 && (
                <p className="text-slate-600 text-xs mt-3">
                  Fewer than 3 judges — score is scaled ×{scoreMultiplier(dive.scores.judges.length).toFixed(2)} instead of dropping outliers.
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
              {dive.scores?.total != null ? dive.scores.total.toFixed(2) : '—'}
            </p>
          </div>

          {/* Video */}
          {diverId && scoreId && (
            <div className="border-t border-slate-800 pt-6">
              <DiveVideoUpload diverId={diverId} diveId={scoreId} readOnly={!isOwner} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
