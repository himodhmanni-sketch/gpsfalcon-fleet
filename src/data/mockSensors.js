export const defaultSensorDefinitions = [
  {
    id: "sn-01",
    name: "مستشعر دوران المحرك (Ignition / ACC)",
    nameEn: "Engine Ignition Sensor",
    type: "acc",
    input: "digital1",
    valueType: "boolean",
    onValue: "ON (يعمل)",
    offValue: "OFF (متوقف)",
    calibration: []
  },
  {
    id: "sn-02",
    name: "مستشعر جهد البطارية الرئيسية",
    nameEn: "Main Battery Voltage",
    type: "battery",
    input: "analog1",
    valueType: "volts",
    unit: "V",
    formula: "val / 1000",
    minValue: 9.0,
    maxValue: 28.5
  },
  {
    id: "sn-03",
    name: "مستوى خزان الوقود التناظري",
    nameEn: "Fuel Tank Level (Analog)",
    type: "fuel",
    input: "analog2",
    valueType: "liters",
    unit: "L",
    capacity: 70,
    calibration: [
      { raw: 0, val: 0 },
      { raw: 2500, val: 35 },
      { raw: 5000, val: 70 }
    ]
  },
  {
    id: "sn-04",
    name: "مستشعر حرارة صندوق التبريد",
    nameEn: "Cargo Temperature Sensor",
    type: "temperature",
    input: "1wire_temp1",
    valueType: "celsius",
    unit: "°C",
    minValue: -25,
    maxValue: 10
  },
  {
    id: "sn-05",
    name: "حساس فتح وإغلاق أبواب الحمولة",
    nameEn: "Cargo Door Sensor",
    type: "door",
    input: "digital2",
    valueType: "boolean",
    onValue: "مفتوح (Open)",
    offValue: "مغلق (Closed)"
  }
];
