function validateRegistration(request, response, next) {
    const body =
      request.body && typeof request.body === 'object' && !Array.isArray(request.body)
        ? request.body
        : {};
  
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role;
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const details = typeof body.details === 'string' ? body.details.trim() : '';
    const feeMin = body.feeMin === '' || body.feeMin == null ? null : Number(body.feeMin);
    const feeMax = body.feeMax === '' || body.feeMax == null ? null : Number(body.feeMax);
  
    if ([feeMin, feeMax].some((fee) => fee !== null && (!Number.isFinite(fee) || fee < 0))) {
      return response.status(400).json({ error: 'Fee amounts must be valid non-negative numbers.' });
    }
    if (feeMin !== null && feeMax !== null && feeMin > feeMax) {
      return response.status(400).json({ error: 'Minimum fee cannot exceed maximum fee.' });
    }
    if (!fullName || fullName.length > 120) {
      return response.status(400).json({ error: 'Enter a name of up to 120 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return response.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 128) {
      return response.status(400).json({ error: 'Password must be 8 to 128 characters.' });
    }
    if (!['student', 'tutor'].includes(role)) {
      return response.status(400).json({ error: 'Role must be student or tutor.' });
    }
  
    request.registrationData = {
      fullName,
      email,
      password,
      role,
      subject,
      details,
      feeMin,
      feeMax
    };
  
    next();
  }
  function validateLogin(request, response, next) {
    const body =
      request.body && typeof request.body === 'object' && !Array.isArray(request.body)
        ? request.body
        : {};
  
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return response.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 128) {
      return response.status(400).json({ error: 'Password must be 8 to 128 characters.' });
    }
    if (!['student', 'tutor'].includes(role)) {
      return response.status(400).json({ error: 'Choose student or tutor sign-in.' });
    }
    request.loginData = { email, password, role };
    next();
  }
  module.exports = { validateRegistration, validateLogin };