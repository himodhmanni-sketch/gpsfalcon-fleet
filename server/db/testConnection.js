import pg from 'pg';
const { Client } = pg;

const passwordsToTry = [
  process.env.PGPASSWORD,
  'postgres',
  'admin',
  'root',
  '123456',
  'password',
  ''
];

async function probe() {
  for (const pass of passwordsToTry) {
    if (pass === undefined) continue;
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pass,
      database: 'postgres',
      connectionTimeoutMillis: 2000
    });

    try {
      await client.connect();
      console.log(`[PostgreSQL Probe] SUCCESS! Connected to PostgreSQL with password: "${pass}"`);
      const res = await client.query('SELECT version();');
      console.log(`[PostgreSQL Probe] Version:`, res.rows[0].version);
      await client.end();
      return pass;
    } catch (err) {
      console.log(`[PostgreSQL Probe] Password "${pass}" failed: ${err.message}`);
    }
  }
  console.log('[PostgreSQL Probe] Could not connect with standard default passwords.');
  return null;
}

probe().then(pass => {
  process.exit(pass !== null ? 0 : 1);
});
