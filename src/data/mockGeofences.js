export const initialGeofences = [
  {
    id: "geo-01",
    name: "مستودع التوزيع المركزي (Central Logistics Hub)",
    nameEn: "Central Logistics Hub",
    type: "circle",
    coords: [24.6480, 46.8050],
    radius: 1200,
    color: "#2563eb",
    fillColor: "#3b82f6",
    activeVehicles: 2,
    alertOnEnter: true,
    alertOnExit: true,
    description: "المستودع الرئيسي لشحنات التبريد والمواد الغذائية"
  },
  {
    id: "geo-02",
    name: "المقر الإداري الرئيسي (Headquarters HQ)",
    nameEn: "Company Headquarters HQ",
    type: "circle",
    coords: [24.7118, 46.6744],
    radius: 700,
    color: "#10b981",
    fillColor: "#34d399",
    activeVehicles: 1,
    alertOnEnter: false,
    alertOnExit: true,
    description: "المقر الرئيسي للإدارة التنفيذية وحافلات الموظفين"
  },
  {
    id: "geo-03",
    name: "منطقة الشحن الجوي - مطار الملك خالد (Cargo Terminal)",
    nameEn: "Airport Cargo Terminal",
    type: "circle",
    coords: [24.8150, 46.7620],
    radius: 1600,
    color: "#f59e0b",
    fillColor: "#fbbf24",
    activeVehicles: 1,
    alertOnEnter: true,
    alertOnExit: true,
    description: "منطقة استلام الطرود السريعة والشحنات الجوية"
  },
  {
    id: "geo-04",
    name: "منطقة العمليات المحظورة (Restricted Area)",
    nameEn: "Restricted Operations Zone",
    type: "circle",
    coords: [24.7650, 46.5900],
    radius: 950,
    color: "#ef4444",
    fillColor: "#f87171",
    activeVehicles: 0,
    alertOnEnter: true,
    alertOnExit: false,
    description: "منطقة يمنع دخول الشاحنات الثقيلة إليها بعد الساعة 6:00 صباحاً"
  }
];
