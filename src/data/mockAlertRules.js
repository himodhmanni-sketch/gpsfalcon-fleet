export const initialAlertRules = [
  {
    id: "rule-01",
    name: "تجاوز السرعة القصوى (120 كم/س)",
    nameEn: "Overspeed Warning (120 km/h)",
    type: "overspeed",
    parameter: 120,
    unit: "km/h",
    vehicles: ["all"],
    enabled: true,
    channels: { sound: true, popup: true, email: true, sms: false, webhook: false },
    email: "himodhmanni@gmail.com",
    sms: "+966501234567",
    webhookUrl: "https://api.gpswox-fleet.com/hooks/speed"
  },
  {
    id: "rule-02",
    name: "تشغيل المحرك خارج ساعات العمل",
    nameEn: "Ignition After Hours (10PM - 6AM)",
    type: "ignition_after_hours",
    parameter: "22:00-06:00",
    vehicles: ["vh-01", "vh-02"],
    enabled: true,
    channels: { sound: true, popup: true, email: true, sms: true, webhook: false },
    email: "himodhmanni@gmail.com",
    sms: "+966501234567"
  },
  {
    id: "rule-03",
    name: "خروج من منطقة المستودع المركزي",
    nameEn: "Geofence Exit (Central Depot)",
    type: "geofence_out",
    parameter: "zone-riyadh-01",
    vehicles: ["all"],
    enabled: true,
    channels: { sound: true, popup: true, email: false, sms: false, webhook: true },
    webhookUrl: "https://api.gpswox-fleet.com/hooks/geofence"
  },
  {
    id: "rule-04",
    name: "توقف المحرك لفترة طويلة أثناء التشغيل (خمول > 30 دقيقة)",
    nameEn: "Excessive Engine Idle (> 30 min)",
    type: "idle_duration",
    parameter: 30,
    unit: "min",
    vehicles: ["all"],
    enabled: true,
    channels: { sound: false, popup: true, email: true, sms: false, webhook: false },
    email: "himodhmanni@gmail.com"
  },
  {
    id: "rule-05",
    name: "فصل بطارية الجهاز أو قطع الطاقة الخارجية",
    nameEn: "Main Power / Battery Disconnected",
    type: "power_cut",
    parameter: "voltage < 9V",
    vehicles: ["all"],
    enabled: true,
    channels: { sound: true, popup: true, email: true, sms: true, webhook: true },
    email: "himodhmanni@gmail.com",
    sms: "+966501234567",
    webhookUrl: "https://api.gpswox-fleet.com/hooks/security"
  },
  {
    id: "rule-06",
    name: "انخفاض مفاجئ في مستوى الوقود (اشتباه سرقة)",
    nameEn: "Sudden Fuel Drop (Theft Suspect)",
    type: "fuel_theft",
    parameter: "drop > 10% in 5 min",
    vehicles: ["vh-01", "vh-02"],
    enabled: true,
    channels: { sound: true, popup: true, email: true, sms: true, webhook: true },
    email: "himodhmanni@gmail.com",
    sms: "+966501234567"
  }
];
