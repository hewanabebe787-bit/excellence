document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorMessage = document.getElementById('login-error');
  const roleMessage = document.getElementById('login-role');
  const submitButton = form.querySelector('button[type="submit"]');

  const requestedRole = new URLSearchParams(window.location.search).get('role');
  const selectedRole = ['student', 'tutor'].includes(requestedRole)
    ? requestedRole
    : 'student';

  roleMessage.textContent = `Signing in as a ${selectedRole}.`;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';
    submitButton.disabled = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('login-email').value.trim(),
          password: document.getElementById('login-password').value,
          role: selectedRole
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not sign in.');
      }

      if (result.user.role === 'student') {
        window.location.assign('/student/profile.html');
      } else if (result.user.role === 'tutor') {
        window.location.assign('/tutors/dashboard.html');
      } else {
        throw new Error('This account role is not supported.');
      }
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error ? error.message : 'Could not sign in.';
    } finally {
      submitButton.disabled = false;
    }
  });
});