document.addEventListener('DOMContentLoaded', () => {
  // === HERO SLIDESHOW ===
  const slides = document.querySelectorAll('.slide');
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  // Change slide every 3 seconds (3000ms)
  setInterval(nextSlide, 5000);

  // === INITIALIZERS ===
  initTutorFiltering();
  initBookingForm();
  initQuickBookButtons();
  loadRegistrations();
});


// === TUTOR FILTERING ===
function initTutorFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const tutorCards = document.querySelectorAll('.tutor-card');

  if (!filterButtons.length || !tutorCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

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


// === QUICK BOOK BUTTONS ===
function initQuickBookButtons() {
  const bookButtons = document.querySelectorAll('.book-btn');
  const subjectSelect = document.getElementById('subject-select');
  const contactSection = document.getElementById('contact');

  if (!bookButtons.length) return;

  bookButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tutorCard = button.closest('.tutor-card');
      const tutorSubject = tutorCard ? tutorCard.getAttribute('data-subject') : '';

      if (subjectSelect && tutorSubject) {
        subjectSelect.value = tutorSubject;
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
