import React, { useState } from "react";
import { 
  Navigation, 
  Radio, 
  Wrench, 
  Camera, 
  Eye, 
  Key, 
  Gauge, 
  Signal, 
  BatteryCharging, 
  Plus, 
  Menu, 
  ShieldAlert, 
  MapPin,
  Clock,
  User,
  Sliders,
  ChevronDown,
  ChevronUp,
  Droplet,
  Thermometer,
  Milestone,
  Video,
  Activity,
  Maximize2
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function OfficialBottomDock({
  lang,
  vehicle,
  onOpenMaintenance,
  onOpenSensors,
  onOpenCamera,
  onCenterMap
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!vehicle) return null;

  const isMoving = vehicle.status === "moving";
  const statusColor = isMoving ? "green" : vehicle.status === "idle" ? "yellow" : "red";
  const speedText = `${vehicle.speed} ${lang === "ar" ? "كم/س" : "km/h"}`;

  if (isMinimized) {
    return (
      <div 
        className="official-bottom-dock-minimized"
        style={{
          position: "absolute",
          bottom: "16px",
          insetInlineStart: "16px",
          background: "#ffffff",
          borderRadius: "30px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
          padding: "8px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 800,
          cursor: "pointer",
          border: "1px solid #e5e7eb"
        }}
        onClick={() => { soundFX.playClick(); setIsMinimized(false); }}
        title={lang === "ar" ? "توسيع شريط البيانات" : "Expand Telemetry Dock"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Navigation size={14} color="#00b4c6" />
          <span style={{ fontWeight: "700", fontSize: "0.82rem", color: "#1f2937" }}>
            {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}
          </span>
          <span className={`vehicle-status-dot ${statusColor}`}></span>
        </div>
        <span style={{ color: "#d1d5db" }}>|</span>
        <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#00b4c6", fontFamily: "var(--font-mono)" }}>
          {speedText}
        </span>
        <span style={{ color: "#d1d5db" }}>|</span>
        <span style={{ fontSize: "0.76rem", color: vehicle.ignition ? "#10b981" : "#6b7280", fontWeight: "600" }}>
          ACC: {vehicle.ignition ? "ON" : "OFF"}
        </span>
        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: "4px", color: "#00b4c6", fontSize: "0.72rem", fontWeight: "700" }}>
          <span>{lang === "ar" ? "عرض التفاصيل" : "Expand"}</span>
          <ChevronUp size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="official-bottom-dock">
      {/* CARD 1: VEHICLE TELEMETRY CARD */}
      <div className="dock-card">
        <div className="dock-card-header">
          <div className="dock-card-title">
            <div className="dock-header-icon-badge">
              <Navigation size={14} color="#00b4c6" />
            </div>
            <span>{lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className={`vehicle-status-dot ${statusColor} ${isMoving ? "pulsing" : ""}`}></span>
            <button 
              onClick={() => { soundFX.playClick(); setIsMinimized(true); }}
              title={lang === "ar" ? "تصغير الشريط" : "Minimize Dock"}
              className="dock-minimize-btn"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="dock-card-content">
          <div className="dock-data-row">
            <span className="dock-data-label">
              <MapPin size={12} color="#00b4c6" />
              <span>{lang === "ar" ? "الموقع:" : "Address:"}</span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="dock-data-value" style={{ fontSize: "0.68rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {lang === "ar" ? vehicle.address : (vehicle.addressEn || vehicle.address)}
              </span>
              <button 
                className="dock-micro-btn"
                onClick={() => { soundFX.playClick(); onCenterMap(); }} 
                title={lang === "ar" ? "عرض على الخريطة" : "Center on Map"}
              >
                <Eye size={12} color="#00b4c6" />
              </button>
            </div>
          </div>

          <div className="dock-data-row">
            <span className="dock-data-label">
              <Clock size={12} color="#6366f1" />
              <span>{lang === "ar" ? "آخر اتصال:" : "Time:"}</span>
            </span>
            <span className="dock-data-value" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="dock-data-row">
            <span className="dock-data-label">
              <Activity size={12} color="#f59e0b" />
              <span>{lang === "ar" ? "الحالة الحالية:" : "Status:"}</span>
            </span>
            <span className="dock-data-value" style={{ fontSize: "0.72rem", color: isMoving ? "#10b981" : vehicle.status === "idle" ? "#f59e0b" : "#ef4444" }}>
              {vehicle.status === "moving" ? (lang === "ar" ? "متحركة" : "Moving") : vehicle.status === "idle" ? (lang === "ar" ? "متوقفة بمحرك يعمل" : "Idling") : (lang === "ar" ? "متوقفة" : "Stopped")}
            </span>
          </div>

          <div className="dock-data-row">
            <span className="dock-data-label">
              <User size={12} color="#10b981" />
              <span>{lang === "ar" ? "السائق:" : "Driver:"}</span>
            </span>
            <span className="dock-data-value" style={{ fontSize: "0.72rem" }}>
              {vehicle.driver?.name || (lang === "ar" ? "سائق الأسطول" : "Fleet Driver")}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: SENSORS (أجهزة الاستشعار) */}
      <div className="dock-card">
        <div className="dock-card-header" style={{ cursor: "pointer" }} onClick={() => { soundFX.playClick(); onOpenSensors(); }}>
          <div className="dock-card-title">
            <div className="dock-header-icon-badge">
              <Radio size={14} color="#00b4c6" />
            </div>
            <span>{lang === "ar" ? "المجسات والاستشعار" : "Sensors & Telemetry"}</span>
          </div>
          <button className="dock-icon-action-btn" title="Configure Sensors">
            <Sliders size={13} color="#00b4c6" />
          </button>
        </div>

        <div className="dock-card-content" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px" }}>
          {/* Column 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div className="dock-data-row">
              <span className="dock-data-label">
                <Gauge size={12} color="#00b4c6" /> {lang === "ar" ? "السرعة" : "Speed"}
              </span>
              <span className="dock-data-value" style={{ color: "#00b4c6", fontFamily: "var(--font-mono)", fontWeight: "700" }}>
                {speedText}
              </span>
            </div>

            <div className="dock-data-row">
              <span className="dock-data-label">
                <Milestone size={12} color="#6366f1" /> {lang === "ar" ? "العداد" : "Odo"}
              </span>
              <span className="dock-data-value" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
                {Number(vehicle.odometer || 88656.18).toFixed(1)} {lang === "ar" ? "كم" : "km"}
              </span>
            </div>

            <div className="dock-data-row">
              <span className="dock-data-label">
                <Key size={12} color={vehicle.ignition ? "#10b981" : "#94a3b8"} /> {lang === "ar" ? "المحرك" : "Ignition"}
              </span>
              <span className={`dock-status-pill ${vehicle.ignition ? "on" : "off"}`}>
                {vehicle.ignition ? (lang === "ar" ? "شغال" : "ON") : (lang === "ar" ? "مطفأ" : "OFF")}
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderInlineStart: "1px solid #f3f4f6", paddingInlineStart: "8px" }}>
            <div className="dock-data-row">
              <span className="dock-data-label">
                <Signal size={12} color="#10b981" /> GSM
              </span>
              <span className="dock-data-value" style={{ color: "#10b981", fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "0.72rem" }}>
                {vehicle.gsmSignal || 100} %
              </span>
            </div>

            <div className="dock-data-row">
              <span className="dock-data-label">
                <BatteryCharging size={12} color="#f59e0b" /> {lang === "ar" ? "البطارية" : "Battery"}
              </span>
              <span className="dock-data-value" style={{ fontSize: "0.68rem", color: vehicle.batteryVoltage ? "#10b981" : "#6b7280", fontFamily: "var(--font-mono)" }}>
                {vehicle.batteryVoltage ? `${vehicle.batteryVoltage}V` : "12.6V"}
              </span>
            </div>

            {vehicle.fuelLevel !== undefined && (
              <div className="dock-data-row">
                <span className="dock-data-label">
                  <Droplet size={12} color="#00b4c6" /> {lang === "ar" ? "الوقود" : "Fuel"}
                </span>
                <span className="dock-data-value" style={{ fontSize: "0.68rem", color: vehicle.fuelLevel < 20 ? "#ef4444" : "#10b981", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                  {vehicle.fuelLevel}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 3: MAINTENANCE (الصيانة) */}
      <div className="dock-card">
        <div className="dock-card-header">
          <div className="dock-card-title">
            <div className="dock-header-icon-badge">
              <Wrench size={14} color="#00b4c6" />
            </div>
            <span>{lang === "ar" ? "إدارة الصيانة" : "Maintenance"}</span>
          </div>
          <button 
            className="dock-icon-action-btn"
            onClick={() => { soundFX.playClick(); onOpenMaintenance(); }} 
            title={lang === "ar" ? "سجل الصيانة" : "Maintenance Log"}
          >
            <Menu size={13} color="#6b7280" />
          </button>
        </div>

        <div className="dock-card-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "8px" }}>
          <button 
            className="btn-add-maintenance-modern"
            onClick={() => { soundFX.playClick(); onOpenMaintenance(); }}
          >
            <div className="maintenance-btn-icon">
              <Plus size={14} strokeWidth={2.5} />
            </div>
            <span>{lang === "ar" ? "إضافة خدمة صيانة" : "Add Service"}</span>
          </button>
          <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
            {lang === "ar" ? "تتبع غيار الزيت والفلاتر والإطارات" : "Track oil, tires & inspections"}
          </span>
        </div>
      </div>

      {/* CARD 4: CAMERAS & MEDIA (كاميرات) */}
      <div className="dock-card card-dashcam-glow" style={{ cursor: "pointer" }} onClick={() => { soundFX.playClick(); onOpenCamera(); }}>
        <div className="dock-card-header">
          <div className="dock-card-title">
            <div className="dock-header-icon-badge" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
              <Camera size={14} color="#ef4444" />
            </div>
            <span>{lang === "ar" ? "كاميرا المراقبة الحية" : "Live Dashcam"}</span>
          </div>
          <div className="dock-live-pip-badge">
            <span className="live-dot-pulsing"></span>
            <span>LIVE</span>
          </div>
        </div>

        <div className="dock-card-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div className="dashcam-dock-preview-btn">
            <Video size={22} color="#00b4c6" />
            <span className="dashcam-dock-title">
              {lang === "ar" ? "عرض البث المباشر" : "Open Video Feed"}
            </span>
            <span className="dashcam-dock-hint">
              {lang === "ar" ? "انقر للمشاهدة والتقاط الصور" : "Click to view stream & snapshots"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
