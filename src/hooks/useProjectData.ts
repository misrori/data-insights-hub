import { useState, useEffect, useMemo } from 'react';
import { Project, FilterState, AggregatedData } from '@/types/project';
import { loadParquetData } from '@/lib/parquetLoader';

const defaultFilters: FilterState = {
  searchQuery: '',
  statusz: [],
  megye: [],
  ev: [],
  kategoria: [],
  minOsszeg: 0,
  maxOsszeg: Infinity,
};

export function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    loadParquetData()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          project.palyazat_nev,
          project.szervezet_nev,
          project.varos,
          project.megye,
          project.id,
        ].map(f => f?.toLowerCase() || '');
        
        if (!searchFields.some(f => f.includes(query))) {
          return false;
        }
      }

      // Status filter
      if (filters.statusz.length > 0 && !filters.statusz.includes(project.statusz)) {
        return false;
      }

      // County filter
      if (filters.megye.length > 0 && !filters.megye.includes(project.megye)) {
        return false;
      }

      // Year filter
      if (filters.ev.length > 0 && !filters.ev.includes(project.ev)) {
        return false;
      }

      // Category filter
      if (filters.kategoria.length > 0 && !filters.kategoria.includes(project.kategoria)) {
        return false;
      }

      // Amount range
      if (project.tamogatott_osszeg < filters.minOsszeg) {
        return false;
      }
      if (filters.maxOsszeg !== Infinity && project.tamogatott_osszeg > filters.maxOsszeg) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  const aggregatedData: AggregatedData = useMemo(() => {
    const data: AggregatedData = {
      osszesIgenyelt: 0,
      osszesTamogatott: 0,
      projektekSzama: filteredProjects.length,
      atlagTamogatas: 0,
      megyenkent: {},
      evenkent: {},
      kategoriaként: {},
      statuszokSzerint: {},
    };

    filteredProjects.forEach(project => {
      data.osszesIgenyelt += project.igenyelt_osszeg;
      data.osszesTamogatott += project.tamogatott_osszeg;

      // By county
      if (!data.megyenkent[project.megye]) {
        data.megyenkent[project.megye] = { count: 0, osszeg: 0 };
      }
      data.megyenkent[project.megye].count++;
      data.megyenkent[project.megye].osszeg += project.tamogatott_osszeg;

      // By year
      if (!data.evenkent[project.ev]) {
        data.evenkent[project.ev] = { count: 0, osszeg: 0 };
      }
      data.evenkent[project.ev].count++;
      data.evenkent[project.ev].osszeg += project.tamogatott_osszeg;

      // By category
      if (!data.kategoriaként[project.kategoria]) {
        data.kategoriaként[project.kategoria] = { count: 0, osszeg: 0 };
      }
      data.kategoriaként[project.kategoria].count++;
      data.kategoriaként[project.kategoria].osszeg += project.tamogatott_osszeg;

      // By status
      if (!data.statuszokSzerint[project.statusz]) {
        data.statuszokSzerint[project.statusz] = 0;
      }
      data.statuszokSzerint[project.statusz]++;
    });

    data.atlagTamogatas = data.projektekSzama > 0 
      ? data.osszesTamogatott / data.projektekSzama 
      : 0;

    return data;
  }, [filteredProjects]);

  const uniqueValues = useMemo(() => ({
    megyék: [...new Set(projects.map(p => p.megye))].filter(Boolean).sort(),
    évek: [...new Set(projects.map(p => p.ev))].sort((a, b) => b - a),
    kategoriák: [...new Set(projects.map(p => p.kategoria))].filter(Boolean).sort(),
    statuszok: [...new Set(projects.map(p => p.statusz))].filter(Boolean),
    városok: [...new Set(projects.map(p => p.varos))].filter(Boolean).sort(),
  }), [projects]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    projects,
    filteredProjects,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    aggregatedData,
    uniqueValues,
  };
}
