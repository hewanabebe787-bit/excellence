document.addEventListener('DOMContentLoaded', () => {
  initTutorFiltering();
  initBookingForm();
  initQuickBookButtons();
  loadRegistrations();
});

async function loadRegistrations() {
  const showcase = document.getElementById('registrations-showcase');

  if (!showcase) return;

  try {
    const response = await fetch('http://localhost:3000/registrations');
    const data = await response.json();

    if (!Array.isArray(data)) {
      showcase.innerHTML = '<p>No registrations yet.</p>';
      return;
    }

    showcase.innerHTML = data
      .map(
        (entry) => `
          <article class="registration-card">
            <div class="meta">
              <span>${new Date(entry.submittedAt).toLocaleDateString()}</span>
              <span>${entry.studentEmail || 'Not provided'}</span>
            </div>
            <h3>${entry.studentName || 'Anonymous Student'}</h3>
            <p>${entry.message || 'No notes provided.'}</p>
            <span class="subject-tag">${entry.subject || 'General'}</span>
          </article>
        `
      )
      .join('');
  } catch (error) {
    console.error('Could not load registrations:', error);
    showcase.innerHTML = '<p>Could not load registrations.</p>';
  }
}

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      alert('Registration saved successfully!');
      bookingForm.reset();
      loadRegistrations();
    } catch (error) {
      console.error('Save error:', error);
      alert('There was a problem saving your registration.');
    }
  });
}

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