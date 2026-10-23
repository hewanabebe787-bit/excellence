function requireTutor(request, response, next) {
    if (!request.session.user) {
      return response.status(401).json({ error: 'Please sign in.' });
    }
  
    if (request.session.user.role !== 'tutor') {
      return response.status(403).json({ error: 'Tutor access required.' });
    }
  
    next();
  }
  
  module.exports = requireTutor;