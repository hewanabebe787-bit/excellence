const { Pool } = require('pg');

const requiredSettings = ['PGDATABASE', 'PGUSER', 'PGPASSWORD'];
const missingSettings = requiredSettings.filter((name) => !process.env[name]);

if (missingSettings.length > 0) {
  throw new Error(`Missing PostgreSQL settings: ${missingSettings.join(', ')}`);
}

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;