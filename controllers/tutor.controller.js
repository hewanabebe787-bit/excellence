const db = require('../db');

function authorizeTutor(req, res) {
  if (!req.session.user) {
    res.status(401).json({ error: 'Please sign in.' });
    return false;
  }

  if (req.session.user.role !== 'tutor') {
    res.status(403).json({ error: 'Tutor access required.' });
    return false;
  }

  return true;
}

async function getTutorProfile(req, res) {
  if (!authorizeTutor(req, res)) return;

  try {
    const result = await db.query(
      `SELECT phone_number AS "phoneNumber",
              education_level AS "educationLevel",
              subjects,
              experience_details AS "experienceDetails",
              availability,
              hourly_rate AS "hourlyRate"
       FROM tutor_profiles
       WHERE user_id = $1`,
      [req.session.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Tutor profile not found.' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Could not load tutor profile:', error);
    res.status(500).json({ error: 'Could not load your profile.' });
  }
}

async function updateTutorProfile(req, res) {
  if (!authorizeTutor(req, res)) return;

  const {
    phoneNumber,
    educationLevel,
    subjects,
    experienceDetails,
    availability,
    hourlyRate
  } = req.tutorProfileData;

  try {
    const result = await db.query(
      `UPDATE tutor_profiles
       SET phone_number = $1,
           education_level = $2,
           subjects = $3,
           experience_details = $4,
           availability = $5,
           hourly_rate = $6
       WHERE user_id = $7
       RETURNING phone_number AS "phoneNumber",
                 education_level AS "educationLevel",
                 subjects,
                 experience_details AS "experienceDetails",
                 availability,
                 hourly_rate AS "hourlyRate"`,
      [
        phoneNumber,
        educationLevel,
        subjects,
        experienceDetails,
        availability,
        hourlyRate,
        req.session.user.id
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Tutor profile not found.' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Could not update tutor profile:', error);
    res.status(500).json({ error: 'Could not save your profile.' });
  }
}

module.exports = { getTutorProfile, updateTutorProfile };