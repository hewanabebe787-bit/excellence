
function validateTutorProfile(request, response, next) {
    const body =
      request.body && typeof request.body === 'object' && !Array.isArray(request.body)
        ? request.body
        : {};
  
    const textFields = [
      ['phoneNumber', 30],
      ['educationLevel', 80],
      ['experienceDetails', 5000],
      ['availability', 2000]
    ];
  
    const profileData = {};
  
    for (const [field, maxLength] of textFields) {
      if (typeof body[field] !== 'string') {
        return response.status(400).json({ error: `${field} must be text.` });
      }
  
      const value = body[field].trim();
      if (value.length > maxLength) {
        return response.status(400).json({ error: `${field} is too long.` });
      }
  
      profileData[field] = value;
    }
  
    if (
      !Array.isArray(body.subjects) ||
      body.subjects.length > 20 ||
      body.subjects.some(
        (subject) => typeof subject !== 'string' || subject.trim().length > 80
      )
    ) {
      return response.status(400).json({
        error: 'Subjects must be a list of up to 20 names, each 80 characters or fewer.'
      });
    }
  
    const hourlyRate =
      body.hourlyRate === '' || body.hourlyRate == null
        ? null
        : Number(body.hourlyRate);
  
    if (
      hourlyRate !== null &&
      (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 99999999)
    ) {
      return response.status(400).json({
        error: 'Hourly rate must be a valid non-negative amount.'
      });
    }
  
    profileData.subjects = body.subjects.map((subject) => subject.trim());
    profileData.hourlyRate = hourlyRate;
    request.tutorProfileData = profileData;
  
    next();
  }
  
  module.exports = validateTutorProfile;