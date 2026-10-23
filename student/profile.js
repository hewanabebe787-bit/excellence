document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const errorMessage = document.getElementById('profile-error');
    const statusMessage = document.getElementById('profile-status');
    const submitButton = form.querySelector('button[type="submit"]');
  
    const phoneInput = document.getElementById('profile-phone');
    const educationInput = document.getElementById('profile-education');
    const schoolInput = document.getElementById('profile-school');
    const goalsInput = document.getElementById('profile-goals');
  
    submitButton.disabled = true;
  
    async function readResponse(response, fallbackMessage) {
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || fallbackMessage);
      }
  
      return result;
    }
  
    async function loadProfile() {
      errorMessage.textContent = '';
      statusMessage.textContent = '';
  
      try {
        const authResponse = await fetch('/api/auth/me');
  
        if (authResponse.status === 401) {
          window.location.assign('/student/login.html');
          return;
        }
  
        const authResult = await readResponse(
          authResponse,
          'Could not verify your account.'
        );
  
        if (authResult.user.role !== 'student') {
          form.hidden = true;
          errorMessage.textContent = 'This page is for student accounts.';
          return;
        }
  
        const profileResponse = await fetch('/api/student/profile');
  
        if (profileResponse.status === 401) {
          window.location.assign('/student/login.html');
          return;
        }
  
        const profileResult = await readResponse(
          profileResponse,
          'Could not load your profile.'
        );
  
        phoneInput.value = profileResult.profile.phoneNumber || '';
        educationInput.value = profileResult.profile.educationLevel || '';
        schoolInput.value = profileResult.profile.schoolName || '';
        goalsInput.value = profileResult.profile.learningGoals || '';
  
        submitButton.disabled = false;
      } catch (error) {
        errorMessage.textContent =
          error instanceof Error ? error.message : 'Could not load your profile.';
      }
    }
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorMessage.textContent = '';
      statusMessage.textContent = '';
      submitButton.disabled = true;
  
      try {
        const response = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phoneInput.value.trim(),
            educationLevel: educationInput.value.trim(),
            schoolName: schoolInput.value.trim(),
            learningGoals: goalsInput.value.trim()
          })
        });
  
        if (response.status === 401) {
          window.location.assign('/student/login.html');
          return;
        }
  
        const result = await readResponse(response, 'Could not save your profile.');
  
        phoneInput.value = result.profile.phoneNumber || '';
        educationInput.value = result.profile.educationLevel || '';
        schoolInput.value = result.profile.schoolName || '';
        goalsInput.value = result.profile.learningGoals || '';
  
        statusMessage.textContent = 'Profile saved.';
      } catch (error) {
        errorMessage.textContent =
          error instanceof Error ? error.message : 'Could not save your profile.';
      } finally {
        submitButton.disabled = false;
      }
    });
  
    loadProfile();
  });