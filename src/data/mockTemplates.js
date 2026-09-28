export const initialNotificationTemplates = [
  {
    id: "tpl-01",
    name: "تنبيه تجاوز السرعة (SMS)",
    nameEn: "Overspeed Alert SMS",
    type: "sms",
    category: "overspeed",
    subject: "تحذير سرعة: {device_name}",
    body: "تحذير أسطول: تجاوزت المركبة {device_name} السرعة المحددة ({speed} كم/س) في {address} بتاريخ {time}. السائق: {driver}."
  },
  {
    id: "tpl-02",
    name: "تقرير انتهاك السياج الجغرافي (Email)",
    nameEn: "Geofence Breach Email",
    type: "email",
    category: "geofence",
    subject: "[تنبيه أمني] خروج مركبة من النطاق: {device_name}",
    body: "عزيزي مدير الأسطول،\n\nنود إعلامكم بأن المركبة {device_name} (لوحة: {plate_number}) قد خرجت من المنطقة الجغرافية المحددة [{geofence_name}] في تمام الساعة {time}.\nالموقع الحالي: {coords} ({address})\nالسرعة الحالية: {speed} كم/س.\n\nمنظومة GPSWOX لإدارة الأساطيل."
  },
  {
    id: "tpl-03",
    name: "تنبيه فصل بطارية الجهاز (SMS / Push)",
    nameEn: "Battery Disconnected Alert",
    type: "sms",
    category: "security",
    subject: "إنذار أمني خطير: {device_name}",
    body: "إنذار طوارئ: تم فصل مصدر الطاقة الخارجي / بطارية السيارة للمركبة {device_name}. الجهاز يعمل حالياً على البطارية الداخلية الاحتياطية. الوقت: {time}."
  },
  {
    id: "tpl-04",
    name: "إشعار موعد صيانة دورية (Email)",
    nameEn: "Scheduled Maintenance Due",
    type: "email",
    category: "maintenance",
    subject: "تذكير صيانة مستحقة للمركبة: {device_name}",
    body: "تذكير صيانة:\nالمركبة {device_name} اقتربت من موعد الخدمة الدورية [{service_name}].\nقراءة العداد الحالية: {odometer} كم.\nيرجى حجز موعد الفحص وتغيير الزيت."
  }
];

export const initialCommandTemplates = [
  {
    id: "cmd-tpl-01",
    name: "إيقاف المحرك فورياً (قطع إمداد الوقود)",
    nameEn: "Cut Off Engine (Stop Fuel/Power)",
    protocol: "GT06 / Coban / Teltonika",
    commandString: "RELAY,1# / DYD,123456# / setdigout 1",
    description: "تفعيل مرحل القطع لمنع تشغيل المحرك في حال السرقة"
  },
  {
    id: "cmd-tpl-02",
    name: "إعادة تفعيل وتشغيل المحرك",
    nameEn: "Restore Engine Power",
    protocol: "GT06 / Coban / Teltonika",
    commandString: "RELAY,0# / HFYD,123456# / setdigout 0",
    description: "إلغاء قفل المرحل والسماح للمركبة بالدوران مجدداً"
  },
  {
    id: "cmd-tpl-03",
    name: "إعادة تشغيل الجهاز عن بُعد (Reboot)",
    nameEn: "Reboot Device",
    protocol: "Universal",
    commandString: "RESET# / reboot / cpureset",
    description: "إعادة إقلاع معالج جهاز التتبع لإنعاش الاتصال بالشبكة"
  },
  {
    id: "cmd-tpl-04",
    name: "طلب تحديد الموقع الفوري برابط خريطة",
    nameEn: "Query Realtime Location Link",
    protocol: "Universal",
    commandString: "WHERE# / fix030s***n123456 / getgps",
    description: "إرسال إحداثيات GPS الحالية فوراً عبر رسالة SMS مع رابط Google Maps"
  }
];
