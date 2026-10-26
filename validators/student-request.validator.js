function validateStudentTutorRequest(request, response, next) {
    const body =
      request.body &&
      typeof request.body === 'object' &&
      !Array.isArray(request.body)
        ? request.body
        : {};
  
    const subject =
      typeof body.subject === 'string' ? body.subject.trim() : '';
    const details =
      typeof body.details === 'string' ? body.details.trim() : '';
  
    function parseFee(value) {
      if (value === '' || value == null) return null;
      if (typeof value !== 'string' && typeof value !== 'number') return NaN;
      return Number(value);
    }
  
    const feeMin = parseFee(body.feeMin);
    const feeMax = parseFee(body.feeMax);
  
    if (!subject || subject.length > 120) {
      return response.status(400).json({
        error: 'Enter a subject of up to 120 characters.'
      });
    }
  
    if (details.length > 5000) {
      return response.status(400).json({
        error: 'Request notes must be 5000 characters or fewer.'
      });
    }
  
    if ([feeMin, feeMax].some((fee) =>
      fee !== null && (!Number.isFinite(fee) || fee < 0)
    )) {
      return response.status(400).json({
        error: 'Fee amounts must be valid non-negative numbers.'
      });
    }
  
    if (feeMin !== null && feeMax !== null && feeMin > feeMax) {
      return response.status(400).json({
        error: 'Minimum fee cannot exceed maximum fee.'
      });
    }
  
    request.studentRequestData = {
      subject,
      details,
      feeMin,
      feeMax
    };
  
    next();
  }
  
  module.exports = validateStudentTutorRequest;