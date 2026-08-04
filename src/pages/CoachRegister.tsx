import { useState } from 'react';
import TextInput from '../components/Connected/TextInput/TextInput';
import { useCreateInvite, useInvites, useRevokeInvite } from '../hooks/useCoach';
import type { DiverInvite } from '../types/coach';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadge(status: DiverInvite['status']): JSX.Element {
  const styles: Record<DiverInvite['status'], string> = {
    pending: 'text-amber-400 bg-amber-500/10',
    claimed: 'text-cyan-400 bg-cyan-500/10',
    revoked: 'text-slate-500 bg-slate-500/10',
  };
  return (
    <span className={`text-xs rounded-full px-2 py-0.5 capitalize ${styles[status]}`}>{status}</span>
  );
}

function CoachRegister(): JSX.Element {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();
  const { data: invites = [], isLoading } = useInvites();

  const handleSubmit = () => {
    setCopied(false);
    createInvite.mutate(
      { email: email.trim(), name: name.trim() || undefined },
      {
        onSuccess: (invite) => {
          setClaimLink(`${window.location.origin}/invite/${invite.token}`);
          setEmail('');
          setName('');
        },
      },
    );
  };

  const handleCopy = () => {
    if (!claimLink) return;
    navigator.clipboard.writeText(claimLink).then(() => setCopied(true));
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Register a diver</h2>
      <p className="text-slate-400 mb-8">
        Invite a diver to join your roster. We'll generate a link you can send them directly —
        they'll finish setting up their own profile once they open it.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
            <TextInput label="Name (optional)" onChange={(e) => setName(e.target.value)} />
          </div>

          {createInvite.isError && (
            <p className="text-red-400 text-sm">
              {createInvite.error instanceof Error ? createInvite.error.message : 'Something went wrong'}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!email.trim() || createInvite.isPending}
            className="self-start bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed
                       text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition duration-150 cursor-pointer"
          >
            {createInvite.isPending ? 'Creating invite…' : 'Create invite link'}
          </button>

          {claimLink && (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5">
              <span className="text-slate-300 text-sm font-mono truncate flex-1">{claimLink}</span>
              <button
                onClick={handleCopy}
                className="text-cyan-400 hover:text-cyan-300 text-sm shrink-0 cursor-pointer transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-4">Invites</h3>
      {isLoading ? (
        <div className="text-slate-500 text-sm py-4">Loading…</div>
      ) : invites.length === 0 ? (
        <p className="text-slate-500 text-sm">No invites sent yet.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {invites.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <p className="text-slate-200 text-sm truncate">{invite.name || invite.email}</p>
                <p className="text-slate-500 text-xs">
                  {invite.email} · sent {formatDate(invite.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {statusBadge(invite.status)}
                {invite.status === 'pending' && (
                  <button
                    onClick={() => revokeInvite.mutate(invite.id)}
                    disabled={revokeInvite.isPending}
                    className="text-slate-600 hover:text-rose-400 text-xs cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoachRegister;
