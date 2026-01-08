import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
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
    groupedProjects,
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
  const varosChartData = Object.entries(aggregatedData.varosokSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const besorolasChartData = Object.entries(aggregatedData.besorolasSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg, count: data.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const dontesChartData = Object.entries(aggregatedData.dontesSzerint)
    .map(([name, value]) => ({ name, value }));

  const szervezetTipusChartData = Object.entries(aggregatedData.szervezetTipusSzerint)
    .map(([name, data]) => ({ name, value: data.osszeg }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const nyertesCount = aggregatedData.dontesSzerint['Nyertes'] || aggregatedData.dontesSzerint['nyertes'] || 0;

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
            title="Nyertes pályázatok"
            value={nyertesCount.toLocaleString('hu-HU')}
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
          <PieChartComponent
            data={dontesChartData}
            title="Pályázatok döntés szerint"
          />
          <BarChartComponent
            data={szervezetTipusChartData}
            title="Szervezet típusok szerinti eloszlás"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartComponent
            data={varosChartData}
            title="Top 10 város támogatás szerint"
          />
          <BarChartComponent
            data={besorolasChartData}
            title="Besorolás szerinti eloszlás"
          />
        </div>

        {/* Projects Table */}
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">Pályázatok</h2>
          <ProjectTable
            projects={filteredProjects}
            groupedProjects={groupedProjects}
            maxRows={20}
          />
        </div>
      </div>
    </Layout>
  );
}
