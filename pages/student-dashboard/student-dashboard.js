// Explicit handlers keep HTML presentation-only and preserve native event semantics.
function updateCvMatches() {
  const hasCv = !!window.BridgewayCV.read();
  document.querySelectorAll('[data-cv-score]').forEach(score => {
    score.hidden = !hasCv;
    score.parentElement.querySelector('.cv-upload-link').hidden = hasCv;
  });
  document.getElementById('cvMatchPreviewNote').hidden = !hasCv;
}
updateCvMatches();
window.addEventListener('pageshow', updateCvMatches);
(function () {
  document.querySelectorAll('[data-onclick="switchTab-tab-progress-1"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-progress'); };
  });
  const profileApplications = '../student-profile/student-profile.html#my-applications';
  const redirectApplications = () => {
    if (location.hash === '#tab-applications') location.replace(profileApplications);
  };
  redirectApplications();
  window.addEventListener('hashchange', redirectApplications);
})();

// Report filters and week shortcuts operate on the existing training record only.
(function () {
  const root = document.getElementById('tab-progress');
  if (!root) return;
  const reports = [...root.querySelectorAll('[data-report-status]')];
  const filters = [...root.querySelectorAll('[data-training-filter]')];
  const filterReports = status => {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.trainingFilter === status)));
    reports.forEach(report => { report.hidden = status !== 'all' && report.dataset.reportStatus !== status; });
    const count = reports.filter(report => !report.hidden).length;
    root.querySelector('#trainingReportCount').textContent = count + (count === 1 ? ' week' : ' weeks');
  };
  filters.forEach(button => button.addEventListener('click', () => filterReports(button.dataset.trainingFilter)));
  root.querySelectorAll('[data-training-week]').forEach(button => button.addEventListener('click', () => {
    filterReports('all');
    const report = document.getElementById('training-week-' + button.dataset.trainingWeek);
    report.open = true;
    report.querySelector('summary').focus({ preventScroll:true });
    report.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'nearest' });
  }));
})();
