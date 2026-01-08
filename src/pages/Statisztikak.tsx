import { useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
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
  const {
    projects,
    filteredProjects,
    loading,
    aggregatedData,
    filters,
    uniqueValues,
    updateFilter,
    resetFilters
  } = useProjectData();

  /* 
   * Calculate Top 50 Winners 
   * Group by Tax Number (adoszama) + Name (szervezet_neve) to handle duplicates/variations
   */
  const topWinners = useMemo(() => {
    const winnersMap = new Map<string, { name: string; count: number; value: number }>();

    filteredProjects.forEach(project => {
      // Use adoszama for unique ID if available, otherwise name
      const id = project.adoszama || project.szervezet_neve;
      if (!id) return; // Skip invalid entries

      const key = String(id);

      if (!winnersMap.has(key)) {
        winnersMap.set(key, {
          name: project.szervezet_neve || 'Névtelen szervezet',
          count: 0,
          value: 0
        });
      }

      const winner = winnersMap.get(key)!;
      winner.count += 1;
      winner.value += (Number(project.tamogatas) || 0);
    });

    const allWinners = Array.from(winnersMap.values());

    return {
      byAmount: [...allWinners]
        .sort((a, b) => b.value - a.value)
        .slice(0, 50),
      byCount: [...allWinners]
        .sort((a, b) => b.count - a.count)
        .slice(0, 50)
    };
  }, [filteredProjects]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const nyertesCount = (aggregatedData.dontesSzerint['Nyertes'] || 0) + (aggregatedData.dontesSzerint['nyertes'] || 0);
  const successRate = projects.length > 0
    ? (nyertesCount / projects.length) * 100
    : 0;

  const varosChartData = Object.entries(aggregatedData.varosokSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const besorolasChartData = Object.entries(aggregatedData.besorolasSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const dontesChartData = Object.entries(aggregatedData.dontesSzerint)
    .map(([name, value]) => ({ name, value }));

  const szervezetTipusChartData = Object.entries(aggregatedData.szervezetTipusSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const varosCountChartData = Object.entries(aggregatedData.varosokSzerint)
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Összes támogatás"
            value={formatCurrency(aggregatedData.osszesTamogatas)}
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Pályázatok száma"
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

        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          showGrouping={false}
        />

        {/* Top 50 Winners Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={topWinners.byAmount}
            title="Top 50 nyertes támogatás összege szerint"
            height={2000}
            yAxisWidth={350}
          />
          <BarChartComponent
            data={topWinners.byCount}
            title="Top 50 nyertes elnyert projektek száma szerint"
            height={2000}
            yAxisWidth={350}
            dataKey="count"
            formatValue={(v) => `${v} db`}
            tooltipLabel="Projektek száma"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PieChartComponent
            data={dontesChartData}
            title="Pályázatok döntés szerint"
          />
          <BarChartComponent
            data={szervezetTipusChartData}
            title="Szervezet típusok szerinti támogatás"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={varosChartData}
            title="Top 10 város támogatás szerint"
          />
          <BarChartComponent
            data={varosCountChartData}
            title="Top 10 város pályázatok száma szerint"
            formatValue={(v) => `${v} db`}
            tooltipLabel="Projektek száma"
          />
        </div>

        <div className="grid gap-6">
          <BarChartComponent
            data={besorolasChartData}
            title="Besorolás szerinti támogatás"
          />
        </div>
      </div>
    </Layout>
  );
}
