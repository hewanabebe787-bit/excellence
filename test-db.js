const { Pool } = require('pg');

// Setup connection details
const pool = new Pool({
  user: 'postgres',         // Your database username
  host: 'localhost',        // Running locally
  database: 'Excellence',   // Change this if your database name in pgAdmin is different
  port: 5432,               // Default port
});

async function checkConnection() {
  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    
    // Ask the database for the current server time to prove it's responding
    const res = await pool.query('SELECT NOW() AS current_time');
    
    console.log('✅ Connection Successful!');
    console.log('📅 Server Time from Database:', res.rows[0].current_time);
    
  } catch (err) {
    console.error('❌ Connection Failed!');
    console.error('Error details:', err.message);
  } finally {
    // Safely close the test connection
    await pool.end();
  }
}

checkConnection();