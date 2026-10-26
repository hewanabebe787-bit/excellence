const db = require('../db');

function authorizeStudent(req, res) {
  if (!req.session.user) {
    res.status(401).json({ error: 'Please sign in.' });
    return false;
  }

  if (req.session.user.role !== 'student') {
    res.status(403).json({ error: 'Student access required.' });
    return false;
  }

  return true;
}
// 


async function getStudentProfile(req, res) {
  if (!authorizeStudent(req, res)) return;

  try {
    const result = await db.query(
      `SELECT phone_number AS "phoneNumber",
              education_level AS "educationLevel",
              school_name AS "schoolName",
              learning_goals AS "learningGoals"
       FROM student_profiles
       WHERE user_id = $1`,
      [req.session.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Could not load student profile:', error);
    res.status(500).json({ error: 'Could not load your profile.' });
  }
}

async function createStudentTutorRequest(req, res) {
  if (!authorizeStudent(req, res)) return;

  const { subject, details, feeMin, feeMax } = req.studentRequestData;

  try {
    const result = await db.query(
      `INSERT INTO tutor_requests
         (student_id, subject, details, fee_min, fee_max)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING subject,
                 details,
                 fee_min AS "feeMin",
                 fee_max AS "feeMax"`,
      [
        req.session.user.id,
        subject,
        details || null,
        feeMin,
        feeMax
      ]
    );

    res.status(201).json({ request: result.rows[0] });
  } catch (error) {
    console.error('Could not create student tutor request:', error);
    res.status(500).json({ error: 'Could not submit your tutor request.' });
  }
}

async function getStudentTutorRequests(req, res) {
  if (!authorizeStudent(req, res)) return;

  try {
    const result = await db.query(
      `SELECT subject,
              details,
              fee_min AS "feeMin",
              fee_max AS "feeMax"
       FROM tutor_requests
       WHERE student_id = $1
       ORDER BY id DESC`,
      [req.session.user.id]
    );

    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Could not load student tutor requests:', error);
    res.status(500).json({ error: 'Could not load your tutor requests.' });
  }
}

async function updateStudentProfile(req, res) {
  if (!authorizeStudent(req, res)) return;

  const { phoneNumber, educationLevel, schoolName, learningGoals } =
    req.studentProfileData;

  try {
    const result = await db.query(
      `UPDATE student_profiles
       SET phone_number = $1,
           education_level = $2,
           school_name = $3,
           learning_goals = $4
       WHERE user_id = $5
       RETURNING phone_number AS "phoneNumber",
                 education_level AS "educationLevel",
                 school_name AS "schoolName",
                 learning_goals AS "learningGoals"`,
      [phoneNumber, educationLevel, schoolName, learningGoals, req.session.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Could not update student profile:', error);
    res.status(500).json({ error: 'Could not save your profile.' });
  }
}

module.exports = { getStudentProfile, updateStudentProfile, getStudentTutorRequests, createStudentTutorRequest };