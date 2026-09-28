import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  Layers, 
  Maximize2, 
  Compass, 
  Car, 
  Truck, 
  Bus, 
  MapPin, 
  ShieldCheck
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { matchAndSnapRoute, smoothSplinePath, normalizeCoordinates } from "../utils/mapMatching";

const TILE_LAYERS = {
  googleRoad: {
    name: "Google Roadmap (خرائط جوجل)",
    url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 21,
    attribution: '&copy; Google Maps'
  },
  googleHybrid: {
    name: "Google Hybrid (قمر صناعي + شوارع)",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 21,
    attribution: '&copy; Google Maps'
  },
  googleSatellite: {
    name: "Google Satellite (قمر صناعي نقي)",
    url: "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 21,
    attribution: '&copy; Google Maps'
  },
  googleTraffic: {
    name: "Google Traffic (حركة المرور الحية)",
    url: "https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 21,
    attribution: '&copy; Google Maps'
  },
  googleTerrain: {
    name: "Google Terrain (تضاريس جوجل)",
    url: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 21,
    attribution: '&copy; Google Maps'
  },
  streets: {
    name: "OpenStreetMap (شوارع)",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    name: "Esri Satellite (أقمار صناعية)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 18,
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  dark: {
    name: "Tactical Dark (داكنة تكتيكية)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 16,
    attribution: '&copy; Esri, HERE, DeLorme, MapmyIndia'
  },
  light: {
    name: "Daylight Gray (رمادية هادئة)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 16,
    attribution: '&copy; Esri, HERE'
  }
};

export function MapView({
  lang,
  t,
  theme,
  vehicles,
  visibleVehicleIds,
  selectedVehicleId,
  onSelectVehicle,
  geofences,
  centerTarget,
  followVehicleId,
  playbackRoute,
  playbackPosition,
  mapAction,
  activeLayerKey: parentLayerKey,
  onChangeLayer,
  isRulerActive,
  snapToRoads = true,
  isDrawingPolygon,
  onSavePolygon,
  onCancelDrawingPolygon
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const geofenceLayersRef = useRef([]);
  const breadcrumbTrailsRef = useRef({});
  const playbackLayerRef = useRef(null);
  const playbackGlowLayerRef = useRef(null);
  const playbackEndpointsRef = useRef([]);
  const playbackMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const rulerLineRef = useRef(null);
  const rulerPointsRef = useRef([]);
  const drawingLayerRef = useRef(null);
  const drawingMarkersRef = useRef([]);

  const [activeLayerKey, setActiveLayerKey] = useState(parentLayerKey || (theme === "light" ? "light" : "dark"));
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showGeofences, setShowGeofences] = useState(true);

  const [drawingPoints, setDrawingPoints] = useState([]);
  const [rulerPoints, setRulerPoints] = useState([]);

  // Sync theme changes
  useEffect(() => {
    if (theme === "light" && activeLayerKey === "dark") {
      changeTileLayer("light");
    } else if (theme === "dark" && activeLayerKey === "light") {
      changeTileLayer("dark");
    }
  }, [theme]);

  // Sync parent layer key
  useEffect(() => {
    if (parentLayerKey && parentLayerKey !== activeLayerKey) {
      changeTileLayer(parentLayerKey);
    }
  }, [parentLayerKey]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Riyadh center
    const initialCenter = [24.7215, 46.6850];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Default tile layer
    const initialTile = TILE_LAYERS[activeLayerKey] || TILE_LAYERS.googleRoad || TILE_LAYERS.streets;
    const tileLayer = L.tileLayer(initialTile.url, {
      subdomains: initialTile.subdomains,
      maxZoom: initialTile.maxZoom,
      attribution: initialTile.attribution
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Add minimal attribution in corner
    L.control.attribution({ position: "bottomright" }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Change Tile Provider
  const changeTileLayer = (key) => {
    if (!mapInstanceRef.current) return;
    setActiveLayerKey(key);
    setShowLayerMenu(false);

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const nextTile = TILE_LAYERS[key] || TILE_LAYERS.googleRoad || TILE_LAYERS.streets;
    const newLayer = L.tileLayer(nextTile.url, {
      subdomains: nextTile.subdomains,
      maxZoom: nextTile.maxZoom,
      attribution: nextTile.attribution
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
    if (onChangeLayer) onChangeLayer(key);
  };



  // Interactive Distance Ruler Tool
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e) => {
      if (!isRulerActive) return;
      const { lat, lng } = e.latlng;
      rulerPointsRef.current.push([lat, lng]);

      if (rulerPointsRef.current.length === 1) {
        L.popup()
          .setLatLng([lat, lng])
          .setContent(`<div style="font-weight:700; font-size:12px; color:#00b4c6;">${lang === "ar" ? "نقطة البداية (انقر نقطة ثانية للقياس)" : "Start Point (Click next point)"}</div>`)
          .openOn(map);
      } else if (rulerPointsRef.current.length >= 2) {
        if (rulerLineRef.current) map.removeLayer(rulerLineRef.current);
        const pts = rulerPointsRef.current;
        rulerLineRef.current = L.polyline(pts, { color: '#00b4c6', weight: 4, dashArray: '6, 6' }).addTo(map);

        let totalMeters = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          totalMeters += L.latLng(pts[i]).distanceTo(L.latLng(pts[i+1]));
        }
        const distKm = (totalMeters / 1000).toFixed(2);
        L.popup()
          .setLatLng([lat, lng])
          .setContent(`<div style="font-weight:700; font-size:12px; color:#00b4c6;">${lang === "ar" ? `المسافة المقاسة: ${distKm} كم (${totalMeters.toFixed(0)} متر)` : `Measured Distance: ${distKm} km (${totalMeters.toFixed(0)} m)`}</div>`)
          .openOn(map);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isRulerActive, lang]);

  // Cleanup ruler when deactivated
  useEffect(() => {
    if (!isRulerActive && rulerLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(rulerLineRef.current);
      rulerLineRef.current = null;
      rulerPointsRef.current = [];
    }
  }, [isRulerActive]);

  // Helper to build custom animated vehicle SVG Marker
  const createVehicleIcon = (vehicle, isSelected) => {
    const isMoving = vehicle.status === "moving";
    const statusColor = 
      vehicle.status === "moving" ? "#10b981" :
      vehicle.status === "idle" ? "#f59e0b" :
      vehicle.status === "stopped" ? "#ef4444" : "#64748b";

    const pulseHtml = (isSelected || isMoving) 
      ? `<div class="marker-pulse-ring" style="border-color: ${statusColor};"></div>` 
      : "";

    const iconSvg = vehicle.type === "truck" ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18.5" r="2.5"/>
        <circle cx="7" cy="18.5" r="2.5"/>
      </svg>
    ` : vehicle.type === "bus" ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/>
        <path d="M6 18h12"/>
        <path d="M4 18v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/>
        <path d="M16 18v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/>
        <rect width="20" height="14" x="2" y="4" rx="3"/>
      </svg>
    ` : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    `;

    return L.divIcon({
      className: `gps-vehicle-marker-wrapper ${isSelected ? "marker-active" : ""}`,
      html: `
        <div class="custom-gps-marker">
          ${pulseHtml}
          <div class="marker-core-bubble" style="background: ${statusColor};">
            <div class="marker-icon-inner">
              ${iconSvg}
            </div>
            ${isMoving ? `
              <div class="marker-heading-arrow" style="transform: rotate(${vehicle.heading}deg);">
                <div class="arrow-tip" style="border-bottom-color: ${statusColor};"></div>
              </div>
            ` : ""}
          </div>
          <div class="marker-label-tag">
            <span class="marker-label-name">${vehicle.plateNumber || vehicle.name || ''}</span>
            <span class="marker-label-speed">${vehicle.speed || 0} ${lang === 'ar' ? 'كم/س' : 'km/h'}</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  };

  // Render & Update Vehicle Markers and Trails
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    vehicles.forEach(vehicle => {
      const isVisible = visibleVehicleIds.includes(vehicle.id);
      const isSelected = selectedVehicleId === vehicle.id;

      if (!isVisible) {
        if (markersRef.current[vehicle.id]) {
          map.removeLayer(markersRef.current[vehicle.id]);
          delete markersRef.current[vehicle.id];
        }
        if (breadcrumbTrailsRef.current[vehicle.id]) {
          map.removeLayer(breadcrumbTrailsRef.current[vehicle.id]);
          delete breadcrumbTrailsRef.current[vehicle.id];
        }
        return;
      }

      const icon = createVehicleIcon(vehicle, isSelected);

      if (!markersRef.current[vehicle.id]) {
        // Create new marker
        const marker = L.marker(vehicle.coords, { icon })
          .addTo(map)
          .on("click", () => {
            soundFX.playClick();
            onSelectVehicle(vehicle.id);
          });

        markersRef.current[vehicle.id] = marker;
      } else {
        // Update existing marker position & icon smoothly
        const marker = markersRef.current[vehicle.id];
        marker.setLatLng(vehicle.coords);
        marker.setIcon(icon);
      }

      // Breadcrumb recent path trail (Smooth curves when road snapping is enabled)
      if (vehicle.historyPath && vehicle.historyPath.length > 1) {
        const rawCoords = vehicle.historyPath
          .filter(p => p && ((Array.isArray(p) && p.length >= 2 && p[0] !== undefined) || (p.lat !== undefined && p.lng !== undefined)))
          .map(p => Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lng]);
        if (vehicle.coords) rawCoords.push(vehicle.coords);

        const pathCoords = snapToRoads && rawCoords.length >= 3 
          ? smoothSplinePath(rawCoords, 6, 0.45) 
          : rawCoords;

        if (!breadcrumbTrailsRef.current[vehicle.id]) {
          const polyline = L.polyline(pathCoords, {
            color: vehicle.status === "moving" ? "#10b981" : "#64748b",
            weight: 3.5,
            opacity: 0.75,
            dashArray: vehicle.status === "moving" ? null : "4, 6",
            lineCap: "round",
            lineJoin: "round"
          }).addTo(map);
          breadcrumbTrailsRef.current[vehicle.id] = polyline;
        } else {
          breadcrumbTrailsRef.current[vehicle.id].setLatLngs(pathCoords);
        }
      }
    });

    // Auto-follow active vehicle if selected
    if (followVehicleId) {
      const targetVehicle = vehicles.find(v => v.id === followVehicleId);
      if (targetVehicle) {
        map.panTo(targetVehicle.coords, { animate: true, duration: 0.8 });
      }
    }
  }, [vehicles, visibleVehicleIds, selectedVehicleId, followVehicleId]);

  // Initial Auto-fit Bounds for Fleet
  const hasInitialCenteredRef = useRef(false);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasInitialCenteredRef.current || vehicles.length === 0) return;
    const bounds = L.latLngBounds(vehicles.map(v => v.coords));
    map.fitBounds(bounds, { padding: [120, 120], maxZoom: 13 });
    hasInitialCenteredRef.current = true;
  }, [vehicles]);

  // Center Target Handler
  useEffect(() => {
    if (!centerTarget || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView(centerTarget.coords, 14, { animate: true, duration: 0.8 });
  }, [centerTarget]);

  // Render Geofences (Circle and Polygon)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous
    geofenceLayersRef.current.forEach(layer => map.removeLayer(layer));
    geofenceLayersRef.current = [];

    if (!showGeofences) return;

    geofences.forEach(zone => {
      const center = zone.coords || zone.center;
      if (zone.type === "circle" && center) {
        const circle = L.circle(center, {
          radius: zone.radius || 500,
          color: zone.color || "#00b4c6",
          fillColor: zone.fillColor || zone.color || "#00b4c6",
          fillOpacity: 0.18,
          weight: 2,
          dashArray: "6, 8"
        }).addTo(map);

        circle.bindTooltip(`
          <div class="geofence-tooltip-content">
            <strong>${lang === "ar" ? zone.name : (zone.nameEn || zone.name)}</strong>
            <div>${zone.activeVehicles || 0} ${lang === "ar" ? "مركبات نشطة بالداخل" : "vehicles inside"}</div>
          </div>
        `, { sticky: true });

        geofenceLayersRef.current.push(circle);
      } else if (zone.type === "polygon" || (zone.polygonPoints && zone.polygonPoints.length > 2)) {
        const poly = L.polygon(zone.polygonPoints, {
          color: zone.color || "#00b4c6",
          fillColor: zone.fillColor || zone.color || "#00b4c6",
          fillOpacity: 0.22,
          weight: 2,
          dashArray: "4, 6"
        }).addTo(map);

        poly.bindTooltip(`
          <div class="geofence-tooltip-content">
            <strong>${lang === "ar" ? zone.name : (zone.nameEn || zone.name)}</strong>
            <div>${lang === "ar" ? "منطقة مضلعة مخصصة" : "Custom Polygon Zone"}</div>
          </div>
        `, { sticky: true });

        geofenceLayersRef.current.push(poly);
      }
    });
  }, [geofences, showGeofences, lang]);

  // Interactive Polygon Drawing Mode Map Listener
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isDrawingPolygon) {
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current);
        drawingLayerRef.current = null;
      }
      drawingMarkersRef.current.forEach(m => map.removeLayer(m));
      drawingMarkersRef.current = [];
      setDrawingPoints([]);
      map.getContainer().style.cursor = "";
      return;
    }

    map.getContainer().style.cursor = "crosshair";

    const handleMapClick = (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      setDrawingPoints(prev => [...prev, pt]);
      soundFX.playClick();
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
      if (map.getContainer()) map.getContainer().style.cursor = "";
    };
  }, [isDrawingPolygon]);

  // Render Polygon Drawing Preview Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isDrawingPolygon) return;

    if (drawingLayerRef.current) {
      map.removeLayer(drawingLayerRef.current);
      drawingLayerRef.current = null;
    }
    drawingMarkersRef.current.forEach(m => map.removeLayer(m));
    drawingMarkersRef.current = [];

    if (drawingPoints.length === 0) return;

    // Draw vertex dots
    drawingPoints.forEach((pt, idx) => {
      const dot = L.circleMarker(pt, {
        radius: 6,
        color: "#00b4c6",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 2
      }).addTo(map);
      drawingMarkersRef.current.push(dot);
    });

    if (drawingPoints.length > 2) {
      drawingLayerRef.current = L.polygon(drawingPoints, {
        color: "#00b4c6",
        fillColor: "rgba(0, 180, 198, 0.25)",
        weight: 3,
        dashArray: "4, 6"
      }).addTo(map);
    } else if (drawingPoints.length > 1) {
      drawingLayerRef.current = L.polyline(drawingPoints, {
        color: "#00b4c6",
        weight: 3,
        dashArray: "4, 6"
      }).addTo(map);
    }
  }, [drawingPoints, isDrawingPolygon]);

  // Render Route Playback Overlay (With OSRM Road Snapping & Spline Fallback)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (playbackLayerRef.current) {
      map.removeLayer(playbackLayerRef.current);
      playbackLayerRef.current = null;
    }
    if (playbackGlowLayerRef.current) {
      map.removeLayer(playbackGlowLayerRef.current);
      playbackGlowLayerRef.current = null;
    }
    if (playbackEndpointsRef.current && playbackEndpointsRef.current.length > 0) {
      playbackEndpointsRef.current.forEach(m => map.removeLayer(m));
      playbackEndpointsRef.current = [];
    }

    if (!playbackRoute || playbackRoute.length === 0) return;

    const rawPoints = normalizeCoordinates(playbackRoute);
    if (rawPoints.length === 0) return;

    let isSubscribed = true;

    const renderSnappedRoute = async () => {
      let finalPoints = rawPoints;
      let isSnapped = false;

      if (snapToRoads) {
        try {
          const matchResult = await matchAndSnapRoute(rawPoints);
          if (isSubscribed && matchResult && matchResult.points && matchResult.points.length > 0) {
            finalPoints = matchResult.points;
            isSnapped = true;
          }
        } catch (e) {
          finalPoints = smoothSplinePath(rawPoints, 6, 0.5);
          isSnapped = true;
        }
      }

      if (!isSubscribed) return;

      // 1. Outer Soft Glow Buffer
      const glowLine = L.polyline(finalPoints, {
        color: isSnapped ? "#00b4c6" : "#60a5fa",
        weight: isSnapped ? 8 : 6,
        opacity: isSnapped ? 0.35 : 0.25,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      playbackGlowLayerRef.current = glowLine;

      // 2. Core Sharp Centerline
      const routeLine = L.polyline(finalPoints, {
        color: isSnapped ? "#0284c7" : "#3b82f6",
        weight: isSnapped ? 4.5 : 4,
        opacity: 0.95,
        dashArray: isSnapped ? null : "6, 8",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      playbackLayerRef.current = routeLine;

      map.fitBounds(routeLine.getBounds(), { padding: [70, 70] });

      // 3. Start Point Marker (Green Badge)
      const startCoord = finalPoints[0];
      const startIcon = L.divIcon({
        className: "gps-route-endpoint-marker",
        html: `
          <div style="background:#10b981; color:#fff; font-size:11px; font-weight:800; padding:4px 9px; border-radius:12px; box-shadow:0 3px 10px rgba(16,185,129,0.5); border:2px solid #fff; white-space:nowrap; display:flex; align-items:center; gap:5px; pointer-events:none;">
            <span style="font-size:12px;">🟢</span>
            <span>${lang === "ar" ? "نقطة الانطلاق" : "Start"}</span>
          </div>
        `,
        iconSize: [88, 26],
        iconAnchor: [44, 13]
      });
      const startMarker = L.marker(startCoord, { icon: startIcon }).addTo(map);

      // 4. Destination Point Marker (Red Badge)
      const endCoord = finalPoints[finalPoints.length - 1];
      const endIcon = L.divIcon({
        className: "gps-route-endpoint-marker",
        html: `
          <div style="background:#ef4444; color:#fff; font-size:11px; font-weight:800; padding:4px 9px; border-radius:12px; box-shadow:0 3px 10px rgba(239,68,68,0.5); border:2px solid #fff; white-space:nowrap; display:flex; align-items:center; gap:5px; pointer-events:none;">
            <span style="font-size:12px;">🏁</span>
            <span>${lang === "ar" ? "نقطة الوصول" : "Destination"}</span>
          </div>
        `,
        iconSize: [88, 26],
        iconAnchor: [44, 13]
      });
      const endMarker = L.marker(endCoord, { icon: endIcon }).addTo(map);

      playbackEndpointsRef.current = [startMarker, endMarker];
    };

    renderSnappedRoute();

    return () => {
      isSubscribed = false;
    };
  }, [playbackRoute, snapToRoads, lang]);

  // Update Moving Playback Vehicle Marker along route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!playbackPosition) {
      if (playbackMarkerRef.current) {
        map.removeLayer(playbackMarkerRef.current);
        playbackMarkerRef.current = null;
      }
      return;
    }

    const posCoords = Array.isArray(playbackPosition) 
      ? [playbackPosition[0], playbackPosition[1]] 
      : [playbackPosition.lat, playbackPosition.lng];

    if (posCoords[0] === undefined || posCoords[1] === undefined) return;

    if (!playbackMarkerRef.current) {
      const pIcon = L.divIcon({
        className: "gps-playback-active-marker",
        html: `
          <div class="playback-marker-beacon">
            <div class="beacon-pulse"></div>
            <div class="beacon-dot">▶</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      playbackMarkerRef.current = L.marker(posCoords, { icon: pIcon }).addTo(map);
    } else {
      playbackMarkerRef.current.setLatLng(posCoords);
    }
  }, [playbackPosition]);

  // Handle external map actions from OfficialMapToolbar (+ / - / fitAll)
  useEffect(() => {
    if (!mapAction || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mapAction.type === "zoomIn") {
      map.zoomIn();
    } else if (mapAction.type === "zoomOut") {
      map.zoomOut();
    } else if (mapAction.type === "fitAll") {
      const visibleVehicles = vehicles.filter(v => visibleVehicleIds.includes(v.id));
      if (visibleVehicles.length > 0) {
        const bounds = L.latLngBounds(visibleVehicles.map(v => v.coords));
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
      }
    }
  }, [mapAction, vehicles, visibleVehicleIds]);

  // Distance Ruler Tool Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isRulerActive) {
      if (rulerLineRef.current) {
        map.removeLayer(rulerLineRef.current);
        rulerLineRef.current = null;
      }
      if (rulerPointsRef.current) {
        rulerPointsRef.current.forEach(m => map.removeLayer(m));
        rulerPointsRef.current = [];
      }
      setRulerPoints([]);
      return;
    }

    map.getContainer().style.cursor = "crosshair";

    const handleRulerClick = (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      setRulerPoints(prev => [...prev, pt]);
      soundFX.playClick();
    };

    map.on("click", handleRulerClick);
    return () => {
      map.off("click", handleRulerClick);
      if (map.getContainer()) map.getContainer().style.cursor = "";
    };
  }, [isRulerActive]);

  // Render Ruler Line and Distance Tooltips
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isRulerActive) return;

    if (rulerLineRef.current) {
      map.removeLayer(rulerLineRef.current);
      rulerLineRef.current = null;
    }
    if (rulerPointsRef.current) {
      rulerPointsRef.current.forEach(m => map.removeLayer(m));
      rulerPointsRef.current = [];
    }

    if (rulerPoints.length === 0) return;

    let totalDist = 0;
    rulerPoints.forEach((pt, idx) => {
      if (idx > 0) {
        const prev = rulerPoints[idx - 1];
        totalDist += L.latLng(prev[0], prev[1]).distanceTo(L.latLng(pt[0], pt[1]));
      }

      const distText = totalDist >= 1000 
        ? `${(totalDist / 1000).toFixed(2)} ${lang === "ar" ? "كم" : "km"}` 
        : `${Math.round(totalDist)} ${lang === "ar" ? "م" : "m"}`;

      const dot = L.circleMarker(pt, {
        radius: 6,
        color: "#00b4c6",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 2
      }).addTo(map);

      dot.bindTooltip(idx === 0 ? (lang === "ar" ? "نقطة البداية" : "Start") : distText, {
        permanent: true,
        direction: "top"
      });

      rulerPointsRef.current.push(dot);
    });

    if (rulerPoints.length > 1) {
      rulerLineRef.current = L.polyline(rulerPoints, {
        color: "#00b4c6",
        weight: 3,
        dashArray: "6, 6"
      }).addTo(map);
    }
  }, [rulerPoints, isRulerActive, lang]);

  const totalRulerDistanceMeters = rulerPoints.reduce((acc, pt, idx) => {
    if (idx === 0) return 0;
    const prev = rulerPoints[idx - 1];
    return acc + L.latLng(prev[0], prev[1]).distanceTo(L.latLng(pt[0], pt[1]));
  }, 0);
  const totalRulerDistFormatted = totalRulerDistanceMeters >= 1000 
    ? `${(totalRulerDistanceMeters / 1000).toFixed(2)} ${lang === "ar" ? "كم" : "km"}` 
    : `${Math.round(totalRulerDistanceMeters)} ${lang === "ar" ? "متر" : "meters"}`;

  // Fit All Visible Vehicles on Map
  const handleFitAll = () => {
    soundFX.playClick();
    const map = mapInstanceRef.current;
    if (!map) return;

    const visibleVehicles = vehicles.filter(v => visibleVehicleIds.includes(v.id));
    if (visibleVehicles.length === 0) return;

    const bounds = L.latLngBounds(visibleVehicles.map(v => v.coords));
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
  };

  return (
    <div className="map-view-wrapper">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="leaflet-map-canvas" />

      {/* Floating Map Controls Bar (Top Right) */}
      <div className="map-floating-controls">
        {/* Layer Switcher */}
        <div className="layer-switcher-dropdown">
          <button 
            className="map-control-btn"
            onClick={() => {
              soundFX.playClick();
              setShowLayerMenu(!showLayerMenu);
            }}
            title={lang === "ar" ? "طبقات الخريطة" : "Map Layers"}
          >
            <Layers size={18} />
          </button>

          {showLayerMenu && (
            <div className="layers-menu-card">
              <div className="layers-menu-title">{lang === "ar" ? "اختر نمط الخريطة" : "Select Map Style"}</div>
              {Object.entries(TILE_LAYERS).map(([key, item]) => (
                <button
                  key={key}
                  className={`layer-option-btn ${activeLayerKey === key ? "active" : ""}`}
                  onClick={() => changeTileLayer(key)}
                >
                  <span className={`layer-swatch ${key}`}></span>
                  <span className="layer-name">{item.name}</span>
                </button>
              ))}

              <div className="layer-divider"></div>

              {/* Geofence toggle */}
              <button
                className={`layer-toggle-btn ${showGeofences ? "active" : ""}`}
                onClick={() => {
                  soundFX.playClick();
                  setShowGeofences(!showGeofences);
                }}
              >
                <ShieldCheck size={16} />
                <span>{lang === "ar" ? "المناطق الجغرافية" : "Show Geofences"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Fit Bounds Button */}
        <button 
          className="map-control-btn" 
          onClick={handleFitAll}
          title={lang === "ar" ? "احتواء كافة المركبات في الشاشة" : "Fit All Vehicles"}
        >
          <Maximize2 size={18} />
        </button>

        {/* Zoom In & Out */}
        <div className="zoom-btn-group">
          <button 
            className="map-control-btn zoom-btn" 
            onClick={() => {
              soundFX.playClick();
              mapInstanceRef.current?.zoomIn();
            }}
            title="Zoom In"
          >
            +
          </button>
          <button 
            className="map-control-btn zoom-btn" 
            onClick={() => {
              soundFX.playClick();
              mapInstanceRef.current?.zoomOut();
            }}
            title="Zoom Out"
          >
            −
          </button>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="map-legend-overlay">
        <div className="legend-item">
          <span className="legend-indicator green"></span>
          <span>{t.moving}</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator yellow"></span>
          <span>{t.idle}</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator red"></span>
          <span>{t.stopped}</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator gray"></span>
          <span>{t.offline}</span>
        </div>
      </div>

      {/* Interactive Polygon Geofence Drawing Banner */}
      {isDrawingPolygon && (
        <div 
          className="drawing-polygon-floating-bar" 
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1200,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "14px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            border: "1px solid rgba(0, 180, 198, 0.5)",
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ 
              background: "#00b4c6", 
              color: "#fff", 
              padding: "3px 9px", 
              borderRadius: "6px", 
              fontSize: "0.78rem", 
              fontWeight: "700" 
            }}>
              {lang === "ar" ? "وضع رسم سياج مضلع" : "Polygon Draw Mode"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
              {lang === "ar" 
                ? `النقاط: ${drawingPoints.length} (انقر على الخريطة لتحديد الزوايا)` 
                : `Points: ${drawingPoints.length} (Click map to place vertices)`}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {drawingPoints.length > 0 && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  setDrawingPoints(prev => prev.slice(0, -1));
                }}
                style={{
                  background: "#334155",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  cursor: "pointer"
                }}
              >
                {lang === "ar" ? "تراجع" : "Undo"}
              </button>
            )}

            <button
              disabled={drawingPoints.length < 3}
              onClick={() => {
                if (drawingPoints.length >= 3) {
                  soundFX.playAlert();
                  onSavePolygon(drawingPoints);
                  setDrawingPoints([]);
                }
              }}
              style={{
                background: drawingPoints.length >= 3 ? "#00b4c6" : "#475569",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: drawingPoints.length >= 3 ? "pointer" : "not-allowed"
              }}
            >
              {lang === "ar" ? "✓ حفظ السياج المضلع" : "✓ Save Polygon"}
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setDrawingPoints([]);
                onCancelDrawingPolygon();
              }}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #475569",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.78rem",
                cursor: "pointer"
              }}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Interactive Distance Ruler Banner */}
      {isRulerActive && (
        <div 
          className="ruler-floating-bar" 
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1200,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "14px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            border: "1px solid rgba(0, 180, 198, 0.5)",
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ 
              background: "#00b4c6", 
              color: "#fff", 
              padding: "3px 9px", 
              borderRadius: "6px", 
              fontSize: "0.78rem", 
              fontWeight: "700" 
            }}>
              {lang === "ar" ? "أداة قياس المسافات" : "Distance Ruler"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
              {lang === "ar" 
                ? `المسافة المقاسة: ${totalRulerDistFormatted} (${rulerPoints.length} نقاط)` 
                : `Measured: ${totalRulerDistFormatted} (${rulerPoints.length} points)`}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {rulerPoints.length > 0 && (
              <button
                onClick={() => {
                  soundFX.playClick();
                  setRulerPoints([]);
                }}
                style={{
                  background: "#334155",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                {lang === "ar" ? "مسح النقاط" : "Clear"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
