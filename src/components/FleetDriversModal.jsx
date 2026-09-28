import React, { useState } from "react";
import { 
  UserCheck, 
  Users, 
  Plus, 
  Car, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Search,
  Eye,
  Key,
  Truck
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function FleetDriversModal({
  lang = "ar",
  currentUser,
  vehicles = [],
  setVehicles,
  clients = [],
  setClients,
  onClose
}) {
  const [activeTab, setActiveTab] = useState("drivers"); // 'drivers' | 'activate_driver'
  const [searchQuery, setSearchQuery] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Form State
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPassword, setDriverPassword] = useState("driver123");
  const [driverPhone, setDriverPhone] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || "");

  // Company's Drivers List
  const companyDrivers = clients.filter(c => 
    c.role === "driver" && 
    (currentUser?.role === "superadmin" || c.companyId === currentUser?.id || c.company === currentUser?.company)
  );

  const displayedDrivers = companyDrivers.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.email && d.email.toLowerCase().includes(q)) ||
      (d.phone && d.phone.includes(q))
    );
  });

  const handleActivateDriver = (e) => {
    e.preventDefault();
    soundFX.playClick();

    if (!driverName.trim() || !driverEmail.trim() || !selectedVehicleId) {
      alert(lang === "ar" ? "يرجى تعبئة كافة الحقول وتحديد المركبة المعينة للسائق" : "Please fill all fields and assign a vehicle");
      return;
    }

    const assignedVeh = vehicles.find(v => v.id === selectedVehicleId);
    const newDriverId = `drv-${Date.now().toString().slice(-6)}`;

    // 1. Create Driver User Account
    const newDriver = {
      id: newDriverId,
      companyId: currentUser?.id || "cl-futtaim",
      resellerId: currentUser?.resellerId || "usr-reseller-01",
      name: driverName.trim(),
      nameAr: driverName.trim(),
      nameEn: driverName.trim(),
      email: driverEmail.trim(),
      password: driverPassword || "driver123",
      phone: driverPhone.trim() || "+966 50 000 0000",
      company: currentUser?.company || (lang === "ar" ? "أسطول الشركة" : "Company Fleet"),
      role: "driver",
      assignedVehicleId: selectedVehicleId,
      devicesCount: 1,
      maxDevices: 1,
      plan: "Fleet Driver License",
      planAr: "رخصة سائق أسطول (مشاهدة مركبته فقط)",
      expiresAt: "2028-12-31",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      driverScore: 95,
      permissions: {
        viewObjects: true,
        editObjects: false,
        deleteObjects: false,
        sendCommands: false,
        viewHistory: true,
        accessReports: true,
        geofences: false,
        maintenance: false,
        billing: false,
        adminPanel: false,
        resellerPanel: false,
        driverManagement: false
      }
    };

    // 2. Update the vehicle's driver info in vehicles state
    if (setVehicles) {
      setVehicles(prev => prev.map(v => {
        if (v.id === selectedVehicleId) {
          return {
            ...v,
            driverId: newDriverId,
            driver: {
              name: driverName.trim(),
              nameEn: driverName.trim(),
              phone: driverPhone.trim(),
              score: 95
            }
          };
        }
        return v;
      }));
    }

    if (setClients) {
      setClients(prev => [newDriver, ...prev]);
    }

    soundFX.playSuccess();
    setSuccessNotice(
      lang === "ar"
        ? `تم تفعيل حساب السائق (${driverName}) وربطه بالمركبة (${assignedVeh ? assignedVeh.name : selectedVehicleId}) بنجاح! يمكنه تسجيل الدخول فوراً عبر: ${driverEmail}`
        : `Driver account (${driverName}) activated for vehicle (${assignedVeh ? assignedVeh.name : selectedVehicleId})! Login: ${driverEmail}`
    );

    // Reset Form
    setDriverName("");
    setDriverEmail("");
    setDriverPhone("");
    setActiveTab("drivers");
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "960px",
          width: "95vw",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(59, 130, 246, 0.25)",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <UserCheck size={24} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
                {lang === "ar" ? "إدارة وتفعيل حسابات سائقي الأسطول" : "Fleet Drivers Account Manager"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                {lang === "ar" 
                  ? "تفعيل حساب لكل سائق في أسطولك لمشاهدة مركبته المعينة له فقط بدقة وعزل كامل" 
                  : "Activate driver accounts: each driver sees ONLY their assigned vehicle"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls Strip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("drivers"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "drivers" ? "#2563eb" : "#e2e8f0",
                color: activeTab === "drivers" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Users size={16} />
              <span>{lang === "ar" ? "سائقو الأسطول الحاليون" : "Current Drivers"} ({companyDrivers.length})</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); setActiveTab("activate_driver"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "activate_driver" ? "#2563eb" : "#e2e8f0",
                color: activeTab === "activate_driver" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={16} />
              <span>{lang === "ar" ? "تفعيل حساب سائق جديد" : "+ Activate New Driver"}</span>
            </button>
          </div>

          {activeTab === "drivers" && (
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={15} style={{ position: "absolute", marginInlineStart: "10px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder={lang === "ar" ? "بحث عن سائق..." : "Search driver..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "7px 12px",
                  paddingInlineStart: "32px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.8rem",
                  width: "200px"
                }}
              />
            </div>
          )}
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            color: "#166534",
            padding: "10px 24px",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "600"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} color="#16a34a" />
              <span>{successNotice}</span>
            </div>
            <button 
              onClick={() => setSuccessNotice("")}
              style={{ background: "none", border: "none", color: "#166534", cursor: "pointer" }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {activeTab === "drivers" ? (
            /* Drivers Table View */
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", textAlign: "start" }}>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "اسم السائق" : "Driver Name"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "البريد الإلكتروني للدخول" : "Login Email"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "رقم الهاتف" : "Phone"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "المركبة المعينة له (يشاهدها فقط)" : "Assigned Vehicle (Locked)"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "تقييم القيادة" : "Driver Score"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        {lang === "ar" ? "لم تقم بتفعيل أي حساب سائق بعد. انقر على 'تفعيل حساب سائق جديد'." : "No driver accounts found."}
                      </td>
                    </tr>
                  ) : (
                    displayedDrivers.map(d => {
                      const veh = vehicles.find(v => v.id === d.assignedVehicleId);
                      return (
                        <tr key={d.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1e293b" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.8rem" }}>
                                {d.name ? d.name.charAt(0) : "D"}
                              </div>
                              <div>{d.name}</div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#475569" }} dir="ltr">{d.email}</td>
                          <td style={{ padding: "12px 16px", color: "#475569" }} dir="ltr">{d.phone || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: "#f0fdf4",
                              color: "#166534",
                              fontWeight: "700",
                              fontSize: "0.78rem",
                              border: "1px solid #bbf7d0"
                            }}>
                              <Car size={14} color="#16a34a" />
                              <span>{veh ? (lang === "ar" ? veh.name : (veh.nameEn || veh.name)) : (d.assignedVehicleId || "مركبة")}</span>
                              {veh?.plateNumber && <span style={{ opacity: 0.75 }}>({veh.plateNumber})</span>}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "#10b981" }}>
                            {d.driverScore || 95}%
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "12px",
                              background: "#ecfdf5",
                              color: "#059669",
                              fontSize: "0.75rem",
                              fontWeight: "700"
                            }}>
                              {lang === "ar" ? "مفعل (نشط)" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleActivateDriver} style={{ maxWidth: "650px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                  {lang === "ar" ? "بيانات تفعيل حساب السائق" : "Activate Driver Login Account"}
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  {lang === "ar" 
                    ? "عند تسجيل الدخول بهذا الحساب، سيرى السائق مركبته المعينة له فقط مع حظر مشاهدة أي سيارات أخرى في الشركة." 
                    : "When logging in, this driver will strictly see only the single assigned vehicle."}
                </p>
              </div>

              {/* Form Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                {/* Driver Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "اسم السائق" : "Driver Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: أحمد منصور" : "e.g. Ahmed Mansoor"}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Driver Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "البريد الإلكتروني لتسجيل الدخول" : "Driver Login Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={driverEmail}
                    onChange={(e) => setDriverEmail(e.target.value)}
                    placeholder="driver@company.com"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "كلمة المرور" : "Driver Password"} *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={driverPassword}
                    onChange={(e) => setDriverPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>
              </div>

              {/* Assigned Vehicle Selection (Crucial) */}
              <div style={{
                background: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "20px"
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "800", color: "#1e3a8a", marginBottom: "8px" }}>
                  <Truck size={20} color="#2563eb" />
                  <span>{lang === "ar" ? "المركبة المعينة للسائق (التي سيراها فقط)" : "Assign Vehicle (Driver will ONLY see this)"} *</span>
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: "1.5px solid #93c5fd",
                    fontSize: "0.92rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    background: "#ffffff"
                  }}
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {lang === "ar" ? v.name : (v.nameEn || v.name)} — {v.plateNumber || v.model || v.id}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: "0.75rem", color: "#1e40af", marginTop: "8px", lineHeight: "1.4" }}>
                  {lang === "ar" 
                    ? "✓ سيتم حصر صلاحيات هذا السائق على هذه المركبة دون سواها، مع تمكينه من تتبع رحلاتها الحية وتاريخ حركتها." 
                    : "✓ The driver account will be strictly restricted to this single vehicle."}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("drivers")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  <CheckCircle size={18} />
                  <span>{lang === "ar" ? "حفظ وتفعيل حساب السائق" : "Save & Activate Driver"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
