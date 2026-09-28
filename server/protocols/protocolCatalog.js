// Complete Traccar Protocol & Command Specification Catalog
// Matches official Traccar Protocol Registry & Command Encoders

export const TRACCAR_PROTOCOLS = [
  {
    id: "gt06",
    name: "Concox / Jimi (GT06)",
    port: 5023,
    type: "TCP",
    format: "Binary (Hex)",
    header: "0x78 0x78 or 0x79 0x79",
    models: ["GT06N", "WeTrack2", "VL02", "JM-VG03", "CRX1", "Wetrack Lite"],
    commands: {
      engineStop: {
        raw: "RELAY,1#",
        titleAr: "قطع الوقود وإيقاف المحرك",
        titleEn: "Cut Fuel / Stop Engine",
        desc: "إرسال أمر Relay,1 عبر GPRS لفصل مضخة البنزين"
      },
      engineResume: {
        raw: "RELAY,0#",
        titleAr: "إعادة توصيل المحرك",
        titleEn: "Restore Engine",
        desc: "إلغاء قفل المحرك وتمكين السائق من التشغيل"
      },
      positionSingle: {
        raw: "WHERE#",
        titleAr: "طلب الموقع الفوري",
        titleEn: "Get Real-Time Position",
        desc: "طلب إحداثيات GPS ورابط الخريطة فوراً"
      },
      rebootDevice: {
        raw: "RESET#",
        titleAr: "إعادة تشغيل الجهاز (Reboot)",
        titleEn: "Reboot Tracker Hardware",
        desc: "إعادة تشغيل وحدة الـ MCU الداخلية للجهاز"
      },
      setSpeedLimit: {
        raw: "SPEED,ON,60,90,1#",
        titleAr: "تحديد السرعة القصوى (90 كم/س)",
        titleEn: "Set Speed Limit Alarm (90 km/h)",
        desc: "تفعيل تنبيه تجاوز السرعة وإطلاق الجرس"
      },
      voiceMonitoring: {
        raw: "MONITOR#",
        titleAr: "تفعيل التنصت الصوتي (Monitor Mode)",
        titleEn: "Audio Monitoring",
        desc: "التحويل لوضع الاتصال الصوتي باتجاه واحد"
      }
    },
    smsConfig: "SERVER,1,SERVER_IP,5023,0#"
  },
  {
    id: "teltonika",
    name: "Teltonika (Code 8 / 8E)",
    port: 5027,
    type: "TCP / UDP",
    format: "Binary AVL Data Packet",
    header: "0x00 0x00 0x00 0x00 (Preamble) + Data Length + Code8/8E",
    models: ["FMB920", "FMB120", "FMC130", "FMB204", "FMB003 OBD", "TST100"],
    commands: {
      engineStop: {
        raw: "setdigout 10",
        titleAr: "تفعيل المخرج الرقمي (قطع المحرك DOUT1)",
        titleEn: "Digital Output 1 High (Cut Engine)",
        desc: "يقوم بتفعيل الـ Relay المتصل بالمخرج الرقمي الأول DOUT1"
      },
      engineResume: {
        raw: "setdigout 00",
        titleAr: "فصل المخرج الرقمي (إعادة تشغيل المحرك)",
        titleEn: "Digital Output 1 Low (Restore Engine)",
        desc: "إلغاء تفعيل الـ Relay وإعادة توصيل الدائرة"
      },
      rebootDevice: {
        raw: "cpureset",
        titleAr: "إعادة ضبط المعالج (CPU Reset)",
        titleEn: "Reboot Device CPU",
        desc: "إعادة تشغيل وحدة معالجة التتبع"
      },
      positionSingle: {
        raw: "ggps",
        titleAr: "استعلام عن بيانات GPS والأقمار",
        titleEn: "Query GPS Coordinates",
        desc: "إرجاع الموقع الحالي وقوة الإشارة وحالة الأقمار"
      },
      readStatus: {
        raw: "getstatus",
        titleAr: "تقرير حالة الحساسات والبطارية",
        titleEn: "Get Status & Diagnostics",
        desc: "قراءة جهد البطارية، حرارة اللوحة، وحالة الـ GNSS"
      }
    },
    smsConfig: "setparam 2004:SERVER_IP;2005:5027;2006:0"
  },
  {
    id: "gps103",
    name: "Coban (GPS103 / TK103)",
    port: 5001,
    type: "TCP",
    format: "ASCII Text Strings",
    header: "##,imei:...,A,... or imei:...;",
    models: ["TK103A", "TK103B", "TK303", "TK104", "GPS103"],
    commands: {
      engineStop: {
        raw: "stop123456",
        titleAr: "فصل المحرك والمضخة (Stop)",
        titleEn: "Stop Engine",
        desc: "أمر فصل دارة الإشعال والمضخة بكلمة سر الجهاز"
      },
      engineResume: {
        raw: "resume123456",
        titleAr: "استئناف عمل المحرك (Resume)",
        titleEn: "Resume Engine",
        desc: "إعادة تشغيل المحرك بعد الفصل"
      },
      positionSingle: {
        raw: "check123456",
        titleAr: "فحص الحالة والموقع (Check)",
        titleEn: "Check Status & Location",
        desc: "إرسال تقرير بالحالة العامة والموقع"
      },
      armDevice: {
        raw: "arm123456",
        titleAr: "تفعيل جهاز الإنذار والحراسة (Arm)",
        titleEn: "Arm Security Alarm",
        desc: "تفعيل حساسات الاهتزاز والأبواب ضد السرقة"
      },
      disarmDevice: {
        raw: "disarm123456",
        titleAr: "إلغاء الإنذار (Disarm)",
        titleEn: "Disarm Alarm",
        desc: "إلغاء وضع الحراسة"
      }
    },
    smsConfig: "adminip123456 SERVER_IP 5001"
  },
  {
    id: "h02",
    name: "SinoTrack (H02)",
    port: 5013,
    type: "TCP",
    format: "ASCII / Binary (*HQ,...) ",
    header: "*HQ,...",
    models: ["ST-901", "ST-906", "ST-902", "ST-907 Relay"],
    commands: {
      engineStop: {
        raw: "9400000",
        titleAr: "فصل المحرك عن بعد (Cut Oil)",
        titleEn: "Cut Off Oil Supply",
        desc: "فصل ريليه الديزل/البنزين"
      },
      engineResume: {
        raw: "9410000",
        titleAr: "إعادة تشغيل المحرك (Restore Oil)",
        titleEn: "Restore Oil Supply",
        desc: "إعادة توصيل الوقود"
      },
      positionSingle: {
        raw: "6690000",
        titleAr: "طلب إحداثيات الموقع (Locate)",
        titleEn: "Request Location Coordinates",
        desc: "إرسال الموقع الحالي عبر رسالة أو حزمة"
      },
      rebootDevice: {
        raw: "RESTART",
        titleAr: "إعادة تشغيل الجهاز",
        titleEn: "Restart Tracker",
        desc: "إعادة تشغيل النظام"
      }
    },
    smsConfig: "8030000 SERVER_IP 5013"
  },
  {
    id: "gl200",
    name: "Queclink (@Track)",
    port: 5004,
    type: "TCP / UDP",
    format: "ASCII (+RESP:GT... / +BUFF:GT...)",
    header: "+RESP:GTFRI / +RESP:GTINF",
    models: ["GV300", "GV50", "GL300", "GV200", "GV65"],
    commands: {
      engineStop: {
        raw: "AT+GTRTO=gv300,1,,,0,,,,,,,,,,,,0001$",
        titleAr: "قطع الوقود (Digital Output 1)",
        titleEn: "Immobilize Fuel Line",
        desc: "أمر تفعيل مخرج التحكم في الوقود"
      },
      engineResume: {
        raw: "AT+GTRTO=gv300,2,,,0,,,,,,,,,,,,0001$",
        titleAr: "إعادة توصيل الوقود",
        titleEn: "Restore Fuel Line",
        desc: "إلغاء قفل الوقود"
      },
      positionSingle: {
        raw: "AT+GTRTO=gv300,3,,,,,,,,,,,,,,0001$",
        titleAr: "استعلام الموقع الفوري",
        titleEn: "Immediate Location Query",
        desc: "طلب إرسال حزمة GPS فورية"
      },
      rebootDevice: {
        raw: "AT+GTRST=gv300,1,,,,0001$",
        titleAr: "إعادة تشغيل الجهاز",
        titleEn: "Reboot Device",
        desc: "Soft Reset للوحدة"
      }
    },
    smsConfig: "AT+GTSRI=gv300,1,,1,SERVER_IP,5004,,,0"
  },
  {
    id: "osmand",
    name: "Traccar Client / OsmAnd (Mobile App)",
    port: 5055,
    type: "HTTP / REST",
    format: "HTTP GET / POST Query Params",
    header: "GET /?id=123456&lat=24.71&lon=46.67&speed=60&bearing=90&batt=95",
    models: ["Traccar Client Android", "Traccar Client iOS", "OsmAnd", "IoT Webhooks"],
    commands: {
      custom: {
        raw: "HTTP ACK 200",
        titleAr: "استجابة خادم التطبيق",
        titleEn: "HTTP Client Sync",
        desc: "تحديث الإحداثيات مباشرة من هواتف السائقين أو أجهزة أندرويد"
      }
    },
    smsConfig: "Set Server URL in App: http://SERVER_IP:5055"
  },
  {
    id: "ruptela",
    name: "Ruptela",
    port: 5046,
    type: "TCP",
    format: "Binary Protocol",
    header: "0x00 0x00 (Packet Length) + Command",
    models: ["FM-Eco4", "Pro4", "HCV5", "LCV5"],
    commands: {
      engineStop: {
        raw: "SET_DOUT_1",
        titleAr: "قطع المحرك DOUT 1",
        titleEn: "Cut Engine",
        desc: "تفعيل المرحل الرقمي"
      },
      engineResume: {
        raw: "RESET_DOUT_1",
        titleAr: "إلغاء قفل المحرك",
        titleEn: "Restore Engine",
        desc: "إعادة توصيل المحرك"
      }
    },
    smsConfig: "setparam 2004:SERVER_IP 2005:5046"
  },
  {
    id: "wialon",
    name: "Wialon IPS / Retranslation",
    port: 5024,
    type: "TCP",
    format: "ASCII Protocol (#D#... / #L#...)",
    header: "#L#1.1;IMEI;NA;NA;NA",
    models: ["Wialon IPS", "Navtelecom", "Galileosky", "Arnavi"],
    commands: {
      positionSingle: {
        raw: "#M#Query",
        titleAr: "استعلام فوري",
        titleEn: "Query",
        desc: "طلب حزمة جديدة"
      }
    },
    smsConfig: "SERVER SERVER_IP:5024"
  },
  {
    id: "huabao",
    name: "Huabao / JT808 (China National Standard)",
    port: 5015,
    type: "TCP",
    format: "Binary 0x7E ... 0x7E",
    header: "0x7E (Start Flag) + Message ID + Phone/ID + 0x7E (End)",
    models: ["JT808 Truck Standard", "BSJ", "Tianqin", "Kingwo"],
    commands: {
      engineStop: {
        raw: "0x8500",
        titleAr: "فصل الزيت والكهرباء (JT808 0x8500)",
        titleEn: "Vehicle Control: Oil/Electric Cut",
        desc: "أمر معيار وزارة النقل الصيني للشاحنات"
      },
      engineResume: {
        raw: "0x8500_RESTORE",
        titleAr: "إلغاء الفصل واستعادة التشغيل",
        titleEn: "Vehicle Control: Restore",
        desc: "إلغاء أمر الفصل"
      }
    },
    smsConfig: "IP#SERVER_IP#5015#"
  },
  {
    id: "meiligao",
    name: "Meiligao",
    port: 5009,
    type: "TCP / UDP",
    format: "Binary @@...\\r\\n",
    header: "@@ ...",
    models: ["VT300", "VT310", "VT400"],
    commands: {
      engineStop: {
        raw: "@@<L>4126,1*<CS>\\r\\n",
        titleAr: "قطع المحرك (Output 1)",
        titleEn: "Cut Output 1",
        desc: "إرسال أمر الفصل المشفر"
      },
      engineResume: {
        raw: "@@<L>4126,0*<CS>\\r\\n",
        titleAr: "استعادة المحرك",
        titleEn: "Restore Output 1",
        desc: "إعادة التشغيل"
      }
    },
    smsConfig: "SERVER,1,SERVER_IP,5009,0#"
  },
  {
    id: "suntech",
    name: "Suntech",
    port: 5011,
    type: "TCP",
    format: "ASCII (ST300CMD;...)",
    header: "ST300CMD;...",
    models: ["ST300", "ST340", "ST310U", "ST600"],
    commands: {
      engineStop: {
        raw: "ST300CMD;IMEI;02;Enable1",
        titleAr: "تفعيل مخرج الإيقاف",
        titleEn: "Enable Output 1",
        desc: "فصل المحرك"
      },
      engineResume: {
        raw: "ST300CMD;IMEI;02;Disable1",
        titleAr: "إلغاء مخرج الإيقاف",
        titleEn: "Disable Output 1",
        desc: "إعادة التشغيل"
      }
    },
    smsConfig: "ST300NTW;IMEI;02;1;SERVER_IP;5011"
  }
];
