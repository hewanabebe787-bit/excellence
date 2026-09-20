document.addEventListener('DOMContentLoaded', () => {
  loadRegistrations();
});

async function loadRegistrations() {
  const showcase = document.getElementById('registrations-showcase');
  if (!showcase) return;

  try {
    const response = await fetch('http://localhost:3000/registrations');
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      showcase.innerHTML = '<p>No registrations yet.</p>';
      return;
    }

    const recentFirst = data
      .slice()
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    showcase.innerHTML = recentFirst
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