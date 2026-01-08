export interface Project {
  azonosito: string;
  szervezet_neve: string;
  adoszama: string;
  besorolas: string;
  szekhely_varos: string;
  szekhely_orszag: string;
  szervezet_tipusa: string;
  tamogatas: number;
  palyazati_dontes: string;
  palyazat_targya: string;
}

export interface FilterState {
  searchQuery: string;
  dontes: string[];
  varos: string[];
  besorolas: string[];
  szervezet_tipusa: string[];
  minOsszeg: number;
  maxOsszeg: number;
}

export interface AggregatedData {
  osszesTamogatas: number;
  projektekSzama: number;
  atlagTamogatas: number;
  varosokSzerint: Record<string, { count: number; osszeg: number }>;
  besorolasSzerint: Record<string, { count: number; osszeg: number }>;
  dontesSzerint: Record<string, number>;
  szervezetTipusSzerint: Record<string, { count: number; osszeg: number }>;
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
