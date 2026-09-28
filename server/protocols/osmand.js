// Traccar Client / OsmAnd Protocol Handler
// Port: 5055 | Format: HTTP GET/POST Query Parameters

export function parseOsmAnd(urlQuery) {
  const params = new URLSearchParams(urlQuery);
  const id = params.get("id") || params.get("deviceid");
  const lat = parseFloat(params.get("lat"));
  const lon = parseFloat(params.get("lon") || params.get("lng"));
  const speed = parseFloat(params.get("speed") || "0"); // knots or m/s or km/h
  const bearing = parseFloat(params.get("bearing") || params.get("heading") || "0");
  const altitude = parseFloat(params.get("altitude") || "0");
  const batt = parseFloat(params.get("batt") || "100");

  if (!id || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  // Convert speed: Traccar OsmAnd protocol receives speed in knots, convert to km/h
  const speedKmh = Math.round(speed * 1.852);

  return {
    type: "location",
    imei: id,
    coords: [lat, lon],
    speed: speedKmh,
    heading: Math.round(bearing),
    altitude: Math.round(altitude),
    batteryVoltage: batt,
    timestamp: new Date()
  };
}
