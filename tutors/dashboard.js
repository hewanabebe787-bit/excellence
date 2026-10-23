document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('dashboard-status');
  const dashboard = document.getElementById('tutor-dashboard');
  const form = document.getElementById('tutor-profile-form');
  const errorMessage = document.getElementById('profile-error');
  const profileStatus = document.getElementById('profile-status');
  const saveButton = form.querySelector('button[type="submit"]');

  const fields = {
    phoneNumber: document.getElementById('tutor-phone'),
    educationLevel: document.getElementById('tutor-education'),
    subjects: document.getElementById('tutor-subjects'),
    experienceDetails: document.getElementById('tutor-experience'),
    availability: document.getElementById('tutor-availability'),
    hourlyRate: document.getElementById('tutor-rate')
  };

  saveButton.disabled = true;

  async function readResponse(response, fallbackMessage) {
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || fallbackMessage);
    }

    return result;
  }

  function showProfile(profile) {
    fields.phoneNumber.value = profile.phoneNumber || '';
    fields.educationLevel.value = profile.educationLevel || '';
    fields.subjects.value = Array.isArray(profile.subjects)
      ? profile.subjects.join(', ')
      : '';
    fields.experienceDetails.value = profile.experienceDetails || '';
    fields.availability.value = profile.availability || '';
    fields.hourlyRate.value = profile.hourlyRate ?? '';
  }

  try {
    const authResponse = await fetch('/api/auth/me');

    if (authResponse.status === 401) {
      window.location.assign('/student/login.html?role=tutor');
      return;
    }

    const authResult = await readResponse(
      authResponse,
      'Could not check your account.'
    );

    if (authResult.user.role !== 'tutor') {
      status.textContent = 'This page is for tutor accounts. Please sign in as a tutor.';
      return;
    }

    document.getElementById('tutor-name').textContent =
      authResult.user.fullName || 'Tutor';
    document.getElementById('tutor-email').textContent = authResult.user.email;

    const profileResponse = await fetch('/api/tutor/profile');

    if (profileResponse.status === 401) {
      window.location.assign('/student/login.html?role=tutor');
      return;
    }

    const profileResult = await readResponse(
      profileResponse,
      'Could not load your tutor profile.'
    );

    showProfile(profileResult.profile);
    status.textContent = '';
    dashboard.hidden = false;
    saveButton.disabled = false;
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : 'Could not load your dashboard.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';
    profileStatus.textContent = '';
    saveButton.disabled = true;

    const hourlyRateInput = fields.hourlyRate.value.trim();

    try {
      const response = await fetch('/api/tutor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fields.phoneNumber.value.trim(),
          educationLevel: fields.educationLevel.value.trim(),
          subjects: fields.subjects.value
            .split(',')
            .map((subject) => subject.trim())
            .filter(Boolean),
          experienceDetails: fields.experienceDetails.value.trim(),
          availability: fields.availability.value.trim(),
          hourlyRate: hourlyRateInput === '' ? null : Number(hourlyRateInput)
        })
      });

      if (response.status === 401) {
        window.location.assign('/student/login.html?role=tutor');
        return;
      }

      const result = await readResponse(response, 'Could not save your profile.');
      showProfile(result.profile);
      profileStatus.textContent = 'Profile saved.';
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error ? error.message : 'Could not save your profile.';
    } finally {
      saveButton.disabled = false;
    }
  });
});