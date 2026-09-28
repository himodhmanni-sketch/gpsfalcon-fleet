// Traccar-aligned Coban GPS103 Protocol Parser
// Port: 5001 | Packet: ASCII Strings

export function parseGps103(buffer) {
  const text = buffer.toString('ascii');

  // 1. Handshake / Login: ##,imei:358742012345678,A;
  if (text.startsWith("##,imei:") || text.startsWith("imei:")) {
    const parts = text.split(',');
    const imeiPart = parts.find(p => p.includes("imei:"));
    const imei = imeiPart ? imeiPart.replace("imei:", "").trim() : "unknown";

    return {
      type: "login",
      imei: imei,
      responseBuffer: Buffer.from("LOAD\r\n", "ascii")
    };
  }

  // 2. Position Report: imei:...,tracker,1001010000,123456,F,080000.000,A,2442.8160,N,04640.5000,E,045.2,180.0,000000;
  if (text.includes(",tracker,") || text.includes(",help me,") || text.includes(",speed,")) {
    const parts = text.replace(";", "").split(',');
    const imei = parts[0].replace("imei:", "").trim();

    // NMEA coordinate converter (DDMM.MMMM to decimal degrees)
    const rawLatIndex = parts.findIndex(p => p === "N" || p === "S") - 1;
    let lat = 0;
    let lng = 0;

    if (rawLatIndex > 0) {
      const rawLat = parseFloat(parts[rawLatIndex]);
      const latHem = parts[rawLatIndex + 1];
      const rawLng = parseFloat(parts[rawLatIndex + 2]);
      const lngHem = parts[rawLatIndex + 3];

      const latDeg = Math.floor(rawLat / 100);
      const latMin = rawLat % 100;
      lat = latDeg + (latMin / 60.0);
      if (latHem === "S") lat = -lat;

      const lngDeg = Math.floor(rawLng / 100);
      const lngMin = rawLng % 100;
      lng = lngDeg + (lngMin / 60.0);
      if (lngHem === "W") lng = -lng;
    }

    const speedKmh = parseFloat(parts[rawLatIndex + 4] || "0") * 1.852; // knots to km/h
    const heading = parseFloat(parts[rawLatIndex + 5] || "0");

    return {
      type: "location",
      imei: imei,
      coords: [lat || 24.7136, lng || 46.6753],
      speed: Math.round(speedKmh),
      heading: heading,
      ignition: true,
      responseBuffer: Buffer.from("ON\r\n", "ascii")
    };
  }

  // 3. Heartbeat: [IMEI]
  return {
    type: "heartbeat",
    responseBuffer: Buffer.from("ON\r\n", "ascii")
  };
}
