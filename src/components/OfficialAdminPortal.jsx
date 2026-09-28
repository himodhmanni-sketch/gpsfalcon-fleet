import React, { useState } from "react";
import { 
  MapPin, 
  Users, 
  Navigation, 
  Wrench, 
  Settings as SettingsIcon, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  LogOut, 
  Plus, 
  Upload, 
  Search, 
  MoreVertical, 
  X, 
  Palette, 
  Mail, 
  MessageSquare, 
  Bell, 
  Briefcase, 
  Calendar, 
  LayoutGrid, 
  List, 
  Trash2, 
  Edit3, 
  Radio, 
  RefreshCw,
  Sliders,
  Check
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { API_ENDPOINTS } from "../config/api";

export function OfficialAdminPortal({
  lang = "ar",
  setLang,
  currentUser,
  onLogout,
  onBackToMap,
  vehicles = [],
  setVehicles,
  clients = [],
  setClients,
  onSyncPostgreSQL
}) {
  const [activeTab, setActiveTab] = useState("objects"); // 'objects', 'settings', 'clients', 'management', 'logs_scheduled'
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [settingsViewMode, setSettingsViewMode] = useState("grid"); // 'grid' | 'list'
  
  // Client Modal (Add / Edit) State
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    password: "client123",
    role: "company", // 'company' | 'individual' | 'reseller' | 'driver'
    company: "",
    phone: "",
    quota: 10,
    active: true
  });

  const handleOpenAddClient = () => {
    soundFX.playClick();
    setEditingClient(null);
    setClientForm({
      name: "",
      email: "",
      password: "client123",
      role: "company",
      company: "",
      phone: "",
      quota: 10,
      active: true
    });
    setShowClientModal(true);
  };

  const handleOpenEditClient = (cli) => {
    soundFX.playClick();
    setEditingClient(cli);
    setClientForm({
      name: cli.name || "",
      email: cli.email || "",
      password: cli.password || "client123",
      role: cli.role || "company",
      company: cli.company || "",
      phone: cli.phone || "",
      quota: cli.quota || 10,
      active: cli.active !== false
    });
    setShowClientModal(true);
  };

  const handleSaveClient = async (e) => {
    if (e) e.preventDefault();
    soundFX.playSuccess();

    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      alert(lang === "ar" ? "يرجى إدخال اسم العميل والبريد الإلكتروني" : "Client name and email are required");
      return;
    }

    const newOrUpdated = {
      id: editingClient?.id || `cl-${Date.now().toString().slice(-6)}`,
      name: clientForm.name.trim(),
      nameAr: clientForm.name.trim(),
      email: clientForm.email.trim(),
      password: clientForm.password || "client123",
      role: clientForm.role,
      company: clientForm.company.trim() || (clientForm.role === "company" ? clientForm.name.trim() : (lang === "ar" ? "عميل خاص" : "Private Client")),
      phone: clientForm.phone.trim(),
      quota: Number(clientForm.quota) || 10,
      active: clientForm.active
    };

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...newOrUpdated } : c));
    } else {
      setClients(prev => [newOrUpdated, ...prev]);
    }

    try {
      await fetch(API_ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrUpdated)
      });
      if (onSyncPostgreSQL) onSyncPostgreSQL();
    } catch (err) {
      console.warn("[Admin Portal] Error saving client to backend:", err.message);
    }

    setShowClientModal(false);
  };

  const handleDeleteClient = (cliId, cliName) => {
    soundFX.playClick();
    if (window.confirm(lang === "ar" ? `هل ترغب حقاً في حذف العميل: ${cliName}؟` : `Delete client: ${cliName}?`)) {
      setClients(prev => prev.filter(c => c.id !== cliId));
    }
  };

  // Device Modal (Add / Edit) State matching Screenshots 4 & 5
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceModalTab, setDeviceModalTab] = useState("main"); // 'main', 'users', 'icons', 'advanced', 'sensors', 'maintenance', 'accuracy', 'tail', 'cameras'

  // Column Visibility Customizer (Gear icon in table header)
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    active: true,
    name: true,
    imei: true,
    online: true,
    lastUpdate: true,
    expiresAt: true,
    user: true
  });

  // Action Menu Dropdown (3 dots) on table rows
  const [activeRowMenuId, setActiveRowMenuId] = useState(null);

  // Device Form State (Full 9 Tabs data)
  const [deviceForm, setDeviceForm] = useState({
    active: true,
    name: "",
    imei: "",
    expiresAt: "",
    noExpiration: true,
    activateGps: true,
    clientId: clients[0]?.id || "cl-01",
    // Accuracy Tab (Screenshot 5)
    validateSpeedAvg: true,
    minSpeedKmh: 6,
    maxSpeedKmh: "",
    minFuelRefillDiff: 10,
    minFuelTheftDiff: 10,
    detectFuelAfterStop: "default",
    // Advanced
    protocol: "GT06",
    protocolPort: 5023,
    simNumber: "",
    plateNumber: "",
    // Icons Tab
    icon: "car",
    // Maintenance Tab
    odometer: 45200,
    engineHours: 1280,
    // Tail Tab
    tailColor: "#00b4c6",
    tailPoints: 25,
    pulseGlow: true,
    // Cameras Tab
    cameraType: "dashcam",
    cameraRtsp: "",
    cameraSnapshotOnAlert: true
  });

  // Settings Sub-Modals (Branding, Email, SMS, Companies)
  const [activeSettingsModal, setActiveSettingsModal] = useState(null);
  const [brandingSettings, setBrandingSettings] = useState({
    platformName: "GPSWOX Fleet Enterprise",
    primaryColor: "#00b4c6",
    supportEmail: "support@gpswox.com",
    supportPhone: "+218 91 000 0000",
    domain: "demo-hs.gpswox.com"
  });

  // Filters for Objects Table (Screenshot 2)
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [objectSearch, setObjectSearch] = useState("");

  // Open Add Device Modal
  const handleOpenAddDevice = () => {
    soundFX.playClick();
    setEditingDevice(null);
    setDeviceModalTab("main");
    setDeviceForm({
      active: true,
      name: "",
      imei: "",
      expiresAt: "",
      noExpiration: true,
      activateGps: true,
      clientId: clients[0]?.id || "cl-01",
      validateSpeedAvg: true,
      minSpeedKmh: 6,
      maxSpeedKmh: "",
      minFuelRefillDiff: 10,
      minFuelTheftDiff: 10,
      detectFuelAfterStop: "default",
      protocol: "GT06",
      protocolPort: 5023,
      simNumber: "",
      plateNumber: ""
    });
    setShowDeviceModal(true);
  };

  // Open Edit Device Modal
  const handleOpenEditDevice = (dev) => {
    soundFX.playClick();
    setEditingDevice(dev);
    setDeviceModalTab("main");
    setDeviceForm({
      active: dev.status !== "inactive",
      name: dev.name || "",
      imei: dev.imei || "",
      expiresAt: dev.expiresAt || "",
      noExpiration: !dev.expiresAt || dev.expiresAt === "unlimited",
      activateGps: true,
      clientId: dev.clientId || clients[0]?.id || "cl-01",
      validateSpeedAvg: true,
      minSpeedKmh: dev.minSpeed || 6,
      maxSpeedKmh: dev.maxSpeed || "",
      minFuelRefillDiff: 10,
      minFuelTheftDiff: 10,
      detectFuelAfterStop: "default",
      protocol: dev.protocol || "GT06",
      protocolPort: dev.protocolPort || 5023,
      simNumber: dev.simNumber || "",
      plateNumber: dev.plateNumber || ""
    });
    setShowDeviceModal(true);
    setActiveRowMenuId(null);
  };

  // Save Device to Backend & PostgreSQL
  const handleSaveDevice = async (e) => {
    e.preventDefault();
    soundFX.playSuccess();

    if (!deviceForm.name || !deviceForm.imei) {
      alert(lang === "ar" ? "يرجى إدراج الاسم ورمز IMEI" : "Name and IMEI are required");
      return;
    }

    const newOrUpdated = {
      id: editingDevice?.id || `vh-${deviceForm.imei}`,
      name: deviceForm.name,
      imei: deviceForm.imei,
      plateNumber: deviceForm.plateNumber || deviceForm.name,
      protocol: deviceForm.protocol,
      protocolPort: deviceForm.protocolPort,
      simNumber: deviceForm.simNumber,
      clientId: deviceForm.clientId,
      status: deviceForm.active ? "stopped" : "inactive",
      coords: editingDevice?.coords || [32.8872, 13.1913],
      speed: editingDevice?.speed || 0,
      lastUpdate: new Date().toISOString()
    };

    if (editingDevice) {
      setVehicles(prev => prev.map(v => v.id === editingDevice.id ? { ...v, ...newOrUpdated } : v));
    } else {
      setVehicles(prev => [newOrUpdated, ...prev]);
    }

    try {
      const token = localStorage.getItem("gpswox_token") || sessionStorage.getItem("gpswox_token");
      await fetch(API_ENDPOINTS.devices, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(newOrUpdated)
      });
      if (onSyncPostgreSQL) onSyncPostgreSQL();
    } catch (err) {
      console.warn("[Admin Portal] Error saving device to PostgreSQL:", err.message);
    }

    setShowDeviceModal(false);
  };

  // Delete Device
  const handleDeleteDevice = async (deviceId) => {
    soundFX.playClick();
    setActiveRowMenuId(null);
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الجهاز نهائياً من المنظومة؟" : "Are you sure you want to permanently delete this device?")) {
      return;
    }

    setVehicles(prev => prev.filter(v => v.id !== deviceId));
    try {
      const token = localStorage.getItem("gpswox_token") || sessionStorage.getItem("gpswox_token");
      await fetch(`${API_ENDPOINTS.devices}/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (onSyncPostgreSQL) onSyncPostgreSQL();
    } catch (err) {
      console.warn("[Admin Portal] Error deleting device:", err.message);
    }
  };

  // Filtered Vehicles for Objects Table
  const filteredVehicles = vehicles.filter(v => {
    if (statusFilter === "active" && v.status === "inactive") return false;
    if (statusFilter === "inactive" && v.status !== "inactive") return false;
    if (clientFilter !== "all" && v.clientId !== clientFilter) return false;
    if (objectSearch) {
      const q = objectSearch.toLowerCase();
      const matchName = v.name?.toLowerCase().includes(q);
      const matchImei = v.imei?.includes(q);
      const matchPlate = v.plateNumber?.toLowerCase().includes(q);
      if (!matchName && !matchImei && !matchPlate) return false;
    }
    return true;
  });

  return (
    <div 
      className="gpswox-admin-portal-wrapper"
      onClick={() => setActiveRowMenuId(null)}
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        background: "#ffffff",
        color: "#374151",
        fontFamily: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
        position: "relative",
        direction: "ltr" // Guarantees sidebar is locked to the physical LEFT edge matching Screenshots 1, 2, 3!
      }}
    >
      {/* =========================================================================
          LEFT SIDEBAR (Matches screenshots 1, 2, 3)
         ========================================================================= */}
      <aside 
        style={{
          width: isSidebarCollapsed ? "60px" : "210px",
          minWidth: isSidebarCollapsed ? "60px" : "210px",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.2s ease",
          zIndex: 100,
          direction: lang === "ar" ? "rtl" : "ltr" // Inside the sidebar, elements flow RTL in Arabic
        }}
      >
        {/* Top: Logo & Collapse Button */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isSidebarCollapsed ? "center" : "space-between",
            padding: "16px 14px",
            borderBottom: "1px solid #f1f5f9"
          }}>
            {!isSidebarCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  background: "linear-gradient(135deg, #00b4c6 0%, #0891b2 100%)",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  boxShadow: "0 2px 8px rgba(0, 180, 198, 0.3)"
                }}>
                  <Radio size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "900", letterSpacing: "0.5px", lineHeight: 1.1 }}>
                    <span style={{ color: "#00b4c6" }}>GPS</span>
                    <span style={{ color: "#0284c7" }}>WOX</span>
                  </div>
                  <div style={{ fontSize: "0.55rem", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>
                    ENABLED GPS PARTNER SINCE 2014
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b"
              }}
              title="Collapse"
            >
              {lang === "ar" 
                ? (isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />) 
                : (isSidebarCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />)}
            </button>
          </div>

          {/* Navigation Menu List */}
          <div style={{ padding: "12px 8px", display: "flex", flexDirection: "column", gap: "3px" }}>
            
            {/* 1. خريطة (Map) -> Takes back to live tracking */}
            <button
              onClick={() => {
                soundFX.playClick();
                if (onBackToMap) onBackToMap();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: "#475569",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              title={lang === "ar" ? "خريطة" : "Map"}
            >
              <MapPin size={17} color="#64748b" />
              {!isSidebarCollapsed && <span>{lang === "ar" ? "خريطة" : "Map"}</span>}
            </button>

            {/* 2. زبائن (Clients) */}
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("clients"); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "clients" ? "#596574" : "transparent",
                color: activeTab === "clients" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                justifyContent: isSidebarCollapsed ? "center" : "space-between",
                transition: "background 0.15s"
              }}
              title={lang === "ar" ? "زبائن" : "Clients"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Users size={17} color={activeTab === "clients" ? "#ffffff" : "#64748b"} />
                {!isSidebarCollapsed && <span>{lang === "ar" ? "زبائن" : "Clients"}</span>}
              </div>
              {!isSidebarCollapsed && (
                <span style={{
                  fontSize: "0.68rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: activeTab === "clients" ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                  color: activeTab === "clients" ? "#ffffff" : "#64748b",
                  fontWeight: "700"
                }}>
                  {clients.length || 1}
                </span>
              )}
            </button>

            {/* 3. السيارات (Objects) -> Active Pill in Screenshot 2 */}
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("objects"); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "objects" ? "#596574" : "transparent",
                color: activeTab === "objects" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                justifyContent: isSidebarCollapsed ? "center" : "space-between",
                transition: "background 0.15s"
              }}
              title={lang === "ar" ? "السيارات" : "Objects"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Navigation size={17} color={activeTab === "objects" ? "#ffffff" : "#64748b"} />
                {!isSidebarCollapsed && <span>{lang === "ar" ? "السيارات" : "Objects"}</span>}
              </div>
              {!isSidebarCollapsed && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{
                    fontSize: "0.68rem",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: activeTab === "objects" ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                    color: activeTab === "objects" ? "#ffffff" : "#64748b",
                    fontWeight: "700"
                  }}>
                    {vehicles.filter(v => v.status !== "inactive").length || 2}
                  </span>
                  <span style={{
                    fontSize: "0.68rem",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: activeTab === "objects" ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                    color: activeTab === "objects" ? "#ffffff" : "#64748b",
                    fontWeight: "700"
                  }}>
                    {vehicles.length || 3}
                  </span>
                </div>
              )}
            </button>

            {/* 4. إعدادات (Settings) -> Active Pill in Screenshot 1 */}
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("settings"); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "settings" ? "#596574" : "transparent",
                color: activeTab === "settings" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                transition: "background 0.15s"
              }}
              title={lang === "ar" ? "إعدادات" : "Settings"}
            >
              <Wrench size={17} color={activeTab === "settings" ? "#ffffff" : "#64748b"} />
              {!isSidebarCollapsed && <span>{lang === "ar" ? "إعدادات" : "Settings"}</span>}
            </button>

            {/* 5. إدارة (Management) */}
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("management"); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "management" ? "#596574" : "transparent",
                color: activeTab === "management" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                transition: "background 0.15s"
              }}
              title={lang === "ar" ? "إدارة" : "Management"}
            >
              <SettingsIcon size={17} color={activeTab === "management" ? "#ffffff" : "#64748b"} />
              {!isSidebarCollapsed && <span>{lang === "ar" ? "إدارة" : "Management"}</span>}
            </button>

            {/* 6. السجلات (Logs) with Collapsible Submenu (Screenshot 3) */}
            <div>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setIsLogsExpanded(!isLogsExpanded);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isSidebarCollapsed ? "center" : "space-between",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab.startsWith("logs") ? "#596574" : "transparent",
                  color: activeTab.startsWith("logs") ? "#ffffff" : "#475569",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%"
                }}
                title={lang === "ar" ? "السجلات" : "Logs"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={17} color={activeTab.startsWith("logs") ? "#ffffff" : "#64748b"} />
                  {!isSidebarCollapsed && <span>{lang === "ar" ? "السجلات" : "Logs"}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown size={14} style={{ transform: isLogsExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                )}
              </button>

              {/* Sub-Items (Screenshot 3 & Extended GPSWOX Logs) */}
              {!isSidebarCollapsed && isLogsExpanded && (
                <div style={{ paddingInlineStart: "24px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {[
                    { id: "logs_scheduled", label: "سجل التقرير المجدول", labelEn: "Scheduled Reports Log" },
                    { id: "logs_email", label: "سجل البريد الإلكتروني", labelEn: "Email Log" },
                    { id: "logs_sms", label: "سجل الرسائل SMS", labelEn: "SMS Log" },
                    { id: "logs_alerts", label: "سجل تنبيهات النظام", labelEn: "System Alerts Log" },
                    { id: "logs_audit", label: "سجل التدقيق والأمان", labelEn: "Audit Log" }
                  ].map(subLog => {
                    const isSubActive = activeTab === subLog.id;
                    return (
                      <button
                        key={subLog.id}
                        onClick={() => { soundFX.playClick(); setActiveTab(subLog.id); }}
                        style={{
                          background: isSubActive ? "#e2e8f0" : "transparent",
                          border: "none",
                          color: isSubActive ? "#0f172a" : "#64748b",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          textAlign: lang === "ar" ? "right" : "left",
                          cursor: "pointer",
                          fontWeight: isSubActive ? "700" : "500",
                          width: "100%"
                        }}
                      >
                        {lang === "ar" ? subLog.label : subLog.labelEn}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Profile, Language & Logout (Matches Screenshots 1, 2, 3) */}
        <div style={{ padding: "12px", borderTop: "1px solid #f1f5f9" }}>
          {!isSidebarCollapsed && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "#64748b", marginBottom: "2px" }}>
                <User size={12} />
                <span>{lang === "ar" ? "حساب" : "Account"}</span>
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.email || "himodhmanni@gmail.com"}
              </div>
            </div>
          )}

          {/* Language Toggle */}
          {!isSidebarCollapsed && (
            <div 
              onClick={() => {
                soundFX.playClick();
                const next = lang === "ar" ? "en" : "ar";
                setLang(next);
                document.documentElement.lang = next;
                document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: "0.76rem",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              <span>{lang === "ar" ? "Arabic" : "English"}</span>
              <span>{lang === "ar" ? "🇦🇪" : "🇬🇧"}</span>
            </div>
          )}

          {/* Switch to Old Version Toggle Switch */}
          {!isSidebarCollapsed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", fontSize: "0.74rem", color: "#64748b" }}>
              <span>{lang === "ar" ? "تبديل إلى الإصدار القديم" : "Switch Old Version"}</span>
              <div style={{ width: "28px", height: "16px", borderRadius: "10px", background: "#00b4c6", position: "relative", cursor: "pointer" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", right: "2px" }} />
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              if (onLogout) onLogout();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "0.78rem",
              fontWeight: "600",
              padding: "8px 0",
              cursor: "pointer",
              width: "100%",
              justifyContent: isSidebarCollapsed ? "center" : "flex-start",
              marginTop: "4px"
            }}
          >
            <LogOut size={14} />
            {!isSidebarCollapsed && <span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN ADMIN WORKSPACE VIEWPORT (Matches Screenshots 1, 2, 3)
         ========================================================================= */}
      <main 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          height: "100vh", 
          overflow: "hidden", 
          background: "#ffffff",
          direction: lang === "ar" ? "rtl" : "ltr" // RTL inside the content area
        }}
      >
        {/* Top Header Row (Matches Screenshots 1, 2, 3) */}
        <header style={{
          height: "54px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "#ffffff"
        }}>
          {/* Breadcrumb / Title on Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", fontWeight: "700", color: "#1e293b" }}>
            {activeTab === "objects" && (
              <>
                <span>{lang === "ar" ? "السيارات" : "Objects"}</span>
                <Navigation size={17} color="#00b4c6" />
              </>
            )}
            {activeTab === "settings" && (
              <>
                <Wrench size={17} color="#00b4c6" />
                <span>{lang === "ar" ? "إعدادات" : "Settings"}</span>
              </>
            )}
            {activeTab === "clients" && (
              <>
                <Users size={17} color="#00b4c6" />
                <span>{lang === "ar" ? "زبائن" : "Clients"}</span>
              </>
            )}
            {activeTab === "management" && (
              <>
                <SettingsIcon size={17} color="#00b4c6" />
                <span>{lang === "ar" ? "إدارة" : "Management"}</span>
              </>
            )}
            {activeTab.startsWith("logs") && (
              <>
                <FileText size={17} color="#00b4c6" />
                <span style={{ color: "#64748b" }}>{lang === "ar" ? "السجلات" : "Logs"}</span>
                <span style={{ color: "#94a3b8" }}>/</span>
                <span>
                  {activeTab === "logs_scheduled" && (lang === "ar" ? "سجل التقرير المجدول" : "Scheduled Reports Log")}
                  {activeTab === "logs_email" && (lang === "ar" ? "سجل البريد الإلكتروني" : "Email Log")}
                  {activeTab === "logs_sms" && (lang === "ar" ? "سجل الرسائل SMS" : "SMS Log")}
                  {activeTab === "logs_alerts" && (lang === "ar" ? "سجل تنبيهات النظام" : "System Alerts Log")}
                  {activeTab === "logs_audit" && (lang === "ar" ? "سجل التدقيق والأمان" : "Audit Log")}
                </span>
              </>
            )}
          </div>

          {/* Left Controls (Settings Grid/List toggle in Screenshot 1) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {activeTab === "settings" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => setSettingsViewMode("list")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: settingsViewMode === "list" ? "#00b4c6" : "#94a3b8",
                    padding: "4px",
                    cursor: "pointer"
                  }}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setSettingsViewMode("grid")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: settingsViewMode === "grid" ? "#00b4c6" : "#94a3b8",
                    padding: "4px",
                    cursor: "pointer"
                  }}
                  title="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", background: "#ffffff" }}>
          
          {/* =========================================================================
              VIEW 1: السيارات (OBJECTS - Matches Screenshot 2)
             ========================================================================= */}
          {activeTab === "objects" && (
            <div>
              {/* Action Bar (Screenshot 2: Left has + & Export, Right has Filters & Search) */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                {/* Physical Left in LTR / End in RTL: + Add Button & 📤 Export */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={handleOpenAddDevice}
                    style={{
                      width: "42px",
                      height: "38px",
                      background: "#00b4c6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 180, 198, 0.25)"
                    }}
                    title={lang === "ar" ? "إضافة جهاز" : "Add Device"}
                  >
                    <Plus size={22} strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={() => { soundFX.playClick(); alert(lang === "ar" ? "جاري تصدير الأجهزة إلى ملف CSV..." : "Exporting devices to CSV..."); }}
                    style={{
                      width: "42px",
                      height: "38px",
                      background: "#ffffff",
                      color: "#00b4c6",
                      border: "1px solid #00b4c6",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    title={lang === "ar" ? "تصدير" : "Export"}
                  >
                    <Upload size={18} />
                  </button>
                </div>

                {/* Physical Right in LTR / Start in RTL: Filter Dropdowns & Search */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.82rem",
                      background: "#ffffff",
                      color: "#475569",
                      outline: "none"
                    }}
                  >
                    <option value="all">{lang === "ar" ? "...يختار الحالة" : "Select status..."}</option>
                    <option value="active">{lang === "ar" ? "فعال" : "Active"}</option>
                    <option value="inactive">{lang === "ar" ? "غير فعال" : "Inactive"}</option>
                  </select>

                  {/* Client Dropdown */}
                  <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.82rem",
                      background: "#ffffff",
                      color: "#475569",
                      outline: "none"
                    }}
                  >
                    <option value="all">{lang === "ar" ? "...يختار" : "Select user..."}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>

                  {/* Search Bar */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "بحث" : "Search"}
                      value={objectSearch}
                      onChange={(e) => setObjectSearch(e.target.value)}
                      style={{
                        padding: "8px 14px",
                        paddingInlineStart: "32px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        fontSize: "0.82rem",
                        width: "180px",
                        outline: "none"
                      }}
                    />
                    <Search size={15} color="#94a3b8" style={{ position: "absolute", left: lang === "ar" ? "10px" : "auto", right: lang === "ar" ? "auto" : "10px" }} />
                  </div>
                </div>
              </div>

              {/* Data Table (Screenshot 2) */}
              <div style={{ overflowX: "auto", borderTop: "1px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: lang === "ar" ? "right" : "left" }}>
                      <th style={{ padding: "12px 14px", width: "40px" }}><input type="checkbox" style={{ accentColor: "#00b4c6" }} /></th>
                      {visibleColumns.active && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "فعال" : "Active"}</th>}
                      {visibleColumns.name && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الاسم ⇅" : "Name ⇅"}</th>}
                      {visibleColumns.imei && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "IMEI" : "IMEI"}</th>}
                      {visibleColumns.online && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "متصل" : "Online"}</th>}
                      {visibleColumns.lastUpdate && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "آخر اتصال" : "Last Connection"}</th>}
                      {visibleColumns.expiresAt && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "تاريخ انتهاء الصلاحية" : "Expiration Date"}</th>}
                      {visibleColumns.user && <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "مستخدم" : "User"}</th>}
                      <th style={{ padding: "12px 14px", width: "45px", textAlign: "center", position: "relative" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColumnCustomizer(!showColumnCustomizer);
                          }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                          title={lang === "ar" ? "تخصيص وإخفاء الأعمدة" : "Customize Columns"}
                        >
                          <SettingsIcon size={15} color="#64748b" />
                        </button>

                        {/* Column Customizer Popover Menu */}
                        {showColumnCustomizer && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              left: lang === "ar" ? "5px" : "auto",
                              right: lang === "ar" ? "auto" : "5px",
                              top: "35px",
                              background: "#ffffff",
                              borderRadius: "8px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                              border: "1px solid #e2e8f0",
                              padding: "10px 14px",
                              zIndex: 60,
                              minWidth: "160px",
                              textAlign: lang === "ar" ? "right" : "left",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px"
                            }}
                          >
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" }}>
                              {lang === "ar" ? "تخصيص الأعمدة" : "Customize Columns"}
                            </div>
                            {[
                              { id: "active", label: "فعال" },
                              { id: "name", label: "الاسم" },
                              { id: "imei", label: "IMEI" },
                              { id: "online", label: "متصل" },
                              { id: "lastUpdate", label: "آخر اتصال" },
                              { id: "expiresAt", label: "تاريخ الصلاحية" },
                              { id: "user", label: "مستخدم" }
                            ].map(col => (
                              <label key={col.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", cursor: "pointer", color: "#475569" }}>
                                <input
                                  type="checkbox"
                                  checked={visibleColumns[col.id]}
                                  onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.id]: e.target.checked })}
                                  style={{ accentColor: "#00b4c6" }}
                                />
                                <span>{col.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(veh => {
                      const isOnline = veh.status !== "inactive" && veh.status !== "offline";
                      const clientObj = clients.find(c => c.id === veh.clientId) || clients[0];
                      return (
                        <tr 
                          key={veh.id}
                          style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                        >
                          <td style={{ padding: "12px 14px" }}><input type="checkbox" style={{ accentColor: "#00b4c6" }} /></td>
                          {visibleColumns.active && (
                            <td style={{ padding: "12px 14px" }}>
                              {veh.status !== "inactive" ? (
                                <span style={{ background: "#10b981", color: "#ffffff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  {lang === "ar" ? "فعال" : "Active"}
                                </span>
                              ) : (
                                <span style={{ background: "#ef4444", color: "#ffffff", padding: "2px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  {lang === "ar" ? "غير فعال" : "Inactive"}
                                </span>
                              )}
                            </td>
                          )}
                          {visibleColumns.name && <td style={{ padding: "12px 14px", fontWeight: "700", color: "#1e293b" }}>{veh.name}</td>}
                          {visibleColumns.imei && <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#475569" }}>{veh.imei || "100000024"}</td>}
                          {visibleColumns.online && (
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                display: "inline-block",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: isOnline ? "#10b981" : "#ef4444"
                              }} />
                            </td>
                          )}
                          {visibleColumns.lastUpdate && (
                            <td style={{ padding: "12px 14px", color: "#64748b", fontSize: "0.78rem" }}>
                              {veh.lastUpdate ? new Date(veh.lastUpdate).toLocaleString(lang === "ar" ? "ar-LY" : "en-US") : "13:54:09 2026-09-26"}
                            </td>
                          )}
                          {visibleColumns.expiresAt && (
                            <td style={{ padding: "12px 14px", color: "#64748b" }}>
                              {veh.expiresAt || (lang === "ar" ? "غير محدود" : "Unlimited")}
                            </td>
                          )}
                          {visibleColumns.user && (
                            <td style={{ padding: "12px 14px", color: "#475569" }}>
                              {clientObj?.email || "himodhmanni@gmail.com"}
                            </td>
                          )}
                          <td style={{ padding: "12px 14px", textAlign: "center", position: "relative" }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveRowMenuId(activeRowMenuId === veh.id ? null : veh.id);
                              }}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu on 3 dots */}
                            {activeRowMenuId === veh.id && (
                              <div style={{
                                position: "absolute",
                                left: lang === "ar" ? "10px" : "auto",
                                right: lang === "ar" ? "auto" : "10px",
                                top: "35px",
                                background: "#ffffff",
                                borderRadius: "8px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                border: "1px solid #e2e8f0",
                                padding: "6px 0",
                                zIndex: 50,
                                minWidth: "120px",
                                textAlign: lang === "ar" ? "right" : "left"
                              }}>
                                <button
                                  onClick={() => handleOpenEditDevice(veh)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    border: "none",
                                    background: "transparent",
                                    width: "100%",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    color: "#334155"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <Edit3 size={14} color="#00b4c6" />
                                  <span>{lang === "ar" ? "تعديل الجهاز" : "Edit Device"}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    soundFX.playSuccess();
                                    setActiveRowMenuId(null);
                                    alert(lang === "ar" ? `تم إرسال أمر إعادة تشغيل الجهاز للمركبة ${veh.name} عبر بروتوكول Gateway بنجاح.` : `Reboot command sent to ${veh.name}.`);
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    border: "none",
                                    background: "transparent",
                                    width: "100%",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    color: "#334155"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <RefreshCw size={14} color="#0284c7" />
                                  <span>{lang === "ar" ? "إعادة تشغيل الجهاز" : "Reboot Device"}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleOpenEditDevice(veh);
                                    setDeviceModalTab("maintenance");
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    border: "none",
                                    background: "transparent",
                                    width: "100%",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    color: "#334155"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <Wrench size={14} color="#f59e0b" />
                                  <span>{lang === "ar" ? "سجل الصيانة" : "Maintenance"}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handleOpenEditDevice(veh);
                                    setDeviceModalTab("sensors");
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    border: "none",
                                    background: "transparent",
                                    width: "100%",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    color: "#334155"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <Sliders size={14} color="#10b981" />
                                  <span>{lang === "ar" ? "أجهزة الاستشعار" : "Sensors"}</span>
                                </button>
                                <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />
                                <button
                                  onClick={() => handleDeleteDevice(veh.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    border: "none",
                                    background: "transparent",
                                    width: "100%",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    color: "#ef4444"
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <Trash2 size={14} color="#ef4444" />
                                  <span>{lang === "ar" ? "حذف الجهاز" : "Delete"}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Pagination (Screenshot 2: Left-aligned < 1 > 20 records) */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "14px",
                padding: "16px 0",
                fontSize: "0.8rem",
                color: "#64748b"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>&lt;</button>
                  <button style={{ border: "1px solid #00b4c6", background: "#00b4c6", color: "#fff", borderRadius: "4px", padding: "4px 10px", fontWeight: "700" }}>1</button>
                  <button style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: "4px", padding: "4px 8px", cursor: "pointer" }}>&gt;</button>
                </div>
                <div>
                  <span>{lang === "ar" ? "السجلات لكل صفحة " : "Records per page "}</span>
                  <select style={{ border: "1px solid #e2e8f0", borderRadius: "4px", padding: "3px 6px", fontSize: "0.78rem" }}>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <span>{vehicles.length} {lang === "ar" ? "ل 1" : "of 1"}</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: إعدادات (SETTINGS - Matches Screenshot 1)
             ========================================================================= */}
          {activeTab === "settings" && (
            <div style={{ padding: "10px 0" }}>
              {/* Section 1: الإعدادات الرئيسية */}
              <div style={{ marginBottom: "36px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#334155", marginBottom: "16px" }}>
                  {lang === "ar" ? "الإعدادات الرئيسية" : "Main Settings"}
                </h3>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {/* Card: مظهر (Screenshot 1) */}
                  <div
                    onClick={() => { soundFX.playClick(); setActiveSettingsModal("branding"); }}
                    style={{
                      width: "170px",
                      height: "135px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 180, 198, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ color: "#00b4c6" }}><Palette size={34} strokeWidth={1.5} /></div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>
                      {lang === "ar" ? "مظهر" : "Appearance"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: تواصل */}
              <div style={{ marginBottom: "36px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#334155", marginBottom: "16px" }}>
                  {lang === "ar" ? "تواصل" : "Communication"}
                </h3>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {/* Card: نماذج البريد الإلكتروني */}
                  <div
                    onClick={() => { soundFX.playClick(); setActiveSettingsModal("email"); }}
                    style={{
                      width: "170px",
                      height: "135px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 180, 198, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ color: "#00b4c6" }}><Mail size={34} strokeWidth={1.5} /></div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#475569", textAlign: "center", padding: "0 8px" }}>
                      {lang === "ar" ? "نماذج البريد الإلكتروني" : "Email Templates"}
                    </span>
                  </div>

                  {/* Card: قوالب الرسائل القصيرة */}
                  <div
                    onClick={() => { soundFX.playClick(); setActiveSettingsModal("sms"); }}
                    style={{
                      width: "170px",
                      height: "135px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 180, 198, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ color: "#00b4c6" }}><MessageSquare size={34} strokeWidth={1.5} /></div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#475569", textAlign: "center", padding: "0 8px" }}>
                      {lang === "ar" ? "قوالب الرسائل القصيرة" : "SMS Templates"}
                    </span>
                  </div>

                  {/* Card: تنبيهات فورية وإشعارات */}
                  <div
                    onClick={() => { soundFX.playClick(); setActiveSettingsModal("push"); }}
                    style={{
                      width: "170px",
                      height: "135px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 180, 198, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ color: "#00b4c6" }}><Bell size={34} strokeWidth={1.5} /></div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "#475569", textAlign: "center", padding: "0 8px" }}>
                      {lang === "ar" ? "تنبيهات فورية وإشعارات" : "Push & Voice Alerts"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: مستخدم */}
              <div style={{ marginBottom: "36px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#334155", marginBottom: "16px" }}>
                  {lang === "ar" ? "مستخدم" : "User & Organization"}
                </h3>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {/* Card: شركات */}
                  <div
                    onClick={() => { soundFX.playClick(); setActiveSettingsModal("companies"); }}
                    style={{
                      width: "170px",
                      height: "135px",
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "14px",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 180, 198, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ color: "#00b4c6" }}><Briefcase size={34} strokeWidth={1.5} /></div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>
                      {lang === "ar" ? "شركات" : "Companies"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: السجلات والتقارير المجدولة (Matches Screenshot 3)
             ========================================================================= */}
          {activeTab.startsWith("logs") && (
            <div>
              {/* Search & Filter Bar */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "16px" }}>
                <select
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.82rem",
                    background: "#ffffff",
                    color: "#475569",
                    outline: "none"
                  }}
                >
                  <option value="">{lang === "ar" ? "...يختار اكتب" : "Select type..."}</option>
                  <option value="daily">{lang === "ar" ? "يومي" : "Daily"}</option>
                  <option value="weekly">{lang === "ar" ? "أسبوعي" : "Weekly"}</option>
                  <option value="monthly">{lang === "ar" ? "شهري" : "Monthly"}</option>
                </select>

                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث" : "Search"}
                    style={{
                      padding: "8px 14px",
                      paddingInlineStart: "32px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.82rem",
                      width: "180px",
                      outline: "none"
                    }}
                  />
                  <Search size={15} color="#94a3b8" style={{ position: "absolute", left: lang === "ar" ? "10px" : "auto", right: lang === "ar" ? "auto" : "10px" }} />
                </div>
              </div>

              {/* Table Headers */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: lang === "ar" ? "right" : "left" }}>
                      <th style={{ padding: "12px 14px", width: "40px" }}><input type="checkbox" style={{ accentColor: "#00b4c6" }} /></th>
                      {activeTab === "logs_scheduled" && (
                        <>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "العنوان" : "Title"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "اكتب" : "Type"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "شكل" : "Format"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "المسهم" : "Contributor"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "مستخدم" : "User"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "إرسال إلى بريد إلكتروني" : "Send to Email"}</th>
                          <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "عن ارسل" : "Sent Via"}</th>
                        </>
                      )}
                      {activeTab === "logs_email" && (
                        <>
                          <th style={{ padding: "12px 14px" }}>المستلم</th>
                          <th style={{ padding: "12px 14px" }}>الموضوع</th>
                          <th style={{ padding: "12px 14px" }}>الحالة</th>
                          <th style={{ padding: "12px 14px" }}>خادم SMTP</th>
                          <th style={{ padding: "12px 14px" }}>تاريخ الإرسال</th>
                        </>
                      )}
                      {activeTab === "logs_sms" && (
                        <>
                          <th style={{ padding: "12px 14px" }}>رقم المستلم</th>
                          <th style={{ padding: "12px 14px" }}>نص الرسالة</th>
                          <th style={{ padding: "12px 14px" }}>بوابة الإرسال</th>
                          <th style={{ padding: "12px 14px" }}>الحالة</th>
                          <th style={{ padding: "12px 14px" }}>التاريخ</th>
                        </>
                      )}
                      {activeTab === "logs_alerts" && (
                        <>
                          <th style={{ padding: "12px 14px" }}>نوع التنبيه</th>
                          <th style={{ padding: "12px 14px" }}>المركبة</th>
                          <th style={{ padding: "12px 14px" }}>القيمة المقروءة</th>
                          <th style={{ padding: "12px 14px" }}>الموقع الجغرافي</th>
                          <th style={{ padding: "12px 14px" }}>وقت التنبيه</th>
                        </>
                      )}
                      {activeTab === "logs_audit" && (
                        <>
                          <th style={{ padding: "12px 14px" }}>المسؤول</th>
                          <th style={{ padding: "12px 14px" }}>الإجراء المتخذ</th>
                          <th style={{ padding: "12px 14px" }}>عنوان IP</th>
                          <th style={{ padding: "12px 14px" }}>التاريخ والوقت</th>
                          <th style={{ padding: "12px 14px" }}>النتيجة</th>
                        </>
                      )}
                      <th style={{ padding: "12px 14px", width: "40px", textAlign: "center" }}><SettingsIcon size={15} color="#64748b" /></th>
                    </tr>
                  </thead>
                </table>

                {/* Empty State with Magnifying Glass (Matches Screenshot 3) */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "80px 20px",
                  color: "#94a3b8"
                }}>
                  <Search size={54} strokeWidth={1.5} color="#cbd5e1" style={{ marginBottom: "16px" }} />
                  <div style={{ fontSize: "0.95rem", color: "#64748b" }}>
                    {lang === "ar" ? "لم يتم العثور على أي بيانات." : "No data found."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: زبائن (CLIENTS TABLE)
             ========================================================================= */}
          {activeTab === "clients" && (
            <div>
              {/* Action & Filter Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <button
                  onClick={handleOpenAddClient}
                  style={{
                    background: "#00b4c6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    fontSize: "0.88rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 180, 198, 0.3)"
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>{lang === "ar" ? "إضافة عميل جديد" : "Add Client"}</span>
                </button>

                {/* Client Search */}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث عن عميل أو بريد..." : "Search client or email..."}
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    style={{
                      padding: "8px 14px",
                      paddingInlineStart: "32px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.82rem",
                      width: "220px",
                      outline: "none"
                    }}
                  />
                  <Search size={15} color="#94a3b8" style={{ position: "absolute", left: lang === "ar" ? "10px" : "auto", right: lang === "ar" ? "auto" : "10px" }} />
                </div>
              </div>

              {/* Clients Data Table */}
              <div style={{ overflowX: "auto", borderTop: "1px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: lang === "ar" ? "right" : "left" }}>
                      <th style={{ padding: "12px 14px", width: "40px" }}><input type="checkbox" style={{ accentColor: "#00b4c6" }} /></th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الاسم" : "Name"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "نوع الحساب" : "Role"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الشركة" : "Company"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "المركبات / الحصة" : "Vehicles / Quota"}</th>
                      <th style={{ padding: "12px 14px" }}>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th style={{ padding: "12px 14px", width: "90px", textAlign: "center" }}>{lang === "ar" ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients
                      .filter(cli => {
                        if (!clientSearchQuery) return true;
                        const q = clientSearchQuery.toLowerCase();
                        return (
                          cli.name?.toLowerCase().includes(q) ||
                          cli.email?.toLowerCase().includes(q) ||
                          cli.company?.toLowerCase().includes(q)
                        );
                      })
                      .map(cli => {
                        const assignedCount = vehicles.filter(v => v.clientId === cli.id || v.companyId === cli.id || v.ownerId === cli.id).length;
                        return (
                          <tr key={cli.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "12px 14px" }}><input type="checkbox" style={{ accentColor: "#00b4c6" }} /></td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ fontWeight: "700", color: "#1e293b" }}>{cli.name}</div>
                              {cli.phone && <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{cli.phone}</div>}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {cli.role === "superadmin" && (
                                <span style={{ background: "rgba(0, 180, 198, 0.12)", color: "#0891b2", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  👑 المدير العام
                                </span>
                              )}
                              {cli.role === "reseller" && (
                                <span style={{ background: "rgba(139, 92, 246, 0.12)", color: "#7c3aed", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  💼 موزع معتمد
                                </span>
                              )}
                              {cli.role === "company" && (
                                <span style={{ background: "rgba(59, 130, 246, 0.12)", color: "#2563eb", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  🏢 شركة أسطول
                                </span>
                              )}
                              {cli.role === "individual" && (
                                <span style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  👤 عميل فردي
                                </span>
                              )}
                              {cli.role === "driver" && (
                                <span style={{ background: "rgba(245, 158, 11, 0.12)", color: "#d97706", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: "700" }}>
                                  🚗 سائق أسطول
                                </span>
                              )}
                              {!cli.role && (
                                <span style={{ background: "#f1f5f9", color: "#64748b", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem" }}>
                                  مستخدم
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#0284c7", fontWeight: "600" }}>{cli.email}</td>
                            <td style={{ padding: "12px 14px", color: "#64748b" }}>{cli.company || "الأسطول التجاري"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ fontWeight: "700", color: "#1e293b" }}>{assignedCount}</span>
                              {cli.quota && <span style={{ color: "#94a3b8" }}> / {cli.quota}</span>}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ 
                                background: cli.active !== false ? "#10b981" : "#ef4444", 
                                color: "#fff", 
                                padding: "2px 8px", 
                                borderRadius: "4px", 
                                fontSize: "0.72rem", 
                                fontWeight: "700" 
                              }}>
                                {cli.active !== false ? (lang === "ar" ? "فعال" : "Active") : (lang === "ar" ? "معلق" : "Suspended")}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <button
                                  onClick={() => handleOpenEditClient(cli)}
                                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#00b4c6", padding: "4px" }}
                                  title={lang === "ar" ? "تعديل بيانات العميل" : "Edit Client"}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClient(cli.id, cli.name)}
                                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                                  title={lang === "ar" ? "حذف العميل" : "Delete Client"}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: إدارة المنظومة (MANAGEMENT HUB)
             ========================================================================= */}
          {activeTab === "management" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Management Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                
                {/* Card 1: المستخدمون والمشرفون */}
                <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "#e0f2fe", padding: "8px", borderRadius: "8px", color: "#0284c7" }}>
                        <Users size={20} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", fontWeight: "700" }}>
                        {lang === "ar" ? "المشرفون وحسابات الإدارة" : "SuperAdmins & Managers"}
                      </h4>
                    </div>
                    <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>نشط</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "12px" }}>
                    حساب المدير العام الرئيسي: <b>{currentUser?.email || "admin@gpswox.com"}</b>
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", fontSize: "0.78rem", color: "#475569", display: "flex", justifyContent: "space-between" }}>
                    <span>الصلاحيات: تحكم كامل في الأسطول</span>
                    <span style={{ color: "#00b4c6", fontWeight: "700" }}>SuperAdmin ✓</span>
                  </div>
                </div>

                {/* Card 2: بوابات وبروتوكولات التتبع */}
                <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "#e0f7fa", padding: "8px", borderRadius: "8px", color: "#00b4c6" }}>
                        <Radio size={20} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", fontWeight: "700" }}>
                        {lang === "ar" ? "بوابات بروتوكولات Traccar" : "Traccar Protocol Ports"}
                      </h4>
                    </div>
                    <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>0.0.0.0 Listening</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem", color: "#475569" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>GT06 / SinoTrack / Conox:</span>
                      <b style={{ fontFamily: "monospace", color: "#00b4c6" }}>Port 5023 TCP</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Teltonika FMB920:</span>
                      <b style={{ fontFamily: "monospace", color: "#00b4c6" }}>Port 5027 TCP</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Coban GPS103:</span>
                      <b style={{ fontFamily: "monospace", color: "#00b4c6" }}>Port 5001 TCP</b>
                    </div>
                  </div>
                </div>

                {/* Card 3: قاعدة بيانات PostgreSQL 17 */}
                <div style={{ background: "#ffffff", padding: "22px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "#ecfdf5", padding: "8px", borderRadius: "8px", color: "#10b981" }}>
                        <RefreshCw size={20} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", fontWeight: "700" }}>
                        {lang === "ar" ? "قاعدة بيانات PostgreSQL 17" : "PostgreSQL 17 Database"}
                      </h4>
                    </div>
                    <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>متصلة ومزامنة</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "12px", lineHeight: 1.6 }}>
                    قاعدة البيانات: <b>gpswox_fleet</b> على المنفذ 5432.<br />
                    حالة المزامنة: حي ومباشر لكافة العمليات والتعديلات.
                  </div>
                  <button
                    onClick={() => {
                      soundFX.playSuccess();
                      if (onSyncPostgreSQL) onSyncPostgreSQL();
                      alert(lang === "ar" ? "تم التحقق من مزامنة قاعدة بيانات PostgreSQL 17 بنجاح." : "PostgreSQL 17 synced successfully.");
                    }}
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#16a34a",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    {lang === "ar" ? "مزامنة قاعدة البيانات الآن ⟳" : "Sync Database Now ⟳"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Footer (Matches Screenshots 1, 2, 3) */}
        <footer style={{
          height: "36px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 28px",
          background: "#ffffff",
          fontSize: "0.72rem",
          color: "#94a3b8"
        }}>
          <span>v4.5.0 | 194.135.92.189 | GPSWOX Free Trial Server ©</span>
        </footer>
      </main>

      {/* =========================================================================
          DEVICE ADD / EDIT MODAL (Matches Screenshots 4 & 5)
         ========================================================================= */}
      {showDeviceModal && (
        <div 
          onClick={() => setShowDeviceModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "680px",
              maxWidth: "96vw",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0"
            }}
          >
            {/* Modal Header (Screenshot 4) */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderBottom: "1px solid #f1f5f9"
            }}>
              {/* Close Button on Physical Left in RTL */}
              <button 
                onClick={() => setShowDeviceModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X size={18} />
              </button>

              {/* Title on Physical Right in RTL: جهاز with Navigation icon */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                <span>{lang === "ar" ? "جهاز" : "Device"}</span>
                <Navigation size={18} color="#00b4c6" />
              </div>
            </div>

            {/* Modal Tabs Header: Two Rows (Matches Screenshots 4 & 5) */}
            <div style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              {/* Row 1 (Right to Left in RTL): رئيسي | المستخدمون | الايقونات | متقدم | أجهزة الاستشعار | الصيانة */}
              <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
                {[
                  { id: "main", label: "رئيسي", labelEn: "Main" },
                  { id: "users", label: "المستخدمون", labelEn: "Users" },
                  { id: "icons", label: "الايقونات", labelEn: "Icons" },
                  { id: "advanced", label: "متقدم", labelEn: "Advanced" },
                  { id: "sensors", label: "أجهزة الاستشعار", labelEn: "Sensors" },
                  { id: "maintenance", label: "الصيانة", labelEn: "Maintenance" }
                ].map(tab => {
                  const isActive = deviceModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDeviceModalTab(tab.id)}
                      style={{
                        flex: 1,
                        padding: "9px 6px",
                        border: "none",
                        background: isActive ? "#ffffff" : "transparent",
                        color: isActive ? "#00b4c6" : "#64748b",
                        borderBottom: isActive ? "2.5px solid #00b4c6" : "2.5px solid transparent",
                        fontSize: "0.8rem",
                        fontWeight: isActive ? "700" : "500",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {lang === "ar" ? tab.label : tab.labelEn}
                    </button>
                  );
                })}
              </div>

              {/* Row 2 (Right to Left in RTL): دقة | ذيل | كاميرات */}
              <div style={{ display: "flex" }}>
                {[
                  { id: "accuracy", label: "دقة", labelEn: "Accuracy" },
                  { id: "tail", label: "ذيل", labelEn: "Tail" },
                  { id: "cameras", label: "كاميرات", labelEn: "Cameras" }
                ].map(tab => {
                  const isActive = deviceModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDeviceModalTab(tab.id)}
                      style={{
                        flex: 1,
                        padding: "9px 6px",
                        border: "none",
                        background: isActive ? "#ffffff" : "transparent",
                        color: isActive ? "#00b4c6" : "#64748b",
                        borderBottom: isActive ? "2.5px solid #00b4c6" : "2.5px solid transparent",
                        fontSize: "0.8rem",
                        fontWeight: isActive ? "700" : "500",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {lang === "ar" ? tab.label : tab.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveDevice} style={{ padding: "24px 28px" }}>
              
              {/* TAB 1: رئيسي (Screenshot 4) */}
              {deviceModalTab === "main" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* فعال Checkbox */}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#1e293b", cursor: "pointer" }}>
                    <input 
                      type="checkbox"
                      checked={deviceForm.active}
                      onChange={(e) => setDeviceForm({ ...deviceForm, active: e.target.checked })}
                      style={{ accentColor: "#00b4c6", width: "16px", height: "16px" }}
                    />
                    <span>{lang === "ar" ? "فعال" : "Active"}</span>
                  </label>

                  {/* الاسم * */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      <span style={{ color: "#ef4444" }}>* </span>
                      {lang === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "...إدراج الاسم" : "Enter name..."}
                      value={deviceForm.name}
                      onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* IMEI * */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      <span style={{ color: "#ef4444" }}>* </span>
                      {lang === "ar" ? "IMEI" : "IMEI"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "...إدراج imei" : "Enter IMEI..."}
                      value={deviceForm.imei}
                      onChange={(e) => setDeviceForm({ ...deviceForm, imei: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem",
                        fontFamily: "monospace",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* تاريخ انتهاء الصلاحية */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      {lang === "ar" ? "تاريخ انتهاء الصلاحية" : "Expiration Date"}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          disabled={deviceForm.noExpiration}
                          placeholder={lang === "ar" ? "...يختار تاريخ انتهاء الصلاحية" : "Select expiration date..."}
                          value={deviceForm.expiresAt}
                          onChange={(e) => setDeviceForm({ ...deviceForm, expiresAt: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            paddingInlineStart: "32px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            fontSize: "0.85rem",
                            background: deviceForm.noExpiration ? "#f3f4f6" : "#ffffff",
                            outline: "none"
                          }}
                        />
                        <Calendar size={16} color="#9ca3af" style={{ position: "absolute", left: lang === "ar" ? "10px" : "auto", right: lang === "ar" ? "auto" : "10px" }} />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#4b5563", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={deviceForm.noExpiration}
                          onChange={(e) => setDeviceForm({ ...deviceForm, noExpiration: e.target.checked })}
                          style={{ accentColor: "#00b4c6" }}
                        />
                        <span>{lang === "ar" ? "غير محدود" : "Unlimited"}</span>
                      </label>
                    </div>
                  </div>

                  {/* تفعيل جهاز GPS */}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#374151", cursor: "pointer", marginTop: "4px" }}>
                    <input 
                      type="checkbox"
                      checked={deviceForm.activateGps}
                      onChange={(e) => setDeviceForm({ ...deviceForm, activateGps: e.target.checked })}
                      style={{ accentColor: "#00b4c6", width: "15px", height: "15px" }}
                    />
                    <span>{lang === "ar" ? "تفعيل جهاز GPS" : "Activate GPS Device"}</span>
                  </label>
                </div>
              )}

              {/* TAB 7: دقة (Matches Screenshot 5) */}
              {deviceModalTab === "accuracy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Checkbox: تحقق من صحة الموقف */}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: "700", color: "#1e293b", cursor: "pointer" }}>
                    <input 
                      type="checkbox"
                      checked={deviceForm.validateSpeedAvg}
                      onChange={(e) => setDeviceForm({ ...deviceForm, validateSpeedAvg: e.target.checked })}
                      style={{ accentColor: "#00b4c6", width: "16px", height: "16px" }}
                    />
                    <span>{lang === "ar" ? "تحقق من صحة الموقف من متوسط السرعة" : "Validate position from average speed"}</span>
                  </label>

                  {/* Row 1: أقل سرعة للتحرك + السرعة القصوى */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "أقل سرعة للتحرك بالكيلومتر في الساعة" : "Minimum moving speed (km/h)"}
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type="number"
                          value={deviceForm.minSpeedKmh}
                          onChange={(e) => setDeviceForm({ ...deviceForm, minSpeedKmh: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setDeviceForm({ ...deviceForm, minSpeedKmh: "" })}
                          style={{ position: "absolute", left: lang === "ar" ? "8px" : "auto", right: lang === "ar" ? "auto" : "8px", background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "السرعة القصوى" : "Maximum speed"}
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="number"
                          placeholder={lang === "ar" ? "...إدراج السرعة القصوى" : "Enter max speed..."}
                          value={deviceForm.maxSpeedKmh}
                          onChange={(e) => setDeviceForm({ ...deviceForm, maxSpeedKmh: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                        <input type="checkbox" style={{ accentColor: "#00b4c6" }} />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: سرقة الوقود + إعادة ملء الوقود */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "أقل فرق للوقود لكشف عن سرقة الوقود" : "Min fuel diff for theft detection"}
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type="number"
                          value={deviceForm.minFuelTheftDiff}
                          onChange={(e) => setDeviceForm({ ...deviceForm, minFuelTheftDiff: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setDeviceForm({ ...deviceForm, minFuelTheftDiff: "" })}
                          style={{ position: "absolute", left: lang === "ar" ? "8px" : "auto", right: lang === "ar" ? "auto" : "8px", background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "أقل فرق للوقود لكشف عن اعادة ملئ الوقود" : "Min fuel diff for refill detection"}
                      </label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                          type="number"
                          value={deviceForm.minFuelRefillDiff}
                          onChange={(e) => setDeviceForm({ ...deviceForm, minFuelRefillDiff: e.target.value })}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setDeviceForm({ ...deviceForm, minFuelRefillDiff: "" })}
                          style={{ position: "absolute", left: lang === "ar" ? "8px" : "auto", right: lang === "ar" ? "auto" : "8px", background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: كشف تغيير الوقود بعد التوقف */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      {lang === "ar" ? "كشف تغيير الوقود بعد التوقف" : "Detect fuel change after stop"}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={deviceForm.detectFuelAfterStop}
                        onChange={(e) => setDeviceForm({ ...deviceForm, detectFuelAfterStop: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#fff" }}
                      >
                        <option value="default">{lang === "ar" ? "...يختار كشف تغيير الوقود بعد التوقف" : "Select detect fuel after stop..."}</option>
                        <option value="enabled">{lang === "ar" ? "تفعيل الكشف التلقائي" : "Enable Auto Detection"}</option>
                        <option value="disabled">{lang === "ar" ? "تعطيل الكشف" : "Disabled"}</option>
                      </select>
                      <input type="checkbox" style={{ accentColor: "#00b4c6" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: المستخدمون (Assign to client) */}
              {deviceModalTab === "users" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151" }}>
                    {lang === "ar" ? "تعيين المركبة لعميل أسطول" : "Assign to Fleet Client"}
                  </label>
                  <select
                    value={deviceForm.clientId}
                    onChange={(e) => setDeviceForm({ ...deviceForm, clientId: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  >
                    {clients.map(cli => (
                      <option key={cli.id} value={cli.id}>{cli.name} ({cli.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* TAB 4: متقدم (Protocol & Hardware) */}
              {deviceModalTab === "advanced" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{lang === "ar" ? "بروتوكول التتبع" : "Protocol"}</label>
                      <select
                        value={deviceForm.protocol}
                        onChange={(e) => {
                          const proto = e.target.value;
                          let port = 5023;
                          if (proto === "Teltonika") port = 5027;
                          if (proto === "Coban") port = 5001;
                          setDeviceForm({ ...deviceForm, protocol: proto, protocolPort: port });
                        }}
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      >
                        <option value="GT06">GT06 / SinoTrack / Conox (Port 5023)</option>
                        <option value="Teltonika">Teltonika FMB920 (Port 5027)</option>
                        <option value="Coban">Coban GPS103 (Port 5001)</option>
                        <option value="H02">H02 Protocol (Port 5013)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{lang === "ar" ? "منفذ الاتصال Gateway" : "Port"}</label>
                      <input 
                        type="number"
                        value={deviceForm.protocolPort}
                        readOnly
                        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#f8fafc" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{lang === "ar" ? "رقم شريحة الجهاز SIM" : "SIM Card Number"}</label>
                    <input 
                      type="text"
                      placeholder="+218 91 000 0000"
                      value={deviceForm.simNumber}
                      onChange={(e) => setDeviceForm({ ...deviceForm, simNumber: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: الايقونات (Icons Selector) */}
              {deviceModalTab === "icons" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151" }}>
                    {lang === "ar" ? "اختر مظهر وأيقونة المركبة على الخريطة التفاعلية:" : "Select vehicle icon for map display:"}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
                    {[
                      { id: "car", label: "سيارة صالون", icon: "🚗" },
                      { id: "suv", label: "سيارة دفع رباعي", icon: "🚙" },
                      { id: "pickup", label: "شاحنة خفيفة", icon: "🛻" },
                      { id: "truck", label: "شاحنة نقل ثقيل", icon: "🚛" },
                      { id: "van", label: "مركبة فان / بضائع", icon: "🚐" },
                      { id: "bus", label: "حافلة ركاب", icon: "🚌" },
                      { id: "motorcycle", label: "دراجة نارية", icon: "🏍️" },
                      { id: "heavy", label: "آلية ثقيلة / جرافة", icon: "🚜" }
                    ].map(item => {
                      const isSelected = (deviceForm.icon || "car") === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setDeviceForm({ ...deviceForm, icon: item.id })}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "14px 8px",
                            borderRadius: "10px",
                            border: isSelected ? "2px solid #00b4c6" : "1px solid #e2e8f0",
                            background: isSelected ? "#e0f7fa" : "#ffffff",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          <span style={{ fontSize: "2rem" }}>{item.icon}</span>
                          <span style={{ fontSize: "0.78rem", fontWeight: isSelected ? "700" : "500", color: isSelected ? "#0891b2" : "#475569", textAlign: "center" }}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: أجهزة الاستشعار (Sensors Configuration) */}
              {deviceModalTab === "sensors" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>
                      {lang === "ar" ? "أجهزة الاستشعار المتصلة بالجهاز:" : "Connected Telematics Sensors:"}
                    </label>
                    <button
                      type="button"
                      onClick={() => alert(lang === "ar" ? "تم فتح نافذة إضافة مستشعر مخصص جديد." : "Add custom sensor modal opened.")}
                      style={{
                        background: "#00b4c6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 12px",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {lang === "ar" ? "+ إضافة مستشعر" : "+ Add Sensor"}
                    </button>
                  </div>

                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: lang === "ar" ? "right" : "left" }}>
                          <th style={{ padding: "8px 12px" }}>المستشعر</th>
                          <th style={{ padding: "8px 12px" }}>النوع</th>
                          <th style={{ padding: "8px 12px" }}>المنفذ / المعامل</th>
                          <th style={{ padding: "8px 12px" }}>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px", fontWeight: "600" }}>مفتاح الإشعال (ACC / Ignition)</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>رقمي (Digital)</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>acc / di_1</td>
                          <td style={{ padding: "8px 12px", color: "#10b981", fontWeight: "700" }}>نشط ✓</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px", fontWeight: "600" }}>مستوى خزان الوقود (Fuel Level)</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>تناظري / RS485</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>fuel_level / ai_1</td>
                          <td style={{ padding: "8px 12px", color: "#10b981", fontWeight: "700" }}>معاير (لتر) ✓</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px", fontWeight: "600" }}>جهد البطارية الخارجية (Voltage)</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>قياس الجهد</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>battery_volt</td>
                          <td style={{ padding: "8px 12px", color: "#10b981", fontWeight: "700" }}>12.6V - 28.4V ✓</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px 12px", fontWeight: "600" }}>حساس الحرارة (Temperature)</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>1-Wire Dallas</td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>temp_c</td>
                          <td style={{ padding: "8px 12px", color: "#0284c7", fontWeight: "700" }}>جاهز للربط</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: الصيانة (Maintenance & Schedules) */}
              {deviceModalTab === "maintenance" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "قراءة عداد الكيلومترات الأولي (Odometer km):" : "Initial Odometer (km):"}
                      </label>
                      <input
                        type="number"
                        value={deviceForm.odometer || 45200}
                        onChange={(e) => setDeviceForm({ ...deviceForm, odometer: Number(e.target.value) })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                        {lang === "ar" ? "ساعات تشغيل المحرك الكلية (Engine Hours):" : "Engine Work Hours:"}
                      </label>
                      <input
                        type="number"
                        value={deviceForm.engineHours || 1280}
                        onChange={(e) => setDeviceForm({ ...deviceForm, engineHours: Number(e.target.value) })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
                      {lang === "ar" ? "خطة التنبيهات الدورية المبرمجة:" : "Automated Maintenance Triggers:"}
                    </div>
                    <ul style={{ margin: 0, paddingInlineStart: "20px", fontSize: "0.8rem", color: "#475569", lineHeight: 1.8 }}>
                      <li>تغيير زيت المحرك والفلتر: <b>كل 5,000 كم</b> (تنبيه متبقي 800 كم)</li>
                      <li>فحص وتبديل الفرامل والإطارات: <b>كل 20,000 كم</b></li>
                      <li>تجديد رخصة القيادة والتأمين السنوي للمركبة: <b>تنبيه قبل 30 يوماً من الانتهاء</b></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 8: ذيل (Tail Path Customization) */}
              {deviceModalTab === "tail" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      {lang === "ar" ? "لون خط تتبع المسار الحي (Live Trail Color):" : "Live Trail Color on Map:"}
                    </label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {["#00b4c6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(c => (
                        <div
                          key={c}
                          onClick={() => setDeviceForm({ ...deviceForm, tailColor: c })}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: c,
                            cursor: "pointer",
                            boxShadow: (deviceForm.tailColor || "#00b4c6") === c ? "0 0 0 3px #ffffff, 0 0 0 5px #00b4c6" : "none",
                            transition: "transform 0.15s"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                      {lang === "ar" ? "طول ذيل المسار (عدد النقاط):" : "Trail Length (Points):"}
                    </label>
                    <select
                      value={deviceForm.tailPoints || 25}
                      onChange={(e) => setDeviceForm({ ...deviceForm, tailPoints: Number(e.target.value) })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#fff" }}
                    >
                      <option value="10">10 نقاط (ذيل قصير)</option>
                      <option value="25">25 نقطة (متوسط - الموصى به)</option>
                      <option value="50">50 نقطة (طويل)</option>
                      <option value="100">100 نقطة (مسار كامل)</option>
                    </select>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={deviceForm.pulseGlow !== false}
                      onChange={(e) => setDeviceForm({ ...deviceForm, pulseGlow: e.target.checked })}
                      style={{ accentColor: "#00b4c6", width: "16px", height: "16px" }}
                    />
                    <span>{lang === "ar" ? "تفعيل وميض الرأس الحي للمركبة أثناء الحركة (Pulse Glow)" : "Enable live pulsing glow head"}</span>
                  </label>
                </div>
              )}

              {/* TAB 9: كاميرات (Cameras & Dashcam MDVR) */}
              {deviceModalTab === "cameras" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      {lang === "ar" ? "نوع كاميرا المراقبة المتصلة:" : "Camera System Type:"}
                    </label>
                    <select
                      value={deviceForm.cameraType || "dashcam"}
                      onChange={(e) => setDeviceForm({ ...deviceForm, cameraType: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", background: "#fff" }}
                    >
                      <option value="dashcam">كاميرا داش كام 4G ذكية (Dual Channel Dashcam)</option>
                      <option value="mdvr">جهاز تسجيل فيديو رقمي للشاحنات 4-Channel MDVR</option>
                      <option value="ipcam">كاميرا شبكية IP Camera</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      {lang === "ar" ? "رابط البث المباشر (RTSP / RTMP / HTTP Stream URL):" : "Live RTSP Video Stream URL:"}
                    </label>
                    <input
                      type="text"
                      placeholder="rtsp://admin:pass@192.168.1.100:554/live/ch0"
                      value={deviceForm.cameraRtsp || ""}
                      onChange={(e) => setDeviceForm({ ...deviceForm, cameraRtsp: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", direction: "ltr" }}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={deviceForm.cameraSnapshotOnAlert !== false}
                      onChange={(e) => setDeviceForm({ ...deviceForm, cameraSnapshotOnAlert: e.target.checked })}
                      style={{ accentColor: "#00b4c6", width: "16px", height: "16px" }}
                    />
                    <span>{lang === "ar" ? "التقاط صور وحفظ مقاطع فيديو تلقائياً عند تجاوز السرعة أو التصادم" : "Auto capture snapshot on speeding and collision alerts"}</span>
                  </label>
                </div>
              )}

              {/* Modal Bottom Buttons (Screenshots 4 & 5: Placed on the physical LEFT in RTL) */}
              <div style={{
                display: "flex",
                justifyContent: "flex-end", // In RTL, flex-end aligns to the physical LEFT!
                gap: "10px",
                marginTop: "24px",
                paddingTop: "14px",
                borderTop: "1px solid #f1f5f9"
              }}>
                <button
                  type="submit"
                  style={{
                    background: "#00b4c6",
                    border: "none",
                    color: "#ffffff",
                    padding: "8px 24px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0, 180, 198, 0.25)"
                  }}
                >
                  {lang === "ar" ? "حفظ" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #00b4c6",
                    color: "#00b4c6",
                    padding: "8px 20px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SETTINGS SUB-MODAL (Branding, Email, SMS, Companies)
         ========================================================================= */}
      {activeSettingsModal && (
        <div 
          onClick={() => setActiveSettingsModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "520px",
              maxWidth: "94vw",
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <button onClick={() => setActiveSettingsModal(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
              <h3 style={{ margin: 0, fontSize: "1rem", color: "#1e293b", fontWeight: "700" }}>
                {activeSettingsModal === "branding" && (lang === "ar" ? "إعدادات المظهر والمنظومة" : "Appearance & Branding")}
                {activeSettingsModal === "email" && (lang === "ar" ? "نماذج البريد الإلكتروني" : "Email Templates")}
                {activeSettingsModal === "sms" && (lang === "ar" ? "قوالب الرسائل القصيرة SMS" : "SMS Templates")}
                {activeSettingsModal === "push" && (lang === "ar" ? "تنبيهات فورية وإشعارات" : "Push & Voice Alerts")}
                {activeSettingsModal === "companies" && (lang === "ar" ? "إدارة الشركات والمؤسسات" : "Companies Management")}
              </h3>
            </div>

            <div style={{ padding: "20px" }}>
              {activeSettingsModal === "branding" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px" }}>{lang === "ar" ? "اسم المنظومة" : "Platform Name"}</label>
                    <input 
                      type="text" 
                      value={brandingSettings.platformName} 
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, platformName: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", marginBottom: "4px" }}>{lang === "ar" ? "اللون الرئيسي" : "Primary Brand Color"}</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="color" 
                        value={brandingSettings.primaryColor} 
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                        style={{ width: "36px", height: "36px", border: "none", cursor: "pointer" }}
                      />
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{brandingSettings.primaryColor}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsModal === "email" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>خادم SMTP الصادر:</label>
                    <input type="text" defaultValue="smtp.gpswox-enterprise.com" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>البريد الإلكتروني للإرسال:</label>
                    <input type="text" defaultValue="no-reply@gpswox.com" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                  </div>
                </div>
              )}

              {activeSettingsModal === "sms" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>مزود خدمة الرسائل SMS Gateway:</label>
                    <input type="text" defaultValue="Libyana & Al-Madar Gateway (HTTP/SMPP)" style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                  </div>
                </div>
              )}

              {activeSettingsModal === "push" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>حالة الإشعارات الفورية للمتصفح:</label>
                    <span style={{ color: "#10b981", fontWeight: "700" }}>مفعلة وتعمل بنجاح (Sound FX + Web Notifications)</span>
                  </div>
                </div>
              )}

              {activeSettingsModal === "companies" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>الشركات والمؤسسات التابعة:</label>
                    <div style={{ padding: "8px 12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      1. شركة الأسطول المتكامل لنقل البضائع والمحروقات
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
                <button
                  onClick={() => {
                    soundFX.playSuccess();
                    setActiveSettingsModal(null);
                  }}
                  style={{
                    background: "#00b4c6",
                    border: "none",
                    color: "#fff",
                    padding: "8px 22px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CLIENT MODAL (Add / Edit Client Account)
         ========================================================================= */}
      {showClientModal && (
        <div 
          onClick={() => setShowClientModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
            direction: lang === "ar" ? "rtl" : "ltr"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "560px",
              maxWidth: "96vw",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              border: "1px solid #e2e8f0",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid #f1f5f9",
              background: "linear-gradient(135deg, #0b1329 0%, #1e293b 100%)",
              color: "#ffffff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(0, 180, 198, 0.2)", padding: "6px", borderRadius: "8px", color: "#00b4c6" }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: "#ffffff" }}>
                    {editingClient 
                      ? (lang === "ar" ? "تعديل بيانات العميل" : "Edit Client") 
                      : (lang === "ar" ? "إضافة عميل جديد للمنظومة" : "Add New Client")}
                  </h3>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {lang === "ar" ? "إنشاء حساب رسمي وتخصيص صلاحيات الوصول والحصص" : "Create client account and assign role & quota"}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowClientModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClient} style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* 1. نوع الحساب والصلاحية */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "نوع الحساب ومستوى الصلاحية:" : "Account Role & Access Tier:"}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
                    {[
                      { role: "company", titleAr: "شركة أسطول", titleEn: "Company", icon: "🏢" },
                      { role: "individual", titleAr: "عميل فردي", titleEn: "Individual", icon: "👤" },
                      { role: "reseller", titleAr: "موزع معتمد", titleEn: "Reseller", icon: "💼" },
                      { role: "driver", titleAr: "سائق أسطول", titleEn: "Driver", icon: "🚗" }
                    ].map(r => (
                      <div
                        key={r.role}
                        onClick={() => setClientForm({ ...clientForm, role: r.role })}
                        style={{
                          border: `1.5px solid ${clientForm.role === r.role ? "#00b4c6" : "#e2e8f0"}`,
                          background: clientForm.role === r.role ? "rgba(0, 180, 198, 0.08)" : "#f8fafc",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ fontSize: "1.1rem", marginBottom: "2px" }}>{r.icon}</div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "700", color: clientForm.role === r.role ? "#0891b2" : "#475569" }}>
                          {lang === "ar" ? r.titleAr : r.titleEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. الاسم والشركة */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "الاسم الكامل للعميل:" : "Full Name:"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: سالم القحطاني" : "e.g. John Doe"}
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "اسم الشركة أو المؤسسة:" : "Company Name:"}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "مثال: الفطيم للخدمات اللوجستية" : "Company or Fleet name"}
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* 3. البريد الإلكتروني وكلمة المرور */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "البريد الإلكتروني (لتسجيل الدخول):" : "Email Address:"} *
                    </label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      placeholder="client@domain.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "كلمة المرور:" : "Password:"}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="••••••••"
                      value={clientForm.password}
                      onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* 4. رقم الهاتف والحصة */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "رقم الهاتف للتواصل والـ SMS:" : "Phone Number:"}
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="+218 91 000 0000"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                      {lang === "ar" ? "حصة المركبات المسموح بها:" : "Vehicle Quota Limit:"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={clientForm.quota}
                      onChange={(e) => setClientForm({ ...clientForm, quota: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                {/* 5. حالة الحساب */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: "600" }}>
                    {lang === "ar" ? "حالة الحساب نشطة وفورية:" : "Account Active Status:"}
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.8rem", color: clientForm.active ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                    <input
                      type="checkbox"
                      checked={clientForm.active}
                      onChange={(e) => setClientForm({ ...clientForm, active: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#00b4c6" }}
                    />
                    <span>{clientForm.active ? (lang === "ar" ? "حساب فعال" : "Active") : (lang === "ar" ? "معلق مؤقتاً" : "Suspended")}</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #00b4c6 0%, #0891b2 100%)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 180, 198, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Check size={16} />
                  <span>{editingClient ? (lang === "ar" ? "حفظ التعديلات" : "Update Client") : (lang === "ar" ? "إنشاء وتفعيل الحساب" : "Create Client")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficialAdminPortal;
