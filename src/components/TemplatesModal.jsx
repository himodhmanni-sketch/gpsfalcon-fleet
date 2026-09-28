import React, { useState } from "react";
import { 
  FileCode, 
  Plus, 
  MessageSquare, 
  Mail, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  Save 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { initialNotificationTemplates, initialCommandTemplates } from "../data/mockTemplates";

export function TemplatesModal({ lang, onClose }) {
  const [activeTab, setActiveTab] = useState("notifications"); // 'notifications' | 'commands'
  const [notifTemplates, setNotifTemplates] = useState(initialNotificationTemplates);
  const [cmdTemplates, setCmdTemplates] = useState(initialCommandTemplates);
  const [copiedId, setCopiedId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "sms",
    category: "overspeed",
    subject: "",
    body: ""
  });

  const handleCopy = (id, text) => {
    soundFX.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNotif = (id) => {
    soundFX.playClick();
    setNotifTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.body) {
      alert(lang === "ar" ? "يرجى تعبئة الاسم ونص القالب" : "Please fill name and body");
      return;
    }

    const created = {
      ...newTemplate,
      id: `tpl-${Date.now()}`
    };

    setNotifTemplates(prev => [created, ...prev]);
    setShowAddModal(false);
    soundFX.playSuccess();
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom templates-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "850px", width: "95vw", height: "80vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <FileCode size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "مركز إدارة القوالب الذكية" : "Smart Templates Management"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "قوالب رسائل التنبيهات (SMS/Email) وقوالب أوامر الأجهزة المحفوظة" : "SMS/Email alert notification templates & GPRS hardware commands presets"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("notifications"); }}
          >
            <MessageSquare size={16} />
            <span>{lang === "ar" ? "قوالب الإشعارات (SMS / Email)" : "Notification Templates"}</span>
            <span className="badge-count">{notifTemplates.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "commands" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("commands"); }}
          >
            <Terminal size={16} />
            <span>{lang === "ar" ? "قوالب أوامر الأجهزة (GPRS Commands)" : "Command Templates"}</span>
            <span className="badge-count">{cmdTemplates.length}</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* TAB 1: NOTIFICATIONS TEMPLATES */}
          {activeTab === "notifications" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {lang === "ar" ? "المتغيرات المتاحة: " : "Available Variables: "}
                  <code style={{ color: "#00b4c6" }}>&#123;device_name&#125;</code>,{" "}
                  <code style={{ color: "#00b4c6" }}>&#123;speed&#125;</code>,{" "}
                  <code style={{ color: "#00b4c6" }}>&#123;address&#125;</code>,{" "}
                  <code style={{ color: "#00b4c6" }}>&#123;driver&#125;</code>,{" "}
                  <code style={{ color: "#00b4c6" }}>&#123;time&#125;</code>
                </div>

                <button 
                  onClick={() => { soundFX.playClick(); setShowAddModal(true); }}
                  style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} />
                  <span>{lang === "ar" ? "إضافة قالب جديد" : "Add Template"}</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifTemplates.map(tpl => (
                  <div key={tpl.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.9rem" }}>
                          {lang === "ar" ? tpl.name : (tpl.nameEn || tpl.name)}
                        </span>
                        <span style={{ background: tpl.type === "sms" ? "#eff6ff" : "#fef3c7", color: tpl.type === "sms" ? "#1d4ed8" : "#b45309", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "600" }}>
                          {tpl.type.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => handleCopy(tpl.id, tpl.body)}
                          style={{ border: "1px solid #d1d5db", background: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          {copiedId === tpl.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          <span>{copiedId === tpl.id ? (lang === "ar" ? "تم!" : "Copied!") : (lang === "ar" ? "نسخ" : "Copy")}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteNotif(tpl.id)}
                          style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {tpl.subject && (
                      <div style={{ fontSize: "0.78rem", color: "#4b5563" }}>
                        <strong>{lang === "ar" ? "الموضوع:" : "Subject:"}</strong> {tpl.subject}
                      </div>
                    )}

                    <div style={{ background: "#f9fafb", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", color: "#374151", whiteSpace: "pre-line", fontFamily: "var(--font-mono)" }}>
                      {tpl.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMMANDS TEMPLATES */}
          {activeTab === "commands" && (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {cmdTemplates.map(cmd => (
                  <div key={cmd.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.9rem", marginBottom: "4px" }}>
                        {lang === "ar" ? cmd.name : (cmd.nameEn || cmd.name)}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: "6px" }}>
                        {cmd.description}
                      </div>
                      <div style={{ display: "inline-block", background: "#1e293b", color: "#38bdf8", padding: "4px 10px", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {cmd.commandString}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCopy(cmd.id, cmd.commandString)}
                      style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                    >
                      {copiedId === cmd.id ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedId === cmd.id ? (lang === "ar" ? "تم النسخ" : "Copied") : (lang === "ar" ? "نسخ الأمر" : "Copy")}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ADD TEMPLATE SUB-MODAL */}
        {showAddModal && (
          <div className="modal-overlay-custom" style={{ zIndex: 100000 }}>
            <div className="modal-box-custom" style={{ maxWidth: "520px", width: "90vw" }}>
              <div className="modal-header-teal">
                <h3 className="modal-title-text">{lang === "ar" ? "إضافة قالب إشعار جديد" : "Add Notification Template"}</h3>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ padding: "18px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "اسم القالب" : "Template Name"} *</label>
                  <input 
                    type="text" 
                    required 
                    value={newTemplate.name} 
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "النوع" : "Channel"}</label>
                    <select 
                      value={newTemplate.type} 
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "التصنيف" : "Category"}</label>
                    <select 
                      value={newTemplate.category} 
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="overspeed">Overspeed</option>
                      <option value="geofence">Geofence</option>
                      <option value="security">Security</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {newTemplate.type === "email" && (
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "عنوان الرسالة (Subject)" : "Subject"}</label>
                    <input 
                      type="text" 
                      value={newTemplate.subject} 
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                )}

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "نص القالب (Message Body)" : "Message Body"} *</label>
                  <textarea 
                    rows={4}
                    required
                    value={newTemplate.body} 
                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                    placeholder="تحذير: تجاوزت المركبة {device_name} السرعة..."
                    style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }} 
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    style={{ background: "#f3f4f6", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button 
                    type="submit" 
                    style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                  >
                    {lang === "ar" ? "حفظ القالب" : "Save Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
