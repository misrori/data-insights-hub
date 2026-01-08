import { Layout } from '@/components/layout/Layout';
import { ProjectMap } from '@/components/map/ProjectMap';
import { useProjectData } from '@/hooks/useProjectData';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { Loader2, Map } from 'lucide-react';
import { useMemo } from 'react';

export default function Terkep() {
  const {
    filteredProjects,
    loading,
    aggregatedData,
    filters,
    updateFilter,
    resetFilters,
    uniqueValues,
    groupedProjects,
  } = useProjectData();

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
            <Map className="h-6 w-6 text-info" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Térkép</h1>
            <p className="text-muted-foreground">
              Pályázatok földrajzi eloszlása
            </p>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          uniqueValues={uniqueValues}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          showGrouping={false}
        />

        <ProjectMap
          projects={filteredProjects}
          aggregatedByCity={aggregatedData.varosokSzerint}
        />
      </div>
    </Layout>
  );
}
