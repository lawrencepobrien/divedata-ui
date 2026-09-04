import PortfolioGrid from '../components/Portfolio/PortfolioGrid';

function CoachPortfolios(): JSX.Element {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-1">Your portfolios</h2>
      <p className="text-slate-400 mb-8">
        Curate highlights pulled from dives across your roster.
      </p>
      <PortfolioGrid />
    </div>
  );
}

export default CoachPortfolios;
