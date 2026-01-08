import initWasm, { readParquet } from 'parquet-wasm';
import * as arrow from 'apache-arrow';
import { Project } from '@/types/project';

let wasmInitialized = false;

async function initParquetWasm() {
  if (!wasmInitialized) {
    await initWasm();
    wasmInitialized = true;
  }
}

export async function loadParquetData(): Promise<Project[]> {
  try {
    await initParquetWasm();
    
    const response = await fetch('/data/data.parquet');
    if (!response.ok) {
      throw new Error('Failed to fetch parquet file');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const parquetBytes = new Uint8Array(arrayBuffer);
    
    const wasmTable = readParquet(parquetBytes);
    const ipcStream = wasmTable.intoIPCStream();
    const table = arrow.tableFromIPC(ipcStream);
    
    const projects: Project[] = [];
    
    for (let i = 0; i < table.numRows; i++) {
      const row: Record<string, any> = {};
      
      for (const field of table.schema.fields) {
        const column = table.getChild(field.name);
        if (column) {
          row[field.name] = column.get(i);
        }
      }
      
      projects.push({
        id: row.id?.toString() || `proj-${i}`,
        palyazat_nev: row.palyazat_nev || row.projekt_nev || row.nev || 'N/A',
        szervezet_nev: row.szervezet_nev || row.szervezet || 'N/A',
        varos: row.varos || row.telepules || 'N/A',
        megye: row.megye || 'N/A',
        regio: row.regio || 'N/A',
        kisterseg: row.kisterseg || 'N/A',
        igenyelt_osszeg: Number(row.igenyelt_osszeg) || Number(row.igenyelt) || 0,
        tamogatott_osszeg: Number(row.tamogatott_osszeg) || Number(row.tamogatott) || 0,
        onresz: Number(row.onresz) || 0,
        statusz: mapStatusz(row.statusz || row.eredmeny || row.status),
        kollaciok: row.kollaciok || row.kollacio || '',
        ev: Number(row.ev) || new Date().getFullYear(),
        datum: row.datum || '',
        kategoria: row.kategoria || 'Egyéb',
        alkategoria: row.alkategoria || '',
        leiras: row.leiras || row.description || '',
      });
    }
    
    return projects;
  } catch (error) {
    console.error('Error loading parquet data:', error);
    // Return mock data for development/demo
    return generateMockData();
  }
}

function mapStatusz(raw: string | undefined): Project['statusz'] {
  if (!raw) return 'támogatott';
  const lower = raw.toLowerCase();
  if (lower.includes('kizár') || lower.includes('elutasít')) return 'kizárt';
  if (lower.includes('nyer')) return 'nyertes';
  if (lower.includes('támogat')) return 'támogatott';
  return 'támogatott';
}

function generateMockData(): Project[] {
  const megyék = ['Budapest', 'Pest', 'Bács-Kiskun', 'Baranya', 'Békés', 'Borsod-Abaúj-Zemplén', 'Csongrád-Csanád', 'Fejér', 'Győr-Moson-Sopron', 'Hajdú-Bihar'];
  const régiók = ['Közép-Magyarország', 'Dél-Alföld', 'Észak-Alföld', 'Dél-Dunántúl', 'Nyugat-Dunántúl', 'Közép-Dunántúl', 'Észak-Magyarország'];
  const kategoriák = ['Civil szervezetek', 'Kulturális', 'Sport', 'Szociális', 'Oktatási', 'Környezetvédelmi', 'Egészségügyi'];
  const statuszok: Project['statusz'][] = ['támogatott', 'nyertes', 'kizárt'];
  const városok = ['Budapest', 'Debrecen', 'Szeged', 'Pécs', 'Győr', 'Miskolc', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely'];

  const projects: Project[] = [];
  
  for (let i = 0; i < 500; i++) {
    const igenyelt = Math.floor(Math.random() * 50000000) + 500000;
    const statusz = statuszok[Math.floor(Math.random() * statuszok.length)];
    const tamogatott = statusz === 'kizárt' ? 0 : Math.floor(igenyelt * (0.5 + Math.random() * 0.5));
    
    projects.push({
      id: `NEA-${2020 + Math.floor(i / 100)}-${String(i).padStart(5, '0')}`,
      palyazat_nev: `${kategoriák[Math.floor(Math.random() * kategoriák.length)]} pályázat ${i + 1}`,
      szervezet_nev: `Szervezet ${i + 1} Egyesület`,
      varos: városok[Math.floor(Math.random() * városok.length)],
      megye: megyék[Math.floor(Math.random() * megyék.length)],
      regio: régiók[Math.floor(Math.random() * régiók.length)],
      kisterseg: 'N/A',
      igenyelt_osszeg: igenyelt,
      tamogatott_osszeg: tamogatott,
      onresz: Math.floor(igenyelt * 0.1),
      statusz,
      kollaciok: '',
      ev: 2020 + Math.floor(i / 100),
      datum: `${2020 + Math.floor(i / 100)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      kategoria: kategoriák[Math.floor(Math.random() * kategoriák.length)],
      alkategoria: '',
      leiras: 'A projekt célja a helyi közösség támogatása és fejlesztése.',
    });
  }
  
  return projects;
}

export async function loadGeoJsonData() {
  try {
    const response = await fetch('/data/varos.geojson');
    if (!response.ok) {
      throw new Error('Failed to fetch GeoJSON');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
}
