import React, { useState } from "react";
import { 
  Layers, 
  Compass, 
  MapPin, 
  Maximize2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Eye, 
  Navigation,
  Crosshair,
  Ruler,
  Check,
  Pentagon,
  Route
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function OfficialMapToolbar({
  lang,
  onFitBounds,
  onZoomIn,
  onZoomOut,
  onOpenGeofences,
  activeLayerKey,
  onChangeLayer,
  onToggleRuler,
  isRulerActive,
  onToggleDrawPolygon,
  isDrawingPolygon,
  snapToRoads = true,
  onToggleSnapToRoads
}) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const layerOptions = [
    { key: "googleRoad", label: "🗺️ خرائط جوجل (Google Roadmap)", labelEn: "Google Roadmap", badge: "Google" },
    { key: "googleHybrid", label: "🛰️ جوجل هجين (Google Hybrid)", labelEn: "Google Hybrid", badge: "Google" },
    { key: "googleSatellite", label: "🌍 جوجل قمر صناعي (Google Satellite)", labelEn: "Google Satellite", badge: "Google" },
    { key: "googleTraffic", label: "🚦 جوجل حركة المرور (Google Traffic)", labelEn: "Google Traffic", badge: "Live" },
    { key: "googleTerrain", label: "⛰️ جوجل تضاريس (Google Terrain)", labelEn: "Google Terrain", badge: "Google" },
    { key: "streets", label: "🗺️ خريطة الشوارع (OpenStreetMap)", labelEn: "OpenStreetMap", badge: "OSM" },
    { key: "satellite", label: "🛰️ صور الأقمار (Esri Satellite)", labelEn: "Esri Satellite", badge: "Esri" },
    { key: "dark", label: "🌙 الخريطة الداكنة التكتيكية (Dark)", labelEn: "Tactical Dark", badge: "Night" },
    { key: "light", label: "☀️ الخريطة الرمادية الهادئة (Light)", labelEn: "Daylight Gray", badge: "Day" }
  ];

  return (
    <div className="official-map-toolbar-right" onClick={(e) => e.stopPropagation()}>
      {/* Top Map Options (White strip) */}
      <div className="map-tools-strip-white">
        <button 
          className="white-tool-btn" 
          onClick={() => {
            soundFX.playClick();
            setShowLayerMenu(!showLayerMenu);
          }}
          title={lang === "ar" ? "طبقات الخريطة" : "Map Layers"}
        >
          <Layers size={18} color="#00b4c6" />
        </button>

        <button 
          className="white-tool-btn" 
          onClick={() => {
            soundFX.playClick();
            onFitBounds();
          }}
          title={lang === "ar" ? "ملاءمة جميع السيارات في الشاشة" : "Fit All Objects"}
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Layer Selection Dropdown Menu */}
      {showLayerMenu && (
        <div 
          className="map-layer-dropdown"
          style={{
            position: "absolute",
            top: "0px",
            left: lang === "ar" ? "46px" : "auto",
            right: lang === "ar" ? "auto" : "46px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e5e7eb",
            zIndex: 1000,
            width: "230px",
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#6b7280", padding: "6px 8px", borderBottom: "1px solid #f3f4f6" }}>
            {lang === "ar" ? "اختر نوع الخريطة" : "Select Map Layer"}
          </div>

          {layerOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => {
                soundFX.playClick();
                onChangeLayer(opt.key);
                setShowLayerMenu(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                fontSize: "0.78rem",
                border: "none",
                background: activeLayerKey === opt.key ? "#f0fdfa" : "transparent",
                color: activeLayerKey === opt.key ? "#00b4c6" : "#374151",
                cursor: "pointer",
                borderRadius: "4px",
                fontWeight: activeLayerKey === opt.key ? "700" : "500",
                textAlign: lang === "ar" ? "right" : "left"
              }}
            >
              <span>{lang === "ar" ? opt.label : opt.labelEn}</span>
              {activeLayerKey === opt.key && <Check size={14} color="#00b4c6" />}
            </button>
          ))}
        </div>
      )}

      {/* Main Teal Action Strip */}
      <div className="map-tools-strip-teal">
        <button 
          className="teal-tool-btn"
          onClick={() => {
            soundFX.playClick();
            onOpenGeofences();
          }}
          title={lang === "ar" ? "المناطق الجغرافية والسياج" : "Geofences"}
        >
          <ShieldCheck size={18} />
        </button>

        <button 
          className="teal-tool-btn"
          onClick={() => {
            soundFX.playClick();
            onFitBounds();
          }}
          title={lang === "ar" ? "توسيط وتثبيت الهدف" : "Center Target"}
        >
          <Crosshair size={18} />
        </button>

        <button 
          className={`teal-tool-btn ${isRulerActive ? "active" : ""}`}
          onClick={() => {
            soundFX.playClick();
            onToggleRuler();
          }}
          style={{ background: isRulerActive ? "#0e7490" : undefined }}
          title={lang === "ar" ? "أداة قياس المسافات على الخريطة" : "Distance Ruler Tool"}
        >
          <Ruler size={18} />
        </button>

        <button 
          className={`teal-tool-btn ${isDrawingPolygon ? "active" : ""}`}
          onClick={() => {
            soundFX.playClick();
            onToggleDrawPolygon();
          }}
          style={{ background: isDrawingPolygon ? "#0e7490" : undefined }}
          title={lang === "ar" ? "رسم منطقة جغرافية مضلعة حرة" : "Draw Custom Polygon Geofence"}
        >
          <Pentagon size={18} />
        </button>

        <button 
          className={`teal-tool-btn ${snapToRoads ? "active" : ""}`}
          onClick={() => {
            soundFX.playClick();
            if (onToggleSnapToRoads) onToggleSnapToRoads();
          }}
          style={{ background: snapToRoads ? "#0e7490" : undefined }}
          title={lang === "ar" ? (snapToRoads ? "مطابقة الشوارع وتنعيم المسارات: مفعّلة" : "تفعيل مطابقة الشوارع وتنعيم المسارات") : "Toggle Road Snapping & Map Matching"}
        >
          <Route size={18} />
        </button>
      </div>

      {/* Zoom Buttons (White strip) */}
      <div className="map-tools-strip-white">
        <button 
          className="white-tool-btn zoom-btn" 
          onClick={() => {
            soundFX.playClick();
            onZoomIn();
          }}
          title={lang === "ar" ? "تكبير الخريطة" : "Zoom In"}
        >
          <Plus size={16} strokeWidth={2.4} />
        </button>
        <button 
          className="white-tool-btn zoom-btn" 
          onClick={() => {
            soundFX.playClick();
            onZoomOut();
          }}
          title={lang === "ar" ? "تصغير الخريطة" : "Zoom Out"}
        >
          <Minus size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
