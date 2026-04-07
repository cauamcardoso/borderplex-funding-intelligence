'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import jurisdictions from '@/data/jurisdictions.json';
import capabilities from '@/data/capabilities.json';
import problems from '@/data/problems.json';
import { getUrgencyColor } from '@/lib/utils';

interface BorderplexMapProps {
  onSelectJurisdiction?: (id: string | null) => void;
  selectedJurisdiction?: string | null;
  height?: string;
}

export default function BorderplexMap({ onSelectJurisdiction, selectedJurisdiction, height = '500px' }: BorderplexMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [loaded, setLoaded] = useState(false);

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-voyager': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          },
        },
        layers: [
          {
            id: 'carto-voyager-layer',
            type: 'raster',
            source: 'carto-voyager',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-106.45, 31.85],
      zoom: 8.2,
      minZoom: 6,
      maxZoom: 14,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add jurisdiction points as a GeoJSON source
      const jurisdictionFeatures = jurisdictions.map((j) => {
        const jProblems = problems.filter((p) => p.jurisdictionIds.includes(j.id));
        const hasCritical = jProblems.some((p) => p.urgency === 'Critical');
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: j.coordinates,
          },
          properties: {
            id: j.id,
            name: j.name,
            state: j.state,
            population: j.population,
            problemCount: jProblems.length,
            governanceType: j.governanceType,
            hasCritical,
            description: j.description,
            // Size based on population (log scale)
            radius: Math.max(8, Math.min(35, Math.log(j.population) * 3)),
          },
        };
      });

      map.current.addSource('jurisdictions', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: jurisdictionFeatures,
        },
      });

      // Outer glow ring
      map.current.addLayer({
        id: 'jurisdiction-glow',
        type: 'circle',
        source: 'jurisdictions',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': [
            'match', ['get', 'state'],
            'TX', '#FF8200',
            'NM', '#059669',
            'MX', '#DB2777',
            '#6B7280',
          ],
          'circle-opacity': 0.12,
          'circle-blur': 0.6,
        },
      });

      // Main circle
      map.current.addLayer({
        id: 'jurisdiction-circle',
        type: 'circle',
        source: 'jurisdictions',
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 0.6],
          'circle-color': [
            'match', ['get', 'state'],
            'TX', '#FF8200',
            'NM', '#059669',
            'MX', '#DB2777',
            '#6B7280',
          ],
          'circle-opacity': 0.3,
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'match', ['get', 'state'],
            'TX', '#FF8200',
            'NM', '#059669',
            'MX', '#DB2777',
            '#6B7280',
          ],
          'circle-stroke-opacity': 0.8,
        },
      });

      // Inner bright core
      map.current.addLayer({
        id: 'jurisdiction-core',
        type: 'circle',
        source: 'jurisdictions',
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 0.25],
          'circle-color': [
            'match', ['get', 'state'],
            'TX', '#FF8200',
            'NM', '#059669',
            'MX', '#DB2777',
            '#6B7280',
          ],
          'circle-opacity': 1,
        },
      });

      // Labels
      map.current.addLayer({
        id: 'jurisdiction-labels',
        type: 'symbol',
        source: 'jurisdictions',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate', ['linear'], ['get', 'population'],
            2000, 10,
            100000, 12,
            500000, 14,
          ],
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': '#0F172A',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2,
        },
      });

      // Population sublabels for large cities
      map.current.addLayer({
        id: 'jurisdiction-pop-labels',
        type: 'symbol',
        source: 'jurisdictions',
        filter: ['>', ['get', 'population'], 20000],
        layout: {
          'text-field': ['concat', ['to-string', ['/', ['round', ['/', ['get', 'population'], 1000]], 1]], 'K'],
          'text-size': 9,
          'text-offset': [0, 3],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#64748B',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.5,
        },
      });

      // Add partner/capability locations
      const partnerFeatures = capabilities
        .filter((c) => c.tier === 'B')
        .map((c) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: c.coordinates,
          },
          properties: {
            name: c.shortName,
            type: c.organizationType,
          },
        }));

      map.current.addSource('partners', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: partnerFeatures,
        },
      });

      map.current.addLayer({
        id: 'partner-markers',
        type: 'circle',
        source: 'partners',
        paint: {
          'circle-radius': 5,
          'circle-color': [
            'match', ['get', 'type'],
            'national_lab', '#06B6D4',
            'university', '#8B5CF6',
            'military', '#EF4444',
            'defense_contractor', '#F43F5E',
            'manufacturer', '#10B981',
            'aerospace', '#6366F1',
            'economic_dev', '#F59E0B',
            '#6B7280',
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      map.current.addLayer({
        id: 'partner-labels',
        type: 'symbol',
        source: 'partners',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 9,
          'text-offset': [0, -1.4],
          'text-anchor': 'bottom',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        },
        paint: {
          'text-color': [
            'match', ['get', 'type'],
            'national_lab', '#0E7490',
            'university', '#7C3AED',
            'military', '#DC2626',
            'defense_contractor', '#E11D48',
            'aerospace', '#4F46E5',
            '#475569',
          ],
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.5,
        },
      });

      // Click interaction for jurisdictions
      map.current.on('click', 'jurisdiction-circle', (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          if (onSelectJurisdiction) {
            onSelectJurisdiction(id === selectedJurisdiction ? null : id);
          }
        }
      });

      // Hover popup
      map.current.on('mouseenter', 'jurisdiction-circle', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          if (!props) return;

          const jProblems = problems.filter((p) => p.jurisdictionIds.includes(props.id));
          const coords = (e.features[0].geometry as any).coordinates.slice();

          const challengeList = jProblems.slice(0, 3).map((p) =>
            `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="width:6px;height:6px;border-radius:50%;background:${getUrgencyColor(p.urgency as any)};flex-shrink:0;"></span>
              <span style="font-size:10px;color:#CBD5E1;">${p.title.length > 40 ? p.title.slice(0, 38) + '...' : p.title}</span>
            </div>`
          ).join('');

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: 'custom-popup',
          })
            .setLngLat(coords)
            .setHTML(`
              <div style="min-width:220px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <strong style="color:white;font-size:13px;">${props.name}</strong>
                  <span style="font-size:10px;padding:2px 8px;border-radius:12px;background:${props.state === 'TX' ? 'rgba(255,130,0,0.15)' : props.state === 'NM' ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)'};color:${props.state === 'TX' ? '#FF8200' : props.state === 'NM' ? '#10B981' : '#EC4899'}">${props.state}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
                  <div style="background:#0A2A5C;border-radius:8px;padding:6px 8px;">
                    <div style="font-size:16px;font-weight:700;color:white;">${Number(props.population).toLocaleString()}</div>
                    <div style="font-size:9px;color:#64748B;">Population</div>
                  </div>
                  <div style="background:#0A2A5C;border-radius:8px;padding:6px 8px;">
                    <div style="font-size:16px;font-weight:700;color:#FF8200;">${jProblems.length}</div>
                    <div style="font-size:9px;color:#64748B;">Challenges</div>
                  </div>
                </div>
                ${challengeList}
              </div>
            `)
            .addTo(map.current);
        }
      });

      map.current.on('mouseleave', 'jurisdiction-circle', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });

      setLoaded(true);
    });
  }, [onSelectJurisdiction, selectedJurisdiction]);

  useEffect(() => {
    initMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/92 backdrop-blur-sm border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[10px] shadow-sm">
        <div className="font-semibold text-[#64748B] tracking-wider mb-1.5" style={{ fontSize: '8px' }}>LEGEND</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#FF8200]" /><span className="text-[#334155]">TX Jurisdiction</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /><span className="text-[#334155]">NM Jurisdiction</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#DB2777]" /><span className="text-[#334155]">MX (Binational)</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /><span className="text-[#334155]">Military/Defense</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /><span className="text-[#334155]">University Partner</span></div>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-[#E2E8F0] text-[#64748B]" style={{ fontSize: '8px' }}>Circle size = population</div>
      </div>

      {/* Coordinate overlay */}
      <div className="absolute bottom-4 right-4 text-[9px] text-[#94A3B8] font-mono bg-white/80 px-1.5 py-0.5 rounded">
        31.76N, 106.44W
      </div>

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#FF8200] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs text-[#64748B]">Loading map...</div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-popup .maplibregl-popup-content {
          background: #041E42 !important;
          border: 1px solid #1E4976 !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
          color: white !important;
        }
        .custom-popup .maplibregl-popup-tip {
          border-top-color: #041E42 !important;
          border-bottom-color: #041E42 !important;
        }
        .maplibregl-ctrl-group {
          background: white !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08) !important;
        }
        .maplibregl-ctrl-group button {
          width: 32px !important;
          height: 32px !important;
        }
        .maplibregl-ctrl-group button + button {
          border-top: 1px solid #E2E8F0 !important;
        }
      `}</style>
    </div>
  );
}
