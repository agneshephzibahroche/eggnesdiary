// Persist and apply dark/light theme
(function () {
  const saved = localStorage.getItem('eggnesdiary_theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
})();

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('eggnesdiary_theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const isDark = document.documentElement.classList.contains('dark');
    btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  }
});
