import React, { useState } from "react";
import { 
  MapPin, 
  X, 
  Plus, 
  ShieldCheck, 
  Bell, 
  Sliders, 
  Check, 
  CircleDot 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

const COLOR_PRESETS = [
  { name: "Blue", hex: "#2563eb", fill: "#3b82f6" },
  { name: "Emerald", hex: "#059669", fill: "#10b981" },
  { name: "Amber", hex: "#d97706", fill: "#f59e0b" },
  { name: "Rose", hex: "#e11d48", fill: "#f43f5e" },
  { name: "Purple", hex: "#7c3aed", fill: "#8b5cf6" },
  { name: "Cyan", hex: "#0891b2", fill: "#06b6d4" }
];

export function GeofenceModal({
  lang,
  t,
  onClose,
  onSaveGeofence,
  defaultCoords,
  onStartDrawingPolygon
}) {
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [radius, setRadius] = useState(800);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [alertEnter, setAlertEnter] = useState(true);
  const [alertExit, setAlertExit] = useState(true);
  const [description, setDescription] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundFX.playAlert();
    const newZone = {
      id: `geo-${Date.now()}`,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      type: "circle",
      coords: defaultCoords || [24.7136, 46.6753],
      radius: Number(radius),
      color: selectedColor.hex,
      fillColor: selectedColor.fill,
      activeVehicles: 0,
      alertOnEnter: alertEnter,
      alertOnExit: alertExit,
      description: description.trim()
    };

    onSaveGeofence(newZone);
    onClose();
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="geofence-modal-box">
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <ShieldCheck size={20} className="geofence-title-icon" />
            <div>
              <h3>{t.geofence.create}</h3>
              <p className="modal-subtitle">{lang === "ar" ? "تحديد منطقة مراقبة أمنية وجغرافية جديدة" : "Define a new tracking perimeter"}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Polygon Drawing Trigger Banner */}
        <div style={{
          background: "rgba(0, 180, 198, 0.08)",
          border: "1px dashed #00b4c6",
          borderRadius: "8px",
          padding: "12px",
          margin: "14px 20px 0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.85rem", color: "#00b4c6" }}>
              {lang === "ar" ? "📐 رسم سياج مضلع حر على الخريطة" : "📐 Draw Custom Polygon on Map"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {lang === "ar" ? "تحديد زوايا وأضلاع غير منتظمة بالنقر المباشر وحفظها في PostgreSQL" : "Place custom vertices directly on the map"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onStartDrawingPolygon) onStartDrawingPolygon();
            }}
            style={{
              background: "#00b4c6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "7px 14px",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {lang === "ar" ? "بدء الرسم" : "Start Draw"}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="geofence-form">
          <div className="form-group">
            <label className="form-label">{lang === "ar" ? "اسم المنطقة (بالعربية)" : "Zone Name (Arabic)"} *</label>
            <input
              type="text"
              required
              placeholder={lang === "ar" ? "مثال: مستودع السلي الشمالي" : "e.g., North Al-Sulay Depot"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="gps-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{lang === "ar" ? "الاسم بالإنجليزية (اختياري)" : "English Name (Optional)"}</label>
            <input
              type="text"
              placeholder="e.g., North Warehouse Logistics"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="gps-input"
            />
          </div>

          {/* Radius Slider */}
          <div className="form-group">
            <div className="slider-label-row">
              <label className="form-label">{t.geofence.radius}:</label>
              <span className="radius-val-highlight">{radius} م</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="50"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="gps-range-slider"
            />
          </div>

          {/* Color Presets */}
          <div className="form-group">
            <label className="form-label">{lang === "ar" ? "لون المنطقة على الخريطة" : "Map Display Color"}</label>
            <div className="color-palette-row">
              {COLOR_PRESETS.map(c => (
                <button
                  type="button"
                  key={c.name}
                  className={`color-bubble-btn ${selectedColor.name === c.name ? "selected" : ""}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedColor(c);
                  }}
                >
                  {selectedColor.name === c.name && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Checkboxes */}
          <div className="form-group">
            <label className="form-label">{lang === "ar" ? "قواعد الإشعارات الفورية" : "Alert Trigger Rules"}</label>
            <div className="checkbox-cards-grid">
              <label className="checkbox-card-item">
                <input
                  type="checkbox"
                  checked={alertEnter}
                  onChange={(e) => setAlertEnter(e.target.checked)}
                />
                <Bell size={15} />
                <span>{t.geofence.alertEnter}</span>
              </label>

              <label className="checkbox-card-item">
                <input
                  type="checkbox"
                  checked={alertExit}
                  onChange={(e) => setAlertExit(e.target.checked)}
                />
                <Bell size={15} />
                <span>{t.geofence.alertExit}</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">{lang === "ar" ? "ملاحظات وتفاصيل إضافية" : "Additional Notes"}</label>
            <textarea
              rows={2}
              placeholder={lang === "ar" ? "ساعات العمل المسموح بها، أو تعليمات السائقين..." : "Operating hours, driver notes..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="gps-textarea"
            />
          </div>

          {/* Submit */}
          <div className="modal-footer-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              {t.commands.cancel}
            </button>
            <button type="submit" className="primary-action-btn">
              <Plus size={16} />
              <span>{t.geofence.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
