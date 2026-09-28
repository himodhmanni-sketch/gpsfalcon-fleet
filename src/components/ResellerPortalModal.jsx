import React, { useState } from "react";
import { 
  Building2, 
  Users, 
  Plus, 
  Car, 
  Search, 
  X, 
  CheckCircle, 
  Shield, 
  Smartphone, 
  Calendar, 
  Key, 
  Mail, 
  Phone, 
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function ResellerPortalModal({
  lang = "ar",
  currentUser,
  clients = [],
  setClients,
  vehicles = [],
  setVehicles,
  onClose
}) {
  const [activeTab, setActiveTab] = useState("clients"); // 'clients' | 'create_client'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'company' | 'individual'
  const [successNotice, setSuccessNotice] = useState("");

  // New Client Form State
  const [clientType, setClientType] = useState("company"); // 'company' | 'individual'
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("123456");
  const [formPhone, setFormPhone] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formMaxDevices, setFormMaxDevices] = useState(10);
  const [formPlateNumber, setFormPlateNumber] = useState("");
  const [formVehicleModel, setFormVehicleModel] = useState("");
  const [formImei, setFormImei] = useState("");

  // Reseller's own clients (filtered by resellerId)
  const myClients = currentUser?.role === "superadmin"
    ? clients.filter(c => c.role !== "superadmin")
    : clients.filter(c => c.resellerId === currentUser?.id);

  // Total allocated devices across reseller's clients
  const quotaTotal = currentUser?.maxDevices || 100;
  const quotaUsed = myClients.reduce((sum, c) => sum + (c.devicesCount || 1), 0);
  const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);

  // Filtered list for display
  const displayedClients = myClients.filter(c => {
    if (filterType !== "all" && c.role !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleCreateClient = (e) => {
    e.preventDefault();
    soundFX.playClick();

    if (!formName.trim() || !formEmail.trim()) {
      alert(lang === "ar" ? "يرجى إدخال اسم العميل والبريد الإلكتروني" : "Please enter client name and email");
      return;
    }

    const newClientId = `cl-${Date.now().toString().slice(-6)}`;
    const newVehicleId = `vh-${Date.now().toString().slice(-6)}`;

    // 1. Create Client Object
    const newClient = {
      id: newClientId,
      resellerId: currentUser?.id || "usr-reseller-01",
      name: formName.trim(),
      nameAr: formName.trim(),
      nameEn: formName.trim(),
      email: formEmail.trim(),
      password: formPassword || "123456",
      phone: formPhone.trim() || "+966 50 000 0000",
      company: clientType === "company" ? (formCompany.trim() || formName.trim()) : (lang === "ar" ? "مركبة شخصية خاصة" : "Private Vehicle"),
      role: clientType, // 'company' or 'individual'
      devicesCount: clientType === "company" ? parseInt(formMaxDevices) : 1,
      maxDevices: clientType === "company" ? parseInt(formMaxDevices) : 1,
      plan: clientType === "company" ? `Fleet Pro (${formMaxDevices} Trackers)` : "Personal Car License",
      planAr: clientType === "company" ? `باقة أسطول الشركات (${formMaxDevices} جهاز)` : "رخصة مركبة فردية",
      expiresAt: "2028-12-31",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      assignedVehicleId: clientType === "individual" ? newVehicleId : null,
      permissions: {
        viewObjects: true,
        editObjects: true,
        deleteObjects: false,
        sendCommands: true,
        viewHistory: true,
        accessReports: true,
        geofences: true,
        maintenance: true,
        billing: false,
        adminPanel: false,
        resellerPanel: false,
        driverManagement: clientType === "company" // only companies can manage drivers
      }
    };

    // 2. If individual, create their dedicated single vehicle immediately
    if (clientType === "individual") {
      const newVeh = {
        id: newVehicleId,
        clientId: newClientId,
        ownerId: newClientId,
        resellerId: currentUser?.id || "usr-reseller-01",
        name: formVehicleModel ? `${formVehicleModel} - ${formName}` : `مركبة ${formName}`,
        nameEn: formVehicleModel ? `${formVehicleModel} - ${formName}` : `Vehicle of ${formName}`,
        plateNumber: formPlateNumber || "أ ب ج 9999",
        model: formVehicleModel || "Toyota Camry 2024",
        imei: formImei || `869${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        type: "car",
        group: lang === "ar" ? "مركبات الأفراد الخاصة" : "Individual Cars",
        groupEn: "Individual Cars",
        driver: {
          name: formName,
          nameEn: formName,
          phone: formPhone || "+966 50 000 0000",
          score: 96
        },
        status: "stopped",
        coords: [24.7136, 46.6753],
        speed: 0,
        maxAllowedSpeed: 100,
        heading: 90,
        ignition: false,
        fuelLevel: 80,
        fuelLiters: 50,
        batteryVoltage: 12.8,
        odometer: 1200.0,
        engineHours: 45,
        doorStatus: "closed",
        satellites: 16,
        gsmSignal: 95,
        address: lang === "ar" ? "طريق الملك فهد، الرياض" : "King Fahd Rd, Riyadh",
        addressEn: "King Fahd Rd, Riyadh",
        lastUpdate: lang === "ar" ? "الآن (مسجل جديد)" : "Just registered",
        lastUpdateEn: "Just registered",
        immobilized: false,
        historyPath: [
          { lat: 24.7136, lng: 46.6753, speed: 0, time: "12:00 PM" }
        ],
        pathDelta: { dLat: 0, dLng: 0 }
      };

      if (setVehicles) {
        setVehicles(prev => [newVeh, ...prev]);
      }
    }

    if (setClients) {
      setClients(prev => [newClient, ...prev]);
    }

    soundFX.playSuccess();
    setSuccessNotice(
      lang === "ar"
        ? `تم إنشاء حساب ${clientType === "company" ? "الشركة" : "العميل الفرد"} (${formName}) بنجاح! يمكنه تسجيل الدخول فوراً باستخدام: ${formEmail}`
        : `Successfully created ${clientType} account (${formName})! Login: ${formEmail}`
    );

    // Reset Form
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormCompany("");
    setFormPlateNumber("");
    setFormVehicleModel("");
    setFormImei("");
    setActiveTab("clients");
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "1050px",
          width: "95vw",
          height: "88vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(139, 92, 246, 0.25)",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Building2 size={24} color="#c4b5fd" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#ffffff" }}>
                {lang === "ar" ? "بوابة إدارة الموزع المعتمد (Reseller Portal)" : "Authorized Reseller Portal"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#c4b5fd" }}>
                {lang === "ar" 
                  ? "إنشاء وإدارة حسابات زبائنك (شركات الأساطيل والأفراد) وتخصيص الأجهزة لهم" 
                  : "Create and manage your clients (Fleet companies & private individuals)"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#ffffff",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quota & KPIs Strip */}
        <div style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px"
        }}>
          {/* Card 1: Quota */}
          <div style={{
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ background: "#ede9fe", color: "#7c3aed", padding: "8px", borderRadius: "8px" }}>
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>
                {lang === "ar" ? "حصة أجهزة الموزع (Quota)" : "Device Quota"}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e1b4b" }}>
                {quotaUsed} / {quotaTotal} <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#10b981" }}>({quotaRemaining} {lang === "ar" ? "متبقي" : "left"})</span>
              </div>
            </div>
          </div>

          {/* Card 2: Companies */}
          <div style={{
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ background: "#dbeafe", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
              <Briefcase size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>
                {lang === "ar" ? "شركات الأساطيل التابعة" : "Fleet Companies"}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b" }}>
                {myClients.filter(c => c.role === "company").length} {lang === "ar" ? "شركة" : "companies"}
              </div>
            </div>
          </div>

          {/* Card 3: Individuals */}
          <div style={{
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ background: "#dcfce7", color: "#16a34a", padding: "8px", borderRadius: "8px" }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600" }}>
                {lang === "ar" ? "العملاء الأفراد (سيارة خاصة)" : "Private Owners"}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b" }}>
                {myClients.filter(c => c.role === "individual").length} {lang === "ar" ? "أفراد" : "individuals"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls Strip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => { soundFX.playClick(); setActiveTab("clients"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "clients" ? "#7c3aed" : "#f1f5f9",
                color: activeTab === "clients" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Users size={16} />
              <span>{lang === "ar" ? "قائمة زبائني" : "My Clients"} ({myClients.length})</span>
            </button>

            <button
              onClick={() => { soundFX.playClick(); setActiveTab("create_client"); }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "create_client" ? "#7c3aed" : "#f1f5f9",
                color: activeTab === "create_client" ? "#ffffff" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={16} />
              <span>{lang === "ar" ? "إنشاء حساب زبون جديد" : "Create New Client"}</span>
            </button>
          </div>

          {activeTab === "clients" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.8rem",
                  color: "#334155",
                  outline: "none"
                }}
              >
                <option value="all">{lang === "ar" ? "كافة الأنواع" : "All Types"}</option>
                <option value="company">{lang === "ar" ? "شركات الأساطيل" : "Fleet Companies"}</option>
                <option value="individual">{lang === "ar" ? "الأفراد" : "Individuals"}</option>
              </select>

              {/* Search */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={15} style={{ position: "absolute", marginInlineStart: "10px", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder={lang === "ar" ? "بحث عن عميل..." : "Search client..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "7px 12px",
                    paddingInlineStart: "32px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8rem",
                    width: "200px"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Success Notice Banner */}
        {successNotice && (
          <div style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            color: "#166534",
            padding: "10px 24px",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "600"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={16} color="#16a34a" />
              <span>{successNotice}</span>
            </div>
            <button 
              onClick={() => setSuccessNotice("")}
              style={{ background: "none", border: "none", color: "#166534", cursor: "pointer" }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {activeTab === "clients" ? (
            /* Clients Table View */
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", textAlign: "start" }}>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "نوع الحساب" : "Type"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "اسم العميل / الشركة" : "Name / Company"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "رقم الهاتف" : "Phone"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "الأجهزة المخصصة" : "Devices Quota"}</th>
                    <th style={{ padding: "12px 16px" }}>{lang === "ar" ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedClients.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        {lang === "ar" ? "لا يوجد عملاء مسجلين بهذا التصنيف حتى الآن." : "No clients found."}
                      </td>
                    </tr>
                  ) : (
                    displayedClients.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: c.role === "company" ? "#dbeafe" : "#dcfce7",
                            color: c.role === "company" ? "#1d4ed8" : "#15803d"
                          }}>
                            {c.role === "company" ? <Building2 size={13} /> : <Car size={13} />}
                            <span>{c.role === "company" ? (lang === "ar" ? "شركة أسطول" : "Fleet Company") : (lang === "ar" ? "فرد (خاص)" : "Individual")}</span>
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#1e293b" }}>
                          <div>{c.name}</div>
                          {c.company && <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "normal" }}>{c.company}</div>}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }} dir="ltr">{c.email}</td>
                        <td style={{ padding: "12px 16px", color: "#475569" }} dir="ltr">{c.phone || "—"}</td>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#7c3aed" }}>
                          {c.role === "company" ? `${c.maxDevices || 10} ${lang === "ar" ? "مركبات" : "vehicles"}` : (lang === "ar" ? "1 مركبة خاصة" : "1 Private Car")}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            background: "#ecfdf5",
                            color: "#059669",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}>
                            {lang === "ar" ? "نشط" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Create Client Form View */
            <form onSubmit={handleCreateClient} style={{ maxWidth: "720px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: "800", color: "#1e1b4b" }}>
                  {lang === "ar" ? "تسجيل عميل جديد وتخصيص الأجهزة له" : "Register Client & Allocate Devices"}
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  {lang === "ar" 
                    ? "اختر نوع العميل: شركة أسطول (لديها عدة مركبات وسائقين) أو عميل فرد (لديه سيارة واحدة خاصة)." 
                    : "Choose whether this is a fleet company or a private individual vehicle owner."}
                </p>
              </div>

              {/* Account Type Selector Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {/* Option 1: Company */}
                <div 
                  onClick={() => { soundFX.playClick(); setClientType("company"); }}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: clientType === "company" ? "2px solid #7c3aed" : "1.5px solid #cbd5e1",
                    background: clientType === "company" ? "#f5f3ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ background: clientType === "company" ? "#7c3aed" : "#f1f5f9", color: clientType === "company" ? "#ffffff" : "#475569", padding: "8px", borderRadius: "8px" }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#1e1b4b", fontSize: "0.95rem" }}>
                        {lang === "ar" ? "شركة / أسطول نقليات" : "Fleet Company"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        {lang === "ar" ? "لديها أسطول من المركبات، حسابات سائقين، وتقارير مجمعة" : "Multiple vehicles, drivers & reports"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option 2: Individual */}
                <div 
                  onClick={() => { soundFX.playClick(); setClientType("individual"); }}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: clientType === "individual" ? "2px solid #7c3aed" : "1.5px solid #cbd5e1",
                    background: clientType === "individual" ? "#f5f3ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ background: clientType === "individual" ? "#7c3aed" : "#f1f5f9", color: clientType === "individual" ? "#ffffff" : "#475569", padding: "8px", borderRadius: "8px" }}>
                      <Car size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", color: "#1e1b4b", fontSize: "0.95rem" }}>
                        {lang === "ar" ? "عميل فرد (مالك خاص)" : "Private Individual"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        {lang === "ar" ? "يملك سيارة واحدة فقط، ولا يرى في كل المنظومة إلا سيارته" : "Single vehicle owner, sees only 1 car"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                {/* Client / Manager Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {clientType === "company" ? (lang === "ar" ? "اسم مدير الأسطول / المسؤول" : "Manager Name") : (lang === "ar" ? "اسم العميل بالكامل" : "Client Full Name")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={clientType === "company" ? (lang === "ar" ? "مثال: عبدالله الرويلي" : "e.g. John Doe") : (lang === "ar" ? "مثال: سالم القحطاني" : "e.g. Salem")}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Company Name (if company) */}
                {clientType === "company" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      {lang === "ar" ? "اسم الشركة / المؤسسة" : "Company Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: شركة المسار السريع للخدمات" : "Company name"}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.88rem"
                      }}
                    />
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "البريد الإلكتروني لتسجيل الدخول" : "Login Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@example.com"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "كلمة المرور الافتراضية" : "Initial Password"} *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    {lang === "ar" ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Quota for Company */}
                {clientType === "company" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      {lang === "ar" ? "عدد المركبات المسموح بها للشركة" : "Allowed Vehicle Quota"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={quotaRemaining}
                      value={formMaxDevices}
                      onChange={(e) => setFormMaxDevices(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.88rem"
                      }}
                    />
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {lang === "ar" ? `المتبقي من حصتك: ${quotaRemaining} جهاز` : `Remaining quota: ${quotaRemaining}`}
                    </span>
                  </div>
                )}
              </div>

              {/* If Individual: Vehicle Details Box */}
              {clientType === "individual" && (
                <div style={{
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#1e1b4b", fontWeight: "800", fontSize: "0.9rem" }}>
                    <Car size={18} color="#7c3aed" />
                    <span>{lang === "ar" ? "بيانات سيارة العميل الوحيدة" : "Client's Single Vehicle Details"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        {lang === "ar" ? "طراز السيارة" : "Model"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "مثال: لكزس LX600" : "Lexus LX600"}
                        value={formVehicleModel}
                        onChange={(e) => setFormVehicleModel(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        {lang === "ar" ? "رقم اللوحة" : "Plate Number"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "ط ر ب 5142" : "ABC-123"}
                        value={formPlateNumber}
                        onChange={(e) => setFormPlateNumber(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
                        {lang === "ar" ? "معرّف الجهاز (IMEI)" : "Tracker IMEI"}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="869727071244774"
                        value={formImei}
                        onChange={(e) => setFormImei(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("clients")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.88rem",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
                  }}
                >
                  <CheckCircle size={18} />
                  <span>{lang === "ar" ? "حفظ وتفعيل حساب العميل" : "Save & Activate Client"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
