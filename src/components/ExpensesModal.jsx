import React, { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  Fuel, 
  Wrench, 
  ShieldCheck, 
  FileSpreadsheet, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  X, 
  Calendar, 
  Search 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function ExpensesModal({
  lang,
  onClose,
  expenses,
  setExpenses,
  vehicles
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState(() => {
    return vehicles.length === 1 ? vehicles[0].id : "all";
  });

  const filteredExpenses = expenses.filter(e => {
    // Scoped strictly to vehicles in authorized fleet
    const belongsToMyFleet = vehicles.some(v => v.id === e.vehicleId || (e.vehicleName && (v.name.includes(e.vehicleName) || e.vehicleName.includes(v.name))));
    if (!belongsToMyFleet && vehicles.length > 0) return false;
    if (filterVehicle === "all") return true;
    return e.vehicleId === filterVehicle;
  });

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalFuelLiters = filteredExpenses
    .filter(e => e.type === "fuel")
    .reduce((sum, e) => sum + Number(e.quantity || 0), 0);
  const totalFuelCost = filteredExpenses
    .filter(e => e.type === "fuel")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  
  const estimatedCostPerKm = (totalAmount / 3850).toFixed(2); // estimated per 3850km

  const handleDeleteExpense = (id) => {
    soundFX.playClick();
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newExp.amount) {
      alert(lang === "ar" ? "يرجى إدخال المبلغ" : "Please enter amount");
      return;
    }

    const v = vehicles.find(veh => veh.id === newExp.vehicleId);

    const created = {
      ...newExp,
      id: `exp-${Date.now()}`,
      vehicleName: v?.name || "Demo 24",
      amount: Number(newExp.amount),
      quantity: Number(newExp.quantity || 0),
      typeAr: newExp.type === "fuel" ? "وقود" : newExp.type === "maintenance" ? "صيانة وتصليح" : newExp.type === "insurance" ? "تأمين وترخيص" : "رسوم أخرى"
    };

    setExpenses(prev => [created, ...prev]);
    setShowAddModal(false);
    soundFX.playSuccess();
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom expenses-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "920px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <CreditCard size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "سجل نفقات الأسطول وحساب استهلاك الوقود" : "Fleet Expenses & Fuel Accounting"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "تتبع تكاليف الوقود، الصيانة، التأمين وحساب تكلفة التشغيل لكل كيلومتر" : "Track fuel, maintenance, insurance costs & cost-per-kilometer"}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* Summary KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "إجمالي النفقات المصروفة" : "Total Expenses"}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#111827", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {totalAmount.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>SAR</span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "تكلفة التشغيل لكل كيلومتر" : "Cost per Kilometer"}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#00b4c6", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {estimatedCostPerKm} <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>SAR / km</span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "إجمالي وقود الديزل/البنزين" : "Total Fuel Consumed"}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#f59e0b", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {totalFuelLiters.toFixed(1)} <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>L</span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{lang === "ar" ? "تكلفة الوقود الإجمالية" : "Total Fuel Spent"}</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#10b981", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {totalFuelCost.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>SAR</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{lang === "ar" ? "المركبة:" : "Vehicle:"}</span>
              <select 
                value={filterVehicle} 
                onChange={(e) => setFilterVehicle(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
              >
                <option value="all">{lang === "ar" ? "جميع مركبات الأسطول" : "All Vehicles"}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => { soundFX.playClick(); setShowAddModal(true); }}
              style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
            >
              <Plus size={16} />
              <span>{lang === "ar" ? "تسجيل نفقة جديدة" : "Add Expense"}</span>
            </button>
          </div>

          {/* Expenses Table */}
          <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: lang === "ar" ? "right" : "left" }}>
              <thead style={{ background: "#f9fafb", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "نوع النفقة" : "Type"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "المبلغ" : "Amount"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "الكمية" : "Qty"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "العداد" : "Odometer"}</th>
                  <th style={{ padding: "10px 14px" }}>{lang === "ar" ? "المزود / المحطة" : "Supplier"}</th>
                  <th style={{ padding: "10px 14px", textAlign: "center" }}>{lang === "ar" ? "حذف" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#6b7280" }}>
                      {exp.date}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: "600", color: "#111827" }}>
                      {exp.vehicleName}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ 
                        background: exp.type === "fuel" ? "#fffbeb" : exp.type === "maintenance" ? "#ecfeff" : "#f3f4f6",
                        color: exp.type === "fuel" ? "#d97706" : exp.type === "maintenance" ? "#0891b2" : "#4b5563",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}>
                        {lang === "ar" ? exp.typeAr : exp.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "#111827" }}>
                      {Number(exp.amount || 0).toFixed(2)} {exp.currency || 'SAR'}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {exp.quantity ? `${exp.quantity} ${exp.unit}` : "-"}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {exp.odometer ? `${exp.odometer} km` : "-"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#4b5563", fontSize: "0.8rem" }}>
                      {exp.supplier}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "5px 8px", borderRadius: "4px", cursor: "pointer" }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* ADD EXPENSE SUB-MODAL */}
        {showAddModal && (
          <div className="modal-overlay-custom" style={{ zIndex: 100000 }}>
            <div className="modal-box-custom" style={{ maxWidth: "520px", width: "90vw" }}>
              <div className="modal-header-teal">
                <h3 className="modal-title-text">{lang === "ar" ? "تسجيل نفقة جديدة للمركبة" : "Add Vehicle Expense"}</h3>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddSubmit} style={{ padding: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "المركبة" : "Vehicle"}</label>
                    <select 
                      value={newExp.vehicleId} 
                      onChange={(e) => setNewExp({ ...newExp, vehicleId: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "نوع النفقة" : "Type"}</label>
                    <select 
                      value={newExp.type} 
                      onChange={(e) => setNewExp({ ...newExp, type: e.target.value })}
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="fuel">{lang === "ar" ? "وقود (بنزين / ديزل)" : "Fuel"}</option>
                      <option value="maintenance">{lang === "ar" ? "صيانة وتصليح" : "Maintenance"}</option>
                      <option value="insurance">{lang === "ar" ? "تأمين ورخصة" : "Insurance"}</option>
                      <option value="toll">{lang === "ar" ? "رسوم طرق ومواقف" : "Tolls & Parking"}</option>
                      <option value="fine">{lang === "ar" ? "مخالفات مرورية" : "Fines"}</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "المبلغ (SAR)" : "Amount (SAR)"} *</label>
                    <input 
                      type="number" 
                      required 
                      value={newExp.amount} 
                      onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                      placeholder="150.00"
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "الكمية (لتر إن وجد)" : "Quantity (Liters)"}</label>
                    <input 
                      type="number" 
                      value={newExp.quantity} 
                      onChange={(e) => setNewExp({ ...newExp, quantity: e.target.value })}
                      placeholder="65"
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "قراءة العداد الحالية" : "Odometer (km)"}</label>
                    <input 
                      type="number" 
                      value={newExp.odometer} 
                      onChange={(e) => setNewExp({ ...newExp, odometer: e.target.value })}
                      placeholder="88500"
                      style={{ width: "100%", padding: "7px", borderRadius: "6px", border: "1px solid #d1d5db" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", marginBottom: "3px" }}>{lang === "ar" ? "المزود / المحطة" : "Supplier"}</label>
                    <input 
                      type="text" 
                      value={newExp.supplier} 
                      onChange={(e) => setNewExp({ ...newExp, supplier: e.target.value })}
                      placeholder="ساسكو Sasco"
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
                    {lang === "ar" ? "حفظ النفقة" : "Save Expense"}
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
