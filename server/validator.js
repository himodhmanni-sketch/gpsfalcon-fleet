/**
 * Enterprise Input Sanitization & Validation Module
 * Guards database and business logic against malicious or malformed inputs.
 */

// Email regex conforming to RFC 5322 simplified standard
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Valid RBAC roles in system
const VALID_ROLES = new Set(['superadmin', 'reseller', 'company', 'client', 'driver']);

/**
 * Sanitizes generic string: trims, removes control characters, and limits max length
 */
export function sanitizeString(val, maxLength = 255) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  // Remove control characters except standard whitespace
  const sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized.slice(0, maxLength);
}

/**
 * Validates and normalizes email
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 255) {
    return { valid: false, error: 'البريد الإلكتروني طويل جداً' };
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صالحة' };
  }
  return { valid: true, value: cleanEmail };
}

/**
 * Validates user / client payload before saving to database
 */
export function validateClientPayload(payload) {
  const errors = [];

  const emailCheck = validateEmail(payload.email);
  if (!emailCheck.valid) {
    errors.push(emailCheck.error);
  }

  const name = sanitizeString(payload.name, 100);
  if (!name || name.length < 2) {
    errors.push('الاسم الكامل يجب أن يتكون من حرفين على الأقل');
  }

  const role = payload.role ? String(payload.role).toLowerCase() : 'client';
  if (!VALID_ROLES.has(role)) {
    errors.push(`الدور '${role}' غير معتمد في المنظومة`);
  }

  if (payload.password && String(payload.password).length < 6) {
    errors.push('كلمة المرور يجب أن لا تقل عن 6 خانات');
  }

  const maxDevices = parseInt(payload.maxDevices || payload.max_devices || '25', 10);
  if (isNaN(maxDevices) || maxDevices < 1 || maxDevices > 100000) {
    errors.push('الحد الأقصى للمركبات يجب أن يكون رقماً بين 1 و 100,000');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      id: sanitizeString(payload.id, 64) || undefined,
      name,
      email: emailCheck.valid ? emailCheck.value : sanitizeString(payload.email, 255),
      company: sanitizeString(payload.company, 150),
      phone: sanitizeString(payload.phone, 30),
      role,
      plan: sanitizeString(payload.plan, 50) || 'Fleet Pro',
      maxDevices: isNaN(maxDevices) ? 25 : maxDevices,
      expiresAt: sanitizeString(payload.expiresAt || payload.expires_at, 30) || '2028-12-31',
      status: payload.status === 'suspended' ? 'suspended' : 'active',
      password: payload.password ? String(payload.password).slice(0, 128) : undefined
    }
  };
}

/**
 * Validates device payload before insertion or update
 */
export function validateDevicePayload(payload) {
  const errors = [];

  const imei = sanitizeString(payload.imei, 30);
  if (!imei || !/^\w{6,25}$/.test(imei)) {
    errors.push('معرف الجهاز أو IMEI غير صالح (يجب أن يكون بين 6 إلى 25 حرف أو رقم)');
  }

  const name = sanitizeString(payload.name, 100);
  const plateNumber = sanitizeString(payload.plateNumber || payload.plate_number, 30);
  const model = sanitizeString(payload.model, 80);
  const type = sanitizeString(payload.type, 30) || 'car';
  const protocol = sanitizeString(payload.protocol, 30) || 'GT06';
  const protocolPort = parseInt(payload.protocolPort || payload.protocol_port || '5023', 10);
  const simNumber = sanitizeString(payload.simNumber || payload.sim_number, 30);
  const driverName = sanitizeString(payload.driver?.name || payload.driverName || '', 100);
  const driverPhone = sanitizeString(payload.driver?.phone || payload.driverPhone || '', 30);

  let lat = 24.7136;
  let lng = 46.6753;
  if (Array.isArray(payload.coords) && payload.coords.length === 2) {
    const pLat = parseFloat(payload.coords[0]);
    const pLng = parseFloat(payload.coords[1]);
    if (!isNaN(pLat) && pLat >= -90 && pLat <= 90) lat = pLat;
    if (!isNaN(pLng) && pLng >= -180 && pLng <= 180) lng = pLng;
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      id: sanitizeString(payload.id, 64) || undefined,
      name: name || `مركبة ${imei.slice(-4)}`,
      imei,
      plateNumber,
      model,
      type,
      protocol,
      protocolPort: isNaN(protocolPort) ? 5023 : protocolPort,
      simNumber,
      driverName,
      driverPhone,
      coords: [lat, lng]
    }
  };
}

/**
 * Validates geographic coordinate point
 */
export function validateCoordinates(lat, lng) {
  const pLat = parseFloat(lat);
  const pLng = parseFloat(lng);
  if (isNaN(pLat) || pLat < -90 || pLat > 90) return false;
  if (isNaN(pLng) || pLng < -180 || pLng > 180) return false;
  return true;
}
