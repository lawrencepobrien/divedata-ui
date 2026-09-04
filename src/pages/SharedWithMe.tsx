import { useNavigate } from 'react-router-dom';
import { useIncomingShares, useAcceptShare, useDeclineShare } from '../hooks/usePortfolioShare';

function SharedWithMe(): JSX.Element {
  const { data: shares = [], isLoading } = useIncomingShares();
  const acceptShare = useAcceptShare();
  const declineShare = useDeclineShare();
  const navigate = useNavigate();

  const pending = shares.filter((s) => s.status === 'pending');
  const accepted = shares.filter((s) => s.status === 'accepted');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Shared with you</h2>
      <p className="text-slate-400 mb-8">Portfolios other coaches and divers have shared with you.</p>

      {isLoading ? (
        <div className="text-slate-500 text-sm py-4">Loading…</div>
      ) : (
        <div className="flex flex-col gap-10">
          {pending.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
                Pending requests
              </h3>
              <div className="flex flex-col gap-3">
                {pending.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-4"
                  >
                    <div>
                      <p className="text-slate-100 font-medium">{share.portfolio_name}</p>
                      <p className="text-slate-500 text-sm">shared by {share.owner_name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => acceptShare.mutate(share.id)}
                        disabled={acceptShare.isPending}
                        className="text-cyan-400 hover:text-cyan-300 cursor-pointer disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineShare.mutate(share.id)}
                        disabled={declineShare.isPending}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
              Shared portfolios
            </h3>
            {accepted.length === 0 ? (
              <p className="text-slate-500 text-sm">Nothing shared with you yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accepted.map((share) => (
                  <button
                    key={share.id}
                    onClick={() => navigate(`/shared/${share.portfolio_id}`)}
                    className="group flex flex-col justify-between text-left bg-slate-900 border border-slate-800 hover:border-cyan-500
                               rounded-2xl p-6 aspect-[4/3] transition duration-150 cursor-pointer"
                  >
                    <span className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition duration-150">
                      {share.portfolio_name}
                    </span>
                    <span className="text-slate-500 text-sm">shared by {share.owner_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedWithMe;
