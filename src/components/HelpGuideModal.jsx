import React, { useState } from "react";
import { 
  HelpCircle, 
  Play, 
  Smartphone, 
  Radio, 
  Check, 
  Star, 
  ShieldCheck, 
  X, 
  Zap, 
  CreditCard 
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function HelpGuideModal({
  lang,
  initialTab = "upgrade", // 'upgrade' | 'guide' | 'tracker' | 'support'
  onClose,
  onOpenAddDevice
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const plans = [
    {
      id: "basic",
      name: "Starter Fleet",
      nameAr: "الأسطول المبتدئ",
      price: "$29",
      priceAr: "110 ريال",
      period: "/ month",
      periodAr: "/ شهرياً",
      devices: "Up to 5 Trackers",
      devicesAr: "حتى 5 سيارات",
      features: [
        "Real-time GPS tracking (10 sec update)",
        "30-day History playback",
        "Geofences & overspeed alerts",
        "Standard email support"
      ],
      featuresAr: [
        "تتبع فوري بتحديث كل 10 ثوانٍ",
        "سجل رحلات لمدة 30 يوماً",
        "تنبيهات السرعة والمناطق الجغرافية",
        "دعم فني عبر البريد الإلكتروني"
      ],
      recommended: false
    },
    {
      id: "pro",
      name: "Business Pro",
      nameAr: "الأعمال الاحترافي",
      price: "$89",
      priceAr: "330 ريال",
      period: "/ month",
      periodAr: "/ شهرياً",
      devices: "Up to 25 Trackers",
      devicesAr: "حتى 25 سيارة",
      features: [
        "All Starter features included",
        "SMS & Push notifications gateway",
        "Engine Cut-off & Remote Commands",
        "Fuel theft detection & Dashcam",
        "Unlimited reports & Excel export",
        "Priority 24/7 technical support"
      ],
      featuresAr: [
        "جميع مزايا الباقة المبتدئة",
        "بوابة رسائل SMS وتنبيهات فورية",
        "أوامر إيقاف المحرك عن بُعد",
        "كشف سرقة الوقود وكاميرات المراقبة",
        "تقارير غير محدودة وتصدير إكسل",
        "دعم فني ذو أولوية 24/7"
      ],
      recommended: true
    },
    {
      id: "enterprise",
      name: "Enterprise Whitelabel",
      nameAr: "المؤسسات والبراندينغ الخاص",
      price: "$199",
      priceAr: "750 ريال",
      period: "/ month",
      periodAr: "/ شهرياً",
      devices: "Unlimited Trackers",
      devicesAr: "عدد غير محدود من السيارات",
      features: [
        "Custom domain & your own logo branding",
        "Full Admin panel with clients management",
        "Dedicated Traccar protocol gateway",
        "REST API & Webhooks access",
        "Dedicated account manager"
      ],
      featuresAr: [
        "دومين خاص وشعار شركتك بالكامل",
        "لوحة إدارة العملاء والمستخدمين الشاملة",
        "خادم بروتوكولات Traccar خاص بك",
        "واجهات برمجية API و Webhooks",
        "مدير حساب مخصص لمنظومتك"
      ],
      recommended: false
    }
  ];

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div 
        className="modal-box-custom help-guide-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "880px", width: "95vw", height: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header-teal">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="header-icon-box">
              <Zap size={20} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title-text">
                {lang === "ar" ? "مركز المساعدة وباقات الترقية" : "Help Center & Upgrade Plans"}
              </h2>
              <span className="modal-subtitle-text">
                {lang === "ar" ? "دليل تشغيل المنظومة، ربط أجهزة التتبع وباقات الاشتراك" : "Software guide, GPS hardware setup & subscription plans"}
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
            className={`admin-tab-btn ${activeTab === "upgrade" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("upgrade"); }}
          >
            <CreditCard size={16} />
            <span>{lang === "ar" ? "ترقية الباقة والاشتراك" : "Upgrade Plan"}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "guide" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("guide"); }}
          >
            <Play size={16} />
            <span>{lang === "ar" ? "كيفية استخدام المنظومة" : "How to Use"}</span>
          </button>

          <button 
            className={`admin-tab-btn ${activeTab === "tracker" ? "active" : ""}`}
            onClick={() => { soundFX.playClick(); setActiveTab("tracker"); }}
          >
            <Radio size={16} />
            <span>{lang === "ar" ? "ربط أول جهاز تتبع أو هاتف" : "Add Tracker / Phone"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          
          {/* TAB 1: UPGRADE PLANS */}
          {activeTab === "upgrade" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", marginBottom: "4px" }}>
                  {lang === "ar" ? "اختر الباقة المثالية لأسطولك" : "Choose the Perfect Fleet Plan"}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {lang === "ar" ? "باقية 14 يوماً في نسختك التجريبية المجانية. قم بالترقية الآن واستمتع بمزايا غير محدودة." : "14 days left in your free trial. Upgrade now for full fleet access."}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {plans.map(p => (
                  <div 
                    key={p.id}
                    style={{
                      background: "#fff",
                      border: p.recommended ? "2px solid #00b4c6" : "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "20px",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: p.recommended ? "0 4px 14px rgba(0, 180, 198, 0.15)" : "none"
                    }}
                  >
                    {p.recommended && (
                      <div style={{ position: "absolute", top: "-10px", right: "20px", background: "#00b4c6", color: "#fff", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                        {lang === "ar" ? "الأكثر طلباً" : "MOST POPULAR"}
                      </div>
                    )}

                    <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>
                      {lang === "ar" ? p.nameAr : p.name}
                    </h4>

                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#00b4c6", fontFamily: "var(--font-mono)" }}>
                        {lang === "ar" ? p.priceAr : p.price}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {lang === "ar" ? p.periodAr : p.period}
                      </span>
                    </div>

                    <div style={{ background: "#f0fdfa", color: "#00b4c6", padding: "4px 8px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "600", marginBottom: "16px", textAlign: "center" }}>
                      {lang === "ar" ? p.devicesAr : p.devices}
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", flex: 1, display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem", color: "#4b5563" }}>
                      {(lang === "ar" ? p.featuresAr : p.features).map((feat, idx) => (
                        <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                          <Check size={14} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => {
                        soundFX.playSuccess();
                        alert(lang === "ar" ? `شكراً لاختيارك باقة ${p.nameAr}! سيتم توجيهك لبوابة الدفع الآمنة.` : `Thank you for selecting ${p.name}! Redirecting to checkout...`);
                      }}
                      style={{
                        background: p.recommended ? "#00b4c6" : "#f3f4f6",
                        color: p.recommended ? "#fff" : "#1f2937",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "0.85rem"
                      }}
                    >
                      {lang === "ar" ? "ترقية الحساب الآن" : "Upgrade Now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO USE */}
          {activeTab === "guide" && (
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                {lang === "ar" ? "دليل تشغيل واحتراف منظومة GPSWOX" : "Getting Started with GPSWOX"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#00b4c6", marginBottom: "6px" }}>
                    1. {lang === "ar" ? "مراقبة السيارات والأسطول على الخريطة" : "1. Live Tracking on Map"}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                    {lang === "ar" 
                      ? "تظهر السيارات في القائمة العائمة جهة اليمين. بالنقر على أي سيارة سيتم توجيه الخريطة إليها وعرض تفاصيل عداد السرعة، عنوان الشارع، والمستشعرات الحية بالأسفل."
                      : "Objects appear in the floating objects panel. Click any vehicle to center the map on it and view speed, live address, and real-time sensors at the bottom."}
                  </p>
                </div>

                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#00b4c6", marginBottom: "6px" }}>
                    2. {lang === "ar" ? "إرسال أوامر إيقاف وتشغيل المحرك عن بُعد" : "2. Remote Commands & Engine Cut-off"}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                    {lang === "ar" 
                      ? "يمكنك إرسال أمر فوري لإيقاف محرك السيارة عبر بروتوكولات GPRS/SMS بالضغط على 'إرسال الأوامر' في القائمة الجانبية أو من خيارات المركبة."
                      : "Send immediate engine stop/resume commands via GPRS/SMS by clicking 'Send Commands' in the sidebar or directly from the object menu."}
                  </p>
                </div>

                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#00b4c6", marginBottom: "6px" }}>
                    3. {lang === "ar" ? "توليد التقارير وتصدير ملفات إكسل و PDF" : "3. Generating Fleet Reports & PDF"}
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                    {lang === "ar" 
                      ? "اضغط على أيقونة 'التقارير' في القائمة، اختر نوع التقرير (الرحلات والتوقفات، ملخص المسافات، كشف الوقود)، ثم اضغط توليد لتنزيل التقرير فورياً."
                      : "Open the Reports tab, select report type (Drives & Stops, Distance summary, Fuel report), and click Generate to export immediately."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD TRACKER */}
          {activeTab === "tracker" && (
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Smartphone size={18} color="#00b4c6" />
                  {lang === "ar" ? "تحويل هاتفك الذكي (أندرويد / آيفون) إلى جهاز تتبع GPS" : "Turn your Smartphone into a GPS Tracker"}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.6 }}>
                  {lang === "ar" 
                    ? "يمكنك استخدام تطبيق 'Traccar Client' أو 'GPSWOX Mobile Client' مجاناً من متجر Google Play أو App Store. أدخل عنوان الخادم:"
                    : "Install 'Traccar Client' or 'GPSWOX Mobile Client' from Google Play or App Store, and set the server URL to:"}
                </p>
                <div style={{ background: "#1e293b", color: "#38bdf8", padding: "8px 12px", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", margin: "8px 0" }}>
                  http://localhost:5055 (أو IP جهازك)
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button 
                  onClick={() => {
                    onClose();
                    onOpenAddDevice();
                  }}
                  style={{ background: "#00b4c6", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  {lang === "ar" ? "فتح معالج ربط جهاز تتبع فيزيائي (Concox, Teltonika, Coban)" : "Open Hardware Tracker Wizard"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
