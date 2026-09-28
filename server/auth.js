import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Load JWT Secret securely from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
  }
  console.warn('⚠️ [Security Warning] JWT_SECRET is not set in environment. Falling back to temporary local key.');
}
const ACTIVE_JWT_SECRET = JWT_SECRET || 'dev_insecure_fallback_key_replace_immediately_in_env_file';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compares plaintext password against bcrypt hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generates signed JWT token for user session
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'client',
    company: user.company || '',
    maxDevices: user.max_devices || user.maxDevices || 25,
    plan: user.plan || 'Fleet Pro'
  };
  return jwt.sign(payload, ACTIVE_JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, ACTIVE_JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and authenticates user from incoming HTTP request
 */
export function authenticateRequest(req) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check url query parameter
    try {
      const url = new URL(req.url, 'http://localhost');
      token = url.searchParams.get('token');
    } catch (e) {}
  }

  if (!token) return null;
  return verifyToken(token);
}
