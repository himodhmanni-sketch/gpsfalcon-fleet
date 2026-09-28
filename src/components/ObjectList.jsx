import React, { useState } from "react";
import { 
  Truck, 
  Car, 
  Bus, 
  MapPin, 
  Eye, 
  EyeOff, 
  Navigation, 
  History, 
  Terminal, 
  Radio, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Gauge, 
  User, 
  Key,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Battery
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function ObjectList({
  lang,
  t,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  visibleVehicleIds,
  onToggleVisibility,
  onCenterVehicle,
  onOpenHistory,
  onOpenCommandModal,
  searchQuery
}) {
  const [statusFilter, setStatusFilter] = useState("all"); // all, moving, stopped, idle, offline
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroupCollapse = (groupName) => {
    soundFX.playClick();
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    // Status filter
    if (statusFilter !== "all" && v.status !== statusFilter) return false;

    // Search query
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q) || (v.nameEn && v.nameEn.toLowerCase().includes(q));
      const matchPlate = v.plateNumber.toLowerCase().includes(q);
      const matchModel = v.model.toLowerCase().includes(q);
      const matchDriver = v.driver.name.toLowerCase().includes(q) || (v.driver.nameEn && v.driver.nameEn.toLowerCase().includes(q));
      if (!matchName && !matchPlate && !matchModel && !matchDriver) return false;
    }

    return true;
  });

  // Group by fleet
  const groupedVehicles = filteredVehicles.reduce((acc, v) => {
    const grp = lang === "ar" ? v.group : (v.groupEn || v.group);
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(v);
    return acc;
  }, {});

  const getVehicleIcon = (type) => {
    switch (type) {
      case "truck":
        return <Truck size={17} />;
      case "bus":
        return <Bus size={17} />;
      default:
        return <Car size={17} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "moving": return "status-badge-moving";
      case "idle": return "status-badge-idle";
      case "stopped": return "status-badge-stopped";
      case "offline": return "status-badge-offline";
      default: return "";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "moving": return t.moving;
      case "idle": return t.idle;
      case "stopped": return t.stopped;
      case "offline": return t.offline;
      default: return status;
    }
  };

  return (
    <div className="object-list-container">
      {/* Status Filter Buttons */}
      <div className="status-filter-bar">
        <button
          className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setStatusFilter("all"); }}
        >
          {t.all}
          <span className="count-tag">{vehicles.length}</span>
        </button>

        <button
          className={`filter-tab-btn moving ${statusFilter === "moving" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setStatusFilter("moving"); }}
        >
          <span className="dot green"></span>
          {t.moving}
          <span className="count-tag">{vehicles.filter(v => v.status === "moving").length}</span>
        </button>

        <button
          className={`filter-tab-btn idle ${statusFilter === "idle" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setStatusFilter("idle"); }}
        >
          <span className="dot yellow"></span>
          {t.idle}
          <span className="count-tag">{vehicles.filter(v => v.status === "idle").length}</span>
        </button>

        <button
          className={`filter-tab-btn stopped ${statusFilter === "stopped" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setStatusFilter("stopped"); }}
        >
          <span className="dot red"></span>
          {t.stopped}
          <span className="count-tag">{vehicles.filter(v => v.status === "stopped").length}</span>
        </button>

        <button
          className={`filter-tab-btn offline ${statusFilter === "offline" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setStatusFilter("offline"); }}
        >
          <span className="dot gray"></span>
          {t.offline}
          <span className="count-tag">{vehicles.filter(v => v.status === "offline").length}</span>
        </button>
      </div>

      {/* Fleet Groups List */}
      <div className="fleet-groups-scroll-area">
        {Object.keys(groupedVehicles).length === 0 ? (
          <div className="empty-search-state">
            <Radio size={36} className="empty-icon pulse" />
            <p>{lang === "ar" ? "لا توجد مركبات مطابقة للبحث أو التصفية" : "No vehicles matching current filter"}</p>
          </div>
        ) : (
          Object.entries(groupedVehicles).map(([groupName, groupVehicles]) => {
            const isCollapsed = collapsedGroups[groupName];
            return (
              <div key={groupName} className="fleet-group-card">
                {/* Group Accordion Header */}
                <div 
                  className="fleet-group-header"
                  onClick={() => toggleGroupCollapse(groupName)}
                >
                  <div className="group-title-row">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <span className="group-name">{groupName}</span>
                  </div>
                  <div className="group-meta-stats">
                    <span className="group-count">{groupVehicles.length}</span>
                  </div>
                </div>

                {/* Group Vehicles List */}
                {!isCollapsed && (
                  <div className="group-vehicles-list">
                    {groupVehicles.map(vehicle => {
                      const isSelected = selectedVehicleId === vehicle.id;
                      const isVisible = visibleVehicleIds.includes(vehicle.id);
                      return (
                        <div
                          key={vehicle.id}
                          className={`vehicle-card-item ${isSelected ? "selected" : ""} ${vehicle.status}`}
                          onClick={() => {
                            soundFX.playClick();
                            onSelectVehicle(vehicle.id);
                          }}
                        >
                          {/* Visibility Checkbox */}
                          <div 
                            className="vehicle-visibility-toggle"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFX.playClick();
                              onToggleVisibility(vehicle.id);
                            }}
                            title={isVisible ? "إخفاء من الخريطة" : "إظهار على الخريطة"}
                          >
                            {isVisible ? (
                              <Eye size={16} className="eye-visible" />
                            ) : (
                              <EyeOff size={16} className="eye-hidden" />
                            )}
                          </div>

                          {/* Vehicle Type Icon & Direction */}
                          <div 
                            className={`vehicle-type-bubble ${vehicle.status}`}
                            title={`Heading: ${vehicle.heading}°`}
                          >
                            {getVehicleIcon(vehicle.type)}
                            {vehicle.status === "moving" && (
                              <div 
                                className="heading-needle" 
                                style={{ transform: `rotate(${vehicle.heading}deg)` }}
                              >
                                ▲
                              </div>
                            )}
                          </div>

                          {/* Vehicle Info Details */}
                          <div className="vehicle-primary-details">
                            <div className="vehicle-name-row">
                              <span className="vehicle-title">
                                {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}
                              </span>
                              {vehicle.immobilized && (
                                <span className="immobilized-badge" title="Engine Remotely Cut">
                                  {lang === "ar" ? "محرك مفصول" : "CUT"}
                                </span>
                              )}
                            </div>

                            <div className="vehicle-sub-meta">
                              <span className="plate-badge">{vehicle.plateNumber}</span>
                              <span className="driver-name-text">
                                <User size={12} />
                                {lang === "ar" ? vehicle.driver.name : (vehicle.driver.nameEn || vehicle.driver.name)}
                              </span>
                            </div>

                            <div className="vehicle-address-row">
                              <MapPin size={11} className="pin-icon" />
                              <span className="address-text">
                                {lang === "ar" ? vehicle.address : (vehicle.addressEn || vehicle.address)}
                              </span>
                            </div>
                          </div>

                          {/* Right Side Telemetry Badges */}
                          <div className="vehicle-quick-telemetry">
                            <div className="speed-display">
                              <span className="speed-num">{vehicle.speed}</span>
                              <span className="speed-unit">{t.vehicleCard.kmh}</span>
                            </div>

                            <div className={`ignition-indicator ${vehicle.ignition ? "ign-on" : "ign-off"}`}>
                              <Key size={11} />
                              <span>{vehicle.ignition ? t.vehicleCard.ignitionOn : t.vehicleCard.ignitionOff}</span>
                            </div>

                            <div className={`status-pill-badge ${getStatusBadgeClass(vehicle.status)}`}>
                              <span className="dot"></span>
                              <span>{getStatusLabel(vehicle.status)}</span>
                            </div>
                          </div>

                          {/* Quick Action Floating Bar */}
                          <div className="vehicle-hover-actions">
                            <button
                              className="hover-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFX.playClick();
                                onCenterVehicle(vehicle);
                              }}
                              title={t.vehicleCard.follow}
                            >
                              <Navigation size={14} />
                            </button>

                            <button
                              className="hover-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFX.playClick();
                                onOpenHistory(vehicle);
                              }}
                              title={t.vehicleCard.routeHistory}
                            >
                              <History size={14} />
                            </button>

                            <button
                              className="hover-action-btn cmd-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFX.playClick();
                                onOpenCommandModal(vehicle);
                              }}
                              title={t.vehicleCard.sendCmd}
                            >
                              <Terminal size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
