import pg from 'pg';
import { hashPassword } from '../auth.js';

const { Pool } = pg;

export async function runAuthMigration() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/gpswox_fleet'
  });

  try {
    console.log('[Auth Migration] Updating clients schema and users...');

    // 1. Ensure password_hash exists in clients table
    await pool.query(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `);

    // 2. Generate bcrypt hashes for default accounts
    const adminHash = await hashPassword('admin123');
    const fleetHash = await hashPassword('fleet123');
    const pass123Hash = await hashPassword('pass123');

    // 3. Upsert SuperAdmin
    await pool.query(`
      INSERT INTO clients (id, name, email, company, phone, role, plan, max_devices, expires_at, status, password_hash)
      VALUES (
        'cl-admin',
        'مدير المنظومة (Super Admin)',
        'admin@gpswox.com',
        'GPSWOX Enterprise Global',
        '+218 91 000 0000',
        'superadmin',
        'Unlimited Enterprise',
        999,
        '2035-12-31',
        'active',
        $1
      )
      ON CONFLICT (email) DO UPDATE SET
        role = 'superadmin',
        password_hash = $1;
    `, [adminHash]);

    // 4. Upsert Himod Hmanni (owner of Muhaymin vehicle)
    await pool.query(`
      INSERT INTO clients (id, name, email, company, phone, role, plan, max_devices, expires_at, status, password_hash)
      VALUES (
        'cl-01',
        'Himod Hmanni',
        'himodhmanni@gmail.com',
        'Hmanni Fleet Management (Libya)',
        '+218 92 123 4567',
        'client',
        'Enterprise VIP',
        50,
        '2028-12-31',
        'active',
        $1
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1;
    `, [adminHash]);

    // 5. Upsert Al-Futtaim Logistics
    await pool.query(`
      INSERT INTO clients (id, name, email, company, phone, role, plan, max_devices, expires_at, status, password_hash)
      VALUES (
        'cl-02',
        'Al-Futtaim Transport',
        'fleet@alfuttaim-logistics.com',
        'Al-Futtaim Logistics',
        '+971 4 290 8800',
        'client',
        'Fleet Pro',
        25,
        '2027-11-20',
        'active',
        $1
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1;
    `, [fleetHash]);

    // 6. Link vehicle 'مهيمن' (869727071244774) to cl-01
    await pool.query(`
      UPDATE devices 
      SET client_id = 'cl-01' 
      WHERE imei = '869727071244774';
    `);

    // 7. Link demo vehicles to cl-02
    await pool.query(`
      UPDATE devices 
      SET client_id = 'cl-02' 
      WHERE id IN ('vh-01', 'vh-02', 'vh-03');
    `);

    console.log('[Auth Migration] Successfully synced clients with bcrypt passwords & multi-tenant assignments.');
  } catch (err) {
    console.error('[Auth Migration] Error:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('auth_migration.js')) {
  runAuthMigration().then(() => process.exit(0)).catch(() => process.exit(1));
}
