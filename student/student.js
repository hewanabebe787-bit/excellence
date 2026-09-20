

document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
    loadRegistrations();
  });

// === BOOKING FORM ===
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
      loadRegistrations();
    } catch (error) {
      console.error('Save error:', error);
      alert('There was a problem saving your registration.');
    }
  });
}

