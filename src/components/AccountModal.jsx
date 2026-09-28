import React, { useState } from "react";
import { 
  User, 
  Settings, 
  Lock, 
  ShieldAlert, 
  Check, 
  X, 
  Save, 
  Shield 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function AccountModal({
  lang,
  onClose,
  currentUser,
  onUpdateUser
}) {
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [profile, setProfile] = useState({
    name: currentUser?.name || "Himod Hmanni",
    email: currentUser?.email || "himodhmanni@gmail.com",
    phone: currentUser?.phone || "+218 92 123 4567",
    company: currentUser?.company || "Hmanni Fleet Management (Libya)",
    role: currentUser?.role || "client",
    plan: currentUser?.plan || "Fleet Pro",
    timezone: "Africa/Tripoli (UTC+2)",
    unitDistance: "km",
    unitSpeed: "kmh",
    unitCapacity: "liter",
    defaultMap: "streets"
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      soundFX.playOverspeed();
      alert(lang === "ar" ? "غير مصرح لك بتغيير إعدادات المنظومة لأن هذا الحساب ليس مديراً (Admin)" : "You do not have permission to change system settings");
      return;
    }

    soundFX.playSuccess();
    setSavedSuccess(true);
    if (onUpdateUser) {
      onUpdateUser({ ...currentUser, ...profile });
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: isSuperAdmin ? "1px solid #d1d5db" : "1px solid #e2e8f0",
    background: isSuperAdmin ? "#ffffff" : "#f8fafc",
    fontSize: "0.85rem",
    color: isSuperAdmin ? "#1e293b" : "#64748b",
    cursor: isSuperAdmin ? "text" : "not-allowed"
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom account-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", width: "95vw", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <User size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "إعدادات الحساب والملف الشخصي" : "Account Settings & Preferences"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "معلومات الحساب، وحدات القياس والخريطة الافتراضية" : "User credentials, units of measurement and map defaults"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Account Role Notice */}
          <div style={{
            background: isSuperAdmin ? "rgba(0, 180, 198, 0.1)" : "rgba(16, 185, 129, 0.1)",
            border: isSuperAdmin ? "1px solid rgba(0, 180, 198, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.82rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={16} color={isSuperAdmin ? "#00b4c6" : "#10b981"} />
              <span style={{ fontWeight: "700", color: "#1e293b" }}>
                {isSuperAdmin 
                  ? (lang === "ar" ? "نوع الحساب: مدير عام المنظومة (SuperAdmin) - كامل الصلاحيات" : "Account: SuperAdmin (Full System Control)") 
                  : (lang === "ar" ? `نوع الحساب: عميل أسطول (${currentUser?.name || "Client"}) - صلاحيات مقيدة` : `Account: Fleet Client (${currentUser?.name})`)}
              </span>
            </div>
            <span style={{
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: "4px",
              background: isSuperAdmin ? "#00b4c6" : "#10b981",
              color: "#fff",
              fontWeight: "700"
            }}>
              {profile.plan}
            </span>
          </div>

          {/* Locked Notice for Clients */}
          {!isSuperAdmin && (
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <ShieldAlert size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.84rem", color: "#92400e", marginBottom: "3px" }}>
                  {lang === "ar" ? "إعدادات المنظومة مقفلة (للقراءة فقط)" : "Settings Locked (Read Only)"}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#b45309", lineHeight: "1.4" }}>
                  {lang === "ar" 
                    ? "أنت مسجل بحساب عميل (Client)، ولا يمكنك تعديل معايير المنظومة أو إعدادات النظام لأن هذه الصلاحيات مخصصة لمدير المنظومة (Admin) فقط. لعرض أو تعديل الإعدادات المركزية يرجى التواصل مع إدارة المنظومة."
                    : "You are logged in as a Client. System preferences and configuration are locked and managed exclusively by the SuperAdmin."}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            {/* User Profile */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} color="#00b4c6" />
                {lang === "ar" ? "البيانات الشخصية" : "Personal Information"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "الاسم" : "Full Name"}</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    disabled={!isSuperAdmin}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    style={{ ...inputStyle, background: "#f1f5f9", cursor: "not-allowed" }} 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "رقم الجوال" : "Mobile Phone"}</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    disabled={!isSuperAdmin}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "المنطقة الزمنية" : "Timezone"}</label>
                  <select 
                    value={profile.timezone} 
                    disabled={!isSuperAdmin}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Africa/Tripoli (UTC+2)">Africa/Tripoli (UTC+2) طرابلس / ليبيا</option>
                    <option value="Asia/Riyadh (UTC+3)">Asia/Riyadh (UTC+3) الرياض / مكة</option>
                    <option value="Asia/Dubai (UTC+4)">Asia/Dubai (UTC+4) دبي</option>
                    <option value="Africa/Cairo (UTC+3)">Africa/Cairo (UTC+3) القاهرة</option>
                    <option value="UTC">UTC Universal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Units & Preferences */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Settings size={16} color="#00b4c6" />
                {lang === "ar" ? "وحدات القياس والعرض" : "Measurement Units & Defaults"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "وحدة قياس المسافة والسرعة" : "Distance & Speed"}</label>
                  <select 
                    value={profile.unitSpeed} 
                    disabled={!isSuperAdmin}
                    onChange={(e) => setProfile({ ...profile, unitSpeed: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="kmh">الكيلومتر والساعة (Km / Km/h) - متري</option>
                    <option value="mph">الأميال والساعة (Miles / Mph) - إمبراطوري</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "4px", color: "#475569", fontWeight: "600" }}>{lang === "ar" ? "وحدة قياس سعة الوقود" : "Fuel Volume"}</label>
                  <select 
                    value={profile.unitCapacity} 
                    disabled={!isSuperAdmin}
                    onChange={(e) => setProfile({ ...profile, unitCapacity: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="liter">اللتر (Liters - L)</option>
                    <option value="gallon">الجالون (Gallons - Gal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
              {savedSuccess && (
                <span style={{ color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={16} />
                  {lang === "ar" ? "تم حفظ التعديلات بنجاح!" : "Preferences saved!"}
                </span>
              )}

              {isSuperAdmin ? (
                <button 
                  type="submit" 
                  style={{ 
                    background: "#00b4c6", 
                    color: "#fff", 
                    border: "none", 
                    padding: "10px 22px", 
                    borderRadius: "8px", 
                    fontWeight: "600", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px" 
                  }}
                >
                  <Save size={16} />
                  <span>{lang === "ar" ? "حفظ الإعدادات" : "Save Changes"}</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  disabled
                  style={{
                    background: "#94a3b8",
                    color: "#ffffff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: 0.75
                  }}
                >
                  <Lock size={15} />
                  <span>{lang === "ar" ? "تعديل الإعدادات متاح للمدير العام فقط" : "Settings Locked: Admin Only"}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
