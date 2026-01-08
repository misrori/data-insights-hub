import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { useProjectData } from '@/hooks/useProjectData';
import { Wallet, FileText, Trophy, TrendingUp, Loader2 } from 'lucide-react';

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} Mrd Ft`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)} M Ft`;
  }
  return new Intl.NumberFormat('hu-HU').format(amount) + ' Ft';
}

export default function Index() {
  const {
    filteredProjects,
    loading,
    filters,
    updateFilter,
    resetFilters,
    aggregatedData,
    uniqueValues,
  } = useProjectData();

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Adatok betöltése...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
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
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            <span className="gold-text">NEA</span> Pályázati Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Nemzeti Együttműködési Alap pályázatainak áttekintése
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Összes támogatás"
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
            title="Nyertes projektek"
            value={aggregatedData.statuszokSzerint['nyertes']?.toLocaleString('hu-HU') || '0'}
            icon={Trophy}
            variant="success"
          />
          <StatCard
            title="Átlag támogatás"
            value={formatCurrency(aggregatedData.atlagTamogatas)}
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
        />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <LineChartComponent
            data={evChartData}
            title="Támogatás évek szerint"
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
            data={kategoriaChartData}
            title="Kategóriák szerinti eloszlás"
          />
        </div>

        {/* Projects Table */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Legutóbbi projektek</h2>
          <ProjectTable projects={filteredProjects} maxRows={10} />
        </div>
      </div>
    </Layout>
  );
}
