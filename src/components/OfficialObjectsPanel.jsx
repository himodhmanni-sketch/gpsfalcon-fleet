import React, { useState } from "react";
import { 
  MoreVertical, 
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  SlidersHorizontal, 
  Search, 
  Check, 
  Car, 
  Truck,
  Bus,
  Bike,
  ChevronDown, 
  Send, 
  Radio, 
  Edit3, 
  History, 
  Share2, 
  CreditCard, 
  Camera, 
  Eye,
  Crosshair,
  Zap,
  Route,
  FolderTree,
  X,
  Gauge
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function OfficialObjectsPanel({
  lang,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  visibleVehicleIds,
  onToggleVisibility,
  onToggleAllVisibility,
  onOpenAddDevice,
  onOpenCommands,
  onOpenSensors,
  onOpenEditDevice,
  onOpenHistory,
  onOpenShare,
  onOpenExpenses,
  onOpenCamera,
  searchQuery,
  setSearchQuery,
  currentUser
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenuVehicleId, setOpenMenuVehicleId] = useState(null);
  const [isGroupOpen, setIsGroupOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = {
    all: vehicles.length,
    moving: vehicles.filter(v => v.status === "moving").length,
    stopped: vehicles.filter(v => v.status === "stopped").length,
    idle: vehicles.filter(v => v.status === "idle").length,
    offline: vehicles.filter(v => v.status === "offline").length
  };

  if (isCollapsed) {
    return (
      <div 
        className="floating-objects-panel" 
        style={{ 
          width: "42px", 
          cursor: "pointer", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "10px 0",
          boxShadow: "var(--gpswox-card-shadow)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}
        onClick={() => { soundFX.playClick(); setIsCollapsed(false); }}
        title={lang === "ar" ? "توسيع قائمة السيارات" : "Expand Objects Panel"}
      >
        <Navigation size={18} color="#00b4c6" />
        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#00b4c6" }}>{vehicles.length}</span>
      </div>
    );
  }

  // Filter by search query and status
  const filtered = vehicles.filter(v => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) || 
      (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
      (v.imei && v.imei.includes(q))
    );
  });

  const allVisible = vehicles.length > 0 && visibleVehicleIds.length === vehicles.length;

  const handleAction = (actionType, vehicle, e) => {
    e.stopPropagation();
    soundFX.playClick();
    setOpenMenuVehicleId(null);

    if (actionType === "center") {
      onSelectVehicle(vehicle.id);
    } else if (actionType === "command") {
      onOpenCommands(vehicle);
    } else if (actionType === "sensors") {
      onOpenSensors(vehicle);
    } else if (actionType === "edit") {
      onOpenEditDevice(vehicle);
    } else if (actionType === "history") {
      onOpenHistory(vehicle);
    } else if (actionType === "share") {
      onOpenShare(vehicle);
    } else if (actionType === "expense") {
      onOpenExpenses(vehicle);
    } else if (actionType === "camera") {
      onOpenCamera(vehicle);
    }
  };

  const renderVehicleIcon = (vehicle, isSelected) => {
    const type = (vehicle.type || "").toLowerCase();
    const color = isSelected ? "#00b4c6" : (vehicle.status === "moving" ? "#10b981" : "#64748b");
    if (type.includes("truck") || type.includes("شاحنة")) return <Truck size={16} color={color} strokeWidth={2} />;
    if (type.includes("bus") || type.includes("حافلة")) return <Bus size={16} color={color} strokeWidth={2} />;
    if (type.includes("bike") || type.includes("دراجة")) return <Bike size={16} color={color} strokeWidth={2} />;
    return <Car size={16} color={color} strokeWidth={2} />;
  };

  return (
    <div className="floating-objects-panel" onClick={() => setOpenMenuVehicleId(null)}>
      {/* Header */}
      <div className="objects-panel-header">
        <button 
          className="panel-collapse-btn" 
          title={lang === "ar" ? "طي / توسيع المجموعة" : "Toggle Group"}
          onClick={() => { soundFX.playClick(); setIsGroupOpen(!isGroupOpen); }}
        >
          <FolderTree size={16} color="#00b4c6" />
        </button>

        <div className="panel-header-title">
          <Navigation size={15} className="panel-header-icon" />
          <span>{lang === "ar" ? "السيارات والأجهزة" : "Fleet Objects"}</span>
          <span className="objects-count-badge">
            {filtered.length}/{vehicles.length}
          </span>
        </div>

        <button 
          className="panel-collapse-btn" 
          onClick={() => { soundFX.playClick(); setIsCollapsed(true); }}
          title={lang === "ar" ? "طي القائمة" : "Minimize Panel"}
        >
          {lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Actions Row: + Button, Menu Toggle, Search Input */}
      <div className="objects-actions-row">
        {currentUser?.role === "superadmin" ? (
          <button 
            className="btn-add-object-teal"
            onClick={() => {
              soundFX.playClick();
              onOpenAddDevice();
            }}
            title={lang === "ar" ? "إضافة سيارة أو جهاز تعقب جديد" : "Add New Vehicle / Tracker"}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <button 
            className="btn-add-object-teal disabled"
            onClick={() => {
              soundFX.playOverspeed();
              alert(lang === "ar" ? "إضافة أجهزة تعقب جديدة تتطلب ترخيصاً من إدارة المنظومة (Admin)." : "Adding trackers is restricted to SuperAdmin.");
            }}
            title={lang === "ar" ? "إضافة أجهزة مخصصة لمدير المنظومة فقط" : "Restricted to SuperAdmin"}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        )}

        <button 
          className="btn-menu-icon" 
          title={allVisible ? (lang === "ar" ? "إخفاء الكل من الخريطة" : "Hide All") : (lang === "ar" ? "إظهار الكل على الخريطة" : "Show All")}
          onClick={() => { soundFX.playClick(); onToggleAllVisibility(!allVisible); }}
        >
          <SlidersHorizontal size={17} strokeWidth={2} />
        </button>

        <div className="objects-search-box">
          <Search size={14} color="#9ca3af" className="search-icon" />
          <input
            type="text"
            placeholder={lang === "ar" ? "بحث بالاسم، اللوحة..." : "Search name, plate..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="objects-search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              title={lang === "ar" ? "مسح البحث" : "Clear"}
            >
              <X size={13} color="#9ca3af" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Quick Tabs */}
      <div className="objects-status-pills-row">
        {[
          { key: "all", label: lang === "ar" ? "الكل" : "All", count: counts.all, color: "#00b4c6" },
          { key: "moving", label: lang === "ar" ? "متحركة" : "Moving", count: counts.moving, color: "#10b981" },
          { key: "stopped", label: lang === "ar" ? "متوقفة" : "Stopped", count: counts.stopped, color: "#ef4444" },
          { key: "idle", label: lang === "ar" ? "خاملة" : "Idle", count: counts.idle, color: "#f59e0b" },
          { key: "offline", label: lang === "ar" ? "غير متصلة" : "Offline", count: counts.offline, color: "#9ca3af" }
        ].map(tab => (
          <button
            key={tab.key}
            className={`status-pill-btn ${statusFilter === tab.key ? "active" : ""}`}
            onClick={() => {
              soundFX.playClick();
              setStatusFilter(tab.key);
            }}
            style={{
              "--tab-color": tab.color
            }}
          >
            <span className="status-pill-dot" style={{ background: tab.color }}></span>
            <span>{tab.label}</span>
            <span className="status-pill-count">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Vehicles List Body */}
      <div className="objects-list-body">
        {/* Default Group Accordion */}
        <div 
          className="objects-group-accordion"
          onClick={() => setIsGroupOpen(!isGroupOpen)}
        >
          <div className="group-checkbox-row">
            <FolderTree size={14} color="#00b4c6" />
            <span>{lang === "ar" ? "أجهزة الأسطول (عام)" : "Fleet Objects"}</span>
            <span className="group-counter-pill">{vehicles.length}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={allVisible}
              onChange={(e) => onToggleAllVisibility(e.target.checked)}
              title={lang === "ar" ? "تحديد أو إلغاء تحديد الكل" : "Select / Deselect All"}
              style={{ accentColor: "#00b4c6", cursor: "pointer", width: "15px", height: "15px" }}
            />
            <ChevronDown size={14} color="#9ca3af" style={{ transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
          </div>
        </div>

        {/* Vehicles Items */}
        {isGroupOpen && filtered.map(vehicle => {
          const isSelected = selectedVehicleId === vehicle.id;
          const isVisible = visibleVehicleIds.includes(vehicle.id);
          const isMoving = vehicle.status === "moving";
          const isIdle = vehicle.status === "idle";

          const statusColor = isMoving ? "green" : isIdle ? "yellow" : "red";
          const speedText = `${vehicle.speed} ${lang === "ar" ? "كم/س" : "km/h"}`;
          const isMenuOpen = openMenuVehicleId === vehicle.id;

          return (
            <div
              key={vehicle.id}
              className={`vehicle-row-item ${isSelected ? "active" : ""}`}
              onClick={() => {
                soundFX.playClick();
                onSelectVehicle(vehicle.id);
              }}
              style={{ position: "relative" }}
            >
              {/* Left Side: Vehicle Type Icon with Status Glow + Speed */}
              <div className="vehicle-row-left">
                <div className={`vehicle-icon-pill ${statusColor} ${isSelected ? "selected" : ""}`}>
                  {renderVehicleIcon(vehicle, isSelected)}
                  <span className={`vehicle-status-dot ${statusColor} ${isMoving ? "pulsing" : ""}`}></span>
                </div>
              </div>

              {/* Center Details: Name, Plate Number / Type, Speed */}
              <div className="vehicle-row-center">
                <div className="vehicle-name-row">
                  <span className="vehicle-row-name">
                    {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}
                  </span>
                  {vehicle.plateNumber && (
                    <span className="vehicle-plate-pill">
                      {vehicle.plateNumber}
                    </span>
                  )}
                </div>
                <div className="vehicle-sub-row">
                  <span className={`vehicle-speed-tag ${statusColor}`}>
                    {speedText}
                  </span>
                  <span className="vehicle-time-sub">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Right Side: Quick Action Micro-Buttons & Visibility Checkbox */}
              <div className="vehicle-row-right" onClick={(e) => e.stopPropagation()}>
                <div className="vehicle-hover-actions">
                  <button
                    className="quick-action-micro-btn"
                    onClick={(e) => handleAction("center", vehicle, e)}
                    title={lang === "ar" ? "توسيط الخريطة على المركبة" : "Center Map"}
                  >
                    <Crosshair size={13} />
                  </button>
                  <button
                    className="quick-action-micro-btn"
                    onClick={(e) => handleAction("command", vehicle, e)}
                    title={lang === "ar" ? "إرسال أمر GPRS سريع" : "Send Command"}
                  >
                    <Zap size={13} />
                  </button>
                  <button
                    className="quick-action-micro-btn"
                    onClick={(e) => handleAction("history", vehicle, e)}
                    title={lang === "ar" ? "سجل الرحلات" : "Route History"}
                  >
                    <Route size={13} />
                  </button>
                  <button
                    className={`quick-action-micro-btn ${isMenuOpen ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClick();
                      setOpenMenuVehicleId(isMenuOpen ? null : vehicle.id);
                    }}
                    title={lang === "ar" ? "خيارات إضافية" : "More Actions"}
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>

                <label className="vehicle-visibility-checkbox" title={lang === "ar" ? "إظهار / إخفاء على الخريطة" : "Toggle Map Visibility"}>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => {
                      soundFX.playClick();
                      onToggleVisibility(vehicle.id);
                    }}
                  />
                  <span className="checkbox-custom-indicator"></span>
                </label>
              </div>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <div 
                  className="vehicle-context-dropdown"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "36px",
                    right: lang === "ar" ? "10px" : "auto",
                    left: lang === "ar" ? "auto" : "10px",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    border: "1px solid #e5e7eb",
                    zIndex: 1000,
                    width: "190px",
                    padding: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
                >
                  <button 
                    onClick={(e) => handleAction("center", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Eye size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "عرض على الخريطة" : "Center on Map"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("command", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Send size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "إرسال أمر GPRS" : "Send Command"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("sensors", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Radio size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "أجهزة الاستشعار" : "Sensors Setup"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("edit", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Edit3 size={13} color="#00b4c6" />
                    <span>{currentUser?.role === "superadmin" ? (lang === "ar" ? "تعديل بيانات المركبة" : "Edit Vehicle") : (lang === "ar" ? "عرض بيانات ومعلمات المركبة" : "View Vehicle Info")}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("history", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <History size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "سجل الرحلات" : "Route History"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("share", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Share2 size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "رابط مشاركة مباشر" : "Share Live Link"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("expense", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <CreditCard size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "تسجيل نفقة جديدة" : "Add Expense"}</span>
                  </button>

                  <button 
                    onClick={(e) => handleAction("camera", vehicle, e)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", fontSize: "0.78rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px", textAlign: lang === "ar" ? "right" : "left", color: "#374151" }}
                  >
                    <Camera size={13} color="#00b4c6" />
                    <span>{lang === "ar" ? "كاميرا المراقبة" : "Dashcam Stream"}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
