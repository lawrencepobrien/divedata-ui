import { useParams } from 'react-router-dom';

/**
 * Profile page — skeleton. Reads the `:id` route param; wiring it to real
 * profile data (e.g. useDiver) comes later.
 */
function Profile(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Profile</h2>
      <p className="text-slate-400">
        Viewing profile <span className="text-slate-200">{id}</span>.
      </p>
      <p className="text-slate-500 text-sm mt-2">Profile details coming soon.</p>
    </div>
  );
}

export default Profile;
