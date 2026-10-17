// Portal-only preference: apply before styles paint, without affecting home or login.
try {
  document.documentElement.dataset.theme = localStorage.getItem('bridgeway:portal-theme') === 'dark' ? 'dark' : 'light';
} catch {
  document.documentElement.dataset.theme = 'light';
}
