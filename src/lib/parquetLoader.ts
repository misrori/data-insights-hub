import initWasm, { readParquet } from 'parquet-wasm';
import * as arrow from 'apache-arrow';
import { Project } from '@/types/project';

let wasmInitialized = false;

async function initParquetWasm() {
  if (!wasmInitialized) {
    try {
      await initWasm('/parquet_wasm_bg.wasm');
      wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize parquet-wasm:', error);
      // Fallback to default init if path fails
      await initWasm();
      wasmInitialized = true;
    }
  }
}

function parseHungarianNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Remove spaces and convert to number (Hungarian format: "2 886 200")
  const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
}

function normalizeStatus(raw: string | undefined): string {
  if (!raw) return 'Ismeretlen';
  const lower = raw.toLowerCase().trim();
  
  if (lower === 'nyertes') return 'Nyertes';
  if (lower === 'nem támogatott') return 'Nem támogatott';
  if (lower === 'elutasított') return 'Elutasított';
  if (lower === 'érvénytelen') return 'Érvénytelen';
  if (lower === 'várólistás') return 'Várólistás';
  
  // Capitalize first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
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
    
    console.log('Parquet schema fields:', table.schema.fields.map(f => f.name));
    console.log('Total rows in parquet:', table.numRows);
    
    const projects: Project[] = [];
    
    for (let i = 0; i < table.numRows; i++) {
      const row: Record<string, any> = {};
      
      for (const field of table.schema.fields) {
        const column = table.getChild(field.name);
        if (column) {
          row[field.name] = column.get(i);
        }
      }
      
      if (i < 3) {
        console.log(`Row ${i} raw data:`, row);
      }
      
      projects.push({
        azonosito: row.azonosito?.toString() || `proj-${i}`,
        szervezet_neve: row.szervezet_neve?.toString() || 'N/A',
        adoszama: row.adoszama?.toString() || 'N/A',
        besorolas: row.besorolas?.toString() || 'Egyéb',
        szekhely_varos: row.szekhely_varos?.toString() || 'N/A',
        szekhely_orszag: row.szekhely_orszag?.toString() || 'Magyarország',
        szervezet_tipusa: row.szervezet_tipusa?.toString() || 'N/A',
        tamogatas: parseHungarianNumber(row.tamogatas),
        palyazati_dontes: normalizeStatus(row.palyazati_dontes?.toString()),
        palyazat_targya: row.palyat_targya?.toString() || row.palyazat_targya?.toString() || '',
        megye: row.megye?.toString() || '',
        regio: row.regio?.toString() || '',
      });
    }
    
    console.log('Loaded projects count:', projects.length);
    return projects;
  } catch (error) {
    console.error('Error loading parquet data:', error);
    throw error;
  }
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
