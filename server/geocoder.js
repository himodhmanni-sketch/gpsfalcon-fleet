import http from 'http';
import https from 'https';

// In-memory quick LRU cache
const memoryCache = new Map();

/**
 * Reverse geocodes latitude and longitude into street and city name
 * Uses PostgreSQL cache if available, falling back to OSM Nominatim API
 */
export async function reverseGeocode(lat, lng, pgPool = null) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return "موقع غير محدد";

  const latRound = parseFloat(parseFloat(lat).toFixed(4));
  const lngRound = parseFloat(parseFloat(lng).toFixed(4));
  const cacheKey = `${latRound},${lngRound}`;

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. Check PostgreSQL cache
  if (pgPool) {
    try {
      const res = await pgPool.query(
        "SELECT address FROM geocoding_cache WHERE lat_round = $1 AND lng_round = $2 LIMIT 1;",
        [latRound, lngRound]
      );
      if (res.rows.length > 0) {
        const addr = res.rows[0].address;
        memoryCache.set(cacheKey, addr);
        return addr;
      }
    } catch (e) {
      // ignore cache read failure
    }
  }

  // 3. Fallback to Nominatim Reverse Geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latRound}&lon=${lngRound}&zoom=18&addressdetails=1&accept-language=ar,en`;
    const response = await fetchWithTimeout(url, 2500);

    if (response && response.display_name) {
      let resolved = response.display_name;
      // Extract concise road, suburb, city
      if (response.address) {
        const road = response.address.road || response.address.street;
        const suburb = response.address.suburb || response.address.neighbourhood || response.address.residential;
        const city = response.address.city || response.address.town || response.address.state;
        if (road && (suburb || city)) {
          resolved = [road, suburb, city].filter(Boolean).join("، ");
        }
      }

      memoryCache.set(cacheKey, resolved);

      // Save to PostgreSQL cache
      if (pgPool) {
        pgPool.query(
          "INSERT INTO geocoding_cache (lat_round, lng_round, address) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;",
          [latRound, lngRound, resolved]
        ).catch(() => {});
      }

      return resolved;
    }
  } catch (err) {
    // network timeout or rate limit
  }

  // Local fallback approximation based on known Riyadh coordinates
  const approx = approximateKnownArea(latRound, lngRound);
  memoryCache.set(cacheKey, approx);
  return approx;
}

function approximateKnownArea(lat, lng) {
  if (lat >= 24.70 && lat <= 24.75 && lng >= 46.65 && lng <= 46.70) {
    return "طريق الملك فهد، حي المروج، الرياض";
  }
  if (lat >= 24.74 && lat <= 24.78 && lng >= 46.67 && lng <= 46.72) {
    return "حي النرجس، طريق أبي بكر الصديق، الرياض";
  }
  if (lat >= 24.66 && lat <= 24.70 && lng >= 46.70 && lng <= 46.75) {
    return "شارع صلاح الدين الأيوبي، حي الملز، الرياض";
  }
  return `إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

async function fetchWithTimeout(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GPSWOX-Fleet-Tracker/4.5 (support@gpswox.com)'
      }
    });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}
