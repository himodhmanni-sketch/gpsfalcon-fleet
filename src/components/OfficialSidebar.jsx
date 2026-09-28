import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Truck, 
  BellRing, 
  Route, 
  BarChart3, 
  Zap, 
  Video, 
  Share2, 
  RadioTower, 
  Wrench, 
  Wallet, 
  FileCode2,
  HelpCircle,
  ChevronLeft, 
  ChevronRight, 
  User, 
  Globe2, 
  Cpu, 
  LogOut,
  Building2,
  UserCheck,
  RefreshCw,
  Car
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { getRoleBadgeInfo } from "../utils/rbac";

export function OfficialSidebar({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  onOpenAdmin,
  onOpenResellerPortal,
  onOpenFleetDrivers,
  onOpenAlerts,
  onOpenHistory,
  onOpenReports,
  onOpenCommands,
  onOpenCamera,
  onOpenShare,
  onOpenAddDevice,
  onOpenMaintenance,
  onOpenExpenses,
  onOpenTemplates,
  onOpenAccount,
  onOpenTraccarHub,
  onOpenHelp,
  currentUser,
  onLogout,
  onSwitchAccount
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = currentUser?.role || "individual";
  const isSuperAdmin = role === "superadmin";
  const isReseller = role === "reseller";
  const isCompany = role === "company";
  const isIndividual = role === "individual";
  const isDriver = role === "driver";

  const roleInfo = getRoleBadgeInfo(role, lang);

  // Dynamic menu items strictly scoped to user role & flow
  const menuItems = [
    // SuperAdmin Portal Link
    ...(isSuperAdmin ? [{ 
      id: "admin", 
      label: "لوحة الإدارة المركزية", 
      labelEn: "Central Admin Panel", 
      icon: <LayoutDashboard size={18} strokeWidth={1.8} /> 
    }] : []),

    // Reseller Management Portal
    ...(isReseller ? [{ 
      id: "reseller_portal", 
      label: "بوابة إدارة الموزع والزبائن", 
      labelEn: "Reseller & Clients Portal", 
      icon: <Building2 size={18} strokeWidth={1.8} /> 
    }] : []),

    // Company Fleet Drivers Manager
    ...(isCompany ? [{ 
      id: "fleet_drivers", 
      label: "إدارة وتفعيل السائقين", 
      labelEn: "Fleet Drivers Manager", 
      icon: <UserCheck size={18} strokeWidth={1.8} /> 
    }] : []),

    // Objects (Cars) - Label dynamically reflects context
    { 
      id: "objects", 
      label: isIndividual 
        ? "سيارتي الخاصة" 
        : (isDriver ? "مركبتي المخصصة" : "السيارات والأجهزة"), 
      labelEn: isIndividual ? "My Private Car" : (isDriver ? "My Assigned Vehicle" : "Objects"), 
      icon: isIndividual ? <Car size={18} strokeWidth={1.8} /> : <Truck size={18} strokeWidth={1.8} /> 
    },

    // Alerts
    { id: "alerts", label: "التنبيهات", labelEn: "Alerts", icon: <BellRing size={18} strokeWidth={1.8} /> },

    // History
    { id: "history", label: "سجل الرحلات", labelEn: "Trip History", icon: <Route size={18} strokeWidth={1.8} /> },

    // Reports (Not needed for driver)
    ...(!isDriver ? [{ id: "reports", label: "التقارير", labelEn: "Reports", icon: <BarChart3 size={18} strokeWidth={1.8} /> }] : []),

    // Commands (Hidden or limited for driver)
    ...(!isDriver ? [{ id: "commands", label: "إرسال الأوامر", labelEn: "Send Commands", icon: <Zap size={18} strokeWidth={1.8} /> }] : []),

    // Dashcam / Media (For superadmin, company, individual)
    ...(!isDriver ? [{ id: "camera", label: "كاميرا / ميديا", labelEn: "Camera / Media", icon: <Video size={18} strokeWidth={1.8} /> }] : []),

    // Location Sharing
    ...(!isDriver ? [{ id: "share", label: "مشاركة التتبع", labelEn: "Live Sharing", icon: <Share2 size={18} strokeWidth={1.8} /> }] : []),

    // Hardware Tracker APN (SuperAdmin & Reseller only)
    ...(isSuperAdmin || isReseller ? [{ 
      id: "activate_gps", 
      label: isReseller ? "توزيع أجهزة GPS" : "تفعيل جهاز GPS", 
      labelEn: isReseller ? "Allocate GPS Trackers" : "Activate GPS Tracker", 
      icon: <RadioTower size={18} strokeWidth={1.8} /> 
    }] : []),

    // Maintenance & Service (Not for driver)
    ...(!isDriver ? [{ id: "maintenance", label: "أعمال الصيانة", labelEn: "Maintenance", icon: <Wrench size={18} strokeWidth={1.8} /> }] : []),

    // Expenses (Not for driver)
    ...(!isDriver ? [{ id: "expenses", label: "المصاريف والوقود", labelEn: "Expenses & Fuel", icon: <Wallet size={18} strokeWidth={1.8} /> }] : []),

    // Templates
    ...(!isDriver && !isIndividual ? [{ id: "templates", label: "القوالب", labelEn: "Templates", icon: <FileCode2 size={18} strokeWidth={1.8} /> }] : []),

    // Help
    { id: "help", label: "المساعدة والدعم", labelEn: "Help & Support", icon: <HelpCircle size={18} strokeWidth={1.8} /> },
  ];

  const handleMenuClick = (itemId) => {
    soundFX.playClick();
    setActiveTab(itemId);

    if (itemId === "admin" && onOpenAdmin) onOpenAdmin();
    if (itemId === "reseller_portal" && onOpenResellerPortal) onOpenResellerPortal();
    if (itemId === "fleet_drivers" && onOpenFleetDrivers) onOpenFleetDrivers();
    if (itemId === "alerts" && onOpenAlerts) onOpenAlerts();
    if (itemId === "history" && onOpenHistory) onOpenHistory();
    if (itemId === "reports" && onOpenReports) onOpenReports();
    if (itemId === "commands" && onOpenCommands) onOpenCommands();
    if (itemId === "camera" && onOpenCamera) onOpenCamera();
    if (itemId === "share" && onOpenShare) onOpenShare();
    if (itemId === "activate_gps" && onOpenAddDevice) onOpenAddDevice();
    if (itemId === "maintenance" && onOpenMaintenance) onOpenMaintenance();
    if (itemId === "expenses" && onOpenExpenses) onOpenExpenses();
    if (itemId === "templates" && onOpenTemplates) onOpenTemplates();
    if (itemId === "help" && onOpenHelp) onOpenHelp();
  };

  return (
    <aside className={`official-gpswox-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Top Logo & Collapse Button */}
      <div className="sidebar-brand-top">
        {!isCollapsed && (
          <div className="gpswox-official-logo">
            <div className="logo-main-text">
              <span>GPS</span><span>WOX</span>
            </div>
            <div className="logo-sub-tag">
              Enterprise Fleet Platform
            </div>
          </div>
        )}

        <button 
          className="sidebar-collapse-toggle"
          onClick={() => {
            soundFX.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          title={isCollapsed ? (lang === "ar" ? "توسيع القائمة" : "Expand Sidebar") : (lang === "ar" ? "طي القائمة" : "Collapse Sidebar")}
        >
          {isCollapsed 
            ? (lang === "ar" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />) 
            : (lang === "ar" ? <ChevronRight size={14} /> : <ChevronLeft size={14} />)}
        </button>
      </div>

      {/* Navigation Menu List */}
      <div className="sidebar-menu-list">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-menu-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => handleMenuClick(item.id)}
            title={lang === "ar" ? item.label : item.labelEn}
          >
            <span className="menu-item-icon">{item.icon}</span>
            <span className="menu-item-text">{lang === "ar" ? item.label : item.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Bottom Profile & Role Section */}
      <div className="sidebar-bottom-profile">
        {/* User Account Card */}
        <div 
          className="user-account-row"
          onClick={() => { soundFX.playClick(); if (onOpenAccount) onOpenAccount(); }}
          title={lang === "ar" ? "إعدادات الحساب" : "Account Settings"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="user-avatar-circle">
              <User size={15} color="#00b4c6" />
              <span className="user-online-pip"></span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px" }}>
                <span className="user-account-email" title={currentUser?.email || "user@example.com"}>
                  {currentUser?.name || currentUser?.email || "User"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                <span className="role-pill-badge" style={{ background: roleInfo.bg, color: roleInfo.color, borderColor: `${roleInfo.color}33` }}>
                  <span>{roleInfo.icon}</span>
                  <span>{roleInfo.label}</span>
                </span>
                {currentUser?.company && (
                  <span style={{ fontSize: "0.64rem", color: "#9ca3af", maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentUser.company}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Switch Account Quick Demo Button */}
        {onSwitchAccount && (
          <button 
            className="switch-old-ver-btn"
            onClick={() => {
              soundFX.playClick();
              onSwitchAccount();
            }}
            title={lang === "ar" ? "تبديل الحساب وتجربة الصلاحيات" : "Switch Account / Test Roles"}
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.22)",
              borderRadius: "8px",
              padding: "5px 10px",
              marginBottom: "4px"
            }}
          >
            <RefreshCw size={13} color="#3b82f6" />
            <span>{lang === "ar" ? "تبديل الحساب / الأدوار" : "Switch Account Role"}</span>
          </button>
        )}

        {/* Language Selector */}
        <div 
          className="language-switch-row"
          onClick={() => {
            soundFX.playClick();
            const next = lang === "ar" ? "en" : "ar";
            setLang(next);
            document.documentElement.lang = next;
            document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Globe2 size={13} color="#6b7280" />
            <span>{lang === "ar" ? "العربية (RTL)" : "English (LTR)"}</span>
          </div>
          <span>{lang === "ar" ? "🇦🇪" : "🇬🇧"}</span>
        </div>

        {/* Traccar Engine Hub (SuperAdmin only) */}
        {isSuperAdmin && (
          <button 
            className="switch-old-ver-btn"
            onClick={onOpenTraccarHub}
            title="Open Traccar Gateway Hub"
          >
            <Cpu size={14} color="#00b4c6" />
            <span>{lang === "ar" ? "محرك بروتوكولات Traccar" : "Traccar Protocol Engine"}</span>
          </button>
        )}

        {/* Log Out */}
        <button 
          className="logout-btn-row" 
          onClick={() => {
            soundFX.playClick();
            if (onLogout) onLogout();
          }}
          title={lang === "ar" ? "تسجيل الخروج" : "Logout"}
        >
          <LogOut size={13} />
          <span>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
