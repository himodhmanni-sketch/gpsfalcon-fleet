import React, { useState } from "react";
import { 
  Radio, 
  Plus, 
  Trash2, 
  Edit2, 
  Gauge, 
  BatteryCharging, 
  Fuel, 
  Thermometer, 
  DoorClosed, 
  Key, 
  X, 
  Save, 
  CheckCircle 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { defaultSensorDefinitions } from "../data/mockSensors";

export function SensorsModal({
  lang,
  onClose,
  vehicles,
  selectedVehicleId
}) {
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || vehicles[0]?.id || "vh-01");
  const [sensors, setSensors] = useState(defaultSensorDefinitions);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "fuel",
    input: "analog2",
    unit: "L",
    formula: "val * 1"
  });

  const handleDeleteSensor = (id) => {
    soundFX.playClick();
    setSensors(prev => prev.filter(s => s.id !== id));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSensor.name) {
      alert(lang === "ar" ? "يرجى كتابة اسم المستشعر" : "Please enter sensor name");
      return;
    }

    const created = {
      ...newSensor,
      id: `sn-${Date.now()}`,
      nameEn: newSensor.name
    };

    setSensors(prev => [created, ...prev]);
    setShowAddModal(false);
    soundFX.playSuccess();
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom sensors-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "95vw", height: "80vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Radio size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "أجهزة الاستشعار ومعايرة القياسات" : "Vehicle Sensors & Telemetry Inputs"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "ضبط ومعايرة حساسات التشغيل، بطارية المركبة، مستوى خزان الوقود والحرارة" : "Configure and calibrate ignition ACC, battery, fuel level & temp sensors"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Top Vehicle Picker */}
        <div style={{ background: "#f9fafb", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{lang === "ar" ? "المركبة:" : "Vehicle:"}</span>
            <select 
              value={vehicleId} 
              onChange={(e) => setVehicleId(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", fontWeight: "600" }}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => { soundFX.playClick(); setShowAddModal(true); }}
            style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Plus size={14} />
            <span>{lang === "ar" ? "إضافة مستشعر جديد" : "Add Sensor"}</span>
          </button>
        </div>

        {/* Sensors List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sensors.map(sensor => {
              const isFuel = sensor.type === "fuel";
              const isBattery = sensor.type === "battery";
              const isAcc = sensor.type === "acc";
              const isTemp = sensor.type === "temperature";
              const isDoor = sensor.type === "door";

              return (
                <div 
                  key={sensor.id}
                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "10px", borderRadius: "8px", background: "#f0fdfa", color: "#00b4c6" }}>
                      {isFuel ? <Fuel size={18} /> : isBattery ? <BatteryCharging size={18} /> : isAcc ? <Key size={18} /> : isTemp ? <Thermometer size={18} /> : <DoorClosed size={18} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: "700", color: "#111827", fontSize: "0.9rem", marginBottom: "2px" }}>
                        {lang === "ar" ? sensor.name : (sensor.nameEn || sensor.name)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", gap: "10px" }}>
                        <span>{lang === "ar" ? "المدخل:" : "Input:"} <code style={{ color: "#0891b2" }}>{sensor.input}</code></span>
                        <span>•</span>
                        <span>{lang === "ar" ? "الوحدة:" : "Unit:"} {sensor.unit || "State"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Live Sensor Value Badge */}
                    <div style={{ textAlign: lang === "ar" ? "left" : "right" }}>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block" }}>{lang === "ar" ? "القيمة الحية" : "Live Value"}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#10b981", fontFamily: "var(--font-mono)" }}>
                        {isFuel ? "68 L (97%)" : isBattery ? `${selectedVehicle.batteryVoltage || 12.6}V` : isAcc ? (selectedVehicle.ignition ? "ON" : "OFF") : isTemp ? "-18.2 °C" : "Closed"}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDeleteSensor(sensor.id)}
                      style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                      title="Delete Sensor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADD SENSOR SUB-MODAL */}
        {showAddModal && (
          <div className="modal-overlay-custom" style={{ zIndex: 100000 }}>
            <div className="modal-box-custom" style={{ maxWidth: "480px", width: "90vw" }}>
              <div className="modal-header-teal">
                <h3 className="modal-title-text">{lang === "ar" ? "إضافة مستشعر جديد" : "Add New Sensor"}</h3>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ padding: "18px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "اسم المستشعر" : "Sensor Name"} *</label>
                  <input 
                    type="text" 
                    required 
                    value={newSensor.name} 
                    onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                    placeholder="مستشعر حرارة المبرد..."
                    style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "النوع" : "Type"}</label>
                    <select 
                      value={newSensor.type} 
                      onChange={(e) => setNewSensor({ ...newSensor, type: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="fuel">{lang === "ar" ? "وقود (Fuel)" : "Fuel"}</option>
                      <option value="acc">{lang === "ar" ? "مفتاح تشغيل (ACC)" : "Ignition ACC"}</option>
                      <option value="battery">{lang === "ar" ? "جهد بطارية (Battery)" : "Battery Voltage"}</option>
                      <option value="temperature">{lang === "ar" ? "حرارة (Temperature)" : "Temperature"}</option>
                      <option value="door">{lang === "ar" ? "أبواب (Door)" : "Door Switch"}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "منفذ الإدخال (Input Port)" : "Input Port"}</label>
                    <input 
                      type="text" 
                      value={newSensor.input} 
                      onChange={(e) => setNewSensor({ ...newSensor, input: e.target.value })}
                      placeholder="analog1"
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
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
                    {lang === "ar" ? "حفظ المستشعر" : "Save Sensor"}
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
