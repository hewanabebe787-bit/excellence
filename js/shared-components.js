async function loadComponent(selector, path) {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    container.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponent('#navbar', '/navbar.html');
  loadComponent('#footer', '/footer.html');
});
