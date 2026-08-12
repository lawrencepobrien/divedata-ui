import DiverTrendlines from '../components/DiverTrendlines';

interface Props {
  diverId: string;
}

export default function StatisticsPage({ diverId }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Statistics</h1>
      <DiverTrendlines diverId={diverId} />
    </div>
  );
}
