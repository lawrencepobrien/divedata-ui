import PortfolioTree from '../components/Portfolio/PortfolioTree';

interface Props {
  fullName?: string;
  hasDiver: boolean;
  diverId?: string;
}

function DiverOverview({ fullName, hasDiver, diverId }: Props): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Welcome back, {fullName}.</h2>
      <p className="text-slate-400 mb-8">Your portfolio</p>

      {hasDiver && diverId ? (
        <PortfolioTree diverId={diverId} />
      ) : (
        <p className="text-slate-500 text-sm">
          Complete your profile to start building a portfolio of your best dives and competitions.
        </p>
      )}
    </div>
  );
}

export default DiverOverview;
