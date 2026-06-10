import { ReactNode, useState } from 'react';
import { User } from '../types/user';
import { useUpdateMe } from '../hooks/useUpdateMe';

interface Props {
  user: User | null;
}

/**
 * Account settings — skeleton. The profile save is wired to a real `/me`
 * mutation; the Keycloak-backed actions (password, sessions, delete) are
 * stubbed at the point where their auth call will go.
 */
function Settings({ user }: Props): JSX.Element {
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updateMe = useUpdateMe();
  const nameDirty = fullName.trim() !== (user?.full_name ?? '').trim();

  const handleSaveProfile = () => {
    updateMe.mutate({ full_name: fullName.trim() });
  };

  // ─── Stubs: each is where a real Keycloak call will be wired ───
  const handleChangePassword = () => {
    // TODO: keycloak.login({ action: 'UPDATE_PASSWORD' }) to open Keycloak's flow.
  };

  const handleSignOutEverywhere = () => {
    // TODO: revoke all sessions via Keycloak account REST / backchannel logout.
  };

  const handleDeleteAccount = () => {
    // TODO: DELETE /me, delete the Keycloak user, then force sign-out.
    setConfirmingDelete(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Settings</h2>
      <p className="text-slate-400 mb-8">Manage your account.</p>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <Section title="Profile" description="Your display name and contact email.">
          <div className="flex flex-col gap-5">
            <Field label="Display name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-2.5 text-sm
                           placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500
                           focus:border-transparent transition duration-150"
              />
            </Field>

            <Field label="Email">
              <p className="text-slate-300 text-sm py-2.5">{user?.email ?? '—'}</p>
            </Field>

            <div className="flex items-center gap-3">
              <PrimaryButton onClick={handleSaveProfile} disabled={!nameDirty || updateMe.isPending}>
                {updateMe.isPending ? 'Saving…' : 'Save changes'}
              </PrimaryButton>
              {updateMe.isSuccess && !nameDirty && (
                <span className="text-sm text-cyan-400">Saved</span>
              )}
              {updateMe.isError && (
                <span className="text-sm text-red-400">
                  {updateMe.error instanceof Error ? updateMe.error.message : 'Save failed'}
                </span>
              )}
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" description="Update the password used to sign in.">
          <SecondaryButton onClick={handleChangePassword}>Change password</SecondaryButton>
        </Section>

        {/* Delete account */}
        <Section
          title="Delete your account"
          description="Permanently delete your account and all associated data."
          danger
        >
          {!confirmingDelete ? (
            <DangerButton onClick={() => setConfirmingDelete(true)}>Delete account</DangerButton>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">Are you sure? This can't be undone.</span>
              <DangerButton onClick={handleDeleteAccount}>Yes, delete</DangerButton>
              <SecondaryButton onClick={() => setConfirmingDelete(false)}>Cancel</SecondaryButton>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

// ─── Local presentational helpers ───

function Section({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}): JSX.Element {
  return (
    <section
      className={`bg-slate-900 border rounded-xl p-6 ${danger ? 'border-red-900/60' : 'border-slate-800'}`}
    >
      <h3 className={`font-semibold ${danger ? 'text-red-400' : 'text-slate-100'}`}>{title}</h3>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                 text-slate-950 font-semibold rounded-lg px-4 py-2.5 text-sm transition duration-150 cursor-pointer"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="border border-slate-700 hover:border-slate-500 text-slate-200 rounded-lg px-4 py-2.5 text-sm
                 transition duration-150 cursor-pointer"
    >
      {children}
    </button>
  );
}

function DangerButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="bg-red-600/90 hover:bg-red-500 text-white font-semibold rounded-lg px-4 py-2.5 text-sm
                 transition duration-150 cursor-pointer"
    >
      {children}
    </button>
  );
}

export default Settings;
