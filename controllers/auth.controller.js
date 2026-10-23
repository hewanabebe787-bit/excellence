const { promisify } = require('node:util');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const db = require('../db');

const scryptAsync = promisify(scrypt);

async function registerUser(req, res) {
  const { fullName, email, password, role, subject, details, feeMin, feeMax } =
    req.registrationData;
  let client;

  try {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scryptAsync(password, salt, 64)).toString('hex');

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
}
async function loginUser(req, res) {
    const { email, password, role } = req.loginData;
  
    try {
      const result = await db.query(
        `SELECT id, full_name, email, role, password_hash
         FROM users
         WHERE email = $1`,
        [email]
      );
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: 'Email or password is incorrect.' });
      }
  
      const [salt, hashHex] = user.password_hash.split(':');
      if (!/^[a-f0-9]{32}$/i.test(salt || '') || !/^[a-f0-9]{128}$/i.test(hashHex || '')) {
        return res.status(401).json({ error: 'Email or password is incorrect.' });
      }
  
      const savedHash = Buffer.from(hashHex, 'hex');
      const submittedHash = await scryptAsync(password, salt, savedHash.length);
  
      if (!timingSafeEqual(savedHash, submittedHash)) {
        return res.status(401).json({ error: 'Email or password is incorrect.' });
      }
      if (user.role !== role) {
        return res.status(403).json({ error: `This account is not registered as a ${role}.` });
      }
      await new Promise((resolve, reject) => {
        req.session.regenerate((error) => error ? reject(error) : resolve());
      });
  
      req.session.user = { id: user.id, role: user.role };
  
      await new Promise((resolve, reject) => {
        req.session.save((error) => error ? reject(error) : resolve());
      });
  
      res.json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ error: 'Could not sign in.' });
    }
  }
  async function getCurrentUser(req, res) {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Please sign in.' });
    }
  
    try {
      const result = await db.query(
        `SELECT id, full_name, email, role
         FROM users
         WHERE id = $1`,
        [req.session.user.id]
      );
  
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Please sign in.' });
      }
  
      res.json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Could not load current user:', error);
      res.status(500).json({ error: 'Could not load your account.' });
    }
  }
module.exports = { registerUser, loginUser, getCurrentUser };