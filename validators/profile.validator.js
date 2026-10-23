function validateStudentProfile(request, response, next) {
    const body =
      request.body && typeof request.body === 'object' && !Array.isArray(request.body)
        ? request.body
        : {};
  
    const fields = [
      ['phoneNumber', 30],
      ['educationLevel', 80],
      ['schoolName', 160],
      ['learningGoals', 5000]
    ];
  
    const profileData = {};
  
    for (const [field, maxLength] of fields) {
      if (typeof body[field] !== 'string') {
        return response.status(400).json({ error: `${field} must be text.` });
      }
  
      const value = body[field].trim();
      if (value.length > maxLength) {
        return response.status(400).json({ error: `${field} is too long.` });
      }
  
      profileData[field] = value;
    }
  
    request.studentProfileData = profileData;
    next();
  }
  
  module.exports = validateStudentProfile;