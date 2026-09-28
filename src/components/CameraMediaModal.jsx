import React, { useState } from "react";
import { 
  Camera, 
  Video, 
  Download, 
  RefreshCw, 
  Play, 
  X, 
  Eye, 
  CheckCircle, 
  ShieldAlert, 
  Car, 
  Maximize2 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function CameraMediaModal({
  lang,
  onClose,
  vehicles,
  selectedVehicleId
}) {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || vehicles[0]?.id || "vh-01");
  const [activeCam, setActiveCam] = useState("front"); // 'front' | 'cabin' | 'cargo'
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fallbackVehicle = {
    id: "vh-default",
    name: lang === "ar" ? "مركبة الأسطول" : "Fleet Vehicle",
    speed: 45,
    coords: [24.7136, 46.6753],
    plateNumber: "---"
  };
  const selectedVehicle = (Array.isArray(vehicles) && vehicles.find(v => v.id === vehicleId)) || (Array.isArray(vehicles) && vehicles[0]) || fallbackVehicle;

  // Gallery of captured media snapshots
  const [snapshots, setSnapshots] = useState([
    {
      id: "snap-1",
      vehicleName: "Demo 24",
      camera: "Front Road Camera",
      cameraAr: "كاميرا الطريق الأمامية",
      time: "2026-09-25 14:12:40",
      speed: "64 km/h",
      coords: "24.7136, 46.6753",
      imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "snap-2",
      vehicleName: "Demo 23",
      camera: "Cabin Safety Cam",
      cameraAr: "كاميرا مقصورة السائق",
      time: "2026-09-25 13:45:10",
      speed: "0 km/h",
      coords: "24.7500, 46.6900",
      imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "snap-3",
      vehicleName: "Demo 25",
      camera: "Cargo Compartment",
      cameraAr: "كاميرا حيز الشحن والتبريد",
      time: "2026-09-25 11:20:05",
      speed: "78 km/h",
      coords: "24.6800, 46.7200",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  const handleCaptureSnapshot = () => {
    soundFX.playClick();
    setIsCapturing(true);

    setTimeout(() => {
      setIsCapturing(false);
      soundFX.playSuccess();

      const newSnap = {
        id: `snap-${Date.now()}`,
        vehicleName: selectedVehicle?.name || "مركبة",
        camera: activeCam === "front" ? "Front Road Camera" : activeCam === "cabin" ? "Cabin Safety Cam" : "Cargo Compartment",
        cameraAr: activeCam === "front" ? "كاميرا الطريق الأمامية" : activeCam === "cabin" ? "كاميرا مقصورة السائق" : "كاميرا حيز الشحن",
        time: `2026-09-25 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        speed: `${selectedVehicle?.speed ?? 0} km/h`,
        coords: `${(selectedVehicle?.coords?.[0] ?? 24.7136).toFixed(4)}, ${(selectedVehicle?.coords?.[1] ?? 46.6753).toFixed(4)}`,
        imageUrl: activeCam === "front" 
          ? "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80"
          : activeCam === "cabin"
          ? "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
      };

      setSnapshots(prev => [newSnap, ...prev]);
    }, 1200);
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom camera-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Camera size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "كاميرات الأسطول وبث الفيديو المباشر" : "Fleet Dashcam & Live Video Stream"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "بث مباشر لكاميرات الطريق والمقصورة مع التقاط الصور الفورية" : "Live front road, cabin safety and cargo cameras with snapshot capture"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Top Controls */}
        <div style={{ background: "#f9fafb", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
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
              {lang === "ar" ? "الكاميرا" : "Camera Channel"}
            </label>
            <div style={{ display: "flex", gap: "4px" }}>
              <button 
                onClick={() => setActiveCam("front")}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", background: activeCam === "front" ? "#00b4c6" : "#fff", color: activeCam === "front" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "أمامية (الطريق)" : "Front (Road)"}
              </button>
              <button 
                onClick={() => setActiveCam("cabin")}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", background: activeCam === "cabin" ? "#00b4c6" : "#fff", color: activeCam === "cabin" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "داخلية (المقصورة)" : "Cabin (Driver)"}
              </button>
              <button 
                onClick={() => setActiveCam("cargo")}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", background: activeCam === "cargo" ? "#00b4c6" : "#fff", color: activeCam === "cargo" ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
              >
                {lang === "ar" ? "خلفية (الشحن)" : "Cargo Bay"}
              </button>
            </div>
          </div>

          <div style={{ marginInlineStart: "auto" }}>
            <button 
              onClick={handleCaptureSnapshot}
              disabled={isCapturing}
              style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
            >
              <Camera size={16} />
              <span>{isCapturing ? (lang === "ar" ? "جاري الالتقاط..." : "Capturing...") : (lang === "ar" ? "التقاط صورة فورية" : "Take Snapshot")}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* Live Video Player Stream Box */}
          <div style={{ position: "relative", width: "100%", height: "300px", background: "#0f172a", borderRadius: "8px", overflow: "hidden", marginBottom: "20px" }}>
            <img 
              src={
                activeCam === "front" 
                  ? "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80"
                  : activeCam === "cabin"
                  ? "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1000&q=80"
                  : "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80"
              }
              alt="Live Dashcam Stream"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
            />

            {/* Live Stream Watermark HUD */}
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(0,0,0,0.65)", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", backdropFilter: "blur(4px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
                <strong>LIVE DASHCAM STREAM</strong>
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem", marginTop: "2px" }}>
                {selectedVehicle?.name || "مركبة الأسطول"} | {activeCam.toUpperCase()} CAM | 30 FPS 1080P
              </div>
            </div>

            {/* Bottom Telemetry Overlay */}
            <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(4px)" }}>
              <div>
                <span>GPS: </span>
                <span style={{ color: "#38bdf8" }}>{(selectedVehicle?.coords?.[0] ?? 24.7136).toFixed(4)}, {(selectedVehicle?.coords?.[1] ?? 46.6753).toFixed(4)}</span>
                <span style={{ margin: "0 8px", color: "#64748b" }}>|</span>
                <span>SPEED: </span>
                <span style={{ color: "#4ade80", fontWeight: "700" }}>{selectedVehicle?.speed ?? 0} km/h</span>
              </div>
              <div style={{ color: "#cbd5e1" }}>
                2026-09-25 {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Snapshots Gallery */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
              {lang === "ar" ? "معرض الصور الملتقطة المحفوظة" : "Saved Snapshots Gallery"}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {snapshots.map(snap => (
                <div key={snap.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ position: "relative", height: "130px" }}>
                    <img src={snap.imageUrl} alt={snap.camera} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", bottom: "6px", right: "6px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
                      {snap.speed}
                    </span>
                  </div>
                  <div style={{ padding: "10px" }}>
                    <div style={{ fontWeight: "600", fontSize: "0.8rem", color: "#111827" }}>
                      {snap.vehicleName} - {lang === "ar" ? snap.cameraAr : snap.camera}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                      {snap.time}
                    </div>
                    <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                      <a 
                        href={snap.imageUrl} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#00b4c6", textDecoration: "none", fontWeight: "600" }}
                      >
                        <Download size={12} />
                        {lang === "ar" ? "تحميل الصورة" : "Download"}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
