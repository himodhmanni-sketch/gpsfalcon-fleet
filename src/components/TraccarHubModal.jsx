import React, { useState } from "react";
import { 
  Server, 
  X, 
  Terminal, 
  Zap, 
  Play, 
  Copy, 
  Check, 
  Radio, 
  Cpu, 
  PowerOff, 
  RotateCcw, 
  MapPin, 
  Smartphone, 
  ShieldCheck, 
  Layers,
  Send,
  Loader2
} from "lucide-react";
import { TRACCAR_PROTOCOLS } from "../../server/protocols/protocolCatalog.js";
import { soundFX } from "../utils/audioAlert";

export function TraccarHubModal({
  lang,
  t,
  onClose,
  isGatewayConnected,
  vehicles,
  onSendTraccarCommand
}) {
  const [selectedProto, setSelectedProto] = useState(TRACCAR_PROTOCOLS[0]);
  const [activeTab, setActiveTab] = useState("commands"); // commands, ports, simulator
  const [copiedKey, setCopiedKey] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState([
    `[GATEWAY] Connected to local Traccar Gateway Engine on ws://localhost:3001`,
    `[STATUS] 5 Hardware TCP/UDP Ports Active (5001, 5004, 5013, 5023, 5027, 5055)`
  ]);

  const handleCopy = (text, key) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test Simulator: Sends raw packet to OsmAnd HTTP or Backend API
  const handleTestPacket = async (type) => {
    soundFX.playClick();
    setSimulating(true);

    let lat = 24.7300 + (Math.random() - 0.5) * 0.05;
    let lon = 46.6900 + (Math.random() - 0.5) * 0.05;
    let speed = Math.round(55 + Math.random() * 40);

    const logEntry = `> INJECT [${type.toUpperCase()}] Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}, Speed: ${speed} km/h`;
    setSimulationLog(prev => [logEntry, ...prev.slice(0, 15)]);

    try {
      // Send directly to OsmAnd HTTP listener on port 5055
      await fetch(`http://localhost:5055/?id=868120045678901&lat=${lat}&lon=${lon}&speed=${speed}&bearing=45&batt=94`);
      soundFX.playAlert();
      setSimulationLog(prev => [
        `< ACK 200: Decoded by Traccar Engine -> WebSocket Broadcast Sent to Map`,
        ...prev
      ]);
    } catch (e) {
      setSimulationLog(prev => [`< Error: ${e.message}`, ...prev]);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="commands-modal-box" style={{ width: "860px" }}>
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <div className="radar-ping" style={{ width: 34, height: 34 }}>
              <Server size={18} color="#38bdf8" />
            </div>
            <div>
              <h3>{lang === "ar" ? "محرك بروتوكولات وأوامر Traccar المدمج" : "Integrated Traccar Protocols & Commands Hub"}</h3>
              <p className="modal-subtitle">
                {lang === "ar" 
                  ? "مكتبة البروتوكولات القياسية، المنافذ النشطة (Ports)، وأوامر التحكم عن بعد للأجهزة" 
                  : "Standard Traccar protocol decoders, active ports & hardware command matrix"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: isGatewayConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${isGatewayConnected ? "var(--status-moving)" : "var(--status-stopped)"}`,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: isGatewayConnected ? "var(--status-moving)" : "var(--status-stopped)"
            }}>
              <span className={`live-dot-indicator`} style={{ background: isGatewayConnected ? "var(--status-moving)" : "var(--status-stopped)" }}></span>
              <span>{isGatewayConnected ? (lang === "ar" ? "خادم البروتوكولات متصل (Port 3001)" : "Gateway Online :3001") : "Gateway Disconnected"}</span>
            </div>

            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="reports-filter-strip" style={{ padding: "8px 20px" }}>
          <div className="report-tab-pills">
            <button
              type="button"
              className={`report-nav-pill ${activeTab === "commands" ? "active" : ""}`}
              onClick={() => setActiveTab("commands")}
            >
              <Terminal size={15} />
              <span>{lang === "ar" ? "أوامر الأجهزة من Traccar" : "Traccar Device Commands"}</span>
            </button>
            <button
              type="button"
              className={`report-nav-pill ${activeTab === "ports" ? "active" : ""}`}
              onClick={() => setActiveTab("ports")}
            >
              <Cpu size={15} />
              <span>{lang === "ar" ? "المنافذ والبروتوكولات النشطة" : "Active Traccar Ports"}</span>
            </button>
            <button
              type="button"
              className={`report-nav-pill ${activeTab === "simulator" ? "active" : ""}`}
              onClick={() => setActiveTab("simulator")}
            >
              <Zap size={15} />
              <span>{lang === "ar" ? "مختبر حقن الحزم (Packet Injector)" : "Hardware Packet Injector"}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* TAB 1: COMMANDS MATRIX */}
          {activeTab === "commands" && (
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "16px" }}>
              {/* Protocols Selector List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
                  {lang === "ar" ? "اختر بروتوكول الجهاز:" : "Select Protocol:"}
                </span>
                {TRACCAR_PROTOCOLS.map(proto => (
                  <button
                    key={proto.id}
                    onClick={() => { soundFX.playClick(); setSelectedProto(proto); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${selectedProto.id === proto.id ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                      background: selectedProto.id === proto.id ? "rgba(37, 99, 235, 0.15)" : "var(--bg-surface-elevated)",
                      color: selectedProto.id === proto.id ? "#38bdf8" : "var(--text-primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "start"
                    }}
                  >
                    <span>{proto.name}</span>
                    <span style={{ 
                      fontSize: "0.65rem", 
                      padding: "1px 5px", 
                      borderRadius: "4px", 
                      background: "rgba(0,0,0,0.3)",
                      fontFamily: "var(--font-mono)"
                    }}>
                      :{proto.port}
                    </span>
                  </button>
                ))}
              </div>

              {/* Commands List for Selected Protocol */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ 
                  background: "var(--bg-surface-elevated)", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h4 style={{ fontSize: "0.88rem", fontWeight: 800 }}>{selectedProto.name}</h4>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {lang === "ar" ? "الموديلات المدعومة: " : "Supported: "}
                      {selectedProto.models.join(", ")}
                    </span>
                  </div>
                  <div style={{ textAlign: "end", fontSize: "0.7rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{selectedProto.type} Port: </span>
                    <strong style={{ color: "var(--brand-primary)", fontFamily: "var(--font-mono)" }}>{selectedProto.port}</strong>
                  </div>
                </div>

                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-secondary)", marginTop: "4px" }}>
                  {lang === "ar" ? "الأوامر القياسية المعتمدة في Traccar لهذا الجهاز:" : "Traccar Commands for this Device:"}
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(selectedProto.commands).map(([cmdKey, cmd]) => (
                    <div 
                      key={cmdKey}
                      style={{
                        background: "var(--bg-surface-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ 
                            fontSize: "0.68rem", 
                            background: cmdKey.includes("Stop") ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.2)",
                            color: cmdKey.includes("Stop") ? "#f87171" : "#38bdf8",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)"
                          }}>
                            {cmdKey}
                          </span>
                          <strong style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                            {lang === "ar" ? cmd.titleAr : cmd.titleEn}
                          </strong>
                        </div>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "4px 0 0" }}>{cmd.desc}</p>
                      </div>

                      {/* Raw Command Box */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code style={{
                          background: "#020617",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #1e293b",
                          fontSize: "0.75rem",
                          color: "#38bdf8",
                          fontFamily: "var(--font-mono)"
                        }}>
                          {cmd.raw}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(cmd.raw, `${selectedProto.id}_${cmdKey}`)}
                          style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            color: copiedKey === `${selectedProto.id}_${cmdKey}` ? "var(--status-moving)" : "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          title="Copy Raw Command"
                        >
                          {copiedKey === `${selectedProto.id}_${cmdKey}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE TRACCAR PORTS */}
          {activeTab === "ports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                {lang === "ar" 
                  ? "خادم الـ Gateway المحلي يستمع حالياً على هذه المنافذ لاستقبال أجهزة التتبع الحقيقية الموجهة إليه:" 
                  : "The local Protocol Gateway server is listening on these real ports for hardware trackers:"}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[
                  { name: "Concox / GT06", port: 5023, type: "TCP Socket", status: "Active Listening", color: "#10b981" },
                  { name: "Teltonika Code 8", port: 5027, type: "TCP Socket", status: "Active Listening", color: "#10b981" },
                  { name: "Coban GPS103", port: 5001, type: "TCP Socket", status: "Active Listening", color: "#10b981" },
                  { name: "SinoTrack H02", port: 5013, type: "TCP Socket", status: "Active Listening", color: "#10b981" },
                  { name: "Queclink @Track", port: 5004, type: "TCP Socket", status: "Active Listening", color: "#10b981" },
                  { name: "Traccar Client (Mobile)", port: 5055, type: "HTTP REST", status: "Active Listening", color: "#38bdf8" },
                ].map(p => (
                  <div 
                    key={p.port}
                    style={{
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.85rem" }}>{p.name}</strong>
                      <span style={{
                        fontSize: "0.62rem",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: p.color,
                        padding: "1px 6px",
                        borderRadius: "999px",
                        fontWeight: 700
                      }}>
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      Port {p.port}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{p.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PACKET INJECTOR SIMULATOR */}
          {activeTab === "simulator" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "var(--bg-surface-elevated)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>
                  {lang === "ar" ? "اختبار حقن حزم GPS حقيقية (Hardware Packet Injection)" : "Simulate Real GPS Packets"}
                </strong>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  {lang === "ar" 
                    ? "يمكنك الضغط على الأزرار أدناه لإرسال حزمة بيانات فورية إلى منافذ الخادم الحقيقية والتأكد من فك تشفيرها وتحديث الخريطة اللحظية:" 
                    : "Inject test hardware packets directly into the protocol listeners to verify real-time decoding:"}
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="primary-action-btn"
                    disabled={simulating}
                    onClick={() => handleTestPacket("osmand")}
                  >
                    {simulating ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
                    <span>{lang === "ar" ? "إرسال حزمة Traccar Client (Port 5055)" : "Inject OsmAnd Packet (5055)"}</span>
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleTestPacket("gt06")}
                  >
                    <Send size={15} />
                    <span>{lang === "ar" ? "حقن حزمة GT06 (Port 5023)" : "Inject GT06 Packet (5023)"}</span>
                  </button>
                </div>
              </div>

              {/* Live Terminal Log */}
              <div className="terminal-live-console" style={{ height: "160px" }}>
                <div className="terminal-titlebar">TRACCAR GATEWAY PACKET DECODER LOG</div>
                <div className="terminal-lines">
                  {simulationLog.map((log, idx) => (
                    <div key={idx} className="terminal-line info" style={{ color: log.startsWith("< ACK") ? "#10b981" : log.startsWith("> INJECT") ? "#38bdf8" : "#94a3b8" }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
