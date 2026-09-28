import React, { useState } from "react";
import { 
  History, 
  Play, 
  Calendar, 
  Download, 
  Clock, 
  Navigation, 
  Gauge, 
  Fuel, 
  MapPin, 
  X, 
  Filter, 
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function HistoryModal({
  lang,
  onClose,
  vehicles,
  selectedVehicleId,
  onStartPlayback,
  snapToRoads = true,
  onToggleSnapToRoads
}) {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || vehicles[0]?.id || "vh-01");
  const [dateFilter, setDateFilter] = useState("today"); // 'today' | 'yesterday' | 'week' | 'custom'
  const [fromDate, setFromDate] = useState("2026-09-25T00:00");
  const [toDate, setToDate] = useState("2026-09-25T23:59");
  const [stopsTolerance, setStopsTolerance] = useState(5); // minutes

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  // Route statistics
  const stats = {
    distance: selectedVehicle?.odometer ? 142.8 : 88.5,
    topSpeed: 104,
    avgSpeed: 52,
    moveDuration: "2h 45m",
    stopDuration: "42m",
    stopsCount: 4,
    fuelEstimated: "18.4 L"
  };

  const trips = [
    { id: 1, start: "08:15", end: "09:30", from: "المستودع الرئيسي (الرياض)", to: "حي العليا التجاري", distance: "45.2 كم", speed: "92 كم/س", status: "drive" },
    { id: 2, start: "09:30", end: "09:55", from: "حي العليا التجاري", to: "حي العليا التجاري", distance: "0 كم", speed: "0 كم/س", status: "stop", duration: "25 دقيقة (تفريغ حمولة)" },
    { id: 3, start: "09:55", end: "11:20", from: "حي العليا التجاري", to: "المنطقة الصناعية الثانية", distance: "62.8 كم", speed: "104 كم/س", status: "drive" },
    { id: 4, start: "11:20", end: "11:37", from: "المنطقة الصناعية الثانية", to: "المنطقة الصناعية الثانية", distance: "0 كم", speed: "0 كم/س", status: "stop", duration: "17 دقيقة" },
    { id: 5, start: "11:37", end: "12:15", from: "المنطقة الصناعية الثانية", to: "طريق الملك فهد", distance: "34.8 كم", speed: "86 كم/س", status: "drive" }
  ];

  const handleLaunchPlayback = () => {
    soundFX.playClick();
    onStartPlayback(selectedVehicle);
    onClose();
  };

  const handleExport = (format) => {
    soundFX.playClick();
    alert(lang === "ar" ? `جاري تحميل ملف مسار الرحلات بصيغة ${format}...` : `Downloading route file in ${format} format...`);
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom history-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "850px", width: "95vw", height: "82vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <History size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "سجل الرحلات وإعادة تشغيل المسار" : "Route History & Playback Controller"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "استرجاع مسارات التتبع السابقة وتحليل فترات القيادة والتوقفات" : "Retrieve historical tracking paths, driving durations & stop analysis"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ background: "#f9fafb", padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "3px" }}>
              {lang === "ar" ? "المركبة" : "Vehicle"}
            </label>
            <select 
              value={vehicleId} 
              onChange={(e) => setVehicleId(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", fontWeight: "600" }}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "3px" }}>
              {lang === "ar" ? "الفترة الزمنية" : "Time Period"}
            </label>
            <div style={{ display: "flex", gap: "4px" }}>
              <button 
                className={`filter-chip ${dateFilter === "today" ? "active" : ""}`}
                onClick={() => setDateFilter("today")}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: dateFilter === "today" ? "#00b4c6" : "#fff", color: dateFilter === "today" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "اليوم" : "Today"}
              </button>
              <button 
                className={`filter-chip ${dateFilter === "yesterday" ? "active" : ""}`}
                onClick={() => setDateFilter("yesterday")}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: dateFilter === "yesterday" ? "#00b4c6" : "#fff", color: dateFilter === "yesterday" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "الأمس" : "Yesterday"}
              </button>
              <button 
                className={`filter-chip ${dateFilter === "week" ? "active" : ""}`}
                onClick={() => setDateFilter("week")}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: dateFilter === "week" ? "#00b4c6" : "#fff", color: dateFilter === "week" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "آخر 7 أيام" : "Last 7 Days"}
              </button>
            </div>
          </div>

          <div style={{ marginInlineStart: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            {onToggleSnapToRoads && (
              <label 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  fontSize: "0.8rem", 
                  color: "#374151", 
                  cursor: "pointer", 
                  background: "#fff", 
                  padding: "6px 12px", 
                  borderRadius: "6px", 
                  border: "1px solid #d1d5db",
                  userSelect: "none"
                }}
                title={lang === "ar" ? "تفعيل خوارزمية مطابقة الإحداثيات مع شوارع الخريطة ومساراتها" : "Snap raw GPS coordinates to real road network"}
              >
                <input 
                  type="checkbox" 
                  checked={snapToRoads} 
                  onChange={onToggleSnapToRoads} 
                  style={{ accentColor: "#00b4c6", cursor: "pointer" }}
                />
                <span style={{ fontWeight: 600 }}>
                  {lang === "ar" ? "🛣️ مطابقة الشوارع (Snap)" : "🛣️ Snap to Roads"}
                </span>
              </label>
            )}
            <button 
              onClick={handleLaunchPlayback}
              style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
            >
              <Play size={16} fill="#fff" />
              <span>{lang === "ar" ? "تشغيل المسار على الخريطة" : "Play on Map"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* Summary KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "إجمالي المسافة المقطوعة" : "Total Distance"}</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#00b4c6", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {stats.distance} <span style={{ fontSize: "0.8rem" }}>{lang === "ar" ? "كم" : "km"}</span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "أعلى سرعة مسجلة" : "Top Speed"}</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#ef4444", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {stats.topSpeed} <span style={{ fontSize: "0.8rem" }}>{lang === "ar" ? "كم/س" : "km/h"}</span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "مدة القيادة الفعلية" : "Driving Duration"}</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#10b981", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {stats.moveDuration}
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "عدد التوقفات" : "Total Stops"}</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#6366f1", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {stats.stopsCount} <span style={{ fontSize: "0.8rem" }}>({stats.stopDuration})</span>
              </div>
            </div>
          </div>

          {/* Drives and Stops Log Table */}
          <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                {lang === "ar" ? "سجل الرحلات والتوقفات المفصل" : "Detailed Drives & Stops Log"}
              </h4>
              <div style={{ display: "flex", gap: "6px" }}>
                <button 
                  onClick={() => handleExport("GPX")}
                  style={{ background: "#f3f4f6", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Download size={12} /> GPX
                </button>
                <button 
                  onClick={() => handleExport("KML")}
                  style={{ background: "#f3f4f6", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Download size={12} /> KML
                </button>
                <button 
                  onClick={() => handleExport("CSV")}
                  style={{ background: "#f3f4f6", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <FileSpreadsheet size={12} /> CSV
                </button>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: lang === "ar" ? "right" : "left" }}>
              <thead style={{ background: "#f9fafb", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "الوقت" : "Time"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "الحالة" : "State"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "من - إلى" : "From - To"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "المسافة" : "Distance"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "السرعة القصوى" : "Max Speed"}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#4b5563" }}>
                      {trip.start} - {trip.end}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ 
                        background: trip.status === "drive" ? "#ecfdf5" : "#fef2f2",
                        color: trip.status === "drive" ? "#059669" : "#dc2626",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}>
                        {trip.status === "drive" ? (lang === "ar" ? "قيادة" : "Drive") : (lang === "ar" ? "توقف" : "Stop")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#111827" }}>
                      {trip.from} {trip.from !== trip.to ? `➔ ${trip.to}` : `(${trip.duration})`}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>
                      {trip.distance}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)" }}>
                      {trip.speed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
