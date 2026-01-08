import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonData, Project } from '@/types/project';
import { loadGeoJsonData } from '@/lib/parquetLoader';

interface ProjectMapProps {
  projects: Project[];
  aggregatedByCity: Record<string, { count: number; osszeg: number }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getColor(count: number): string {
  if (count > 50) return '#fbbf24';
  if (count > 20) return '#f59e0b';
  if (count > 10) return '#d97706';
  if (count > 5) return '#b45309';
  if (count > 0) return '#92400e';
  return '#374151';
}

function MapController() {
  const map = useMap();

  useEffect(() => {
    // Hungary bounds
    map.fitBounds([
      [45.7, 16.1],
      [48.6, 22.9]
    ]);
  }, [map]);

  return null;
}

export function ProjectMap({ projects, aggregatedByCity }: ProjectMapProps) {
  const [geoData, setGeoData] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    loadGeoJsonData().then(data => {
      if (data && data.features) {
        // Discard unnecessary properties and only keep the polygon + city join key
        const cleanedFeatures = data.features.map((feature: any) => {
          const cityName = feature.properties?.varos;
          const cityData = aggregatedByCity[cityName];

          return {
            ...feature,
            properties: {
              varos: cityName,
              count: cityData?.count || 0,
              osszeg: cityData?.osszeg || 0,
              // Keep megye just for display if available
              megye: feature.properties?.megye || '',
            }
          };
        });
        setGeoData({ ...data, features: cleanedFeatures });
      }
    });
  }, [aggregatedByCity]);

  const getFeatureStyle = (feature: any) => {
    const count = feature.properties?.count || 0;
    const cityName = feature.properties?.varos;

    return {
      fillColor: getColor(count),
      weight: selectedCity === cityName ? 2 : 1,
      opacity: 1,
      color: selectedCity === cityName ? '#fbbf24' : '#4b5563',
      fillOpacity: count > 0 ? 0.7 : 0.1,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    const cityName = props.varos;
    const count = props.count;
    const osszeg = props.osszeg;

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#fbbf24',
          fillOpacity: 0.9,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        if (selectedCity !== cityName) {
          e.target.setStyle(getFeatureStyle(feature));
        }
      },
      click: () => {
        setSelectedCity(cityName);
      },
    });

    if (count > 0) {
      layer.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-base">${cityName}</h3>
          <p class="text-sm text-gray-400">${props.megye}</p>
          <div class="mt-2 space-y-1">
            <p class="text-sm"><span class="text-gray-400">Projektek:</span> <strong>${count.toLocaleString('hu-HU')}</strong></p>
            <p class="text-sm"><span class="text-gray-400">Támogatás:</span> <strong>${formatCurrency(osszeg)}</strong></p>
          </div>
        </div>
      `, {
        className: 'custom-popup'
      });
    }
  };

  return (
    <div className="stat-card p-0 overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold text-foreground">Projektek térképen</h3>
        <p className="text-sm text-muted-foreground">Városonkénti támogatás eloszlás</p>
      </div>
      <div className="h-[500px] relative">
        <MapContainer
          center={[47.1625, 19.5033]}
          zoom={7}
          className="h-full w-full"
          style={{ background: 'hsl(var(--card))' }}
        >
          <MapController />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />
          {geoData && (
            <GeoJSON
              data={geoData as any}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-card/95 p-3 backdrop-blur">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Projektek száma</p>
          <div className="space-y-1">
            {[
              { label: '50+', color: '#fbbf24' },
              { label: '20-50', color: '#f59e0b' },
              { label: '10-20', color: '#d97706' },
              { label: '5-10', color: '#b45309' },
              { label: '1-5', color: '#92400e' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
