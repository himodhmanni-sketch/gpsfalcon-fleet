import React from "react";
import { 
  X, 
  Navigation, 
  History, 
  Terminal, 
  Fuel, 
  Battery, 
  Key, 
  Gauge, 
  Thermometer, 
  Phone, 
  User, 
  MapPin, 
  Radio, 
  Signal, 
  PowerOff, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Compass,
  Zap
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function VehicleHud({
  lang,
  t,
  vehicle,
  onClose,
  isFollowing,
  onToggleFollow,
  onOpenHistory,
  onOpenCommandModal
}) {
  if (!vehicle) return null;

  const isSpeeding = vehicle.speed > vehicle.maxAllowedSpeed;
  const speedPercentage = Math.min(100, Math.round((vehicle.speed / (vehicle.maxAllowedSpeed * 1.3)) * 100));

  return (
    <div className="vehicle-hud-overlay">
      <div className="hud-card-container">
        {/* HUD Top Bar Header */}
        <div className="hud-header">
          <div className="hud-vehicle-identity">
            <div className={`hud-status-indicator ${vehicle.status}`}></div>
            <div>
              <div className="hud-vehicle-name">
                {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}
              </div>
              <div className="hud-vehicle-subinfo">
                <span className="hud-plate-tag">{vehicle.plateNumber}</span>
                <span className="hud-model-tag">{vehicle.model}</span>
              </div>
            </div>
          </div>

          <div className="hud-header-actions">
            {/* Follow mode toggle */}
            <button
              className={`hud-icon-btn ${isFollowing ? "active-following" : ""}`}
              onClick={() => {
                soundFX.playClick();
                onToggleFollow(vehicle.id);
              }}
              title={isFollowing ? "Stop Following" : "Auto-Follow on Map"}
            >
              <Navigation size={16} />
              <span className="btn-label">{isFollowing ? (lang === "ar" ? "تتبع نشط" : "Following") : t.vehicleCard.follow}</span>
            </button>

            <button
              className="hud-close-btn"
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              title="Close HUD"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Speedometer & Immediate Telemetry Banner */}
        <div className="hud-speed-gauge-section">
          {/* Radial Speed Dial */}
          <div className={`speedometer-circle ${isSpeeding ? "speeding-alarm" : ""}`}>
            <svg viewBox="0 0 100 100" className="speed-svg-gauge">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="gauge-bg-ring"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="gauge-fill-ring"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * speedPercentage) / 100}
                style={{
                  stroke: isSpeeding ? "#ef4444" : vehicle.speed > 0 ? "#10b981" : "#64748b"
                }}
              />
            </svg>
            <div className="speed-gauge-content">
              <span className="speed-value">{vehicle.speed}</span>
              <span className="speed-unit-label">{t.vehicleCard.kmh}</span>
              {isSpeeding && (
                <span className="speeding-warning-tag">
                  <AlertTriangle size={11} />
                  {lang === "ar" ? "تجاوز السرعة" : "OVERSPEED"}
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics Columns */}
          <div className="hud-metrics-column">
            {/* Ignition ACC */}
            <div className="hud-metric-row">
              <div className="metric-icon-box">
                <Key size={15} />
              </div>
              <div className="metric-details">
                <span className="metric-label">{t.vehicleCard.ignition}</span>
                <span className={`metric-val-status ${vehicle.ignition ? "acc-on" : "acc-off"}`}>
                  {vehicle.ignition ? t.vehicleCard.ignitionOn : t.vehicleCard.ignitionOff}
                </span>
              </div>
            </div>

            {/* Fuel Level */}
            <div className="hud-metric-row">
              <div className="metric-icon-box">
                <Fuel size={15} />
              </div>
              <div className="metric-details">
                <span className="metric-label">{t.vehicleCard.fuel}</span>
                <div className="fuel-bar-wrap">
                  <div 
                    className="fuel-bar-fill" 
                    style={{ 
                      width: `${vehicle.fuelLevel}%`,
                      backgroundColor: vehicle.fuelLevel < 25 ? "#ef4444" : "#3b82f6"
                    }}
                  ></div>
                </div>
                <span className="metric-value-sub">{vehicle.fuelLevel}% ({vehicle.fuelLiters}L)</span>
              </div>
            </div>

            {/* Battery Voltage */}
            <div className="hud-metric-row">
              <div className="metric-icon-box">
                <Battery size={15} />
              </div>
              <div className="metric-details">
                <span className="metric-label">{t.vehicleCard.battery}</span>
                <span className="metric-value-num">
                  {vehicle.batteryVoltage} V
                  {vehicle.batteryVoltage < 12.0 && (
                    <span className="battery-low-alert"> ({lang === "ar" ? "منخفضة" : "Low"})</span>
                  )}
                </span>
              </div>
            </div>

            {/* Reefer or Cabin Temp */}
            {vehicle.temperature !== undefined && (
              <div className="hud-metric-row">
                <div className="metric-icon-box">
                  <Thermometer size={15} />
                </div>
                <div className="metric-details">
                  <span className="metric-label">{t.vehicleCard.temp}</span>
                  <span className="metric-value-num highlight-temp">{vehicle.temperature}°C</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & GPS Info */}
        <div className="hud-location-section">
          <div className="hud-address-line">
            <MapPin size={16} className="loc-pin" />
            <span className="address-full">
              {lang === "ar" ? vehicle.address : (vehicle.addressEn || vehicle.address)}
            </span>
          </div>

          <div className="hud-coords-row">
            <span className="coords-code">
              {Number(vehicle.coords[0]).toFixed(5)}, {Number(vehicle.coords[1]).toFixed(5)}
            </span>
            <span className="satellites-tag">
              <Radio size={13} />
              {vehicle.satellites} {lang === "ar" ? "أقمار صناعية" : "Sats"}
            </span>
            <span className="gsm-tag">
              <Signal size={13} />
              {vehicle.gsmSignal}% GSM
            </span>
            <span className="last-sync-tag">
              <Clock size={13} />
              {lang === "ar" ? vehicle.lastUpdate : (vehicle.lastUpdateEn || vehicle.lastUpdate)}
            </span>
          </div>
        </div>

        {/* Driver Profile & Contact */}
        <div className="hud-driver-section">
          <div className="driver-avatar-box">
            <img src={vehicle.driver.avatar} alt={vehicle.driver.name} className="driver-img" />
            <div className="driver-score-tag" title="Safety Index Score">
              {vehicle.driver.score}%
            </div>
          </div>
          <div className="driver-meta">
            <div className="driver-title-label">{t.vehicleCard.driver}</div>
            <div className="driver-name-text">
              {lang === "ar" ? vehicle.driver.name : (vehicle.driver.nameEn || vehicle.driver.name)}
            </div>
            <a href={`tel:${vehicle.driver.phone}`} className="driver-phone-link">
              <Phone size={12} />
              <span>{vehicle.driver.phone}</span>
            </a>
          </div>

          {/* Odometer & Engine Hours */}
          <div className="driver-stats-box">
            <div className="odo-item">
              <span className="label">{t.vehicleCard.odometer}</span>
              <span className="val">{vehicle.odometer.toLocaleString()} km</span>
            </div>
            <div className="odo-item">
              <span className="label">{lang === "ar" ? "ساعات المحرك" : "Engine Hours"}</span>
              <span className="val">{vehicle.engineHours.toLocaleString()} h</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="hud-bottom-actions">
          <button
            className="hud-action-btn primary"
            onClick={() => {
              soundFX.playClick();
              onOpenHistory(vehicle);
            }}
          >
            <History size={16} />
            <span>{t.vehicleCard.routeHistory}</span>
          </button>

          <button
            className="hud-action-btn secondary"
            onClick={() => {
              soundFX.playClick();
              onOpenCommandModal(vehicle);
            }}
          >
            <Terminal size={16} />
            <span>{t.vehicleCard.sendCmd}</span>
          </button>

          <button
            className={`hud-action-btn ${vehicle.immobilized ? "danger-restore" : "danger-cut"}`}
            onClick={() => {
              soundFX.playWarning();
              onOpenCommandModal(vehicle, "immobilize");
            }}
          >
            <PowerOff size={16} />
            <span>{vehicle.immobilized ? t.vehicleCard.restoreEngine : t.vehicleCard.cutEngine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
