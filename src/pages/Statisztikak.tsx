import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { Loader2, BarChart3, Wallet, FileText, TrendingUp, Percent } from 'lucide-react';

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} Mrd Ft`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} M Ft`;
  }
  return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

export default function Statisztikak() {
  const { projects, loading, aggregatedData } = useProjectData();

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const successRate = projects.length > 0 
    ? ((aggregatedData.statuszokSzerint['nyertes'] || 0) + (aggregatedData.statuszokSzerint['támogatott'] || 0)) / projects.length * 100
    : 0;

  const megyeChartData = Object.entries(aggregatedData.megyenkent)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const evChartData = Object.entries(aggregatedData.evenkent)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  const statuszChartData = Object.entries(aggregatedData.statuszokSzerint)
    .map(([name, value]) => ({ name, value }));

  const kategoriaChartData = Object.entries(aggregatedData.kategoriaként)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value);

  const projektekSzamaByMegye = Object.entries(aggregatedData.megyenkent)
    .map(([name, data]) => ({ name, value: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Statisztikák</h1>
            <p className="text-muted-foreground">
              Részletes statisztikai áttekintés
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Összes igényelt"
            value={formatCurrency(aggregatedData.osszesIgenyelt)}
            icon={Wallet}
          />
          <StatCard
            title="Összes támogatott"
            value={formatCurrency(aggregatedData.osszesTamogatott)}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Projektek száma"
            value={aggregatedData.projektekSzama.toLocaleString('hu-HU')}
            icon={FileText}
          />
          <StatCard
            title="Átlag támogatás"
            value={formatCurrency(aggregatedData.atlagTamogatas)}
            icon={TrendingUp}
          />
          <StatCard
            title="Sikerességi arány"
            value={`${successRate.toFixed(1)}%`}
            icon={Percent}
            variant="success"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <LineChartComponent
            data={evChartData}
            title="Támogatás alakulása évek szerint"
          />
          <PieChartComponent
            data={statuszChartData}
            title="Projektek státusz szerint"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={megyeChartData}
            title="Top 10 megye támogatás szerint"
          />
          <BarChartComponent
            data={projektekSzamaByMegye}
            title="Top 10 megye projektek száma szerint"
            formatValue={(v) => `${v} db`}
          />
        </div>

        <div className="grid gap-6">
          <BarChartComponent
            data={kategoriaChartData}
            title="Kategóriák szerinti támogatás"
          />
        </div>
      </div>
    </Layout>
  );
}
