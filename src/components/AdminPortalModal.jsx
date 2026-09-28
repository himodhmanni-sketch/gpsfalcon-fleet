import React, { useState } from "react";
import { 
  Users, 
  Car, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  LogIn, 
  Shield, 
  Save, 
  RefreshCw, 
  Send, 
  CheckCircle,
  AlertTriangle,
  Key,
  Globe,
  Radio,
  FileText
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function AdminPortalModal({
  lang,
  onClose,
  clients,
  setClients,
  vehicles,
  onImpersonateClient,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState("clients");
  const [clientSearch, setClientSearch] = useState("");
  const [objectSearch, setObjectSearch] = useState("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    plan: "Fleet Pro",
    maxDevices: 25,
    expiresAt: "2027-12-31",
    status: "active",
    permissions: {
      viewObjects: true,
      editObjects: true,
      deleteObjects: false,
      sendCommands: true,
      viewHistory: true,
      accessReports: true,
      geofences: true,
      maintenance: true,
      billing: false
    }
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    platformName: "GPSWOX Fleet Enterprise v4.5",
    supportEmail: "himodhmanni@gmail.com",
    supportPhone: "+966 50 123 4567",
    defaultMap: "streets",
    defaultLat: 24.7136,
    defaultLng: 46.6753,
    defaultZoom: 12,
    smsGatewayUrl: "https://api.twilio.com/2010-04-01/Accounts/AC_DEMO/Messages.json",
    smsSenderId: "GPSWOX-ALERT",
    smsApiKey: "sec_live_9941a87bcf921"
  });

  const [smsTestNumber, setSmsTestNumber] = useState("+966501234567");
  const [smsStatus, setSmsStatus] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.company.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Filter central objects
  const filteredObjects = vehicles.filter(v =>
    v.name.toLowerCase().includes(objectSearch.toLowerCase()) ||
    v.imei.toLowerCase().includes(objectSearch.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(objectSearch.toLowerCase())
  );

  const handleToggleClientStatus = (clientId) => {
    soundFX.playClick();
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return { ...c, status: c.status === "active" ? "suspended" : "active" };
      }
      return c;
    }));
  };

  const handleDeleteClient = (clientId) => {
    soundFX.playClick();
    if (confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا العميل وجميع حساباته؟" : "Are you sure you want to delete this client?")) {
      setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  const handleAddClientSubmit = (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) {
      alert(lang === "ar" ? "يرجى تعبئة الاسم والبريد الإلكتروني" : "Please fill name and email");
      return;
    }

    const created = {
      ...newClient,
      id: `cl-${Date.now().toString().slice(-4)}`,
      devicesCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setClients(prev => [created, ...prev]);
    setShowAddClientModal(false);
    soundFX.playSuccess();
    alert(lang === "ar" ? "تمت إضافة العميل الجديد بنجاح!" : "New client added successfully!");
  };

  const handleSendTestSms = () => {
    soundFX.playClick();
    setSmsStatus("sending");
    setTimeout(() => {
      setSmsStatus("success");
      soundFX.playSuccess();
      setTimeout(() => setSmsStatus(null), 4000);
    }, 1200);
  };

  const handleSaveSystemSettings = (e) => {
    e.preventDefault();
    soundFX.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (currentUser && currentUser.role !== "superadmin") {
    return null;
  }

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom admin-portal-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "1050px", width: "95vw", height: "88vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "لوحة الإدارة المركزية والتحكم الشامل" : "Central Admin & Management Portal"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "إدارة العملاء، الأجهزة المركزية، إعدادات الخادم والبراندينغ" : "Manage clients, central devices, server settings & whitelabel"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === "clients" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("clients"); }}
          >
            <Users size={16} />
            <span>{lang === "ar" ? "العملاء والمستخدمين" : "Clients & Users"}</span>
            <span className="badge-count">{clients.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "objects" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("objects"); }}
          >
            <Car size={16} />
            <span>{lang === "ar" ? "جميع الأجهزة بالمنظومة" : "Central Objects"}</span>
            <span className="badge-count">{vehicles.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("settings"); }}
          >
            <Settings size={16} />
            <span>{lang === "ar" ? "إعدادات الخادم والبراندينغ" : "System & Whitelabel"}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "server" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("server"); }}
          >
            <Activity size={16} />
            <span>{lang === "ar" ? "سجلات أداء الخادم" : "Server Performance"}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="admin-tab-content" style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* TAB 1: CLIENTS & USERS */}
          {activeTab === "clients" && (
            <div className="clients-management-view">
              <div className="table-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
                <div className="search-bar-inline" style={{ display: "flex", alignItems: "center", background: "#f3f4f6", borderRadius: "8px", padding: "6px 12px", width: "320px" }}>
                  <Search size={16} color="#9ca3af" />
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث عن عميل أو شركة أو بريد..." : "Search clients, company, email..."}
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", paddingInlineStart: "8px", width: "100%", fontSize: "0.85rem" }}
                  />
                </div>

                <button 
                  className="btn-primary-teal"
                  onClick={() => { soundFX.playClick(); setShowAddClientModal(true); }}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "#00b4c6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                >
                  <Plus size={16} />
                  <span>{lang === "ar" ? "إضافة عميل جديد" : "Add New Client"}</span>
                </button>
              </div>

              {/* Clients Table */}
              <div className="table-responsive-box" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "ar" ? "right" : "left", fontSize: "0.85rem" }}>
                  <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>
                    <tr>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "العميل / الشركة" : "Client / Company"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "البريد والهاتف" : "Email & Phone"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الباقة" : "Plan"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الأجهزة" : "Devices"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "تاريخ الانتهاء" : "Expires"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th style={{ padding: "12px 14px", textAlign: "center" }}>{lang === "ar" ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => (
                      <tr key={client.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: "600", color: "#111827" }}>{client.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{client.company}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div>{client.email}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{client.phone}</div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "#ecfeff", color: "#0891b2", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                            {lang === "ar" ? (client.planAr || client.plan) : client.plan}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)" }}>
                          <strong>{client.devicesCount}</strong> / {client.maxDevices}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "0.8rem" }}>
                          {client.expiresAt}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ 
                            background: client.status === "active" ? "#ecfdf5" : "#fef2f2",
                            color: client.status === "active" ? "#059669" : "#dc2626",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: client.status === "active" ? "#10b981" : "#ef4444" }}></span>
                            {client.status === "active" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معلق" : "Suspended")}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <button 
                              title={lang === "ar" ? "تسجيل الدخول كعميل" : "Login as Client"}
                              onClick={() => { soundFX.playClick(); onImpersonateClient(client); }}
                              style={{ border: "none", background: "#f0fdf4", color: "#16a34a", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                            >
                              <LogIn size={15} />
                            </button>
                            <button 
                              title={client.status === "active" ? (lang === "ar" ? "تعليق الحساب" : "Suspend") : (lang === "ar" ? "تنشيط" : "Activate")}
                              onClick={() => handleToggleClientStatus(client.id)}
                              style={{ border: "none", background: "#f3f4f6", color: "#4b5563", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                            >
                              <RefreshCw size={15} />
                            </button>
                            <button 
                              title={lang === "ar" ? "حذف العميل" : "Delete"}
                              onClick={() => handleDeleteClient(client.id)}
                              style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CENTRAL OBJECTS */}
          {activeTab === "objects" && (
            <div className="central-objects-view">
              <div className="table-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="search-bar-inline" style={{ display: "flex", alignItems: "center", background: "#f3f4f6", borderRadius: "8px", padding: "6px 12px", width: "320px" }}>
                  <Search size={16} color="#9ca3af" />
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث بالاسم، IMEI، أو اللوحة..." : "Search by name, IMEI, plate..."}
                    value={objectSearch}
                    onChange={(e) => setObjectSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", paddingInlineStart: "8px", width: "100%", fontSize: "0.85rem" }}
                  />
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {lang === "ar" ? `إجمالي الأجهزة المربوطة: ${vehicles.length}` : `Total connected devices: ${vehicles.length}`}
                </div>
              </div>

              <div className="table-responsive-box" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: lang === "ar" ? "right" : "left", fontSize: "0.85rem" }}>
                  <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>
                    <tr>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "المركبة" : "Object"}</th>
                      <th style={{ padding: "12px 14px" }}>IMEI</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "البروتوكول والمنفذ" : "Protocol & Port"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "شريحة SIM" : "SIM Card"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "العميل التابع له" : "Assigned Client"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "السرعة" : "Speed"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredObjects.map(obj => (
                      <tr key={obj.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: "600", color: "#111827" }}>{obj.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{obj.plateNumber}</div>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: "#0891b2" }}>
                          {obj.imei}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "#f3f4f6", padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                            {obj.protocol || "GT06"} (Port {obj.protocolPort || 5023})
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                          {obj.simNumber || "+966540001122"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          Himod Hmanni (Demo Account)
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ 
                            background: obj.status === "moving" ? "#ecfdf5" : obj.status === "idle" ? "#fffbeb" : "#fef2f2",
                            color: obj.status === "moving" ? "#059669" : obj.status === "idle" ? "#d97706" : "#dc2626",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
                            {obj.status === "moving" ? (lang === "ar" ? "متحرك" : "Moving") : obj.status === "idle" ? (lang === "ar" ? "خامل" : "Idle") : (lang === "ar" ? "متوقف" : "Stopped")}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)" }}>
                          {obj.speed} {lang === "ar" ? "كم/س" : "km/h"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM SETTINGS & BRANDING */}
          {activeTab === "settings" && (
            <div className="system-settings-view">
              <form onSubmit={handleSaveSystemSettings}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  {/* General Branding */}
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "14px", color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Globe size={16} color="#00b4c6" />
                      {lang === "ar" ? "الهوية والبراندينغ (Whitelabel)" : "Branding & Identity"}
                    </h3>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                        {lang === "ar" ? "اسم المنظومة المعروض" : "Platform Title"}
                      </label>
                      <input
                        type="text"
                        value={systemSettings.platformName}
                        onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                        {lang === "ar" ? "بريد الدعم الفني" : "Support Email"}
                      </label>
                      <input
                        type="email"
                        value={systemSettings.supportEmail}
                        onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                        {lang === "ar" ? "هاتف الطوارئ والدعم" : "Support Phone"}
                      </label>
                      <input
                        type="text"
                        value={systemSettings.supportPhone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, supportPhone: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {/* SMS Gateway Integration */}
                  <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "14px", color: "#111827", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Radio size={16} color="#00b4c6" />
                      {lang === "ar" ? "بوابة الرسائل القصيرة (SMS Gateway)" : "SMS Gateway Integration"}
                    </h3>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                        SMS Gateway API Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={systemSettings.smsGatewayUrl}
                        onChange={(e) => setSystemSettings({ ...systemSettings, smsGatewayUrl: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                          Sender ID
                        </label>
                        <input
                          type="text"
                          value={systemSettings.smsSenderId}
                          onChange={(e) => setSystemSettings({ ...systemSettings, smsSenderId: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#4b5563", marginBottom: "4px" }}>
                          API Secret Key
                        </label>
                        <input
                          type="password"
                          value={systemSettings.smsApiKey}
                          onChange={(e) => setSystemSettings({ ...systemSettings, smsApiKey: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    {/* Test SMS Sender Tool */}
                    <div style={{ background: "#f9fafb", padding: "10px", borderRadius: "6px", border: "1px dashed #d1d5db" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                        {lang === "ar" ? "فحص وتجربة إرسال SMS" : "Test SMS Sending"}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          value={smsTestNumber}
                          onChange={(e) => setSmsTestNumber(e.target.value)}
                          placeholder="+966..."
                          style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                        />
                        <button
                          type="button"
                          onClick={handleSendTestSms}
                          disabled={smsStatus === "sending"}
                          style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Send size={13} />
                          <span>{smsStatus === "sending" ? "..." : (lang === "ar" ? "إرسال تجريبي" : "Send Test")}</span>
                        </button>
                      </div>
                      {smsStatus === "success" && (
                        <div style={{ color: "#10b981", fontSize: "0.75rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={12} />
                          <span>{lang === "ar" ? "تم إرسال الرسالة التجريبية بنجاح عبر البوابة!" : "Test SMS delivered successfully via gateway!"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  {saveSuccess && (
                    <span style={{ color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={16} />
                      {lang === "ar" ? "تم حفظ إعدادات النظام بنجاح!" : "System settings saved successfully!"}
                    </span>
                  )}
                  <button 
                    type="submit" 
                    className="btn-primary-teal"
                    style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Save size={16} />
                    <span>{lang === "ar" ? "حفظ وتطبيق الإعدادات" : "Save Settings"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SERVER TELEMETRY & PERFORMANCE */}
          {activeTab === "server" && (
            <div className="server-telemetry-view">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "حزم GPS المستلمة" : "GPS Packets Received"}</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#00b4c6", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    148,920
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#10b981" }}>+24 / sec</span>
                </div>

                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "اتصالات TCP النشطة" : "Active TCP Sockets"}</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    3 / 1,000
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>Concox, Teltonika</span>
                </div>

                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "وقت تشغيل الخادم" : "Server Uptime"}</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#6366f1", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    99.98%
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>14 days 6 hours</span>
                </div>

                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "استهلاك الذاكرة والمعالج" : "CPU & RAM Load"}</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    12%
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>180MB Node.js</span>
                </div>
              </div>

              {/* Protocol Listeners Status */}
              <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "12px", color: "#111827" }}>
                  {lang === "ar" ? "منافذ البروتوكولات المصغية حالياً (Traccar Ports)" : "Active Protocol Gateway Ports"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", borderInlineStart: "4px solid #10b981" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>Port 5023</strong>
                      <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: "600" }}>LISTENING</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Concox GT06 / SinoTrack Protocol</div>
                  </div>

                  <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", borderInlineStart: "4px solid #10b981" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>Port 5027</strong>
                      <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: "600" }}>LISTENING</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Teltonika Code 8 / Extended</div>
                  </div>

                  <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", borderInlineStart: "4px solid #10b981" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>Port 5001</strong>
                      <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: "600" }}>LISTENING</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>Coban TK103 / GPS103 Protocol</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ADD CLIENT SUB-MODAL */}
        {showAddClientModal && (
          <div className="modal-overlay-custom" style={{ zIndex: 100000 }}>
            <div className="modal-box-custom" style={{ maxWidth: "550px", width: "90vw" }}>
              <div className="modal-header-teal">
                <h3 className="modal-title-text">{lang === "ar" ? "إضافة عميل جديد للنظام" : "Add New Client"}</h3>
                <button className="modal-close-btn" onClick={() => setShowAddClientModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddClientSubmit} style={{ padding: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "الاسم الكامل" : "Full Name"} *</label>
                    <input 
                      type="text" 
                      required 
                      value={newClient.name} 
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "البريد الإلكتروني" : "Email"} *</label>
                    <input 
                      type="email" 
                      required 
                      value={newClient.email} 
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "الشركة / المؤسسة" : "Company"}</label>
                    <input 
                      type="text" 
                      value={newClient.company} 
                      onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "رقم الهاتف" : "Phone"}</label>
                    <input 
                      type="text" 
                      value={newClient.phone} 
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "الحد الأقصى للأجهزة" : "Max Devices"}</label>
                    <input 
                      type="number" 
                      value={newClient.maxDevices} 
                      onChange={(e) => setNewClient({ ...newClient, maxDevices: Number(e.target.value) })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "الباقة" : "Subscription Plan"}</label>
                    <select 
                      value={newClient.plan} 
                      onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="Fleet Pro">Fleet Pro (أسطول احترافي)</option>
                      <option value="Standard">Standard (قياسي)</option>
                      <option value="Enterprise VIP">Enterprise VIP (مؤسسات)</option>
                      <option value="Trial">Trial (تجريبي)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddClientModal(false)}
                    style={{ background: "#f3f4f6", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                  >
                    {lang === "ar" ? "حفظ وإضافة" : "Add Client"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
