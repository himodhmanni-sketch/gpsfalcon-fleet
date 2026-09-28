import React, { useState } from "react";
import { 
  Truck, 
  Bell, 
  History, 
  Map as MapIcon, 
  Wrench, 
  BarChart2, 
  Cpu, 
  Plus, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  MapPin, 
  Play, 
  Calendar,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { ObjectList } from "./ObjectList";
import { soundFX } from "../utils/audioAlert";

export function Sidebar({
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
  searchQuery,
  events,
  setEvents,
  geofences,
  onSelectGeofence,
  onOpenNewGeofence,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onStartRoutePlayback
}) {
  const unreadAlerts = events.filter(e => !e.read).length;

  // History Tab Form State
  const [historyVehicleId, setHistoryVehicleId] = useState(vehicles[0]?.id || "");
  const [historyFromDate, setHistoryFromDate] = useState("2026-09-25T08:00");
  const [historyToDate, setHistoryToDate] = useState("2026-09-25T13:30");

  const handleMarkAllRead = () => {
    soundFX.playClick();
    setEvents(prev => prev.map(e => ({ ...e, read: true })));
  };

  const handleStartHistory = () => {
    const v = vehicles.find(item => item.id === historyVehicleId);
    if (v) {
      soundFX.playClick();
      onStartRoutePlayback(v);
    }
  };

  return (
    <aside className={`gps-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Top Tab Bar Navigation */}
      <div className="sidebar-tab-navigation">
        <button
          className={`sidebar-nav-item ${activeTab === "objects" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setActiveTab("objects"); }}
          title={t.tabs.objects}
        >
          <Truck size={18} />
          <span className="tab-label">{t.tabs.objects}</span>
          <span className="badge-count">{vehicles.length}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === "events" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setActiveTab("events"); }}
          title={t.tabs.events}
        >
          <Bell size={18} />
          <span className="tab-label">{t.tabs.events}</span>
          {unreadAlerts > 0 && <span className="badge-alert-count pulse">{unreadAlerts}</span>}
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setActiveTab("history"); }}
          title={t.tabs.history}
        >
          <History size={18} />
          <span className="tab-label">{t.tabs.history}</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === "geofences" ? "active" : ""}`}
          onClick={() => { soundFX.playClick(); setActiveTab("geofences"); }}
          title={t.tabs.geofences}
        >
          <MapIcon size={18} />
          <span className="tab-label">{t.tabs.geofences}</span>
          <span className="badge-count">{geofences.length}</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="sidebar-content-body">
        {/* TAB 1: OBJECTS (VEHICLES) */}
        {activeTab === "objects" && (
          <ObjectList
            lang={lang}
            t={t}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            visibleVehicleIds={visibleVehicleIds}
            onToggleVisibility={onToggleVisibility}
            onCenterVehicle={onCenterVehicle}
            onOpenHistory={onOpenHistory}
            onOpenCommandModal={onOpenCommandModal}
            searchQuery={searchQuery}
          />
        )}

        {/* TAB 2: ALERTS & EVENTS */}
        {activeTab === "events" && (
          <div className="events-tab-container">
            <div className="events-tab-header">
              <div className="events-header-title">
                <Bell size={16} />
                <span>{lang === "ar" ? "سجل الأحداث والتنبيهات المباشرة" : "Live Alert Log"}</span>
              </div>
              {unreadAlerts > 0 && (
                <button className="mark-read-btn" onClick={handleMarkAllRead}>
                  <CheckCheck size={14} />
                  <span>{lang === "ar" ? "تعيين الكل كمقروء" : "Mark read"}</span>
                </button>
              )}
            </div>

            <div className="events-list-scroll">
              {events.map(evt => {
                const getEventIcon = () => {
                  if (evt.severity === "critical") return <ShieldAlert size={17} className="critical-icon" />;
                  if (evt.severity === "warning") return <AlertTriangle size={17} className="warning-icon" />;
                  return <Info size={17} className="info-icon" />;
                };

                return (
                  <div
                    key={evt.id}
                    className={`event-item-card ${evt.severity} ${!evt.read ? "unread" : ""}`}
                    onClick={() => {
                      soundFX.playClick();
                      // Mark read & center on event position
                      setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, read: true } : e));
                      if (evt.coords) {
                        onCenterVehicle({ coords: evt.coords, name: evt.vehicleName });
                      }
                    }}
                  >
                    <div className="event-icon-box">
                      {getEventIcon()}
                    </div>
                    <div className="event-info-box">
                      <div className="event-target-vehicle">{evt.vehicleName}</div>
                      <div className="event-message-text">
                        {lang === "ar" ? evt.message : (evt.messageEn || evt.message)}
                      </div>
                      <div className="event-timestamp">
                        <Clock size={11} />
                        <span>{lang === "ar" ? evt.time : (evt.timeEn || evt.time)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: HISTORY PLAYBACK CONTROLLER */}
        {activeTab === "history" && (
          <div className="history-tab-container">
            <div className="history-tab-header">
              <History size={18} />
              <span>{t.history.title}</span>
            </div>

            <div className="history-form-box">
              <div className="form-group">
                <label className="form-label">{t.history.selectVehicle}</label>
                <select
                  value={historyVehicleId}
                  onChange={(e) => setHistoryVehicleId(e.target.value)}
                  className="gps-select"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {lang === "ar" ? v.name : (v.nameEn || v.name)} ({v.plateNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-dates">
                <div className="form-group">
                  <label className="form-label">{t.history.from}</label>
                  <input
                    type="datetime-local"
                    value={historyFromDate}
                    onChange={(e) => setHistoryFromDate(e.target.value)}
                    className="gps-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.history.to}</label>
                  <input
                    type="datetime-local"
                    value={historyToDate}
                    onChange={(e) => setHistoryToDate(e.target.value)}
                    className="gps-input"
                  />
                </div>
              </div>

              <button className="primary-action-btn" onClick={handleStartHistory}>
                <Play size={16} />
                <span>{t.history.loadRoute}</span>
              </button>
            </div>

            {/* Quick Trip Statistics Preview */}
            <div className="trip-stats-preview-card">
              <div className="preview-stat-item">
                <span className="stat-label">{t.history.totalDistance}:</span>
                <span className="stat-val highlight">48.6 كم</span>
              </div>
              <div className="preview-stat-item">
                <span className="stat-label">{t.history.maxSpeed}:</span>
                <span className="stat-val">112 كم/س</span>
              </div>
              <div className="preview-stat-item">
                <span className="stat-label">{t.history.stopsCount}:</span>
                <span className="stat-val">3 توقفات</span>
              </div>
              <div className="preview-stat-item">
                <span className="stat-label">{t.history.movingDuration}:</span>
                <span className="stat-val">1h 45m</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GEOFENCES */}
        {activeTab === "geofences" && (
          <div className="geofences-tab-container">
            <div className="geofences-tab-header">
              <div className="geofence-title-row">
                <MapIcon size={16} />
                <span>{t.geofence.title}</span>
              </div>
              <button className="add-geofence-btn" onClick={onOpenNewGeofence}>
                <Plus size={15} />
                <span>{t.geofence.create}</span>
              </button>
            </div>

            <div className="geofences-list-scroll">
              {geofences.map(zone => (
                <div
                  key={zone.id}
                  className="geofence-item-card"
                  onClick={() => {
                    soundFX.playClick();
                    onSelectGeofence(zone);
                  }}
                >
                  <div 
                    className="geofence-color-marker" 
                    style={{ backgroundColor: zone.color }}
                  ></div>
                  <div className="geofence-info">
                    <div className="geofence-name">
                      {lang === "ar" ? zone.name : (zone.nameEn || zone.name)}
                    </div>
                    <div className="geofence-meta">
                      <span className="type-tag">{zone.type === "circle" ? (lang === "ar" ? "دائري" : "Circle") : "Polygon"} ({zone.radius}m)</span>
                      <span className="active-tag">{zone.activeVehicles} {lang === "ar" ? "مركبات بالداخل" : "inside"}</span>
                    </div>
                    {zone.description && (
                      <div className="geofence-desc">{zone.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Collapse / Expand Tab Toggle */}
      <button 
        className="sidebar-collapse-handle"
        onClick={() => {
          soundFX.playClick();
          setIsCollapsed(!isCollapsed);
        }}
        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
      >
        {isCollapsed ? (lang === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />) : (lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
      </button>
    </aside>
  );
}
