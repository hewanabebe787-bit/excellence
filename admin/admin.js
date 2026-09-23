document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
    loadRegistrations();
  });
  
  function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
  
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const studentName = document.getElementById('student-name').value.trim();
      const studentEmail = document.getElementById('student-email').value.trim();
      const subject = document.getElementById('subject-select').value;
      const message = document.getElementById('message').value.trim();
  
      if (!studentName || !studentEmail || !subject) {
        alert('Please fill in all required fields.');
        return;
      }
  
      const formData = {
        studentName,
        studentEmail,
        subject,
        message,
        submittedAt: new Date().toISOString()
      };
  
      try {
        const response = await fetch('http://localhost:3000/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) throw new Error('Save failed');
  
        alert('Registration saved successfully!');
        bookingForm.reset();
        await loadRegistrations();
      } catch (error) {
        console.error('Save error:', error);
        alert('There was a problem saving your registration.');
      }
    });
  }
  
  async function loadRegistrations() {
    const list = document.getElementById('registrations-list');
    if (!list) return;
  
    try {
      const response = await fetch('http://localhost:3000/registrations');
      if (!response.ok) throw new Error('Unable to load registrations');
  
      const data = await response.json();
  
      if (!Array.isArray(data) || data.length === 0) {
        list.innerHTML = '<p>No registrations yet.</p>';
        return;
      }
  
      const recentFirst = data
        .slice()
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
      list.innerHTML = recentFirst
        .map(
          (entry) => `
            <article class="registration-card">
              <div class="meta">
                <span>${entry.studentName || 'Anonymous Student'}</span>
                <span>${new Date(entry.submittedAt).toLocaleDateString()}</span>
              </div>
              <h3>${entry.subject || 'General'}</h3>
              <p>${entry.studentEmail || 'Not provided'}</p>
              <p>${entry.message || 'No notes provided.'}</p>
              <span class="subject-tag">${entry.subject || 'General'}</span>
            </article>
          `
        )
        .join('');
    } catch (error) {
      console.error('Load error:', error);
      list.innerHTML = '<p>Could not load registrations.</p>';
    }
  }