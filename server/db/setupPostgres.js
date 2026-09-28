import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Client, Pool } = pg;

const DB_CONFIG = {
  host: process.env.PGHOST || process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PGPORT || process.env.PG_PORT || '5432', 10),
  user: process.env.PGUSER || process.env.PG_USER || 'postgres',
  password: process.env.PGPASSWORD !== undefined ? process.env.PGPASSWORD : (process.env.PG_PASSWORD || 'postgres')
};

export async function initPostgres() {
  let pool;
  
  if (process.env.DATABASE_URL) {
    console.log('[PostgreSQL] Connecting via DATABASE_URL...');
    const isExternalOrSsl = process.env.DATABASE_URL.includes("sslmode=require") || process.env.PGSSL === "true";
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isExternalOrSsl ? { rejectUnauthorized: false } : false
    });
  } else {
    console.log('[PostgreSQL] Connecting to server to verify database...');
    const rootClient = new Client({ ...DB_CONFIG, database: 'postgres' });
    await rootClient.connect();

    const checkDb = await rootClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'gpswox_fleet';"
    );

    if (checkDb.rows.length === 0) {
      console.log("[PostgreSQL] Creating database 'gpswox_fleet'...");
      await rootClient.query('CREATE DATABASE gpswox_fleet;');
      console.log("[PostgreSQL] Database 'gpswox_fleet' created successfully.");
    } else {
      console.log("[PostgreSQL] Database 'gpswox_fleet' already exists.");
    }
    await rootClient.end();

    // Connect to gpswox_fleet and apply schema
    pool = new Pool({ ...DB_CONFIG, database: process.env.PGDATABASE || 'gpswox_fleet' });
  }

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  console.log("[PostgreSQL] Executing schema tables...");
  await pool.query(schemaSql);
  console.log("[PostgreSQL] Schema applied successfully! All tables ready.");

  // Check and seed initial data if empty
  const countClients = await pool.query("SELECT COUNT(*) FROM clients;");
  if (parseInt(countClients.rows[0].count) === 0) {
    console.log("[PostgreSQL] Seeding initial clients & devices...");
    await pool.query(`
      INSERT INTO clients (id, name, email, company, phone, plan, max_devices, expires_at, status) VALUES
      ('cl-01', 'Himod Hmanni', 'himodhmanni@gmail.com', 'Hmanni Logistics & Fleet Co.', '+966 50 123 4567', 'Enterprise VIP', 50, '2027-12-31', 'active'),
      ('cl-02', 'Al-Futtaim Transport', 'fleet@alfuttaim-logistics.com', 'Al-Futtaim Logistics', '+971 4 290 8800', 'Fleet Pro', 25, '2026-11-20', 'active'),
      ('cl-03', 'Saudi Cold Chain Delivery', 'admin@saudicoldchain.sa', 'Saudi Cold Chain', '+966 11 488 2311', 'Standard', 10, '2026-10-15', 'active');
    `);

    await pool.query(`
      INSERT INTO devices (id, name, imei, plate_number, model, type, protocol, protocol_port, sim_number, driver_name, driver_phone, client_id, status, odometer, current_lat, current_lng, current_speed, current_heading, current_ignition, current_battery, current_gsm, current_address) VALUES
      ('vh-01', 'Demo 24', '864201049281745', 'أ ب ج 1042', 'Mercedes Actros Reefer', 'truck', 'GT06', 5023, '+966540001122', 'أحمد منصور الحارثي', '+966501112233', 'cl-01', 'moving', 88656.18, 24.7136, 46.6753, 64, 45, TRUE, 24.4, 98, 'طريق الملك فهد، حي المروج، الرياض'),
      ('vh-02', 'Demo 23', '864201049281746', 'د هـ و 3390', 'Toyota Hilux 4x4', 'car', 'Teltonika', 5027, '+966540001123', 'سالم الدوسري', '+966502223344', 'cl-01', 'stopped', 114220.50, 24.7500, 46.6900, 0, 180, FALSE, 12.6, 92, 'مستودعات السلي، مخرج 18، الرياض'),
      ('vh-03', 'Demo 25', '864201049281747', 'س ص ع 7712', 'Isuzu NPR Chilled', 'truck', 'Coban', 5001, '+966540001124', 'محمد عبد الله الشمري', '+966503334455', 'cl-01', 'idle', 64150.00, 24.6800, 46.7200, 0, 90, TRUE, 12.8, 85, 'حي الملز، شارع صلاح الدين، الرياض');
    `);

    await pool.query(`
      INSERT INTO geofences (id, name, type, color, fill_color, latitude, longitude, radius, active_vehicles) VALUES
      ('zone-01', 'المستودع المركزي (الرياض)', 'circle', '#10b981', 'rgba(16, 185, 129, 0.18)', 24.7136, 46.6753, 600, 2),
      ('zone-02', 'المنطقة المحظورة (محيط المطار)', 'circle', '#ef4444', 'rgba(239, 68, 68, 0.18)', 24.7800, 46.7200, 1200, 0);
    `);

    console.log("[PostgreSQL] Seed data populated successfully.");
  }

  return pool;
}

// Direct execution test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initPostgres().then(pool => {
    console.log("[PostgreSQL] Setup complete!");
    pool.end();
    process.exit(0);
  }).catch(err => {
    console.error("[PostgreSQL] Setup failed:", err);
    process.exit(1);
  });
}
