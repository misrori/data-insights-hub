import { useState, useEffect, useMemo } from 'react';
import { Project, FilterState, AggregatedData } from '@/types/project';
import { loadParquetData } from '@/lib/parquetLoader';

const defaultFilters: FilterState = {
  searchQuery: '',
  dontes: [],
  varos: [],
  besorolas: [],
  szervezet_tipusa: [],
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
      // Search query - search by name, organization+tax number, city, id
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          project.palyazat_targya,
          project.szervezet_neve,
          project.adoszama,
          project.szekhely_varos,
          project.azonosito,
          project.besorolas,
        ].map(f => f?.toLowerCase() || '');
        
        if (!searchFields.some(f => f.includes(query))) {
          return false;
        }
      }

      // Decision filter
      if (filters.dontes.length > 0 && !filters.dontes.includes(project.palyazati_dontes)) {
        return false;
      }

      // City filter
      if (filters.varos.length > 0 && !filters.varos.includes(project.szekhely_varos)) {
        return false;
      }

      // Classification filter
      if (filters.besorolas.length > 0 && !filters.besorolas.includes(project.besorolas)) {
        return false;
      }

      // Organization type filter
      if (filters.szervezet_tipusa.length > 0 && !filters.szervezet_tipusa.includes(project.szervezet_tipusa)) {
        return false;
      }

      // Amount range
      if (project.tamogatas < filters.minOsszeg) {
        return false;
      }
      if (filters.maxOsszeg !== Infinity && project.tamogatas > filters.maxOsszeg) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  const aggregatedData: AggregatedData = useMemo(() => {
    const data: AggregatedData = {
      osszesTamogatas: 0,
      projektekSzama: filteredProjects.length,
      atlagTamogatas: 0,
      varosokSzerint: {},
      besorolasSzerint: {},
      dontesSzerint: {},
      szervezetTipusSzerint: {},
    };

    filteredProjects.forEach(project => {
      data.osszesTamogatas += project.tamogatas;

      // By city
      if (!data.varosokSzerint[project.szekhely_varos]) {
        data.varosokSzerint[project.szekhely_varos] = { count: 0, osszeg: 0 };
      }
      data.varosokSzerint[project.szekhely_varos].count++;
      data.varosokSzerint[project.szekhely_varos].osszeg += project.tamogatas;

      // By classification
      if (!data.besorolasSzerint[project.besorolas]) {
        data.besorolasSzerint[project.besorolas] = { count: 0, osszeg: 0 };
      }
      data.besorolasSzerint[project.besorolas].count++;
      data.besorolasSzerint[project.besorolas].osszeg += project.tamogatas;

      // By decision
      if (!data.dontesSzerint[project.palyazati_dontes]) {
        data.dontesSzerint[project.palyazati_dontes] = 0;
      }
      data.dontesSzerint[project.palyazati_dontes]++;

      // By organization type
      if (!data.szervezetTipusSzerint[project.szervezet_tipusa]) {
        data.szervezetTipusSzerint[project.szervezet_tipusa] = { count: 0, osszeg: 0 };
      }
      data.szervezetTipusSzerint[project.szervezet_tipusa].count++;
      data.szervezetTipusSzerint[project.szervezet_tipusa].osszeg += project.tamogatas;
    });

    data.atlagTamogatas = data.projektekSzama > 0 
      ? data.osszesTamogatas / data.projektekSzama 
      : 0;

    return data;
  }, [filteredProjects]);

  const uniqueValues = useMemo(() => ({
    varosok: [...new Set(projects.map(p => p.szekhely_varos))].filter(Boolean).sort(),
    besorolasok: [...new Set(projects.map(p => p.besorolas))].filter(Boolean).sort(),
    dontesek: [...new Set(projects.map(p => p.palyazati_dontes))].filter(Boolean).sort(),
    szervezetTipusok: [...new Set(projects.map(p => p.szervezet_tipusa))].filter(Boolean).sort(),
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
