document.addEventListener('DOMContentLoaded', () => {
  loadRegistrations();

  const nextBtn = document.getElementById("nextBtn");
  const forms = document.querySelectorAll("form");
  const firstForm = forms[0];
  const secondForm = forms[1];
  nextBtn.addEventListener("click", function () {

    // Check if the first form is filled correctly
    if (!firstForm.checkValidity()) {
      firstForm.reportValidity();
      return;
    }

    // Hide the first page
    firstForm.parentElement.style.display = "none";

    // Show the second page
    secondForm.style.display = "block";
  });
});


async function loadRegistrations() {
  const showcase = document.getElementById('registrations-list');
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

            <span class="subject-tag">
              ${entry.subject || 'General'}
            </span>
          </article>
        `
      )
      .join('');

  } catch (error) {
    console.error('Could not load registrations:', error);
    showcase.innerHTML = '<p>Could not load registrations.</p>';
  }
}
// THIRD PAGE

const experienceYes = document.getElementById("experienceYes");
const experienceNo = document.getElementById("experienceNo");
const experienceDetails = document.getElementById("experienceDetails");

experienceYes.addEventListener("change", function () {
  experienceDetails.style.display = "block";
});

experienceNo.addEventListener("change", function () {
  experienceDetails.style.display = "none";
});


const finishBtn = document.getElementById("finishBtn");
const thirdPage = document.getElementById("thirdPage");
const pendingPage = document.getElementById("pendingPage");

finishBtn.addEventListener("click", function () {

  // Make sure experience is selected
  if (!experienceYes.checked && !experienceNo.checked) {
    alert("Please tell us whether you have teaching experience.");
    return;
  }

  // Make sure CV is uploaded
  const cv = document.getElementById("cv");

  if (cv.files.length === 0) {
    alert("Please upload your CV.");
    return;
  }

  // Make sure Fayda is uploaded
  const fayda = document.getElementById("fayda");

  if (fayda.files.length === 0) {
    alert("Please upload your Fayda.");
    return;
  }

  // Hide application page
  thirdPage.style.display = "none";

  // Show pending page
  pendingPage.style.display = "block";
});