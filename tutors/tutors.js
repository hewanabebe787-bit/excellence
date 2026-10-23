document.addEventListener('DOMContentLoaded', () => {

  const nextBtn = document.getElementById('nextBtn');
  const forms = document.querySelectorAll('form');
  const firstForm = forms[0];
  const secondForm = forms[1];
  const applicationNextBtn = document.getElementById('applicationNextBtn');
  const thirdPage = document.getElementById('thirdPage');

  nextBtn.addEventListener('click', async () => {
    if (!firstForm.checkValidity()) {
      firstForm.reportValidity();
      return;
    }

    nextBtn.disabled = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: document.getElementById('student-name').value.trim(),
          email: document.getElementById('tutor-email').value.trim(),
          password: document.getElementById('tutor-password').value,
          role: 'tutor'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not create your tutor account.');
      }
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('tutor-email').value.trim(),
          password: document.getElementById('tutor-password').value,
          role: 'tutor'
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (!loginResponse.ok) {
        throw new Error(
          `Account created, but sign-in failed: ${
            loginResult.error || 'Please sign in before continuing.'
          }`
        );
      }
      firstForm.style.display = 'none';
      secondForm.style.display = 'block';
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not create your tutor account.');
    } finally {
      nextBtn.disabled = false;
    }
  });

  applicationNextBtn.addEventListener('click', () => {
    secondForm.querySelector('h2').style.display = 'none';
    secondForm.querySelector('.education-subtitle').style.display = 'none';
    secondForm.querySelector('.education-options').style.display = 'none';
    applicationNextBtn.style.display = 'none';
    thirdPage.style.display = 'block';
  });
});

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

finishBtn.addEventListener("click", async function () {
  if (!experienceYes.checked && !experienceNo.checked) {
    alert("Please tell us whether you have teaching experience.");
    return;
  }

  const cv = document.getElementById("cv");
  const fayda = document.getElementById("fayda");

  if (cv.files.length === 0 || fayda.files.length === 0) {
    alert("Please upload both your CV and Fayda.");
    return;
  }

  const formData = new FormData();
  formData.append("cv", cv.files[0]);
  formData.append("fayda", fayda.files[0]);

  finishBtn.disabled = true;

  try {
    const response = await fetch("/api/tutor/documents", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not upload your documents.");
    }

    thirdPage.style.display = "none";
    pendingPage.style.display = "block";
  } catch (error) {
    alert(error instanceof Error ? error.message : "Could not upload your documents.");
  } finally {
    finishBtn.disabled = false;
  }
});