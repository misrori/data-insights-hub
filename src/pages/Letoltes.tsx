import { Layout } from '@/components/layout/Layout';
import { useProjectData } from '@/hooks/useProjectData';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Letoltes() {
  const { projects, filteredProjects, loading, filters } = useProjectData();
  const [downloading, setDownloading] = useState<string | null>(null);

  const hasActiveFilters = 
    filters.searchQuery ||
    filters.dontes.length > 0 ||
    filters.varos.length > 0 ||
    filters.besorolas.length > 0 ||
    filters.szervezet_tipusa.length > 0;

  const downloadCSV = async (data: typeof projects, filename: string) => {
    setDownloading(filename);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const headers = [
      'Azonosító', 'Szervezet neve', 'Adószám', 'Besorolás', 'Székhely város',
      'Székhely ország', 'Szervezet típusa', 'Támogatás', 'Pályázati döntés', 'Pályázat tárgya'
    ];

    const rows = data.map(p => [
      p.azonosito,
      `"${(p.szervezet_neve || '').replace(/"/g, '""')}"`,
      p.adoszama,
      `"${(p.besorolas || '').replace(/"/g, '""')}"`,
      p.szekhely_varos,
      p.szekhely_orszag,
      `"${(p.szervezet_tipusa || '').replace(/"/g, '""')}"`,
      p.tamogatas,
      p.palyazati_dontes,
      `"${(p.palyazat_targya || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  const downloadJSON = async (data: typeof projects, filename: string) => {
    setDownloading(filename);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const downloadOptions = [
    {
      title: 'Összes adat',
      description: 'Az összes pályázat exportálása szűrés nélkül',
      count: projects.length,
      getData: () => projects,
      filename: 'nea-osszes-palyazat',
    },
    ...(hasActiveFilters ? [{
      title: 'Szűrt adatok',
      description: 'A jelenlegi szűrésnek megfelelő pályázatok',
      count: filteredProjects.length,
      getData: () => filteredProjects,
      filename: 'nea-szurt-palyazatok',
    }] : []),
    {
      title: 'Nyertes pályázatok',
      description: 'Csak a nyertes döntésű pályázatok',
      count: projects.filter(p => p.palyazati_dontes.toLowerCase() === 'nyertes').length,
      getData: () => projects.filter(p => p.palyazati_dontes.toLowerCase() === 'nyertes'),
      filename: 'nea-nyertes-palyazatok',
    },
    {
      title: 'Elutasított pályázatok',
      description: 'Elutasított és nem támogatott pályázatok',
      count: projects.filter(p => {
        const d = p.palyazati_dontes.toLowerCase();
        return d === 'elutasított' || d === 'nem támogatott';
      }).length,
      getData: () => projects.filter(p => {
        const d = p.palyazati_dontes.toLowerCase();
        return d === 'elutasított' || d === 'nem támogatott';
      }),
      filename: 'nea-elutasitott-palyazatok',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Adatok letöltése</h1>
            <p className="text-muted-foreground">
              Exportáld az adatokat CSV vagy JSON formátumban
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {downloadOptions.map((option) => (
            <div key={option.title} className="stat-card">
              <div className="mb-4">
                <h3 className="font-display text-lg font-semibold">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {option.count.toLocaleString('hu-HU')} <span className="text-sm font-normal text-muted-foreground">pályázat</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={downloading !== null}
                  onClick={() => downloadCSV(option.getData(), option.filename)}
                >
                  {downloading === option.filename ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={downloading !== null}
                  onClick={() => downloadJSON(option.getData(), option.filename)}
                >
                  {downloading === option.filename ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="mr-2 h-4 w-4" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Original Parquet Download */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Eredeti adatfájl</h3>
              <p className="text-sm text-muted-foreground">
                Az eredeti Parquet formátumú adatfájl letöltése
              </p>
            </div>
            <a 
              href="/data/data.parquet" 
              download="nea-data.parquet"
              className="inline-flex"
            >
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Parquet letöltése
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
