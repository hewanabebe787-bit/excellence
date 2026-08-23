 
document.addEventListener('DOMContentLoaded', () => {
  initTutorFiltering();
  initBookingForm();
  initQuickBookButtons();
  initRegistrationShowcase();
});

async function initRegistrationShowcase() {
  const showcase = document.getElementById('registrations-showcase');

  if (!showcase) return;

  let registrations = getSavedRegistrations();

  try {
    const response = await fetch('db.json');

    if (response.ok) {
      const dbData = await response.json();

      if (Array.isArray(dbData) && dbData.length) {
        registrations = [...dbData, ...registrations];
      }
    }
  } catch (error) {
    console.warn('Unable to load db.json. Showing saved local registrations instead.', error);
  }

  renderRegistrations(showcase, registrations.slice(0, 6));
}

function getSavedRegistrations() {
  try {
    const data = localStorage.getItem('excellenceRegistrations');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Could not read localStorage:', error);
    return [];
  }
}

function saveRegistration(registration) {
  try {
    const existing = getSavedRegistrations();
    const updated = [registration, ...existing];
    localStorage.setItem('excellenceRegistrations', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Could not save registration locally:', error);
    return [registration];
  }
}

function renderRegistrations(container, registrations) {
  if (!container || !Array.isArray(registrations) || !registrations.length) {
    container.innerHTML = '<p class="empty-state">No registrations yet.</p>';
    return;
  }

  container.innerHTML = registrations.map((entry) => {
    const name = entry.studentName || 'Anonymous Student';
    const email = entry.studentEmail || 'Not provided';
    const subject = entry.subject || 'General';
    const message = entry.message || 'No additional notes.';
    const submittedAt = entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : 'Recently';

    return `
      <article class="registration-card">
        <div class="meta">
          <span>${submittedAt}</span>
          <span>${email}</span>
        </div>
        <h3>${name}</h3>
        <p>${message}</p>
        <span class="subject-tag">${subject}</span>
      </article>
    `;
  }).join('');
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

  bookingForm.addEventListener('submit', (e) => {
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

    const savedRecords = saveRegistration(formData);
    const showcase = document.getElementById('registrations-showcase');

    if (showcase) {
      renderRegistrations(showcase, savedRecords.slice(0, 6));
    }

    console.log('Form Submission Payload:', formData);
 
    alert(`Thank you, ${studentName}! Your request for ${subject.toUpperCase()} tutoring has been received. We will contact you at ${studentEmail} shortly.`);
 
    bookingForm.reset();
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