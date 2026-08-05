import PortfolioGrid from '../components/Portfolio/PortfolioGrid';

interface Props {
  fullName?: string;
  hasDiver: boolean;
}

function DiverOverview({ fullName, hasDiver }: Props): JSX.Element {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Welcome back, {fullName}.</h2>
      <p className="text-slate-400 mb-8">Your portfolios</p>

      {hasDiver ? (
        <PortfolioGrid />
      ) : (
        <p className="text-slate-500 text-sm">
          Complete your profile to start building a portfolio of your best dives and competitions.
        </p>
      )}
    </div>
  );
}

export default DiverOverview;
