import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  QrCode, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Plus 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function SharingModal({
  lang,
  onClose,
  vehicles,
  selectedVehicleId
}) {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || vehicles[0]?.id || "vh-01");
  const [durationHours, setDurationHours] = useState(24);
  const [copiedId, setCopiedId] = useState(null);

  const [activeShares, setActiveShares] = useState([
    {
      id: "share-01",
      vehicleId: "vh-01",
      vehicleName: "Demo 24",
      token: "trk-9941a87b",
      url: `${window.location.origin}/track/share-demo-24-x9941`,
      expiresAt: "2026-09-26 14:00",
      createdAt: "2026-09-25 14:00",
      viewsCount: 6
    },
    {
      id: "share-02",
      vehicleId: "vh-02",
      vehicleName: "Demo 23",
      token: "trk-5520e11c",
      url: `${window.location.origin}/track/share-demo-23-y5520`,
      expiresAt: "2026-09-25 18:00",
      createdAt: "2026-09-25 12:00",
      viewsCount: 2
    }
  ]);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  const handleCreateShare = (e) => {
    e.preventDefault();
    soundFX.playSuccess();

    const randomHash = Math.random().toString(36).substring(2, 8);
    const newShare = {
      id: `share-${Date.now()}`,
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      token: `trk-${randomHash}`,
      url: `${window.location.origin}/track/share-${selectedVehicle.name.toLowerCase().replace(/\s+/g, '-')}-${randomHash}`,
      expiresAt: `2026-09-26 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: `2026-09-25 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      viewsCount: 0
    };

    setActiveShares(prev => [newShare, ...prev]);
  };

  const handleCopyLink = (share) => {
    soundFX.playClick();
    navigator.clipboard.writeText(share.url);
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteShare = (shareId) => {
    soundFX.playClick();
    setActiveShares(prev => prev.filter(s => s.id !== shareId));
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom sharing-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "750px", width: "95vw", height: "80vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Share2 size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "مشاركة موقع التتبع المباشر" : "Live Location Sharing Addon"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "إنشاء روابط تتبع آمنة ومؤقتة ومشاركتها مع العملاء بدون تسجيل دخول" : "Generate secure temporary tracking links without requiring login"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* Create Share Link Box */}
          <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
              {lang === "ar" ? "إنشاء رابط مشاركة جديد" : "Generate New Share Link"}
            </h3>

            <form onSubmit={handleCreateShare} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", fontWeight: "600" }}>
                  {lang === "ar" ? "المركبة المراد مشاركتها" : "Target Vehicle"}
                </label>
                <select 
                  value={vehicleId} 
                  onChange={(e) => setVehicleId(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", fontWeight: "600" }}>
                  {lang === "ar" ? "مدة الصلاحية" : "Link Validity Duration"}
                </label>
                <select 
                  value={durationHours} 
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                >
                  <option value={1}>{lang === "ar" ? "1 ساعة" : "1 Hour"}</option>
                  <option value={6}>{lang === "ar" ? "6 ساعات" : "6 Hours"}</option>
                  <option value={24}>{lang === "ar" ? "24 ساعة (يوم كامل)" : "24 Hours"}</option>
                  <option value={168}>{lang === "ar" ? "7 أيام (أسبوع)" : "7 Days"}</option>
                </select>
              </div>

              <button 
                type="submit"
                style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", height: "37px" }}
              >
                <Plus size={16} />
                <span>{lang === "ar" ? "توليد الرابط" : "Generate Link"}</span>
              </button>
            </form>
          </div>

          {/* Active Shares List */}
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
              {lang === "ar" ? `روابط المشاركة النشطة (${activeShares.length})` : `Active Shared Links (${activeShares.length})`}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeShares.map(share => (
                <div 
                  key={share.id}
                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.9rem" }}>
                        {share.vehicleName}
                      </span>
                      <span style={{ background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "600" }}>
                        {lang === "ar" ? "نشط" : "ACTIVE"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#0284c7", fontFamily: "var(--font-mono)", wordBreak: "break-all", background: "#f0f9ff", padding: "4px 8px", borderRadius: "4px", marginBottom: "6px", display: "inline-block" }}>
                      {share.url}
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "#6b7280", display: "flex", gap: "12px" }}>
                      <span><Clock size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {lang === "ar" ? "ينتهي:" : "Expires:"} {share.expiresAt}</span>
                      <span>•</span>
                      <span>{lang === "ar" ? "المشاهدات:" : "Views:"} {share.viewsCount}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button 
                      onClick={() => handleCopyLink(share)}
                      style={{ background: copiedId === share.id ? "#10b981" : "#00b4c6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", transition: "all 0.2s" }}
                    >
                      {copiedId === share.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === share.id ? (lang === "ar" ? "تم النسخ!" : "Copied!") : (lang === "ar" ? "نسخ الرابط" : "Copy Link")}</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteShare(share.id)}
                      style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "6px 8px", borderRadius: "6px", cursor: "pointer" }}
                      title="Revoke / Delete"
                    >
                      <Trash2 size={15} />
                    </button>
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
