const previewStudent = window.BridgewayStudent.current();
if (previewStudent.id === 'lina') {
  document.querySelector('.profile-avatar').textContent = 'LH';
  document.querySelector('.profile-identity-copy h2').textContent = previewStudent.name;
  document.querySelector('.profile-identity-copy span').textContent = 'Student ID ' + previewStudent.studentId;
  document.querySelector('.profile-verified').textContent = 'Sample student';
  document.getElementById('profileFullName').value = previewStudent.name;
  document.getElementById('profilePhone').value = '';
  document.getElementById('profileEmail').value = 'lina@bau.edu.jo';
  document.getElementById('profileBio').value = '';
  document.getElementById('profileGpa').textContent = previewStudent.gpa + ' / 4.00';
  document.querySelector('.profile-academic > div:last-child dd').textContent = 'Not assigned · After company acceptance';
}
document.getElementById('studentProfileForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      showPortalToast('Profile validated in this preview. Changes are not saved.');
    });

// Old bookmarks now open the dashboard Applications view.
function redirectLegacyApplications() {
  if (location.hash === '#my-applications') location.replace(window.BridgewayStudent.url('../student-dashboard/student-dashboard.html#tab-applications'));
}
redirectLegacyApplications();
window.addEventListener('hashchange', redirectLegacyApplications);


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
