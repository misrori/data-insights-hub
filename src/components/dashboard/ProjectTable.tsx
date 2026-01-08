import { useState } from 'react';
import { Project } from '@/types/project';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectTableProps {
  projects: Project[];
  maxRows?: number;
}

type SortField = 'palyazat_nev' | 'szervezet_nev' | 'varos' | 'tamogatott_osszeg' | 'ev';
type SortDirection = 'asc' | 'desc';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusColors: Record<string, string> = {
  'támogatott': 'bg-primary/20 text-primary border-primary/30',
  'nyertes': 'bg-success/20 text-success border-success/30',
  'kizárt': 'bg-destructive/20 text-destructive border-destructive/30',
  'elutasított': 'bg-muted text-muted-foreground border-border',
};

export function ProjectTable({ projects, maxRows }: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>('tamogatott_osszeg');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const rowsPerPage = maxRows || 20;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'palyazat_nev':
      case 'szervezet_nev':
      case 'varos':
        comparison = a[sortField].localeCompare(b[sortField], 'hu');
        break;
      case 'tamogatott_osszeg':
      case 'ev':
        comparison = a[sortField] - b[sortField];
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedProjects = sortedProjects.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const totalPages = Math.ceil(projects.length / rowsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="scrollbar-thin max-h-[600px] overflow-auto">
          <table className="data-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('palyazat_nev')}
                >
                  <div className="flex items-center gap-1">
                    Pályázat neve
                    <SortIcon field="palyazat_nev" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('szervezet_nev')}
                >
                  <div className="flex items-center gap-1">
                    Szervezet
                    <SortIcon field="szervezet_nev" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('varos')}
                >
                  <div className="flex items-center gap-1">
                    Város
                    <SortIcon field="varos" />
                  </div>
                </th>
                <th>Megye</th>
                <th 
                  className="cursor-pointer hover:bg-muted/80 text-right"
                  onClick={() => handleSort('tamogatott_osszeg')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Támogatás
                    <SortIcon field="tamogatott_osszeg" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => handleSort('ev')}
                >
                  <div className="flex items-center gap-1">
                    Év
                    <SortIcon field="ev" />
                  </div>
                </th>
                <th>Státusz</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="group">
                  <td className="max-w-[300px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{project.palyazat_nev}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.id}</span>
                  </td>
                  <td className="max-w-[200px] truncate">{project.szervezet_nev}</td>
                  <td>{project.varos}</td>
                  <td className="text-muted-foreground">{project.megye}</td>
                  <td className="text-right font-medium tabular-nums">
                    {formatCurrency(project.tamogatott_osszeg)}
                  </td>
                  <td>{project.ev}</td>
                  <td>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[project.statusz] || statusColors.elutasított}`}>
                      {project.statusz}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, projects.length)} / {projects.length} projekt
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              Előző
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Következő
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
