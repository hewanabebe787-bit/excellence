
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateRegistration, validateLogin } = require('./validators/auth.validator');
const { registerUser, loginUser, getCurrentUser } = require('./controllers/auth.controller');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const app = express();
const db = require('./db');
const validateStudentProfile = require('./validators/profile.validator');
const validateTutorProfile = require('./validators/tutor-profile.validator');
const requireTutor = require('./middleware/require-tutor');
const { uploadTutorDocuments: tutorUploadMiddleware } = require('./middleware/tutor-upload');
const {
  getTutorProfile,
  updateTutorProfile
} = require('./controllers/tutor.controller');
const {
  uploadTutorDocuments
} = require('./controllers/tutor-documents.controller');
const {
  getStudentProfile,
  updateStudentProfile
} = require('./controllers/student.controller');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
if (!process.env.SESSION_SECRET) {
  throw new Error('Missing SESSION_SECRET setting.');
}

app.use(session({
  store: new PgSession({
    pool: db,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
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

app.post('/api/auth/register', validateRegistration, registerUser);

app.post('/api/auth/login', validateLogin, loginUser);

app.get('/api/auth/me', getCurrentUser);

app.get('/api/student/profile', getStudentProfile);

app.put('/api/student/profile', validateStudentProfile, updateStudentProfile);

app.get('/api/tutor/profile', getTutorProfile);

app.put('/api/tutor/profile', validateTutorProfile, updateTutorProfile);

app.post(
  '/api/tutor/documents',
  requireTutor,
  tutorUploadMiddleware,
  uploadTutorDocuments
);

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