import { Search, X, Filter } from 'lucide-react';
import { FilterState } from '@/types/project';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterPanelProps {
  filters: FilterState;
  uniqueValues: {
    megyék: string[];
    évek: number[];
    kategoriák: string[];
    statuszok: string[];
  };
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
}

export function FilterPanel({ 
  filters, 
  uniqueValues, 
  onUpdateFilter, 
  onResetFilters 
}: FilterPanelProps) {
  const hasActiveFilters = 
    filters.searchQuery ||
    filters.statusz.length > 0 ||
    filters.megye.length > 0 ||
    filters.ev.length > 0 ||
    filters.kategoria.length > 0;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Keresés név, szervezet, város..."
          value={filters.searchQuery}
          onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
          className="search-input pl-10"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onUpdateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Szűrők:</span>
        </div>

        {/* Status Filter */}
        <Select
          value={filters.statusz[0] || 'all'}
          onValueChange={(value) => 
            onUpdateFilter('statusz', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="Státusz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden státusz</SelectItem>
            <SelectItem value="támogatott">Támogatott</SelectItem>
            <SelectItem value="nyertes">Nyertes</SelectItem>
            <SelectItem value="kizárt">Kizárt</SelectItem>
          </SelectContent>
        </Select>

        {/* County Filter */}
        <Select
          value={filters.megye[0] || 'all'}
          onValueChange={(value) => 
            onUpdateFilter('megye', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue placeholder="Megye" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden megye</SelectItem>
            {uniqueValues.megyék.map(megye => (
              <SelectItem key={megye} value={megye}>{megye}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select
          value={filters.ev[0]?.toString() || 'all'}
          onValueChange={(value) => 
            onUpdateFilter('ev', value === 'all' ? [] : [parseInt(value)])
          }
        >
          <SelectTrigger className="w-32 bg-secondary border-border">
            <SelectValue placeholder="Év" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden év</SelectItem>
            {uniqueValues.évek.map(ev => (
              <SelectItem key={ev} value={ev.toString()}>{ev}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.kategoria[0] || 'all'}
          onValueChange={(value) => 
            onUpdateFilter('kategoria', value === 'all' ? [] : [value])
          }
        >
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden kategória</SelectItem>
            {uniqueValues.kategoriák.map(kat => (
              <SelectItem key={kat} value={kat}>{kat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Szűrők törlése
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <span className="filter-chip active">
              Keresés: {filters.searchQuery}
              <button onClick={() => onUpdateFilter('searchQuery', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.statusz.map(s => (
            <span key={s} className="filter-chip active">
              {s}
              <button onClick={() => onUpdateFilter('statusz', filters.statusz.filter(x => x !== s))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.megye.map(m => (
            <span key={m} className="filter-chip active">
              {m}
              <button onClick={() => onUpdateFilter('megye', filters.megye.filter(x => x !== m))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
