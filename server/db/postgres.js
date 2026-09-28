import pg from 'pg';
import 'dotenv/config';
import { reverseGeocode } from '../geocoder.js';
import { verifyPassword, generateToken, hashPassword } from '../auth.js';
import { validateClientPayload, validateDevicePayload, validateEmail } from '../validator.js';

const { Pool } = pg;

const isExternalOrSsl = process.env.DATABASE_URL 
  ? (process.env.DATABASE_URL.includes("sslmode=require") || process.env.PGSSL === "true")
  : false;

export const pgPool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isExternalOrSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PG_POOL_MAX || "20", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    })
  : new Pool({
      host: process.env.PGHOST || process.env.PG_HOST || "localhost",
      port: parseInt(process.env.PGPORT || process.env.PG_PORT || "5432", 10),
      user: process.env.PGUSER || process.env.PG_USER || "postgres",
      password: process.env.PGPASSWORD !== undefined ? process.env.PGPASSWORD : (process.env.PG_PASSWORD || "postgres"),
      database: process.env.PGDATABASE || process.env.PG_DATABASE || "gpswox_fleet",
      max: parseInt(process.env.PG_POOL_MAX || "20", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

pgPool.on('error', (err) => {
  console.error('[PostgreSQL Pool] Unexpected error on idle client:', err.message);
});

/**
 * Persists an incoming GPS packet and updates device's live status in PostgreSQL
 */
export async function persistTelemetry(imei, protocol, data, rawHex = null) {
  try {
    const lat = data.coords ? parseFloat(data.coords[0]) : null;
    const lng = data.coords ? parseFloat(data.coords[1]) : null;
    const rawSpeed = data.speed !== undefined ? parseFloat(data.speed) : 0;
    // Filter GPS drift: speeds under 4 km/h when stationary are treated as 0
    const speed = rawSpeed < 4 ? 0 : rawSpeed;
    const heading = data.heading !== undefined ? parseInt(data.heading) : 0;
    const ignition = !!data.ignition;
    const battery = data.batteryVoltage !== undefined ? parseFloat(data.batteryVoltage) : null;
    const gsm = data.gsmSignal !== undefined ? parseInt(data.gsmSignal) : 100;
    const status = speed >= 4 ? 'moving' : (ignition ? 'idle' : 'stopped');
    const odoDelta = speed >= 4 ? 0.015 : 0;

    // 1. Resolve reverse geocode address
    let address = null;
    if (lat && lng) {
      address = await reverseGeocode(lat, lng, pgPool);
    }

    // 2. Lookup existing device by imei or create new
    let actualDeviceId = null;
    const devCheck = await pgPool.query(
      `SELECT id FROM devices WHERE imei = $1 LIMIT 1;`,
      [imei]
    );

    if (devCheck.rows.length > 0) {
      actualDeviceId = devCheck.rows[0].id;
      // Update existing device
      await pgPool.query(
        `UPDATE devices SET
           status = $1,
           current_lat = $2,
           current_lng = $3,
           current_speed = $4,
           current_heading = $5,
           current_ignition = $6,
           current_battery = $7,
           current_gsm = $8,
           current_address = $9,
           odometer = COALESCE(odometer, 0) + $10,
           last_update = NOW()
         WHERE id = $11;`,
        [status, lat, lng, speed, heading, ignition, battery, gsm, address, odoDelta, actualDeviceId]
      );
    } else {
      actualDeviceId = `vh-${imei}`;
      // Insert new device
      await pgPool.query(
        `INSERT INTO devices (id, name, imei, protocol, status, current_lat, current_lng, current_speed, current_heading, current_ignition, current_battery, current_gsm, current_address, last_update)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW());`,
        [actualDeviceId, `مركبة ${imei.slice(-4)}`, imei, protocol, status, lat, lng, speed, heading, ignition, battery, gsm, address]
      );
    }

    // 3. Insert into positions time-series history
    await pgPool.query(
      `INSERT INTO positions (device_id, imei, latitude, longitude, speed, heading, ignition, battery_voltage, gsm_signal, address, raw_packet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [actualDeviceId, imei, lat, lng, speed, heading, ignition, battery, gsm, address, rawHex]
    );

    return { address, status };
  } catch (err) {
    console.error('[PostgreSQL] persistTelemetry error:', err.message);
    return null;
  }
}

/**
 * Fetches all fleet devices from PostgreSQL
 */
export async function getFleetDevices(user = null) {
  try {
    // Watchdog: If device has not transmitted for over 5 minutes, auto-transition from moving to stopped
    await pgPool.query(`
      UPDATE devices
      SET status = 'stopped', current_speed = 0
      WHERE last_update < NOW() - INTERVAL '5 minutes' AND (status = 'moving' OR current_speed > 0);
    `);

    let query = `
      SELECT id, name, imei, plate_number as "plateNumber", model, type, protocol, 
             protocol_port as "protocolPort", sim_number as "simNumber", 
             driver_name, driver_phone, client_id as "clientId", status, odometer, current_lat, current_lng,
             current_speed as speed, current_heading as heading, current_ignition as ignition,
             current_battery as "batteryVoltage", current_gsm as "gsmSignal",
             current_address as address, last_update as "lastUpdate"
      FROM devices
    `;
    // Strict Multi-Tenant Isolation
    if (!user) {
      return [];
    }

    const params = [];
    if (user.role !== 'superadmin') {
      query += ` WHERE client_id = $1`;
      params.push(user.id);
    }
    query += ` ORDER BY id ASC;`;

    const res = await pgPool.query(query, params);

    // For each device, fetch its latest 50 history points
    const devices = [];
    for (const row of res.rows) {
      let historyPath = [];
      try {
        const histRes = await pgPool.query(
          `SELECT latitude, longitude FROM positions WHERE imei = $1 ORDER BY recorded_at DESC LIMIT 50;`,
          [row.imei]
        );
        historyPath = histRes.rows.reverse().map(r => [parseFloat(r.latitude), parseFloat(r.longitude)]);
      } catch (e) {
        historyPath = [];
      }

      const coords = row.current_lat && row.current_lng 
        ? [parseFloat(row.current_lat), parseFloat(row.current_lng)] 
        : [24.7136, 46.6753];

      if (historyPath.length === 0) {
        historyPath = [coords];
      }

      devices.push({
        ...row,
        odometer: parseFloat(row.odometer || 0),
        speed: parseFloat(row.speed || 0),
        heading: parseInt(row.heading || 0),
        batteryVoltage: parseFloat(row.batteryVoltage || 12.6),
        gsmSignal: parseInt(row.gsmSignal || 100),
        coords,
        historyPath,
        driver: { name: row.driver_name || 'سائق غير معين', phone: row.driver_phone || '' }
      });
    }

    return devices;
  } catch (err) {
    console.error('[PostgreSQL] getFleetDevices error:', err.message);
    return [];
  }
}

/**
 * Saves or updates a device in PostgreSQL
 */
export async function saveDevice(dev) {
  try {
    const valResult = validateDevicePayload(dev);
    if (!valResult.valid) {
      throw new Error(valResult.errors.join(' | '));
    }
    const clean = valResult.sanitized;
    const id = clean.id || `vh-${clean.imei}`;

    await pgPool.query(`
      INSERT INTO devices (id, name, imei, plate_number, model, type, protocol, protocol_port, sim_number, driver_name, driver_phone, current_lat, current_lng, last_update)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (imei) DO UPDATE SET
        name = EXCLUDED.name,
        plate_number = EXCLUDED.plate_number,
        model = EXCLUDED.model,
        type = EXCLUDED.type,
        protocol = EXCLUDED.protocol,
        protocol_port = EXCLUDED.protocol_port,
        sim_number = EXCLUDED.sim_number,
        driver_name = EXCLUDED.driver_name,
        driver_phone = EXCLUDED.driver_phone,
        last_update = NOW();
    `, [id, clean.name, clean.imei, clean.plateNumber, clean.model, clean.type, clean.protocol, clean.protocolPort, clean.simNumber, clean.driverName, clean.driverPhone, clean.coords[0], clean.coords[1]]);

    return { success: true, id };
  } catch (err) {
    console.error('[PostgreSQL] saveDevice error:', err.message);
    throw err;
  }
}

/**
 * Deletes a device from PostgreSQL
 */
export async function deleteDevice(idOrImei) {
  try {
    await pgPool.query(`DELETE FROM devices WHERE id = $1 OR imei = $1;`, [idOrImei]);
    return { success: true };
  } catch (err) {
    console.error('[PostgreSQL] deleteDevice error:', err.message);
    throw err;
  }
}

/**
 * Fetches all geofences (both circular & polygon)
 */
export async function getGeofences() {
  try {
    const res = await pgPool.query(`
      SELECT id, name, type, color, fill_color as "fillColor", 
             latitude, longitude, radius, polygon_points as "polygonPoints", 
             active_vehicles as "activeVehicles", speed_limit as "speedLimit"
      FROM geofences ORDER BY created_at DESC;
    `);
    return res.rows.map(row => {
      const coords = row.latitude && row.longitude ? [parseFloat(row.latitude), parseFloat(row.longitude)] : null;
      let points = row.polygonPoints;
      if (typeof points === 'string') {
        try { points = JSON.parse(points); } catch(e) { points = null; }
      }
      return {
        ...row,
        center: coords,
        coords: coords,
        radius: row.radius ? parseInt(row.radius) : 500,
        polygonPoints: Array.isArray(points) ? points : null
      };
    });
  } catch (err) {
    console.error('[PostgreSQL] getGeofences error:', err.message);
    return [];
  }
}

/**
 * Saves a new geofence (circle or polygon) to PostgreSQL
 */
export async function saveGeofence(gf) {
  try {
    const id = gf.id || `zone-${Date.now()}`;
    const name = gf.name || 'منطقة جديدة';
    const type = gf.type || (gf.polygonPoints && gf.polygonPoints.length > 2 ? 'polygon' : 'circle');
    const color = gf.color || '#00b4c6';
    const fillColor = gf.fillColor || 'rgba(0, 180, 198, 0.2)';
    const lat = gf.center ? gf.center[0] : (gf.latitude || null);
    const lng = gf.center ? gf.center[1] : (gf.longitude || null);
    const radius = gf.radius || 500;
    const polygonPoints = gf.polygonPoints ? JSON.stringify(gf.polygonPoints) : null;

    await pgPool.query(`
      INSERT INTO geofences (id, name, type, color, fill_color, latitude, longitude, radius, polygon_points, active_vehicles)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        color = EXCLUDED.color,
        fill_color = EXCLUDED.fill_color,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        radius = EXCLUDED.radius,
        polygon_points = EXCLUDED.polygon_points;
    `, [id, name, type, color, fillColor, lat, lng, radius, polygonPoints, gf.activeVehicles || 0]);

    return { success: true, id };
  } catch (err) {
    console.error('[PostgreSQL] saveGeofence error:', err.message);
    throw err;
  }
}

/**
 * Deletes a geofence from PostgreSQL
 */
export async function deleteGeofence(id) {
  try {
    await pgPool.query(`DELETE FROM geofences WHERE id = $1;`, [id]);
    return { success: true };
  } catch (err) {
    console.error('[PostgreSQL] deleteGeofence error:', err.message);
    throw err;
  }
}

/**
 * Fetches recent events/alerts from PostgreSQL
 */
export async function getEvents(limit = 100) {
  try {
    const res = await pgPool.query(`
      SELECT id, device_id as "vehicleId", vehicle_name as "vehicleName",
             type, severity, message, latitude, longitude, is_read as "isRead",
             created_at as "timestamp"
      FROM events
      ORDER BY created_at DESC
      LIMIT $1;
    `, [limit]);

    return res.rows.map(row => ({
      ...row,
      coords: row.latitude && row.longitude ? [parseFloat(row.latitude), parseFloat(row.longitude)] : null,
      time: new Date(row.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }));
  } catch (err) {
    console.error('[PostgreSQL] getEvents error:', err.message);
    return [];
  }
}

/**
 * Persists an event or alert rule trigger
 */
export async function persistEvent(event) {
  try {
    await pgPool.query(
      `INSERT INTO events (id, device_id, vehicle_name, type, severity, message, latitude, longitude, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        event.id || `evt-${Date.now()}`,
        event.vehicleId || 'unknown',
        event.vehicleName || 'Vehicle',
        event.type || 'info',
        event.severity || 'info',
        event.message || '',
        event.coords ? event.coords[0] : null,
        event.coords ? event.coords[1] : null,
        false
      ]
    );
  } catch (err) {
    console.error('[PostgreSQL] persistEvent error:', err.message);
  }
}

/**
 * Fetches all enterprise clients from PostgreSQL
 */
export async function getClients() {
  try {
    const res = await pgPool.query(`
      SELECT id, name, email, company, phone, role, plan, max_devices as "maxDevices",
             expires_at as "expiresAt", status, created_at as "createdAt"
      FROM clients ORDER BY name ASC;
    `);
    return res.rows;
  } catch (err) {
    console.error('[PostgreSQL] getClients error:', err.message);
    return [];
  }
}

/**
 * Authenticates user credentials and returns JWT token + user profile
 */
export async function authenticateClient(email, plainPassword) {
  try {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }
    const cleanEmail = emailValidation.value;

    const res = await pgPool.query(
      `SELECT id, name, email, company, phone, role, plan, max_devices as "maxDevices",
              expires_at as "expiresAt", status, password_hash
       FROM clients WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
      [cleanEmail]
    );
    if (res.rows.length === 0) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل في المنظومة' };
    }
    const user = res.rows[0];
    if (user.status !== 'active') {
      return { success: false, error: 'تم تعطيل هذا الحساب، يرجى التواصل مع إدارة النظام' };
    }
    const isMatch = await verifyPassword(plainPassword, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }
    delete user.password_hash;
    const token = generateToken(user);
    return { success: true, user, token };
  } catch (err) {
    console.error('[PostgreSQL] authenticateClient error:', err.message);
    return { success: false, error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' };
  }
}

/**
 * Creates or updates an enterprise client with optional secure password
 */
export async function saveClient(client) {
  try {
    const valResult = validateClientPayload(client);
    if (!valResult.valid) {
      throw new Error(valResult.errors.join(' | '));
    }
    const clean = valResult.sanitized;
    const id = clean.id || `cl-${Date.now()}`;
    let passHash = null;
    if (clean.password) {
      passHash = await hashPassword(clean.password);
    } else {
      passHash = await hashPassword('client123');
    }
    await pgPool.query(`
      INSERT INTO clients (id, name, email, company, phone, role, plan, max_devices, expires_at, status, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        company = EXCLUDED.company,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        plan = EXCLUDED.plan,
        max_devices = EXCLUDED.max_devices,
        status = EXCLUDED.status,
        password_hash = COALESCE(EXCLUDED.password_hash, clients.password_hash);
    `, [
      id,
      clean.name,
      clean.email,
      clean.company,
      clean.phone,
      clean.role,
      clean.plan,
      clean.maxDevices,
      clean.expiresAt,
      clean.status,
      passHash
    ]);
    return { success: true, id };
  } catch (err) {
    console.error('[PostgreSQL] saveClient error:', err.message);
    throw err;
  }
}

/**
 * Fetches all fleet expenses from PostgreSQL
 */
export async function getExpenses() {
  try {
    const res = await pgPool.query(`
      SELECT id, device_id as "vehicleId", vehicle_name as "vehicleName",
             type, amount, odometer, supplier, date, notes
      FROM expenses ORDER BY date DESC;
    `);
    return res.rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount || 0),
      odometer: parseFloat(r.odometer || 0)
    }));
  } catch (err) {
    console.error('[PostgreSQL] getExpenses error:', err.message);
    return [];
  }
}

/**
 * Adds an expense record to PostgreSQL
 */
export async function saveExpense(exp) {
  try {
    const id = exp.id || `exp-${Date.now()}`;
    await pgPool.query(`
      INSERT INTO expenses (id, device_id, vehicle_name, type, amount, odometer, supplier, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [
      id,
      exp.vehicleId,
      exp.vehicleName,
      exp.type,
      exp.amount,
      exp.odometer || 0,
      exp.supplier || '',
      exp.date || new Date().toISOString().split('T')[0],
      exp.notes || ''
    ]);
    return { success: true, id };
  } catch (err) {
    console.error('[PostgreSQL] saveExpense error:', err.message);
    throw err;
  }
}

/**
 * Fetches historical path for a vehicle from PostgreSQL
 */
export async function getDeviceHistory(imei, limit = 500) {
  try {
    const res = await pgPool.query(`
      SELECT latitude, longitude, speed, heading, ignition, recorded_at, address
      FROM positions
      WHERE imei = $1
      ORDER BY recorded_at ASC
      LIMIT $2;
    `, [imei, limit]);

    return res.rows.map(r => ({
      coords: [parseFloat(r.latitude), parseFloat(r.longitude)],
      speed: parseFloat(r.speed),
      heading: parseInt(r.heading),
      ignition: r.ignition,
      recordedAt: r.recorded_at,
      address: r.address
    }));
  } catch (err) {
    console.error('[PostgreSQL] getDeviceHistory error:', err.message);
    return [];
  }
}
