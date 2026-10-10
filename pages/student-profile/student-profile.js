document.getElementById('studentProfileForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      showPortalToast('Profile validated in this preview. Changes are not saved.');
    });

document.querySelectorAll('[data-withdraw-application]').forEach(button => {
  button.addEventListener('click', () => {
    const cells = button.closest('tr').cells;
    window.openWithdrawModal(cells[1].textContent.trim(), cells[0].textContent.trim());
  });
});
function showProfileView(focus = false) {
  const applications = location.hash === '#my-applications';
  document.getElementById('student-profile-details').hidden = applications;
  const panel = document.getElementById('my-applications');
  panel.hidden = !applications;
  document.querySelector('main h1').textContent = applications ? 'My Applications' : 'Student Profile';
  document.querySelector('.bw-subtitle').textContent = applications
    ? 'Your internship applications and company decisions, all in one place.'
    : 'Your details, academic record, and CV.';
  document.querySelectorAll('[data-profile-view]').forEach(link => {
    const active = link.dataset.profileView === (applications ? 'applications' : 'profile');
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (focus && applications) panel.focus({ preventScroll:true });
}
showProfileView();
window.addEventListener('hashchange', () => showProfileView(true));

// Select a local file for the frontend preview; no file bytes leave the browser.
const cvInput = document.getElementById('studentCvFile');
const cvStatus = document.getElementById('studentCvStatus');
const removeCv = document.getElementById('removeStudentCv');
function showCv(file) {
  cvStatus.textContent = file ? `${file.name} · ${Math.ceil(file.size / 1024)} KB · Selected for preview, not uploaded or analyzed.` : 'No CV selected.';
  removeCv.hidden = !file;
}
showCv(window.BridgewayCV.read());
cvInput.addEventListener('change', () => {
  const file = cvInput.files[0];
  if (!file) return;
  if (!/\.(pdf|docx)$/i.test(file.name) || !file.size || file.size > 5 * 1024 * 1024) {
    cvInput.value = '';
    cvStatus.textContent = 'Choose a non-empty PDF or DOCX file up to 5 MB. Your previous selection is unchanged.';
    return;
  }
  const stored = window.BridgewayCV.set(file);
  showCv(file);
  if (!stored) cvStatus.textContent += ' Browser storage is unavailable; the selection cannot carry over to listings.';
});
removeCv.addEventListener('click', () => {
  if (!window.BridgewayCV.set(null)) {
    cvStatus.textContent = 'Could not clear the preview selection. Browser storage is unavailable.';
    return;
  }
  cvInput.value = '';
  showCv(null);
});
