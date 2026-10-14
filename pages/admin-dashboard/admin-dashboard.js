// Show header creation actions only in their relevant college views.
document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('.bw-page-header');
  const student=header.querySelector('[data-open-modal="registerStudentModal"]');
  const supervisor=header.querySelector('[data-open-modal="addSupervisorModal"]');
  const update=tab=>{student.hidden=tab!=='tab-overview';supervisor.hidden=tab!=='tab-overview';};
  document.addEventListener('click',event=>{const button=event.target.closest('.bw-masar-nav [data-tab]');if(button)update(button.dataset.tab);});
  update(location.hash.slice(1)||'tab-overview');
  document.querySelectorAll('[data-college-listing-toggle]').forEach(button=>{
    button.addEventListener('click',async()=>{
      const row=button.closest('tr'),name=row.cells[1].textContent.trim(),paused=row.dataset.collegeListingState==='paused';
      if(!paused&&!await window.confirmPartnershipPause(`Pause “${name}” for your college’s students only? The company’s listing and other colleges are unaffected. Existing applications and training stay intact. This is a temporary preview.`, 'Pause listing for your college?', 'Pause for my college'))return;
      row.dataset.collegeListingState=paused?'active':'paused';
      const status=row.querySelector('[data-college-listing-status]');status.textContent=paused?'Available':'Paused for your college';status.className=`bw-badge ${paused?'bw-badge-success':'bw-badge-danger'}`;
      button.textContent=paused?'Pause':'Resume';button.setAttribute('aria-label',`${paused?'Pause':'Resume'} ${name} for your college`);
      window.showPortalToast(paused?'Listing resumed for your college in this preview only.':'Listing paused for your college in this preview only. Other colleges are unaffected.');
    });
  });
});
// Explicit handlers keep HTML presentation-only and preserve native event semantics.
(function () {
  document.querySelectorAll('[data-onclick="querySelector--1"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-users\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="querySelector--2"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-students\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="querySelector--3"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-companies\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="querySelector--4"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-supervisors\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="querySelector--5"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-posts\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="querySelector--6"]').forEach(element => {
    element.onclick = function(event) { document.querySelector('[data-tab=\'tab-approved\']')?.click(); };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-students-7"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-students') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-supervisors-8"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-supervisors') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-approved-9"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-approved') };
  });
  document.querySelectorAll('[data-onchange="showPortalToast--10"]').forEach(element => {
    element.onchange = function(event) { showPortalToast('Supervisor assignment changed in this preview only.') };
  });
  document.querySelectorAll('[data-onclick="openUnassignModal--11"]').forEach(element => {
    element.onclick = function(event) { openUnassignModal(1, 'Alice Johnson', 'Dr. John Smith') };
  });
  document.querySelectorAll('[data-onclick="openDeleteModal-Student-12"]').forEach(element => {
    element.onclick = function(event) { openDeleteModal('Student', 1, 'Alice Johnson') };
  });
  document.querySelectorAll('[data-onclick="openUnassignModal--13"]').forEach(element => {
    element.onclick = function(event) { openUnassignModal(2, 'Ghaith Amourah', 'Dr. Ahmad S.') };
  });
  document.querySelectorAll('[data-onclick="openDeleteModal-Student-14"]').forEach(element => {
    element.onclick = function(event) { openDeleteModal('Student', 2, 'Ghaith Amourah') };
  });
  document.querySelectorAll('[data-onclick="openUnassignModal--15"]').forEach(element => {
    element.onclick = function(event) { openUnassignModal(3, 'Sarah Ahmad', 'Dr. Ahmad S.') };
  });
  document.querySelectorAll('[data-onclick="openDeleteModal-Student-16"]').forEach(element => {
    element.onclick = function(event) { openDeleteModal('Student', 3, 'Sarah Ahmad') };
  });
  document.querySelectorAll('[data-onclick="openDeleteModal-Supervisor-17"]').forEach(element => {
    element.onclick = function(event) { openDeleteModal('Supervisor', 2, 'Dr. John Smith') };
  });
  document.querySelectorAll('[data-onclick="openDeleteModal-Supervisor-18"]').forEach(element => {
    element.onclick = function(event) { openDeleteModal('Supervisor', 5, 'Dr. Ahmad S.') };
  });
  document.querySelectorAll('[data-onclick="openTerminateModal--21"]').forEach(element => {
    element.onclick = function(event) { openTerminateModal(101, 'Alice Johnson', 'Full-Stack .NET Developer') };
  });
  document.querySelectorAll('[data-onclick="openTerminateModal--22"]').forEach(element => {
    element.onclick = function(event) { openTerminateModal(102, 'Ghaith Amourah', 'Software Engineering Intern') };
  });
})();
