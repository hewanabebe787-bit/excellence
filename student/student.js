

document.addEventListener('DOMContentLoaded', () => {
    initBookingForm();
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

    const payload = {
      fullName: studentName,
      email: studentEmail,
      password: document.getElementById('student-password').value,
      role: 'student',
      subject,
      details: message,
      feeMin: document.getElementById('fee-min').value || null,
      feeMax: document.getElementById('fee-max').value || null
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      alert('Your account and tutor request have been submitted successfully.');
      bookingForm.reset();
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'There was a problem creating your account.');
    }
});
  }


