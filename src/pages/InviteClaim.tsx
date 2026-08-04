import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useClaimInvite } from '../hooks/useCoach';
import { profileApi } from '../api/profile';
import { ApiError } from '../api/client';

function InviteClaim(): JSX.Element {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claimInvite = useClaimInvite();
  const attempted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    claimInvite.mutate(token, {
      onSuccess: async () => {
        // A fresh /me/profile lookup tells us whether this account already
        // finished ProfileSetup — if not, send them there next.
        try {
          const profile = await queryClient.fetchQuery({
            queryKey: ['profile'],
            queryFn: () => profileApi.get(),
          });
          navigate(profile?.type ? '/' : '/setup', { replace: true });
        } catch {
          navigate('/setup', { replace: true });
        }
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError('This invite link is invalid.');
        } else if (err instanceof ApiError && err.status === 409) {
          setError('This invite has already been used or has expired.');
        } else {
          setError('Something went wrong claiming this invite.');
        }
      },
    });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      {error ? (
        <>
          <h2 className="text-xl font-semibold mb-2">Couldn't join</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition duration-150 cursor-pointer"
          >
            Go to DiveData
          </button>
        </>
      ) : (
        <p className="text-slate-500 text-sm">Joining your coach's roster…</p>
      )}
    </div>
  );
}

export default InviteClaim;
