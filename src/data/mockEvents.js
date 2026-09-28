export const initialEvents = [
  {
    id: "evt-01",
    vehicleId: "vh-01",
    vehicleName: "مرسيدس أكتروس - شاحنة تبريد",
    type: "overspeed",
    severity: "warning",
    message: "تجاوز السرعة القصوى: 84 كم/س في منطقة محددة بـ 80 كم/س",
    messageEn: "Overspeed detected: 84 km/h in 80 km/h zone",
    time: "منذ دقيقتين",
    timeEn: "2 mins ago",
    coords: [24.7215, 46.6850],
    read: false
  },
  {
    id: "evt-02",
    vehicleId: "vh-04",
    vehicleName: "لكزس LX600 - نقل كبار الشخصيات",
    type: "geofence_enter",
    severity: "info",
    message: "دخول منطقة: منطقة الشحن الجوي - مطار الملك خالد",
    messageEn: "Entered geofence: Airport Cargo Terminal",
    time: "منذ 6 دقائق",
    timeEn: "6 mins ago",
    coords: [24.8120, 46.7580],
    read: false
  },
  {
    id: "evt-03",
    vehicleId: "vh-03",
    vehicleName: "فورد ترانزيت - توصيل طرود سريع",
    type: "idle_warning",
    severity: "warning",
    message: "تنبيه وقوف مع تشغيل المحرك (Idle) لأكثر من 15 دقيقة بدون حركة",
    messageEn: "Excessive engine idle detected: > 15 mins",
    time: "منذ 14 دقيقة",
    timeEn: "14 mins ago",
    coords: [24.6980, 46.7210],
    read: false
  },
  {
    id: "evt-04",
    vehicleId: "vh-05",
    vehicleName: "فولفو FMX - قلاب إنشائي ثقيل",
    type: "ignition_off",
    severity: "info",
    message: "تم إطفاء المحرك في المستودع الإنشائي (ACC OFF)",
    messageEn: "Engine turned OFF at depot (ACC OFF)",
    time: "منذ 45 دقيقة",
    timeEn: "45 mins ago",
    coords: [24.6430, 46.8120],
    read: true
  },
  {
    id: "evt-05",
    vehicleId: "vh-07",
    vehicleName: "إيسوزو ديماكس - فحص شبكات",
    type: "low_battery",
    severity: "critical",
    message: "تحذير حرج: انخفاض جهد بطارية المركبة إلى 11.9 فولت (تفريغ)",
    messageEn: "Critical: Low battery voltage detected 11.9V",
    time: "منذ 3 ساعات",
    timeEn: "3 hours ago",
    coords: [24.7890, 46.6110],
    read: true
  }
];
