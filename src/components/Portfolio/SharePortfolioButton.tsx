import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../../api/profile';
import { useRoster } from '../../hooks/useCoach';
import {
  useMyCoaches,
  useOutgoingShares,
  useCreateShare,
  useRevokeShare,
} from '../../hooks/usePortfolioShare';

interface Props {
  portfolioId: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-amber-400',
  accepted: 'text-cyan-400',
  declined: 'text-rose-400',
};

function SharePortfolioButton({ portfolioId }: Props): JSX.Element {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => profileApi.get() });
  const isCoach = profile?.type === 'coach';

  const { data: roster = [] } = useRoster(profile !== undefined && isCoach);
  const { data: coaches = [] } = useMyCoaches(profile !== undefined && !isCoach);
  const { data: shares = [] } = useOutgoingShares(portfolioId);
  const createShare = useCreateShare(portfolioId);
  const revokeShare = useRevokeShare(portfolioId);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = isCoach
    ? roster.filter((d) => d.has_profile).map((d) => ({ id: d.user_id, label: d.name || d.email }))
    : coaches.map((c) => ({ id: c.user_id, label: c.name || c.email }));

  const alreadyShared = new Set(shares.filter((s) => s.status !== 'declined').map((s) => s.recipient_id));
  const available = candidates.filter((c) => !alreadyShared.has(c.id));

  const handleShare = (recipientId: string) => {
    setError(null);
    createShare.mutate(recipientId, {
      onError: (err) => setError(err instanceof Error ? err.message : 'Failed to share'),
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-slate-400 hover:text-slate-200 text-sm transition-colors cursor-pointer"
      >
        Share
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {shares.length > 0 && (
        <div className="flex flex-col items-end gap-1">
          {shares.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{s.recipient_name}</span>
              <span className={STATUS_COLOR[s.status] ?? 'text-slate-500'}>{s.status}</span>
              <button
                onClick={() => revokeShare.mutate(s.id)}
                aria-label={`Revoke share with ${s.recipient_name}`}
                title="Revoke"
                className="text-slate-600 hover:text-rose-400 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {available.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {available.map((c) => (
            <button
              key={c.id}
              onClick={() => handleShare(c.id)}
              disabled={createShare.isPending}
              className="text-slate-300 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500 rounded-lg px-3 py-1 text-sm
                         transition-colors cursor-pointer disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-xs">
          {isCoach ? 'No roster divers to share with.' : 'No coaches to share with.'}
        </p>
      )}

      <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-sm cursor-pointer">
        Close
      </button>

      {error && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}

export default SharePortfolioButton;
