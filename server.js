const express = require('express');
const cors = require('cors');
const { promisify } = require('node:util');
const { randomBytes, scrypt } = require('node:crypto');
require('dotenv').config();

const app = express();
const db = require('./db');
const scryptAsync = promisify(scrypt);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT current_user, current_database()');
    res.json({ status: 'ok', ...result.rows[0] });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.post('/api/auth/register', validateRegistration, async (req, res) => {
  const { fullName, email, password, role, subject, details, feeMin, feeMax } = req.registrationData;

  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)).toString('hex');
  let client;

  try {
    client = await db.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [fullName, email, `${salt}:${hash}`, role]
    );
    const user = result.rows[0];

    if (role === 'student') {
      await client.query(
        'INSERT INTO student_profiles (user_id) VALUES ($1)',
        [user.id]
      );
      if (subject) {
        await client.query(
          `INSERT INTO tutor_requests (student_id, subject, details, fee_min, fee_max)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, subject, details || null, feeMin, feeMax]
        );
      }
      
    } else {
      await client.query(
        'INSERT INTO tutor_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ user });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Registration rollback failed:', rollbackError);
      }
    }

    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    console.error('Account registration failed:', error);
    res.status(500).json({ error: 'Could not create the account.' });
  } finally {
    if (client) client.release();
  }
});

async function startServer() {
  await db.query('SELECT 1');
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Could not connect to PostgreSQL:', error);
  process.exitCode = 1;
});