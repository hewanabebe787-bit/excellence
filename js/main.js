/* ==========================================================================
   EXCELLENCE TUTOR - MAIN JASCRIPT LOGIC (js/main.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTutorFiltering();
  initBookingForm();
  initQuickBookButtons();
});

/* ==========================================================================
   1. TUTOR FILTERING SYSTEM
   ========================================================================== */
function initTutorFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const tutorCards = document.querySelectorAll('.tutor-card');

  if (!filterButtons.length || !tutorCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // 1. Update active class on filter buttons
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      // 2. Get selected filter value
      const filterValue = button.getAttribute('data-filter');

      // 3. Filter tutor cards
      tutorCards.forEach((card) => {
        const cardSubject = card.getAttribute('data-subject');

        if (filterValue === 'all' || cardSubject === filterValue) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   2. CONSULTATION & BOOKING FORM HANDLER
   ========================================================================== */
function initBookingForm() {
  const bookingForm = document.getElementById('booking-form');

  if (!bookingForm) return;

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Extract Form Values
    const studentName = document.getElementById('student-name').value.trim();
    const studentEmail = document.getElementById('student-email').value.trim();
    const subject = document.getElementById('subject-select').value;
    const message = document.getElementById('message').value.trim();

    // Basic Validation
    if (!studentName || !studentEmail || !subject) {
      alert('Please fill in all required fields.');
      return;
    }

    // Build Form Payload (Ready for Future Backend API Connection)
    const formData = {
      studentName,
      studentEmail,
      subject,
      message,
      submittedAt: new Date().toISOString()
    };

    console.log('Form Submission Payload:', formData);

    // Feedback to User
    alert(`Thank you, ${studentName}! Your request for ${subject.toUpperCase()} tutoring has been received. We will contact you at ${studentEmail} shortly.`);

    // Reset Form
    bookingForm.reset();
  });
}

/* ==========================================================================
   3. QUICK-BOOK BUTTON INTERACTION
   ========================================================================== */
function initQuickBookButtons() {
  const bookButtons = document.querySelectorAll('.book-btn');
  const subjectSelect = document.getElementById('subject-select');
  const contactSection = document.getElementById('contact');

  if (!bookButtons.length) return;

  bookButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tutorCard = button.closest('.tutor-card');
      const tutorSubject = tutorCard ? tutorCard.getAttribute('data-subject') : '';

      // Auto-select subject in form if matching option exists
      if (subjectSelect && tutorSubject) {
        subjectSelect.value = tutorSubject;
      }

      // Smooth scroll down to contact form
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}