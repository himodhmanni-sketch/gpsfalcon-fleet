import React, { useState } from "react";
import { 
  Wrench, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  Check 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function MaintenanceModal({
  lang,
  t,
  vehicles,
  onClose
}) {
  const [maintenanceRecords, setMaintenanceRecords] = useState(() => {
    if (!vehicles || vehicles.length === 0) return [];
    return vehicles.slice(0, 5).map((v, idx) => {
      const odo = Math.round(v.odometer || 45000);
      const nextDue = odo + 5000 - (odo % 5000);
      const diff = nextDue - odo;
      const status = diff < 500 ? "due_soon" : "ok";
      return {
        id: `mnt-${v.id}-${idx}`,
        vehicleId: v.id,
        vehicleName: `${lang === "ar" ? v.name : (v.nameEn || v.name)} (${v.plateNumber || v.id.slice(-4)})`,
        task: idx % 2 === 0 
          ? (lang === "ar" ? "تغيير زيت المحرك وفلتر الوقود الأصلي" : "Engine Oil & Fuel Filter Replacement")
          : (lang === "ar" ? "فحص الفرامل وضغط الإطارات الدورية" : "Periodic Brake & Tire Pressure Inspection"),
        dueKm: `${nextDue.toLocaleString()} km`,
        currentKm: `${odo.toLocaleString()} km`,
        status: status,
        dueDate: "2026-10-20",
        costEstimate: idx % 2 === 0 ? "850 SAR" : "420 SAR"
      };
    });
  });

  const handleCompleteService = (recordId) => {
    soundFX.playAlert();
    setMaintenanceRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: "ok",
          task: rec.task + (lang === "ar" ? " (تمت الصيانة بنجاح)" : " (Completed)")
        };
      }
      return rec;
    }));
  };

  const getStatusBadge = (status) => {
    if (status === "overdue") {
      return (
        <span className="mnt-badge overdue">
          <AlertTriangle size={13} />
          {t.maintenance.statusOverdue}
        </span>
      );
    }
    if (status === "due_soon") {
      return (
        <span className="mnt-badge due-soon">
          <Clock size={13} />
          {t.maintenance.statusDueSoon}
        </span>
      );
    }
    return (
      <span className="mnt-badge ok">
        <CheckCircle2 size={13} />
        {t.maintenance.statusOk}
      </span>
    );
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="maintenance-modal-box">
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <Wrench size={22} className="mnt-title-icon" />
            <div>
              <h3>{t.maintenance.title}</h3>
              <p className="modal-subtitle">
                {lang === "ar" ? "متابعة جداول الصيانة الدورية وتنبيهات الكيلومترات للأساطيل" : "Manage scheduled fleet maintenance and service intervals"}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Maintenance Cards List */}
        <div className="maintenance-records-list">
          {maintenanceRecords.map(item => (
            <div key={item.id} className={`maintenance-record-card ${item.status}`}>
              <div className="mnt-card-left">
                <div className="mnt-vehicle-title">{item.vehicleName}</div>
                <div className="mnt-task-title">{item.task}</div>
                <div className="mnt-meta-grid">
                  <div className="mnt-meta-cell">
                    <span className="meta-lbl">{lang === "ar" ? "الكيلومتر المستحق" : "Due Km"}:</span>
                    <span className="meta-val">{item.dueKm}</span>
                  </div>
                  <div className="mnt-meta-cell">
                    <span className="meta-lbl">{lang === "ar" ? "العداد الفعلي" : "Current Km"}:</span>
                    <span className="meta-val">{item.currentKm}</span>
                  </div>
                  <div className="mnt-meta-cell">
                    <span className="meta-lbl">{lang === "ar" ? "تاريخ الاستحقاق" : "Due Date"}:</span>
                    <span className="meta-val">{item.dueDate}</span>
                  </div>
                  <div className="mnt-meta-cell">
                    <span className="meta-lbl">{lang === "ar" ? "التكلفة التقديرية" : "Est Cost"}:</span>
                    <span className="meta-val">{item.costEstimate}</span>
                  </div>
                </div>
              </div>

              <div className="mnt-card-right">
                {getStatusBadge(item.status)}
                {item.status !== "ok" && (
                  <button 
                    className="complete-service-btn"
                    onClick={() => handleCompleteService(item.id)}
                  >
                    <Check size={14} />
                    <span>{lang === "ar" ? "تسجيل الإنجاز" : "Mark Done"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
