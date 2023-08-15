function toggleClasses() {
  document.querySelector('.nav-links').classList.toggle('expanded');
  document.querySelector('.hamburger').classList.toggle('hidden');
  document.querySelector('.hamburger-close').classList.toggle('visible');
  document.querySelector('html').classList.toggle('stuck');
  document.querySelector('#themeToggle').classList.toggle('hidden');
}

document.querySelector('.hamburger').addEventListener('click', toggleClasses);
document.querySelector('.hamburger-close').addEventListener('click', toggleClasses);
