import React, { useState } from "react";
import { 
  Edit3, 
  Car, 
  Save, 
  X, 
  Check, 
  CreditCard, 
  User, 
  Phone, 
  Gauge, 
  Fuel,
  Lock,
  ShieldAlert
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function EditDeviceModal({
  lang,
  onClose,
  vehicle,
  onSaveVehicle,
  currentUser
}) {
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [formData, setFormData] = useState({
    name: vehicle?.name || "",
    plateNumber: vehicle?.plateNumber || "",
    model: vehicle?.model || "Standard Tracker",
    simNumber: vehicle?.simNumber || "",
    driverName: vehicle?.driver?.name || "سائق الأسطول",
    driverPhone: vehicle?.driver?.phone || "",
    odometer: vehicle?.odometer || 0,
    fuelCapacity: 70
  });

  // Early return AFTER hooks to avoid rules-of-hooks violation
  if (!vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      soundFX.playOverspeed();
      alert(lang === "ar" ? "تعديل معايير المركبة وجهاز التتبع متاح لمدير المنظومة (Admin) فقط" : "Editing tracker parameters is restricted to Administrator");
      return;
    }

    soundFX.playSuccess();

    const updated = {
      ...vehicle,
      name: formData.name,
      plateNumber: formData.plateNumber,
      model: formData.model,
      simNumber: formData.simNumber,
      odometer: Number(formData.odometer),
      driver: {
        ...vehicle.driver,
        name: formData.driverName,
        phone: formData.driverPhone
      }
    };

    onSaveVehicle(updated);
    onClose();
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: isSuperAdmin ? "1px solid #d1d5db" : "1px solid #e2e8f0",
    background: isSuperAdmin ? "#ffffff" : "#f8fafc",
    color: isSuperAdmin ? "#1e293b" : "#64748b",
    fontSize: "0.85rem",
    cursor: isSuperAdmin ? "text" : "not-allowed"
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom edit-device-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px", width: "90vw" }}
      >
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Edit3 size={18} color="#fff" />
            <h3 className="modal-title-text">
              {lang === "ar" ? `بيانات المركبة: ${vehicle.name}` : `Object Details: ${vehicle.name}`}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "18px" }}>
          {!isSuperAdmin && (
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.8rem",
              color: "#92400e"
            }}>
              <Lock size={16} color="#d97706" style={{ flexShrink: 0 }} />
              <span>
                {lang === "ar" 
                  ? "معلمات الجهاز والأجهزة المرتبطة مقفلة ومحددة من قِبل إدارة المنظومة (Admin) ولا يمكن تعديلها بحساب عميل."
                  : "Device specifications are read-only and locked by the SuperAdmin."}
              </span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "اسم المركبة" : "Object Name"} *</label>
              <input 
                type="text" 
                required 
                disabled={!isSuperAdmin}
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "رقم اللوحة" : "Plate Number"}</label>
              <input 
                type="text" 
                disabled={!isSuperAdmin}
                value={formData.plateNumber} 
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "موديل وطراز المركبة" : "Vehicle Model"}</label>
              <input 
                type="text" 
                disabled={!isSuperAdmin}
                value={formData.model} 
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "شريحة SIM داخل الجهاز" : "SIM Card Number"}</label>
              <input 
                type="text" 
                disabled={!isSuperAdmin}
                value={formData.simNumber} 
                onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "اسم السائق المسؤول" : "Assigned Driver"}</label>
              <input 
                type="text" 
                disabled={!isSuperAdmin}
                value={formData.driverName} 
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "هاتف السائق" : "Driver Phone"}</label>
              <input 
                type="text" 
                disabled={!isSuperAdmin}
                value={formData.driverPhone} 
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "عداد الكيلومتر (Odometer)" : "Odometer (km)"}</label>
              <input 
                type="number" 
                disabled={!isSuperAdmin}
                value={formData.odometer} 
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "سعة خزان الوقود (لتر)" : "Tank Capacity (Liters)"}</label>
              <input 
                type="number" 
                disabled={!isSuperAdmin}
                value={formData.fuelCapacity} 
                onChange={(e) => setFormData({ ...formData, fuelCapacity: e.target.value })}
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: "#f3f4f6", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}
            >
              {lang === "ar" ? "إغلاق" : "Close"}
            </button>
            {isSuperAdmin ? (
              <button 
                type="submit" 
                style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}
              >
                <Save size={15} />
                <span>{lang === "ar" ? "حفظ التعديلات" : "Save Changes"}</span>
              </button>
            ) : (
              <button 
                type="button" 
                disabled
                style={{ background: "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: "not-allowed", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", opacity: 0.7 }}
              >
                <Lock size={14} />
                <span>{lang === "ar" ? "مقفلة للمدير فقط" : "Admin Only"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
