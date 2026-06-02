import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Radar, Navigation, AlertCircle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

const KENOSHA_BOUNDS = [-88.2, 42.4, -87.5, 42.7];

export default function RadarMap({ activeLocation, setActiveLocation, squallAlert }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const userMarkerRef = useRef(null);
  const [isRadarActive, setIsRadarActive] = useState(false);
  const [radarFrames, setRadarFrames] = useState([]);
  const animationTimer = useRef(null);

  const { location: userLocation, error: geoError, isLocating } = useGeolocation();

  // Auto-activate radar when squall alert triggers
  useEffect(() => {
    if (squallAlert) {
      setIsRadarActive(true);
    }
  }, [squallAlert]);

  // Generate Iowa State IEM WMS Frames for Doppler Animation
  useEffect(() => {
    // Generate 5 timestamps, each 5 minutes apart, going backwards to create a 25-minute loop
    const frames = [];
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 5) * 5);
    now.setSeconds(0);
    now.setMilliseconds(0);

    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60000);
      const timeStr = d.toISOString();
      const baseUrl = import.meta.env.VITE_RADAR_WMS_URL || 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi';
      const url = `${baseUrl}?service=WMS&version=1.1.1&request=GetMap&layers=nexrad-n0q-900913&format=image/png&transparent=true&srs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}&time=${timeStr}`;
      frames.push(url);
    }
    setRadarFrames(frames);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    if (!activeLocation) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapboxgl.accessToken) {
      console.error("VITE_MAPBOX_TOKEN is missing.");
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [activeLocation.lon, activeLocation.lat],
      zoom: 14.5,
      pitch: 0,
      bearing: 0
    });

    map.current.on('style.load', () => {
      // Terrain & Sky
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512
      });
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2.5 });

      map.current.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      if (map.current.getLayer('water')) {
        map.current.setPaintProperty('water', 'fill-color', '#0b192c');
        map.current.setPaintProperty('water', 'fill-color-transition', { duration: 1000 });
        map.current.setPaintProperty('water', 'fill-opacity-transition', { duration: 1000 });
      }
      if (map.current.getLayer('background')) {
        map.current.setPaintProperty('background', 'background-color', '#1c1c1e');
      }

      // Action 1: The WMS Bathymetry Injection
      if (!map.current.getSource('bathymetry-source')) {
        map.current.addSource('bathymetry-source', {
          type: 'raster',
          tiles: ['https://dnrmaps.wi.gov/arcgis/services/DW_Surface_Water_Viewer/MapServer/WmsServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Bathymetry&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}'],
          tileSize: 256,
          bounds: KENOSHA_BOUNDS
        });
      }

      if (!map.current.getLayer('bathymetry-layer')) {
        map.current.addLayer({
          id: 'bathymetry-layer',
          type: 'raster',
          source: 'bathymetry-source',
          paint: {
            'raster-opacity': 0.75
          }
        }, 'water'); // Add below labels if possible, or above water
      }
    });

    // Action 2: The Dynamic WBIC Lookup
    map.current.on('click', async (e) => {
      const { lat, lng } = e.lngLat;
      
      try {
        // Construct ArcGIS REST API Identify URL for the DW_Surface_Water_Viewer
        // Using identify is generally much more reliable for finding features by click than WMS GetFeatureInfo.
        const url = `https://dnrmaps.wi.gov/arcgis/rest/services/DW_Surface_Water_Viewer/MapServer/identify?geometryType=esriGeometryPoint&geometry=${lng},${lat}&sr=4326&tolerance=3&mapExtent=${lng-0.1},${lat-0.1},${lng+0.1},${lat+0.1}&imageDisplay=800,600,96&returnGeometry=false&f=json`;
        
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.results && data.results.length > 0) {
          // Find the first result that has WATERBODY_WBIC or WBIC
          const result = data.results.find(r => r.attributes && (r.attributes.WATERBODY_WBIC || r.attributes.WBIC || r.attributes.WATERBODY_NAME));
          
          if (result && result.attributes) {
            const wbic = result.attributes.WATERBODY_WBIC || result.attributes.WBIC || 'UNKNOWN';
            const name = result.attributes.WATERBODY_NAME || result.attributes.OFFICIAL_NAME || result.attributes.LAKE_NAME || `Lake ${wbic}`;
            
            if (wbic && wbic !== 'Null' && setActiveLocation) {
              // Update activeLocation state to trigger weather fetch and header update
              setActiveLocation({
                id: `wbic-${wbic}`,
                name: name,
                lat: lat,
                lon: lng,
                wbic: wbic
              });
            }
          }
        }
      } catch (err) {
        console.error("DNR WBIC Fetch Error:", err);
      }
    });

    // Custom tactical marker
    const el = document.createElement('div');
    el.className = 'w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] border-2 border-zinc-950 relative flex items-center justify-center';
    const ring = document.createElement('div');
    ring.className = 'absolute -inset-4 rounded-full border-2 border-emerald-500/50 animate-ping';
    el.appendChild(ring);

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([activeLocation.lon, activeLocation.lat])
      .addTo(map.current);
      
    return () => {
      if (animationTimer.current) clearInterval(animationTimer.current);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // FlyTo Logic
  useEffect(() => {
    if (!map.current || !activeLocation) return;
    map.current.flyTo({
      center: [activeLocation.lon, activeLocation.lat],
      zoom: 14.5,
      pitch: 0,
      essential: true
    });
    if (marker.current) {
      marker.current.setLngLat([activeLocation.lon, activeLocation.lat]);
    }
  }, [activeLocation]);

  // Doppler Animation Loop
  useEffect(() => {
    if (!map.current || radarFrames.length === 0) return;

    const setupRadar = () => {
      // 1. Pre-load all frame layers
      radarFrames.forEach((frameUrl, index) => {
        const sourceId = `rainviewer-source-${index}`;
        const layerId = `rainviewer-layer-${index}`;

        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'raster',
            tiles: [frameUrl],
            tileSize: 256,
            bounds: KENOSHA_BOUNDS,
            minzoom: 6,
            maxzoom: 13
          });
        }

        if (!map.current.getLayer(layerId)) {
          map.current.addLayer({
            id: layerId,
            type: 'raster',
            source: sourceId,
            paint: {
              'raster-opacity': 0,
              'raster-opacity-transition': { duration: 0 } // instant swap for smooth loop
            }
          });
        }
      });

      // 2. Manage Animation Loop
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
      }

      if (isRadarActive) {
        let currentFrame = 0;
        
        // Initial setup: show first frame
        radarFrames.forEach((_, i) => {
          if (map.current.getLayer(`rainviewer-layer-${i}`)) {
             map.current.setPaintProperty(`rainviewer-layer-${i}`, 'raster-opacity', i === 0 ? 0.8 : 0);
          }
        });

        // Loop through frames
        animationTimer.current = setInterval(() => {
          const nextFrame = (currentFrame + 1) % radarFrames.length;
          
          if (map.current.getLayer(`rainviewer-layer-${currentFrame}`)) {
             map.current.setPaintProperty(`rainviewer-layer-${currentFrame}`, 'raster-opacity', 0);
          }
          if (map.current.getLayer(`rainviewer-layer-${nextFrame}`)) {
             map.current.setPaintProperty(`rainviewer-layer-${nextFrame}`, 'raster-opacity', 0.8);
          }
          
          currentFrame = nextFrame;
        }, 600); // 600ms per frame to mimic standard doppler speed
      } else {
        // Hide all layers when inactive
        radarFrames.forEach((_, i) => {
          if (map.current.getLayer(`rainviewer-layer-${i}`)) {
             map.current.setPaintProperty(`rainviewer-layer-${i}`, 'raster-opacity', 0);
          }
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      setupRadar();
    } else {
      map.current.once('idle', setupRadar);
    }
  }, [radarFrames, isRadarActive]);

  // Squall Polygon Injection Logic
  useEffect(() => {
    if (!map.current) return;
    
    const drawPolygon = () => {
      if (squallAlert && squallAlert.geometry) {
        if (!map.current.getSource('squall-polygon-source')) {
          map.current.addSource('squall-polygon-source', {
            type: 'geojson',
            data: { type: 'Feature', geometry: squallAlert.geometry }
          });
        } else {
          map.current.getSource('squall-polygon-source').setData({
            type: 'Feature', geometry: squallAlert.geometry
          });
        }

        if (!map.current.getLayer('squall-polygon-fill')) {
          map.current.addLayer({
            id: 'squall-polygon-fill',
            type: 'fill',
            source: 'squall-polygon-source',
            paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.25 }
          });
        }

        if (!map.current.getLayer('squall-polygon-outline')) {
          map.current.addLayer({
            id: 'squall-polygon-outline',
            type: 'line',
            source: 'squall-polygon-source',
            paint: {
              'line-color': '#b91c1c',
              'line-width': 3,
              'line-dasharray': [2, 2]
            }
          });
        }
      } else {
        if (map.current.getLayer('squall-polygon-fill')) map.current.removeLayer('squall-polygon-fill');
        if (map.current.getLayer('squall-polygon-outline')) map.current.removeLayer('squall-polygon-outline');
      }
    };

    if (map.current.isStyleLoaded()) {
      drawPolygon();
    } else {
      map.current.once('idle', drawPolygon);
    }
  }, [squallAlert]);

  // Live Tracking Marker
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-location-dot';
      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lon, userLocation.lat])
        .addTo(map.current);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lon, userLocation.lat]);
    }
  }, [userLocation]);

  const handleLocateMe = () => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: [userLocation.lon, userLocation.lat],
        zoom: 14.5,
        essential: true
      });
    }
  };

  return (
    <div className="relative w-full h-full z-[0]">
      <div ref={mapContainer} className="w-full h-full" />
      
      {geoError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/50 text-red-200 px-3 py-1.5 rounded-sm flex items-center gap-2 text-xs font-mono shadow-lg backdrop-blur-sm">
          <AlertCircle size={14} className="text-red-400" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Locate Me Button */}
      <button
        onClick={handleLocateMe}
        disabled={!userLocation || isLocating}
        className={`fixed bottom-40 right-4 z-40 p-3 bg-zinc-900/90 backdrop-blur-md border ${
          userLocation ? 'border-sky-500/50 hover:border-sky-400 text-sky-400' : 'border-zinc-800 text-zinc-600'
        } rounded-md transition-colors duration-300 focus:outline-none flex items-center justify-center`}
        aria-label="Locate Me"
      >
        <Navigation className={isLocating ? 'animate-pulse' : ''} size={24} />
      </button>

      {/* Tactical UI Toggle */}
      <button
        onClick={() => setIsRadarActive(!isRadarActive)}
        className={`fixed bottom-24 right-4 z-40 p-3 bg-zinc-900/90 backdrop-blur-md border ${
          isRadarActive ? 'border-emerald-500' : 'border-zinc-800'
        } rounded-md transition-colors duration-300 focus:outline-none flex items-center justify-center`}
        aria-label="Toggle Radar"
      >
        <Radar className={isRadarActive ? 'text-emerald-400 animate-spin' : 'text-zinc-500'} size={24} />
      </button>
    </div>
  );
}
