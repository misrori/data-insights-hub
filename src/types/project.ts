export interface Project {
  id: string;
  palyazat_nev: string;
  szervezet_nev: string;
  varos: string;
  megye: string;
  regio: string;
  kisterseg: string;
  igenyelt_osszeg: number;
  tamogatott_osszeg: number;
  onresz: number;
  statusz: 'támogatott' | 'kizárt' | 'nyertes' | 'elutasított';
  kollaciok: string;
  ev: number;
  datum: string;
  kategoria: string;
  alkategoria: string;
  leiras?: string;
}

export interface FilterState {
  searchQuery: string;
  statusz: string[];
  megye: string[];
  ev: number[];
  kategoria: string[];
  minOsszeg: number;
  maxOsszeg: number;
}

export interface AggregatedData {
  osszesIgenyelt: number;
  osszesTamogatott: number;
  projektekSzama: number;
  atlagTamogatas: number;
  megyenkent: Record<string, { count: number; osszeg: number }>;
  evenkent: Record<number, { count: number; osszeg: number }>;
  kategoriaként: Record<string, { count: number; osszeg: number }>;
  statuszokSzerint: Record<string, number>;
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    regio: string;
    megye: string;
    kisterseg: string;
    varos: string;
    varos_nev_join: string;
  };
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
