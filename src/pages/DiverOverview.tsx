import { useState } from 'react';
import PortfolioGrid from '../components/Portfolio/PortfolioGrid';
import DiverTrendlines from '../components/DiverTrendlines';

type Tab = 'portfolios' | 'trends';

const TABS: { value: Tab; label: string }[] = [
  { value: 'portfolios', label: 'Portfolios' },
  { value: 'trends', label: 'Trends' },
];

interface Props {
  fullName?: string;
  hasDiver: boolean;
  diverId?: string;
}

function DiverOverview({ fullName, hasDiver, diverId }: Props): JSX.Element {
  const [tab, setTab] = useState<Tab>('portfolios');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Welcome back, {fullName}.</h2>
      <p className="text-slate-400 mb-8">Your portfolios</p>

      {hasDiver && diverId ? (
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

          {tab === 'portfolios' && <PortfolioGrid />}
          {tab === 'trends' && <DiverTrendlines diverId={diverId} />}
        </>
      ) : (
        <p className="text-slate-500 text-sm">
          Complete your profile to start building a portfolio of your best dives and competitions.
        </p>
      )}
    </div>
  );
}

export default DiverOverview;
