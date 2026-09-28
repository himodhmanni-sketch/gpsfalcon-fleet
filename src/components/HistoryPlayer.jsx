import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  X, 
  Clock, 
  Gauge, 
  MapPin, 
  Compass, 
  CheckCircle2 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function HistoryPlayer({
  lang,
  t,
  vehicle,
  onClose,
  onPlaybackUpdate,
  snapToRoads = true,
  onToggleSnapToRoads
}) {
  const route = vehicle.historyPath || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying || route.length === 0) return;

    const intervalTime = Math.max(250, 1200 / speedMultiplier);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= route.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        if (onPlaybackUpdate) {
          onPlaybackUpdate(route[next]);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, route]);

  // Initial update
  useEffect(() => {
    if (route.length > 0 && onPlaybackUpdate) {
      onPlaybackUpdate(route[0]);
    }
  }, []);

  const handlePlayPause = () => {
    soundFX.playClick();
    if (currentIndex >= route.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setCurrentIndex(val);
    if (onPlaybackUpdate && route[val]) {
      onPlaybackUpdate(route[val]);
    }
  };

  const currentPoint = route[currentIndex] || route[0] || { speed: 0, time: "--:--", lat: 0, lng: 0 };
  const progressPercent = route.length > 1 ? Math.round((currentIndex / (route.length - 1)) * 100) : 0;

  return (
    <div className="history-player-dock">
      <div className="history-player-inner">
        {/* Left Side: Vehicle Info & Close */}
        <div className="player-vehicle-info">
          <div className="player-title-row">
            <span className="live-badge-replay">REPLAY</span>
            <span className="player-vehicle-title">
              {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)}
            </span>
          </div>
          <div className="player-meta-row">
            <span className="player-plate">{vehicle.plateNumber}</span>
            <span className="player-time">
              <Clock size={12} />
              {currentPoint.time}
            </span>
          </div>
        </div>

        {/* Center Controls & Scrubber Slider */}
        <div className="player-controls-center">
          <div className="player-buttons-strip">
            <button 
              className="player-ctrl-btn" 
              onClick={() => {
                soundFX.playClick();
                setCurrentIndex(0);
                if (onPlaybackUpdate && route[0]) onPlaybackUpdate(route[0]);
              }}
              title="Reset to Start"
            >
              <RotateCcw size={15} />
            </button>

            <button 
              className={`player-ctrl-btn play-main-btn ${isPlaying ? "playing" : ""}`} 
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Speed Multiplier Pill */}
            <div className="speed-multiplier-group">
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  className={`multiplier-pill ${speedMultiplier === s ? "active" : ""}`}
                  onClick={() => {
                    soundFX.playClick();
                    setSpeedMultiplier(s);
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Road Snapping Toggle Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                if (onToggleSnapToRoads) onToggleSnapToRoads();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "16px",
                border: `1.5px solid ${snapToRoads ? "#00b4c6" : "rgba(255,255,255,0.2)"}`,
                background: snapToRoads ? "rgba(0, 180, 198, 0.22)" : "rgba(255,255,255,0.06)",
                color: snapToRoads ? "#00b4c6" : "#94a3b8",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              title={lang === "ar" ? "تفعيل/تعطيل مطابقة المسار للشوارع هندسياً" : "Toggle Road Snapping"}
            >
              <span>🛣️</span>
              <span>{lang === "ar" ? (snapToRoads ? "مطابقة الشوارع: مفعّلة" : "مسار GPS خام") : (snapToRoads ? "Road Snapped" : "Raw GPS")}</span>
            </button>
          </div>

          {/* Timeline Scrubber */}
          <div className="player-scrubber-row">
            <span className="time-endpoint">{route[0]?.time || "Start"}</span>
            <div className="slider-wrapper">
              <input
                type="range"
                min="0"
                max={Math.max(0, route.length - 1)}
                value={currentIndex}
                onChange={handleSliderChange}
                className="history-scrubber-slider"
              />
              <div 
                className="slider-track-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="time-endpoint">{route[route.length - 1]?.time || "End"}</span>
          </div>
        </div>

        {/* Right Side: Speed Meter & Close Button */}
        <div className="player-right-stats">
          <div className="playback-speed-indicator">
            <span className="p-speed-value">{currentPoint.speed}</span>
            <span className="p-speed-unit">{t.vehicleCard.kmh}</span>
          </div>

          <button 
            className="player-close-btn" 
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            title="Exit Replay"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
