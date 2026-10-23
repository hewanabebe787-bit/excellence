document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');

  if (slides.length < 2) return;

  let currentIndex = 0;

  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 5000);
});