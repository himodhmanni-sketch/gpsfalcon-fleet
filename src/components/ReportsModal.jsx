import React, { useState, useMemo } from "react";
import { 
  FileText, 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Fuel, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  Car
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function ReportsModal({
  lang,
  t,
  vehicles = [],
  onClose
}) {
  const [activeReportTab, setActiveReportTab] = useState("trips"); // trips, fuel, speed, idle
  
  // If user has only 1 vehicle, default to that exact vehicle instead of "all"
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    return vehicles.length === 1 ? vehicles[0].id : "all";
  });
  
  const [dateRange, setDateRange] = useState("today");

  const reportTabs = [
    { id: "trips", label: t.reports.tripsReport, icon: <TrendingUp size={16} /> },
    { id: "fuel", label: t.reports.fuelReport, icon: <Fuel size={16} /> },
    { id: "speed", label: t.reports.speedReport, icon: <AlertTriangle size={16} /> },
    { id: "idle", label: t.reports.idleReport, icon: <Clock size={16} /> },
  ];

  // Dynamically compute report rows scoped strictly to authorized vehicles
  const targetVehicles = useMemo(() => {
    if (selectedVehicle === "all") {
      return vehicles;
    }
    const found = vehicles.filter(v => v.id === selectedVehicle);
    return found.length > 0 ? found : vehicles;
  }, [vehicles, selectedVehicle]);

  // Dynamic Trips Data
  const dynamicTripsData = useMemo(() => {
    return targetVehicles.map(v => {
      const dist = ((v.odometer % 300) + 45.2).toFixed(1);
      const fuel = ((v.odometer % 300) * 0.18 + 8.4).toFixed(1);
      return {
        id: v.id,
        vehicle: `${lang === "ar" ? v.name : (v.nameEn || v.name)} (${v.plateNumber || v.id.slice(-4)})`,
        distance: `${dist} km`,
        distanceNum: parseFloat(dist),
        time: `${Math.floor(dist / 40) + 1}h ${(dist % 50).toFixed(0)}m`,
        maxSpeed: `${v.speed > 0 ? Math.max(v.speed + 15, 80) : 75} km/h`,
        avgSpeed: `${Math.round((v.speed || 50) * 0.75)} km/h`,
        fuel: `${fuel} L`,
        fuelNum: parseFloat(fuel),
        stops: Math.floor((v.odometer % 10) + 2)
      };
    });
  }, [targetVehicles, lang]);

  // Dynamic Fuel Data
  const dynamicFuelData = useMemo(() => {
    return targetVehicles.map(v => {
      const consumed = ((v.odometer % 200) * 0.15 + 12).toFixed(1);
      return {
        id: v.id,
        vehicle: lang === "ar" ? v.name : (v.nameEn || v.name),
        plate: v.plateNumber || "—",
        startFuel: `${Math.min(100, (v.fuelLevel || 75) + 18)}%`,
        endFuel: `${v.fuelLevel || 60}%`,
        consumed: `${consumed} L`,
        consumedNum: parseFloat(consumed),
        efficiency: `${((v.odometer % 5) + 6.2).toFixed(1)} km/L`,
        cost: `${(consumed * 2.2).toFixed(2)} SAR`,
        theftAlert: (v.fuelLevel || 50) < 30 ? (lang === "ar" ? "اشتباه انخفاض مفاجئ (-12L)" : "Sudden drop suspected") : (lang === "ar" ? "طبيعي وسليم" : "Normal")
      };
    });
  }, [targetVehicles, lang]);

  // Dynamic Speed & Safety Data
  const dynamicSpeedData = useMemo(() => {
    return targetVehicles.map(v => {
      const overspeed = v.speed > (v.maxAllowedSpeed || 80) ? 2 : (v.status === "moving" && v.speed > 75 ? 1 : 0);
      const score = v.driver?.score || 94;
      return {
        id: v.id,
        vehicle: lang === "ar" ? v.name : (v.nameEn || v.name),
        driver: v.driver?.name || (lang === "ar" ? "سائق معتمد" : "Assigned Driver"),
        overspeedCount: overspeed,
        topSpeed: `${Math.max(v.speed || 0, 78)} km/h`,
        duration: overspeed > 0 ? "45s" : "0s",
        safetyScore: `${score}%`,
        penalty: overspeed > 1 ? (lang === "ar" ? "تنبيه سرعة زائدة" : "Overspeed notice") : (lang === "ar" ? "لا يوجد مخالفات" : "Clean record")
      };
    });
  }, [targetVehicles, lang]);

  // Dynamic KPI Aggregations
  const totalDistance = dynamicTripsData.reduce((acc, row) => acc + (row.distanceNum || 0), 0).toFixed(1);
  const totalFuel = dynamicFuelData.reduce((acc, row) => acc + (row.consumedNum || 0), 0).toFixed(1);
  const totalOverspeed = dynamicSpeedData.reduce((acc, row) => acc + (row.overspeedCount || 0), 0);
  const avgSafetyScore = targetVehicles.length > 0
    ? (targetVehicles.reduce((acc, v) => acc + (v.driver?.score || 94), 0) / targetVehicles.length).toFixed(1)
    : 95.0;

  // Export to CSV Function
  const handleExportCSV = () => {
    soundFX.playAlert();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReportTab === "trips") {
      csvContent += "Vehicle,Distance,Duration,MaxSpeed,AvgSpeed,Fuel,Stops\n";
      dynamicTripsData.forEach(row => {
        csvContent += `"${row.vehicle}","${row.distance}","${row.time}","${row.maxSpeed}","${row.avgSpeed}","${row.fuel}","${row.stops}"\n`;
      });
    } else if (activeReportTab === "fuel") {
      csvContent += "Vehicle,StartFuel,EndFuel,Consumed,Efficiency,EstCost,Alert\n";
      dynamicFuelData.forEach(row => {
        csvContent += `"${row.vehicle}","${row.startFuel}","${row.endFuel}","${row.consumed}","${row.efficiency}","${row.cost}","${row.theftAlert}"\n`;
      });
    } else {
      csvContent += "Vehicle,Driver,OverspeedCount,TopSpeed,Duration,SafetyScore\n";
      dynamicSpeedData.forEach(row => {
        csvContent += `"${row.vehicle}","${row.driver}","${row.overspeedCount}","${row.topSpeed}","${row.duration}","${row.safetyScore}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GPSWOX_${activeReportTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="reports-modal-box">
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <FileText size={22} className="reports-title-icon" />
            <div>
              <h3>{t.reports.title}</h3>
              <p className="modal-subtitle">
                {vehicles.length === 1 
                  ? (lang === "ar" ? `تحليلات وتقارير خاصة بمركبتك: ${vehicles[0].name}` : `Reports for your vehicle: ${vehicles[0].name}`)
                  : (lang === "ar" ? `تحليلات الأداء والوقود لأسطولك المعتمد (${vehicles.length} مركبة)` : `Fleet performance & fuel reporting (${vehicles.length} vehicles)`)}
              </p>
            </div>
          </div>
          <div className="reports-top-actions">
            <button className="export-action-btn" onClick={handleExportCSV}>
              <Download size={15} />
              <span>{t.reports.exportExcel}</span>
            </button>
            <button className="export-action-btn secondary" onClick={handlePrint}>
              <Printer size={15} />
              <span>{t.reports.print}</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="reports-filter-strip">
          <div className="report-tab-pills">
            {reportTabs.map(tab => (
              <button
                key={tab.id}
                className={`report-nav-pill ${activeReportTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  soundFX.playClick();
                  setActiveReportTab(tab.id);
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="report-dropdowns-group">
            {/* If user has ONLY 1 vehicle, show locked badge or single-vehicle select */}
            {vehicles.length === 1 ? (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: "700"
              }}>
                <Car size={14} color="#16a34a" />
                <span>{lang === "ar" ? vehicles[0].name : (vehicles[0].nameEn || vehicles[0].name)}</span>
              </div>
            ) : (
              <select 
                value={selectedVehicle} 
                onChange={(e) => {
                  soundFX.playClick();
                  setSelectedVehicle(e.target.value);
                }}
                className="gps-select sm"
                style={{ fontWeight: "600" }}
              >
                <option value="all">{lang === "ar" ? `كافة الأسطول المصرح (${vehicles.length} مركبة)` : `All Authorized Fleet (${vehicles.length})`}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {lang === "ar" ? v.name : (v.nameEn || v.name)} {v.plateNumber ? `(${v.plateNumber})` : ""}
                  </option>
                ))}
              </select>
            )}

            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="gps-select sm"
            >
              <option value="today">{lang === "ar" ? "اليوم" : "Today"}</option>
              <option value="yesterday">{lang === "ar" ? "أمس" : "Yesterday"}</option>
              <option value="last7">{lang === "ar" ? "آخر 7 أيام" : "Last 7 Days"}</option>
              <option value="month">{lang === "ar" ? "الشهر الحالي" : "This Month"}</option>
            </select>
          </div>
        </div>

        {/* Dynamic Summary KPI Cards */}
        <div className="reports-kpi-summary-grid">
          <div className="kpi-card">
            <span className="kpi-label">{lang === "ar" ? "إجمالي الكيلومترات" : "Total Distance"}</span>
            <span className="kpi-value highlight-blue">{totalDistance} كم</span>
            <span className="kpi-sub">
              {targetVehicles.length === 1 
                ? (lang === "ar" ? "مركبتك الخاصة" : "1 vehicle selected") 
                : `${targetVehicles.length} ${lang === "ar" ? "مركبات مدرجة في التقرير" : "vehicles in report"}`}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">{lang === "ar" ? "إجمالي استهلاك الوقود" : "Total Fuel Burn"}</span>
            <span className="kpi-value highlight-amber">{totalFuel} لتر</span>
            <span className="kpi-sub">{lang === "ar" ? "معدل تشغيل كفؤ" : "Efficient consumption"}</span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">{lang === "ar" ? "تجاوزات السرعة المسجلة" : "Overspeed Incidents"}</span>
            <span className="kpi-value highlight-red">{totalOverspeed} {lang === "ar" ? "حوادث" : "incidents"}</span>
            <span className="kpi-sub">
              {totalOverspeed === 0 
                ? (lang === "ar" ? "✓ التزام تام بحدود السرعة" : "Zero infractions") 
                : (lang === "ar" ? "متابعة فورية مطلوبة" : "Review needed")}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">{lang === "ar" ? "معدل السلامة والأمان" : "Safety Score"}</span>
            <span className="kpi-value highlight-green">{avgSafetyScore}%</span>
            <span className="kpi-sub">{lang === "ar" ? "تصنيف: ممتاز ومطابق للمواصفات" : "Gold Standard"}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="reports-table-scroll-area">
          {activeReportTab === "trips" && (
            <table className="gps-data-table">
              <thead>
                <tr>
                  <th>{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                  <th>{lang === "ar" ? "المسافة" : "Distance"}</th>
                  <th>{lang === "ar" ? "المدة" : "Duration"}</th>
                  <th>{lang === "ar" ? "السرعة القصوى" : "Max Speed"}</th>
                  <th>{lang === "ar" ? "متوسط السرعة" : "Avg Speed"}</th>
                  <th>{lang === "ar" ? "الوقود التقريبي" : "Est. Fuel"}</th>
                  <th>{lang === "ar" ? "محطات التوقف" : "Stops"}</th>
                </tr>
              </thead>
              <tbody>
                {dynamicTripsData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      {lang === "ar" ? "لا توجد بيانات رحلات لهذه المركبة في هذه الفترة" : "No trip data found"}
                    </td>
                  </tr>
                ) : (
                  dynamicTripsData.map((row) => (
                    <tr key={row.id}>
                      <td className="font-semibold text-teal">{row.vehicle}</td>
                      <td>{row.distance}</td>
                      <td>{row.time}</td>
                      <td>{row.maxSpeed}</td>
                      <td>{row.avgSpeed}</td>
                      <td>{row.fuel}</td>
                      <td><span className="badge-pill">{row.stops}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReportTab === "fuel" && (
            <table className="gps-data-table">
              <thead>
                <tr>
                  <th>{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                  <th>{lang === "ar" ? "الوقود عند البدء" : "Start Fuel"}</th>
                  <th>{lang === "ar" ? "الوقود الحالي" : "End Fuel"}</th>
                  <th>{lang === "ar" ? "المحروق" : "Consumed"}</th>
                  <th>{lang === "ar" ? "المعدل" : "Efficiency"}</th>
                  <th>{lang === "ar" ? "التكلفة التقديرية" : "Est. Cost"}</th>
                  <th>{lang === "ar" ? "تنبيه سرقة أو تهريب" : "Theft Detection"}</th>
                </tr>
              </thead>
              <tbody>
                {dynamicFuelData.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold">{row.vehicle} {row.plate !== "—" ? `(${row.plate})` : ""}</td>
                    <td>{row.startFuel}</td>
                    <td>{row.endFuel}</td>
                    <td className="text-amber font-semibold">{row.consumed}</td>
                    <td>{row.efficiency}</td>
                    <td>{row.cost}</td>
                    <td>
                      <span className={`status-badge-inline ${row.theftAlert.includes("انخفاض") ? "alert" : "safe"}`}>
                        {row.theftAlert}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === "speed" && (
            <table className="gps-data-table">
              <thead>
                <tr>
                  <th>{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                  <th>{lang === "ar" ? "السائق" : "Driver"}</th>
                  <th>{lang === "ar" ? "مرات تجاوز السرعة" : "Overspeed Count"}</th>
                  <th>{lang === "ar" ? "أعلى سرعة" : "Top Speed"}</th>
                  <th>{lang === "ar" ? "المدة الإجمالية للتجاوز" : "Violation Time"}</th>
                  <th>{lang === "ar" ? "معدل السلامة" : "Safety Score"}</th>
                  <th>{lang === "ar" ? "الإجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {dynamicSpeedData.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold">{row.vehicle}</td>
                    <td>{row.driver}</td>
                    <td>
                      <span className={`badge-pill ${row.overspeedCount > 0 ? "danger" : "success"}`}>
                        {row.overspeedCount}
                      </span>
                    </td>
                    <td className="text-red font-semibold">{row.topSpeed}</td>
                    <td>{row.duration}</td>
                    <td className="text-green font-semibold">{row.safetyScore}</td>
                    <td>{row.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportTab === "idle" && (
            <table className="gps-data-table">
              <thead>
                <tr>
                  <th>{lang === "ar" ? "المركبة" : "Vehicle"}</th>
                  <th>{lang === "ar" ? "حالة المحرك" : "Engine State"}</th>
                  <th>{lang === "ar" ? "مدة الوقوف مع تشغيل المحرك" : "Idling Duration"}</th>
                  <th>{lang === "ar" ? "الوقود المهدر" : "Wasted Fuel"}</th>
                  <th>{lang === "ar" ? "الموقع الأخير" : "Last Location"}</th>
                </tr>
              </thead>
              <tbody>
                {targetVehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-semibold">{lang === "ar" ? v.name : (v.nameEn || v.name)}</td>
                    <td>
                      <span className={`badge-pill ${v.ignition ? "warning" : "muted"}`}>
                        {v.ignition ? (lang === "ar" ? "تشغيل (Idle)" : "Idling") : (lang === "ar" ? "مطفأ" : "Engine Off")}
                      </span>
                    </td>
                    <td>{v.status === "idle" ? "24m 10s" : "0m"}</td>
                    <td>{v.status === "idle" ? "1.8 L" : "0.0 L"}</td>
                    <td>{lang === "ar" ? (v.address || "طريق الملك فهد") : (v.addressEn || v.address || "Main Rd")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
