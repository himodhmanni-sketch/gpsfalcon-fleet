import React, { useState } from "react";
import { 
  Plus, 
  X, 
  Cpu, 
  Wifi, 
  Radio, 
  Server, 
  Key, 
  Car, 
  Truck, 
  Bus, 
  Copy, 
  Check, 
  HelpCircle,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export const TRACKER_PROTOCOLS = [
  {
    id: "teltonika",
    brand: "Teltonika",
    models: "FMB920, FMB120, FMC130, FMB003",
    protocolName: "Teltonika Code 8 / Code 8 Extended",
    defaultPort: 5027,
    packetType: "Binary TCP/UDP",
    smsConfigExample: "setparam 2004:SERVER_IP;2005:5027;2006:0",
    description: "البروتوكول الأوروبي الأكثر استخداماً للأساطيل والشاحنات والحساسات المتطورة (CAN-bus & BLE)."
  },
  {
    id: "concox",
    brand: "Concox / Jimi IoT",
    models: "GT06N, WeTrack2, VL02, JM-VG03",
    protocolName: "GT06 Protocol (Concox)",
    defaultPort: 5023,
    packetType: "Binary TCP (Header 0x78 0x78)",
    smsConfigExample: "SERVER,1,SERVER_IP,5023,0#",
    description: "البروتوكول الأكثر انتشاراً في المركبات الخاصة وسيارات الإيجار والدراجات النارية."
  },
  {
    id: "coban",
    brand: "Coban",
    models: "TK103, TK303, GPS103B",
    protocolName: "GPS103 / Coban ASCII",
    defaultPort: 5001,
    packetType: "ASCII Text TCP",
    smsConfigExample: "adminip123456 SERVER_IP 5001",
    description: "بروتوكول نصوص ASCII واسع الشهرة وسهل التكوين عبر رسائل الـ SMS."
  },
  {
    id: "sinotrack",
    brand: "SinoTrack",
    models: "ST-901, ST-906, ST-902 OBD",
    protocolName: "H02 / SinoTrack Protocol",
    defaultPort: 5013,
    packetType: "ASCII / Binary",
    smsConfigExample: "8030000 SERVER_IP 5013",
    description: "أجهزة تتبع صغيرة الحجم ومقاومة للماء مخصصة للمركبات الخفيفة والدرجات."
  },
  {
    id: "queclink",
    brand: "Queclink",
    models: "GV300, GV50, GL300",
    protocolName: "Queclink @Track Protocol",
    defaultPort: 5004,
    packetType: "ASCII TCP/UDP (+RESP:GT...)",
    smsConfigExample: "AT+GTSRI=gv300,1,,1,SERVER_IP,5004,,,0",
    description: "بروتوكول احترافي عالي الاستقرار مستخدم في كبرى شركات التأمين وإدارة المخاطر."
  }
];

export function AddDeviceModal({
  lang,
  t,
  onClose,
  onAddVehicle,
  serverIp = "gps.yourserver.com"
}) {
  const [step, setStep] = useState(1); // 1: Vehicle & Device Info, 2: Protocol & Server Configuration
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("car"); // car, truck, van, bus
  const [group, setGroup] = useState(lang === "ar" ? "أساطيل النقل السريع" : "Express Fleet");
  const [imei, setImei] = useState("");
  const [simNumber, setSimNumber] = useState("");
  const [selectedProtocolId, setSelectedProtocolId] = useState("teltonika");
  const [copiedSms, setCopiedSms] = useState(false);

  const selectedProtocol = TRACKER_PROTOCOLS.find(p => p.id === selectedProtocolId) || TRACKER_PROTOCOLS[0];

  const handleCopySms = () => {
    soundFX.playClick();
    const smsCmd = selectedProtocol.smsConfigExample.replace("SERVER_IP", serverIp);
    navigator.clipboard.writeText(smsCmd);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !imei.trim() || !plateNumber.trim()) return;

    soundFX.playAlert();

    // Random Riyadh coordinates nearby
    const baseLat = 24.7136 + (Math.random() - 0.5) * 0.08;
    const baseLng = 46.6753 + (Math.random() - 0.5) * 0.08;

    const newVehicle = {
      id: `vh-${Date.now()}`,
      imei: imei.trim(),
      protocol: selectedProtocol.id,
      protocolPort: selectedProtocol.defaultPort,
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      plateNumber: plateNumber.trim(),
      model: model.trim() || (type === "truck" ? "Heavy Truck" : "Fleet Sedan"),
      type: type,
      group: group,
      groupEn: group,
      driver: {
        name: lang === "ar" ? "سائق قيد التعيين" : "Unassigned Driver",
        nameEn: "Unassigned Driver",
        phone: simNumber || "+966 50 000 0000",
        score: 100,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces"
      },
      status: "idle",
      coords: [baseLat, baseLng],
      speed: 0,
      maxAllowedSpeed: 90,
      heading: 0,
      ignition: true,
      fuelLevel: 100,
      fuelLiters: 60,
      batteryVoltage: 13.8,
      odometer: 0,
      engineHours: 1,
      doorStatus: "closed",
      satellites: 14,
      gsmSignal: 95,
      address: lang === "ar" ? "الموقع الأولي - في انتظار إشارة GPS..." : "Initial position - awaiting GPS sync...",
      addressEn: "Initial position - awaiting GPS sync...",
      lastUpdate: lang === "ar" ? "تم الربط الآن" : "Just Connected",
      lastUpdateEn: "Just Connected",
      immobilized: false,
      historyPath: [
        { lat: baseLat, lng: baseLng, speed: 0, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ],
      pathDelta: { dLat: 0.0002, dLng: 0.0002 }
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="commands-modal-box" style={{ width: "760px" }}>
        {/* Modal Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <Cpu size={22} className="terminal-title-icon" />
            <div>
              <h3>{lang === "ar" ? "إضافة جهاز تعقب GPS ومركبة جديدة" : "Add GPS Tracker & Vehicle"}</h3>
              <p className="modal-subtitle">
                {lang === "ar" 
                  ? "ربط الجهاز بالمنظومة وتحديد بروتوكول الاتصال (TCP/UDP Gateway)" 
                  : "Connect device to server gateway via hardware protocol"}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Step Tabs Header */}
        <div className="reports-filter-strip" style={{ padding: "8px 20px" }}>
          <div className="report-tab-pills">
            <button
              type="button"
              className={`report-nav-pill ${step === 1 ? "active" : ""}`}
              onClick={() => setStep(1)}
            >
              <span>1. {lang === "ar" ? "بيانات المركبة والـ IMEI" : "Vehicle & IMEI Info"}</span>
            </button>
            <button
              type="button"
              className={`report-nav-pill ${step === 2 ? "active" : ""}`}
              onClick={() => setStep(2)}
            >
              <span>2. {lang === "ar" ? "البروتوكول وإعدادات المنفذ (Port & APN)" : "Protocol & Ports"}</span>
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
            {step === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Vehicle Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">{lang === "ar" ? "اسم أو رقم تعريف المركبة" : "Vehicle Name"} *</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: تويوتا كامري - نقل خفيف" : "e.g., Toyota Camry Fleet #12"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="gps-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{lang === "ar" ? "رقم اللوحة المرورية" : "License Plate"} *</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: ب د ر 5050" : "e.g., ABC-1234"}
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="gps-input"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">{lang === "ar" ? "نوع المركبة" : "Vehicle Type"}</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="gps-select"
                    >
                      <option value="car">{lang === "ar" ? "سيارة صالون / سيدان" : "Sedan / Car"}</option>
                      <option value="truck">{lang === "ar" ? "شاحنة نقل ثقيل" : "Heavy Truck"}</option>
                      <option value="van">{lang === "ar" ? "فان توزيع / طرود" : "Delivery Van"}</option>
                      <option value="bus">{lang === "ar" ? "حافلة ركاب" : "Passenger Bus"}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{lang === "ar" ? "المجموعة أو الأسطول" : "Fleet Group"}</label>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "مثال: أسطول الرياض المركزي" : "e.g., Central Riyadh Fleet"}
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="gps-input"
                    />
                  </div>
                </div>

                {/* GPS Hardware IMEI Section */}
                <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Smartphone size={17} color="var(--brand-primary)" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {lang === "ar" ? "معرّف جهاز التعقب الفريد (Hardware IMEI)" : "Tracker Hardware Identification"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">
                        {lang === "ar" ? "رقم الـ IMEI (15 رقم مطبوع على الجهاز)" : "IMEI Number (15 digits)"} *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={15}
                        placeholder="868120045678901"
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        className="gps-input"
                        style={{ fontFamily: "var(--font-mono)", letterSpacing: "1px" }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {lang === "ar" ? "رقم شريحة الـ SIM داخل الجهاز" : "SIM Card Phone Number"}
                      </label>
                      <input
                        type="text"
                        placeholder="+966 50 123 4567"
                        value={simNumber}
                        onChange={(e) => setSimNumber(e.target.value)}
                        className="gps-input"
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    {lang === "ar" 
                      ? "💡 الـ IMEI هو الرقم التسلسلي الذي يرسله الجهاز في بداية كل حزمة بروتوكول ليتعرف عليه الخادم تلقائياً." 
                      : "💡 IMEI is the unique hardware identifier sent in the protocol handshake packet."}
                  </p>
                </div>
              </div>
            ) : (
              /* STEP 2: PROTOCOL & PORT CONFIGURATION */
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "اختر نوع وموديل جهاز التعقب (Protocol Family):" : "Select Device Protocol Family:"}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                    {TRACKER_PROTOCOLS.map(proto => (
                      <div
                        key={proto.id}
                        onClick={() => setSelectedProtocolId(proto.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          padding: "10px",
                          borderRadius: "8px",
                          border: `1px solid ${selectedProtocolId === proto.id ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                          background: selectedProtocolId === proto.id ? "rgba(37, 99, 235, 0.12)" : "var(--bg-surface-elevated)",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            {proto.brand}
                          </span>
                          <span style={{ 
                            fontSize: "0.68rem", 
                            background: "var(--brand-primary)", 
                            color: "#fff", 
                            padding: "1px 6px", 
                            borderRadius: "4px",
                            fontFamily: "var(--font-mono)"
                          }}>
                            Port: {proto.defaultPort}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{proto.models}</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>{proto.protocolName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Server Connectivity & SMS Setup */}
                <div style={{ background: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Server size={17} color="#38bdf8" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {lang === "ar" ? "معلومات توجيه الجهاز إلى الخادم (Server Gateway)" : "Server Gateway Destination"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.75rem", marginBottom: "12px" }}>
                    <div style={{ background: "var(--input-bg)", padding: "8px 10px", borderRadius: "6px" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.65rem" }}>Server IP / Hostname:</span>
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{serverIp}</strong>
                    </div>

                    <div style={{ background: "var(--input-bg)", padding: "8px 10px", borderRadius: "6px" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.65rem" }}>Port (المنفذ):</span>
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--status-moving)" }}>
                        {selectedProtocol.defaultPort} ({selectedProtocol.packetType})
                      </strong>
                    </div>
                  </div>

                  {/* SMS Quick Config Command */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {lang === "ar" ? "أمر الرسالة النصية (SMS) لتهيئة الجهاز للاتصال بالخادم:" : "SMS Configuration Command for SIM:"}
                    </span>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#020617",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #1e293b",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.74rem",
                      color: "#38bdf8"
                    }}>
                      <span>{selectedProtocol.smsConfigExample.replace("SERVER_IP", serverIp)}</span>
                      <button
                        type="button"
                        onClick={handleCopySms}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: copiedSms ? "var(--status-moving)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {copiedSms ? <Check size={14} /> : <Copy size={14} />}
                        <span style={{ fontSize: "0.65rem" }}>{copiedSms ? (lang === "ar" ? "تم النسخ" : "Copied") : (lang === "ar" ? "نسخ" : "Copy")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer-actions" style={{ padding: "14px 20px", background: "var(--bg-surface-elevated)", borderTop: "1px solid var(--border-subtle)", margin: 0 }}>
            {step === 2 ? (
              <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                {lang === "ar" ? "السابق" : "Back"}
              </button>
            ) : (
              <button type="button" className="secondary-btn" onClick={onClose}>
                {t.commands.cancel}
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => {
                  if (!name.trim() || !imei.trim() || !plateNumber.trim()) {
                    soundFX.playWarning();
                    alert(lang === "ar" ? "يرجى تعبئة اسم المركبة، رقم اللوحة، والـ IMEI" : "Please fill in vehicle name, plate number, and IMEI");
                    return;
                  }
                  soundFX.playClick();
                  setStep(2);
                }}
              >
                <span>{lang === "ar" ? "متابعة لاختيار البروتوكول" : "Next: Protocol Setup"}</span>
              </button>
            ) : (
              <button type="submit" className="primary-action-btn">
                <Plus size={16} />
                <span>{lang === "ar" ? "حفظ وإضافة المركبة للمنظومة" : "Save & Connect Tracker"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
