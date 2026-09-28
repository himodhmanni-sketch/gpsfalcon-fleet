import React, { useState } from "react";
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Mail, 
  MessageSquare, 
  Webhook, 
  X, 
  Save, 
  Sliders, 
  Clock, 
  Gauge, 
  Key, 
  BatteryWarning, 
  Fuel, 
  MapPin, 
  Check 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function AlertsModal({
  lang,
  onClose,
  events,
  setEvents,
  alertRules,
  setAlertRules,
  vehicles,
  soundMuted,
  setSoundMuted
}) {
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'rules' | 'create_rule'
  const [filterSeverity, setFilterSeverity] = useState("all");

  // New Rule State
  const [newRule, setNewRule] = useState({
    name: "",
    type: "overspeed",
    parameter: 120,
    vehicleId: "all",
    enabled: true,
    channels: {
      sound: true,
      popup: true,
      email: true,
      sms: false,
      webhook: false
    },
    email: "himodhmanni@gmail.com",
    sms: "+966501234567",
    webhookUrl: "https://api.gpswox-fleet.com/hooks/alert"
  });

  const filteredEvents = events.filter(e => {
    // Multi-tenant check: event must belong to user's authorized vehicles
    const matchesVehicle = vehicles.some(v => 
      v.id === e.deviceId || 
      v.imei === e.imei || 
      (e.vehicleName && (v.name.includes(e.vehicleName) || e.vehicleName.includes(v.name)))
    );
    if (!matchesVehicle && vehicles.length > 0) return false;
    if (filterSeverity === "all") return true;
    return e.severity === filterSeverity;
  });

  const handleToggleRule = (ruleId) => {
    soundFX.playClick();
    setAlertRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const handleDeleteRule = (ruleId) => {
    soundFX.playClick();
    setAlertRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleClearEvents = () => {
    soundFX.playClick();
    if (confirm(lang === "ar" ? "هل تريد مسح جميع سجلات التنبيهات؟" : "Clear all alerts history?")) {
      setEvents([]);
    }
  };

  const handleCreateRuleSubmit = (e) => {
    e.preventDefault();
    if (!newRule.name) {
      alert(lang === "ar" ? "يرجى كتابة اسم التنبيه" : "Please enter alert name");
      return;
    }

    const created = {
      ...newRule,
      id: `rule-${Date.now().toString().slice(-4)}`,
      nameEn: newRule.name
    };

    setAlertRules(prev => [created, ...prev]);
    setActiveTab("rules");
    soundFX.playSuccess();
    alert(lang === "ar" ? "تم حفظ قاعدة التنبيه الجديدة بنجاح!" : "Alert rule created successfully!");
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom alerts-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "900px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Bell size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "مركز التنبيهات وإدارة قواعد الأحداث" : "Alerts & Event Rules Engine"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "مراقبة فورية للسرعة، السياج الجغرافي، تشغيل المحرك وسرقة الوقود" : "Live alerts feed, overspeed, geofence breaches & sensor triggers"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Top Action Tabs */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === "feed" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("feed"); }}
          >
            <Bell size={16} />
            <span>{lang === "ar" ? "سجل التنبيهات المباشر" : "Live Alerts Feed"}</span>
            <span className="badge-count">{events.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("rules"); }}
          >
            <Sliders size={16} />
            <span>{lang === "ar" ? "قواعد التنبيهات النشطة" : "Alert Rules"}</span>
            <span className="badge-count">{alertRules.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "create_rule" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("create_rule"); }}
          >
            <Plus size={16} />
            <span>{lang === "ar" ? "إنشاء تنبيه جديد" : "Create Alert"}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* 1. LIVE ALERTS FEED */}
          {activeTab === "feed" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{lang === "ar" ? "تصفية:" : "Filter:"}</span>
                  <select 
                    value={filterSeverity} 
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.8rem" }}
                  >
                    <option value="all">{lang === "ar" ? "جميع التنبيهات" : "All Alerts"}</option>
                    <option value="critical">{lang === "ar" ? "حرجة / خطيرة" : "Critical"}</option>
                    <option value="warning">{lang === "ar" ? "تحذيرات" : "Warnings"}</option>
                    <option value="info">{lang === "ar" ? "معلوماتية" : "Info"}</option>
                  </select>

                  <button 
                    onClick={() => {
                      soundFX.playClick();
                      setSoundMuted(!soundMuted);
                    }}
                    style={{ border: "1px solid #d1d5db", background: "#fff", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "#4b5563" }}
                  >
                    {soundMuted ? <VolumeX size={14} color="#ef4444" /> : <Volume2 size={14} color="#10b981" />}
                    <span>{soundMuted ? (lang === "ar" ? "الصوت صامت" : "Sound Muted") : (lang === "ar" ? "الصوت مفعل" : "Sound On")}</span>
                  </button>
                </div>

                {events.length > 0 && (
                  <button 
                    onClick={handleClearEvents}
                    style={{ background: "#fef2f2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trash2 size={14} />
                    <span>{lang === "ar" ? "مسح السجل" : "Clear All"}</span>
                  </button>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                  <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 12px" }} />
                  <p>{lang === "ar" ? "لا توجد تنبيهات جديدة في الوقت الحالي، الأسطول يعمل بشكل سليم." : "No new alerts. All fleet objects are operating normally."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredEvents.map(evt => {
                    const isCritical = evt.severity === "critical";
                    const isWarning = evt.severity === "warning";
                    const borderColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#3b82f6";
                    const bgColor = isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#eff6ff";

                    return (
                      <div 
                        key={evt.id}
                        style={{
                          background: "#fff",
                          border: `1px solid #e5e7eb`,
                          borderInlineStart: `4px solid ${borderColor}`,
                          borderRadius: "8px",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ padding: "8px", borderRadius: "8px", background: bgColor, color: borderColor }}>
                            {isCritical ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                              <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.9rem" }}>
                                {evt.vehicleName}
                              </span>
                              <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "10px", background: bgColor, color: borderColor, fontWeight: "600" }}>
                                {isCritical ? (lang === "ar" ? "طوارئ" : "CRITICAL") : (lang === "ar" ? "تحذير" : "WARNING")}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#4b5563" }}>
                              {lang === "ar" ? evt.message : (evt.messageEn || evt.message)}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: lang === "ar" ? "left" : "right", color: "#9ca3af", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                          <Clock size={12} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: "3px" }} />
                          {lang === "ar" ? evt.time : (evt.timeEn || evt.time)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. ALERT RULES LIST */}
          {activeTab === "rules" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {lang === "ar" ? `قواعد التنبيهات المبرمجة: ${alertRules.length}` : `Configured Alert Rules: ${alertRules.length}`}
                </span>
                <button 
                  onClick={() => setActiveTab("create_rule")}
                  style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} />
                  <span>{lang === "ar" ? "إضافة قاعدة جديدة" : "Add New Rule"}</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {alertRules.map(rule => (
                  <div 
                    key={rule.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.9rem" }}>
                          {lang === "ar" ? rule.name : (rule.nameEn || rule.name)}
                        </span>
                        <span style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "0.72rem", color: "#6b7280" }}>
                          {rule.type}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280", display: "flex", gap: "12px", alignItems: "center" }}>
                        <span>
                          {lang === "ar" ? "المركبات:" : "Vehicles:"} <strong>{rule.vehicles[0] === "all" ? (lang === "ar" ? "كل الأسطول" : "All Fleet") : rule.vehicles.join(", ")}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {lang === "ar" ? "القيمة:" : "Param:"} <code style={{ color: "#0891b2" }}>{rule.parameter} {rule.unit || ""}</code>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.8rem" }}>
                        <input 
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                          style={{ accentColor: "#00b4c6", cursor: "pointer", width: "16px", height: "16px" }}
                        />
                        <span style={{ color: rule.enabled ? "#10b981" : "#9ca3af", fontWeight: "600" }}>
                          {rule.enabled ? (lang === "ar" ? "مفعل" : "Active") : (lang === "ar" ? "معطل" : "Off")}
                        </span>
                      </label>

                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                        title="Delete Rule"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CREATE RULE WIZARD */}
          {activeTab === "create_rule" && (
            <form onSubmit={handleCreateRuleSubmit} style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", color: "#111827" }}>
                {lang === "ar" ? "إعداد قاعدة تنبيه ذكية جديدة" : "New Smart Alert Configuration"}
              </h3>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                  {lang === "ar" ? "اسم التنبيه" : "Alert Name"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder={lang === "ar" ? "مثال: تجاوز السرعة 120 كم/س للمركبات" : "e.g. Overspeed alert 120 km/h"}
                  value={newRule.name} 
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                    {lang === "ar" ? "نوع الحدث / المشغل" : "Trigger Type"}
                  </label>
                  <select 
                    value={newRule.type} 
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  >
                    <option value="overspeed">{lang === "ar" ? "تجاوز السرعة (Overspeed)" : "Overspeed"}</option>
                    <option value="ignition_on">{lang === "ar" ? "تشغيل المحرك (Ignition ON)" : "Ignition ON"}</option>
                    <option value="geofence_out">{lang === "ar" ? "خروج من السياج الجغرافي" : "Geofence Exit"}</option>
                    <option value="idle_duration">{lang === "ar" ? "خمول المحرك لفترة طويلة" : "Excessive Idle"}</option>
                    <option value="power_cut">{lang === "ar" ? "قطع أو فصل بطارية المركبة" : "Power Disconnected"}</option>
                    <option value="fuel_theft">{lang === "ar" ? "اشتباه سرقة وقود (انخفاض مفاجئ)" : "Fuel Theft Drop"}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                    {lang === "ar" ? "قيمة الحد (القيمة / المدة)" : "Threshold Parameter"}
                  </label>
                  <input 
                    type="text" 
                    value={newRule.parameter} 
                    onChange={(e) => setNewRule({ ...newRule, parameter: e.target.value })}
                    placeholder="120"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px", fontWeight: "600" }}>
                  {lang === "ar" ? "المركبات المشمولة" : "Target Vehicles"}
                </label>
                <select 
                  value={newRule.vehicleId} 
                  onChange={(e) => setNewRule({ ...newRule, vehicleId: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                >
                  {vehicles.length > 1 && (
                    <option value="all">{lang === "ar" ? `جميع مركبات الأسطول (${vehicles.length} مركبة)` : `All Fleet (${vehicles.length})`}</option>
                  )}
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {lang === "ar" ? v.name : (v.nameEn || v.name)} {v.plateNumber ? `(${v.plateNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Channels */}
              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", border: "1px solid #e5e7eb", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", display: "block", marginBottom: "8px", color: "#374151" }}>
                  {lang === "ar" ? "قنوات وصول التنبيه" : "Notification Delivery Channels"}
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={newRule.channels.sound} 
                      onChange={(e) => setNewRule({ ...newRule, channels: { ...newRule.channels, sound: e.target.checked } })}
                      style={{ accentColor: "#00b4c6" }}
                    />
                    <span>{lang === "ar" ? "نغمة صوتية فورية" : "Sound Chime"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={newRule.channels.popup} 
                      onChange={(e) => setNewRule({ ...newRule, channels: { ...newRule.channels, popup: e.target.checked } })}
                      style={{ accentColor: "#00b4c6" }}
                    />
                    <span>{lang === "ar" ? "نافذة منبثقة بالنظام" : "Browser Alert"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={newRule.channels.email} 
                      onChange={(e) => setNewRule({ ...newRule, channels: { ...newRule.channels, email: e.target.checked } })}
                      style={{ accentColor: "#00b4c6" }}
                    />
                    <span>{lang === "ar" ? "إشعار بريد إلكتروني" : "Email Notification"}</span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={newRule.channels.sms} 
                      onChange={(e) => setNewRule({ ...newRule, channels: { ...newRule.channels, sms: e.target.checked } })}
                      style={{ accentColor: "#00b4c6" }}
                    />
                    <span>{lang === "ar" ? "رسالة نصية SMS" : "SMS Alert"}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setActiveTab("rules")}
                  style={{ background: "#f3f4f6", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                >
                  {lang === "ar" ? "حفظ وتفعيل التنبيه" : "Save & Activate"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
