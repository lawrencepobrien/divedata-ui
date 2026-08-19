import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoster } from '../hooks/useCoach';
import PortfolioGrid from '../components/Portfolio/PortfolioGrid';
import DiverTrendlines from '../components/DiverTrendlines';
import Breadcrumbs from '../components/Breadcrumbs';

type Tab = 'portfolios' | 'trends';

const TABS: { value: Tab; label: string }[] = [
  { value: 'portfolios', label: 'Portfolios' },
  { value: 'trends', label: 'Trends' },
];

function RosterDiverDetail(): JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const { data: roster = [], isLoading } = useRoster();
  const diver = roster.find((d) => d.user_id === userId);
  const [tab, setTab] = useState<Tab>('portfolios');

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-6 py-12 text-slate-500 text-sm">Loading…</div>;
  }

  if (!diver) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-500 text-sm">
          Diver not found — they may no longer be on your roster.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Breadcrumbs items={[{ label: 'Team', href: '/' }, { label: diver.name || diver.email }]} />
      </div>

      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-bold">{diver.name || diver.email}</h2>
        {!diver.has_profile && (
          <span className="text-xs text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
            Profile incomplete
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-8">
        {diver.email}
        {diver.has_profile && (diver.city || diver.country)
          ? ` · ${[diver.city, diver.country].filter(Boolean).join(', ')}`
          : ''}
      </p>

      {diver.has_profile && diver.diver_id ? (
        <>
          <div role="tablist" className="flex gap-6 border-b border-slate-800 mb-8">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                  tab === value
                    ? 'border-cyan-500 text-slate-100'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'portfolios' && <PortfolioGrid ownerId={diver.user_id} />}
          {tab === 'trends' && <DiverTrendlines diverId={diver.diver_id} ownerId={diver.user_id} />}
        </>
      ) : (
        <p className="text-slate-500 text-sm">
          This diver hasn't finished setting up their profile yet.
        </p>
      )}
    </div>
  );
}

export default RosterDiverDetail;
