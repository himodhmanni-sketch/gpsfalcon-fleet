import React from "react";
import { 
  Radio, 
  Satellite, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Globe, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  FileText, 
  Wrench,
  Activity,
  CheckCircle2,
  Clock,
  WifiOff,
  Plus,
  Server
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function Header({
  lang,
  setLang,
  theme,
  setTheme,
  t,
  vehicles,
  searchQuery,
  setSearchQuery,
  isSimulating,
  setIsSimulating,
  soundMuted,
  setSoundMuted,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenMaintenanceModal,
  onOpenAddDeviceModal,
  onOpenTraccarHubModal,
  isGatewayConnected
}) {
  const counts = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === "moving").length,
    stopped: vehicles.filter(v => v.status === "stopped").length,
    idle: vehicles.filter(v => v.status === "idle").length,
    offline: vehicles.filter(v => v.status === "offline").length,
  };

  const handleSoundToggle = () => {
    const isMuted = soundFX.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) {
      soundFX.playClick();
    }
  };

  return (
    <header className="gps-header">
      {/* Brand & Platform Status */}
      <div className="header-brand-section">
        <div className="gps-logo-badge">
          <div className="radar-ping">
            <Radio className="brand-icon pulse-glow" size={22} />
          </div>
          <div className="brand-text-container">
            <div className="brand-title" dir="ltr">
              <span className="brand-highlight">GPS</span>WOX
              <span className="brand-edition">FLEET PRO</span>
            </div>
            <div className="brand-tagline">
              <span className="live-dot-indicator"></span>
              {t.brandSubtitle}
            </div>
          </div>
        </div>

        {/* Fleet KPI Quick Pills */}
        <div className="fleet-status-pills">
          <div className="status-pill total" title={t.totalObjects}>
            <span className="pill-dot"></span>
            <span className="pill-label">{t.all}:</span>
            <span className="pill-value">{counts.total}</span>
          </div>

          <div className="status-pill moving" title={t.moving}>
            <span className="pill-dot green pulse"></span>
            <span className="pill-label">{t.moving}:</span>
            <span className="pill-value">{counts.moving}</span>
          </div>

          <div className="status-pill idle" title={t.idle}>
            <span className="pill-dot yellow"></span>
            <span className="pill-label">{t.idle}:</span>
            <span className="pill-value">{counts.idle}</span>
          </div>

          <div className="status-pill stopped" title={t.stopped}>
            <span className="pill-dot red"></span>
            <span className="pill-label">{t.stopped}:</span>
            <span className="pill-value">{counts.stopped}</span>
          </div>

          <div className="status-pill offline" title={t.offline}>
            <span className="pill-dot gray"></span>
            <span className="pill-label">{t.offline}:</span>
            <span className="pill-value">{counts.offline}</span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="header-search-container">
        <Search className="search-icon" size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="header-search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search-btn" 
            onClick={() => setSearchQuery("")}
            title="Clear"
          >
            ×
          </button>
        )}
      </div>

      {/* Quick Action & Controls */}
      <div className="header-actions-section">
        {/* Add GPS Device Button */}
        <button
          className="action-btn-pill"
          style={{ background: "linear-gradient(135deg, #2563eb, #0891b2)", color: "#fff", borderColor: "transparent", fontWeight: 700 }}
          onClick={() => {
            soundFX.playClick();
            onOpenAddDeviceModal();
          }}
          title={lang === "ar" ? "إضافة جهاز تعقب جديد (IMEI & Protocols)" : "Add New GPS Tracker Device"}
        >
          <Plus size={15} />
          <span className="btn-text">
            {lang === "ar" ? "إضافة جهاز" : "Add Device"}
          </span>
        </button>

        {/* Traccar Protocols & Commands Button */}
        <button
          className="action-btn-pill"
          style={{ 
            background: isGatewayConnected ? "rgba(16, 185, 129, 0.12)" : "var(--bg-surface-elevated)", 
            borderColor: isGatewayConnected ? "rgba(16, 185, 129, 0.4)" : "var(--border-subtle)",
            color: isGatewayConnected ? "#34d399" : "var(--text-secondary)"
          }}
          onClick={() => {
            soundFX.playClick();
            onOpenTraccarHubModal();
          }}
          title={lang === "ar" ? "محرك بروتوكولات وأوامر Traccar (المنافذ النشطة 5001-5055)" : "Traccar Protocol Engine"}
        >
          <Server size={15} />
          <span className="btn-text">
            {lang === "ar" ? "بروتوكولات Traccar" : "Traccar Hub"}
          </span>
          <span className={`stream-beacon ${isGatewayConnected ? "beacon-active" : ""}`} style={{ background: isGatewayConnected ? "var(--status-moving)" : "var(--status-stopped)" }}></span>
        </button>

        {/* Live Simulation Stream Toggle */}
        <button
          className={`action-btn-pill ${isSimulating ? "active-sim" : "paused-sim"}`}
          onClick={() => {
            soundFX.playClick();
            setIsSimulating(!isSimulating);
          }}
          title={isSimulating ? t.simulation.liveActive : t.simulation.paused}
        >
          {isSimulating ? <Pause size={15} /> : <Play size={15} />}
          <span className="btn-text">
            {isSimulating ? (lang === "ar" ? "بث حي" : "Live Feed") : (lang === "ar" ? "إيقاف مؤقت" : "Paused")}
          </span>
          <span className={`stream-beacon ${isSimulating ? "beacon-active" : ""}`}></span>
        </button>

        {/* Quick Reports Button */}
        <button
          className="action-btn-icon"
          onClick={() => {
            soundFX.playClick();
            onOpenReportModal();
          }}
          title={t.reports.title}
        >
          <FileText size={18} />
          <span className="badge-hint">{t.tabs.reports}</span>
        </button>

        {/* Maintenance Button */}
        <button
          className="action-btn-icon"
          onClick={() => {
            soundFX.playClick();
            onOpenMaintenanceModal();
          }}
          title={t.maintenance.title}
        >
          <Wrench size={18} />
          <span className="badge-hint">{t.tabs.maintenance}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          className={`action-btn-icon ${soundMuted ? "muted" : ""}`}
          onClick={handleSoundToggle}
          title={soundMuted ? "Unmute Sounds" : "Mute Sounds"}
        >
          {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Theme Toggle */}
        <button
          className="action-btn-icon"
          onClick={() => {
            soundFX.playClick();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          title="Toggle Dark/Light Mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language Switcher */}
        <button
          className="action-btn-pill lang-btn"
          onClick={() => {
            soundFX.playClick();
            const nextLang = lang === "ar" ? "en" : "ar";
            setLang(nextLang);
            document.documentElement.lang = nextLang;
            document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
          }}
          title="Switch Language / تغيير اللغة"
        >
          <Globe size={15} />
          <span className="lang-code">{lang === "ar" ? "English" : "العربية"}</span>
        </button>

        {/* User Profile Avatar */}
        <div className="user-profile-badge" title="Fleet Command Operator">
          <div className="user-avatar-circle">
            <span>OP</span>
          </div>
          <div className="user-info-text">
            <span className="user-name">{lang === "ar" ? "المشرف العام" : "Fleet Dispatcher"}</span>
            <span className="user-role">ADMIN</span>
          </div>
        </div>
      </div>
    </header>
  );
}
