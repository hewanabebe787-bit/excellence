document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const errorMessage = document.getElementById('profile-error');
    const statusMessage = document.getElementById('profile-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const requestForm = document.getElementById('request-form');
    const requestError = document.getElementById('request-error');
    const requestStatus = document.getElementById('request-status');
    const requestSubmitButton = requestForm.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById('profile-phone');
    const educationInput = document.getElementById('profile-education');
    const schoolInput = document.getElementById('profile-school');
    const goalsInput = document.getElementById('profile-goals');
    const requestsList = document.getElementById('requests-list');

    submitButton.disabled = true;
  
    async function readResponse(response, fallbackMessage) {
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const bodyText = await response.text();
        throw new Error(
          bodyText && bodyText.trim().startsWith('<')
            ? 'The server returned an HTML page instead of JSON. Please restart the server and refresh the page.'
            : fallbackMessage
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || fallbackMessage);
      }

      return result;
    }
    
    async function loadTutorRequests() {
      try {
        const response = await fetch('/api/student/requests');
    
        if (response.status === 401) {
          window.location.assign('/student/login.html');
          return;
        }
    
        const result = await readResponse(
          response,
          'Could not load your tutor requests.'
        );
    
        requestsList.replaceChildren();
    
        if (result.requests.length === 0) {
          requestsList.textContent = 'You haven’t submitted any tutor requests yet.';
          return;
        }
    
        for (const request of result.requests) {
          const item = document.createElement('article');
          const subject = document.createElement('h3');
          subject.textContent = request.subject;
          item.appendChild(subject);
    
          if (request.details) {
            const details = document.createElement('p');
            details.textContent = `Notes: ${request.details}`;
            item.appendChild(details);
          }
    
          if (request.feeMin !== null || request.feeMax !== null) {
            const fee = document.createElement('p');
            const minimum = request.feeMin ?? '—';
            const maximum = request.feeMax ?? '—';
            fee.textContent = `Fee range: ${minimum} – ${maximum}`;
            item.appendChild(fee);
          }
    
          requestsList.appendChild(item);
        }
      } catch (error) {
        requestsList.textContent =
          error instanceof Error ? error.message : 'Could not load your tutor requests.';
      }
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
        document.getElementById('account-name').textContent = authResult.user.fullName;
        document.getElementById('account-email').textContent = authResult.user.email;
  
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
    requestForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      requestError.textContent = '';
      requestStatus.textContent = '';
      requestSubmitButton.disabled = true;
    
      try {
        const response = await fetch('/api/student/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: document.getElementById('request-subject').value.trim(),
            details: document.getElementById('request-details').value.trim(),
            feeMin: document.getElementById('request-fee-min').value,
            feeMax: document.getElementById('request-fee-max').value
          })
        });
    
        if (response.status === 401) {
          window.location.assign('/student/login.html');
          return;
        }
    
        await readResponse(response, 'Could not submit your tutor request.');
    
        requestForm.reset();
        requestStatus.textContent = 'Your tutor request was submitted.';
        await loadTutorRequests();
      } catch (error) {
        requestError.textContent =
          error instanceof Error ? error.message : 'Could not submit your tutor request.';
      } finally {
        requestSubmitButton.disabled = false;
      }
    });
    loadProfile();
    loadTutorRequests();
  });
 