/* Presentation enhancements scoped to the company workspace. */
document.addEventListener('DOMContentLoaded', () => {
  const weeklyCards = document.querySelectorAll('[data-weekly-id]');
  const weeklyWeek = document.getElementById('programWeekSelect');
  let weeklyStudentId = '';
  const model = window.BridgewayPartners;
  const collegeName = id => model.organizations.find(college => college.id === model.students.find(student => student.id === id)?.college)?.name || 'College unavailable';
  document.querySelectorAll('[data-student-college]').forEach(element => element.textContent = collegeName(element.dataset.studentCollege));
  document.querySelectorAll('#companyCandidatesTableBody tr').forEach(row => {
    const college = document.createElement('div');
    college.className = 'company-student-college';
    college.textContent = collegeName(row.dataset.studentId);
    row.cells[0].querySelector('[data-style="s9"]').after(college);
  });
  function updateWeeklyWeek() {
    document.getElementById('weeklyReportWeek').textContent = `Week ${weeklyWeek.value} of 8`;
  }
  window.selectWeeklyIntern = (id, card, name) => {
    if (!['1','2'].includes(id) || !card) return;
    if (id !== weeklyStudentId) document.getElementById('companyWeeklyForm').reset();
    weeklyStudentId = id;
    document.getElementById('activeInternSelect').value = id;
    weeklyCards.forEach(item => {
      const selected = item.dataset.weeklyId === id;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('weeklyReportStudent').textContent = name;
    document.getElementById('weeklyReportRole').textContent = card.querySelector('.bw-intern-status-role').textContent;
    document.getElementById('weeklyReportCollege').textContent = collegeName(id === '1' ? 'alice' : 'ghaith');
    document.getElementById('companyWeeklyPrompt').hidden = true;
    document.getElementById('companyWeeklyDetail').hidden = false;
    weeklyWeek.value = card.dataset.weeklyWeek;
    updateWeeklyWeek();
  };
  weeklyWeek.addEventListener('change', updateWeeklyWeek);
  weeklyCards.forEach(card => card.setAttribute('aria-pressed', String(card.classList.contains('is-active'))));
  const studentSelect = document.getElementById('evaluationStudentSelect');
  studentSelect.selectedIndex = -1;
  const studentOptions = Array.from(studentSelect.options);
  const studentSearch = document.getElementById('evaluationStudentSearch');
  let selectedStudent = '';
  function renderEvaluationStudents() {
    const query = studentSearch.value.trim().toLowerCase();
    const list = document.getElementById('companyEvaluationStudents');
    list.replaceChildren();
    studentOptions.filter(option => `${option.textContent} ${collegeName(option.value)}`.toLowerCase().includes(query)).forEach(option => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'company-student-button';
      button.setAttribute('aria-pressed', String(option.value === selectedStudent));
      button.setAttribute('aria-controls', 'companyEvaluationDetail');
      [option.dataset.name, collegeName(option.value), option.textContent.split('·')[1].trim(), option.dataset.status].forEach((text, index) => {
        const line = document.createElement(index === 0 ? 'strong' : 'span'); line.textContent = text; button.append(line);
      });
      button.addEventListener('click', () => window.selectInternForRubric(option.value, option.dataset.name, option.dataset.role, option.dataset.gpa, option.dataset.status));
      list.append(button);
    });
    document.getElementById('evaluationStudentEmpty').hidden = list.childElementCount > 0;
  }
  document.querySelector('.evaluation-form-area').id = 'companyEvaluationDetail';
  studentSearch.addEventListener('input', renderEvaluationStudents);
  studentSelect.addEventListener('change', () => {
    const option = studentSelect.selectedOptions[0];
    if (!option) return;
    window.selectInternForRubric(option.value, option.dataset.name, option.dataset.role, option.dataset.gpa, option.dataset.status);
  });
  // Keep selections made from the existing applicant Evaluate action in sync.
  const selectStudent = window.selectInternForRubric;
  window.selectInternForRubric = (id, ...details) => {
    if (!studentOptions.some(option => option.value === id)) return;
    if (id !== selectedStudent) {
      document.querySelectorAll('#rubricCriteriaContainer .is-active').forEach(button => button.classList.remove('is-active'));
      document.getElementById('evaluationComments').value = '';
      window.updateRubricHUD();
    }
    selectedStudent = id;
    studentSearch.value = '';
    studentSelect.replaceChildren(...studentOptions);
    studentSelect.value = id;
    document.getElementById('companyEvaluationPrompt').hidden = true;
    document.querySelector('.evaluation-form-area').hidden = false;
    document.getElementById('evaluationCollege').textContent = collegeName(id);
    document.getElementById('evaluationStudentEmpty').hidden = true;
    selectStudent(id, ...details);
    renderEvaluationStudents();
  };
  renderEvaluationStudents();
  weeklyCards.forEach(card => card.addEventListener('click', () => window.selectWeeklyIntern(card.dataset.weeklyId, card, card.querySelector('.bw-intern-status-name').textContent)));
  document.getElementById('weeklyStudentSearch').addEventListener('input', function () {
    weeklyCards.forEach(card => card.hidden = !card.textContent.toLowerCase().includes(this.value.trim().toLowerCase()));
    document.getElementById('weeklyStudentsEmpty').hidden = Array.from(weeklyCards).some(card => !card.hidden);
  });
  document.getElementById('clearCompanyWeekly').addEventListener('click', () => {
    weeklyStudentId = ''; document.getElementById('activeInternSelect').value = '';
    document.getElementById('companyWeeklyDetail').hidden = true; document.getElementById('companyWeeklyPrompt').hidden = false;
    weeklyCards.forEach(card => { card.classList.remove('is-active'); card.setAttribute('aria-pressed', 'false'); });
    document.getElementById('weeklyStudentSearch').focus();
  });
  document.getElementById('clearCompanyEvaluation').addEventListener('click', () => {
    selectedStudent = ''; studentSelect.selectedIndex = -1;
    document.querySelector('.evaluation-form-area').hidden = true; document.getElementById('companyEvaluationPrompt').hidden = false;
    renderEvaluationStudents(); studentSearch.focus();
  });
  const accountWrap = document.querySelector('.company-account-wrap');
  const accountToggle = document.getElementById('companyAccountToggle');
  const accountDropdown = document.getElementById('companyAccountDropdown');
  function setAccountOpen(open) {
    accountToggle.setAttribute('aria-expanded', String(open));
    accountDropdown.hidden = !open;
  }
  accountToggle.addEventListener('click', () => setAccountOpen(accountDropdown.hidden));
  accountToggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setAccountOpen(true);
      accountDropdown.querySelector('a').focus();
    }
  });
  document.addEventListener('click', event => {
    if (!accountWrap.contains(event.target)) setAccountOpen(false);
  });
  document.addEventListener('focusin', event => {
    if (!accountWrap.contains(event.target)) setAccountOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !accountDropdown.hidden) {
      setAccountOpen(false);
      accountToggle.focus();
    }
  });
  accountDropdown.addEventListener('click', event => {
    if (event.target.closest('a')) setAccountOpen(false);
  });
  const headings = {
    'tab-posts': ['Internship overview', 'A clear view of your opportunities, applicants, and interns.'],
    'tab-candidates': ['Applications', 'Review applicants to your company listings.'],
    'tab-accepted-students': ['Interns', 'Your internship roster and training status, separate from applications.'],
    'tab-partners': ['Partner colleges', 'Your company college connections and internship cycle.'],
    'tab-weekly-reports': ['Weekly reports', 'Choose an intern, then complete their report for the selected week.'],
    'tab-final-evaluation': ['Evaluations', 'Complete the internship evaluation required by the college at the end of term.']
  };
  function updateHeading() {
    const current = document.querySelector('.bw-tab-panel.is-active');
    const heading = headings[current?.id];
    if (!heading) return;
    document.querySelector('.bw-company-content').dataset.currentView = current.id;
    document.getElementById('companyPageTitle').textContent = heading[0];
    document.getElementById('companyPageDescription').textContent = heading[1];
    document.querySelectorAll('.bw-masar-nav [data-tab]').forEach(button => {
      if (button.dataset.tab === current.id) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('.bw-tab-panel').forEach(panel => {
    new MutationObserver(updateHeading).observe(panel, { attributes: true, attributeFilter: ['class'] });
  });
  updateHeading();
  const search = document.getElementById('companyListingSearch');
  const grid = document.querySelector('#tab-posts .bw-opportunities-grid');
  let listingStatus = 'all';
  function filterListings() {
    let visible = 0;
    grid.querySelectorAll('.bw-opp-card').forEach(card => {
      const matchesSearch = card.textContent.toLowerCase().includes(search.value.trim().toLowerCase());
      card.hidden = !matchesSearch || (listingStatus !== 'all' && card.dataset.listingStatus !== listingStatus);
      if (!card.hidden) visible++;
    });
    const empty = document.getElementById('companyListingsEmpty');
    empty.hidden = visible > 0;
    empty.textContent = grid.querySelector('.bw-opp-card') ? 'No matching internships. Try a different search or status.' : 'No internships yet. Post an internship to get started.';
    document.getElementById('companyListingCount').textContent = `Showing ${visible} of ${grid.querySelectorAll('.bw-opp-card').length} listings`;
    document.getElementById('kpiActivePosts').textContent = grid.querySelectorAll('[data-listing-status="active"]').length;
  }
  document.querySelectorAll('[data-listing-filter]').forEach(button => {
    button.addEventListener('click', () => {
      listingStatus = button.dataset.listingFilter;
      document.querySelectorAll('[data-listing-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      filterListings();
    });
  });
  grid.querySelectorAll('[data-listing-details]').forEach(button => {
    button.addEventListener('click', () => {
      const detail = document.getElementById(button.getAttribute('aria-controls'));
      const open = detail.hidden;
      detail.hidden = !open;
      button.closest('.bw-opp-card').querySelectorAll('[data-listing-details]').forEach(item => item.setAttribute('aria-expanded', String(open)));
    });
  });
  grid.querySelectorAll('[data-listing-pause]').forEach(button => {
    button.onclick = null;
    button.addEventListener('click', () => {
      const row = button.closest('.bw-opp-card');
      const paused = row.dataset.listingStatus === 'active';
      row.dataset.listingStatus = paused ? 'paused' : 'active';
      row.querySelector('.post-status-badge').textContent = paused ? 'Paused' : 'Active';
      button.textContent = paused ? 'Resume listing' : 'Pause Post';
      filterListings();
      if (row.hidden) document.querySelector(`[data-listing-filter="${listingStatus}"]`).focus();
    });
  });
  search.addEventListener('input', filterListings);
  new MutationObserver(filterListings).observe(grid, { childList: true });
  filterListings();
  document.querySelectorAll('.bw-intern-status-card, .bw-intern-chip').forEach(card => {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const applications = document.getElementById('companyCandidatesTableBody');
  const accepted = document.getElementById('companyAcceptedTableBody');
  const search = document.getElementById('acceptedStudentSearch');
  let status = 'all';
  function filterAccepted() {
    let visible = 0;
    Array.from(accepted.rows).forEach(row => {
      row.hidden = (status !== 'all' && row.dataset.status !== status) || !row.textContent.toLowerCase().includes(search.value.trim().toLowerCase());
      row.style.display = '';
      if (!row.hidden) visible++;
    });
    document.getElementById('acceptedStudentsEmpty').hidden = visible > 0;
  }
  window.syncCompanyStudents = () => {
    [...applications.rows, ...accepted.rows].forEach(row => {
      const target = ['accepted', 'awaiting'].includes(row.dataset.status) ? accepted : applications;
      if (row.parentElement !== target) { row.hidden = false; target.append(row); }
    });
    document.getElementById('companyApplicationCount').textContent = applications.rows.length;
    document.getElementById('companyApplicationsMetric').textContent = applications.rows.length;
    document.getElementById('companyAcceptedCount').textContent = accepted.rows.length;
    document.querySelectorAll('.listing-applicants').forEach(button => {
      const role = button.getAttribute('aria-label').replace('Review applicants for ', '');
      button.firstChild.textContent = Array.from(applications.rows).filter(row => row.cells[2].textContent.trim() === role).length;
    });
    filterAccepted();
    window.searchCandidates?.(document.getElementById('candidateSearchInput').value);
  };
  document.querySelectorAll('[data-accepted-filter]').forEach(button => button.addEventListener('click', () => {
    status = button.dataset.acceptedFilter;
    document.querySelectorAll('[data-accepted-filter]').forEach(item => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    filterAccepted();
  }));
  search.addEventListener('input', filterAccepted);
  document.querySelector('[data-onclick="filterCandidates-rejected"]').addEventListener('click', function () { window.filterCandidates('rejected', this); });
  window.syncCompanyStudents();
});

document.addEventListener('DOMContentLoaded',()=>{
 const id=new URLSearchParams(location.search).get('student');
 if(!['alice','ghaith'].includes(id))return;
 const option=document.querySelector(`#evaluationStudentSelect option[value="${id}"]`);
 if(location.hash==='#tab-final-evaluation' && option)window.selectInternForRubric(id,option.dataset.name,option.dataset.role,option.dataset.gpa,option.dataset.status);
 if(location.hash==='#tab-weekly-reports'){const card=document.querySelector(`[data-weekly-id="${id==='alice'?'1':'2'}"]`);window.selectWeeklyIntern(card.dataset.weeklyId,card,card.querySelector('.bw-intern-status-name').textContent);}
});

// Explicit handlers keep HTML presentation-only and preserve native event semantics.
(function () {
  document.querySelectorAll('[data-onclick="switchTab-tab-posts-1"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-posts') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-candidates-2"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-candidates') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-accepted-students"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-accepted-students') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-weekly-reports-3"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-weekly-reports') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-final-evaluation-4"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-final-evaluation') };
  });
  document.querySelectorAll('[data-onclick="toggleCompanyPost--5"]').forEach(element => {
    element.onclick = function(event) { toggleCompanyPost(this) };
  });
  document.querySelectorAll('[data-onclick="openDeletePostModal--6"]').forEach(element => {
    element.onclick = function(event) { openDeletePostModal('Software Engineering Intern') };
  });
  document.querySelectorAll('[data-onclick="openDeletePostModal--7"]').forEach(element => {
    element.onclick = function(event) { openDeletePostModal('Frontend React Developer Intern') };
  });
  document.querySelectorAll('[data-onclick="filterCandidates-all-8"]').forEach(element => {
    element.onclick = function(event) { filterCandidates('all', this) };
  });
  document.querySelectorAll('[data-onclick="filterCandidates-review-10"]').forEach(element => {
    element.onclick = function(event) { filterCandidates('review', this) };
  });
  document.querySelectorAll('[data-oninput="searchCandidates--12"]').forEach(element => {
    element.oninput = function(event) { searchCandidates(this.value); };
  });
  document.querySelectorAll('[data-onclick="selectInternForRubric-alice-13"]').forEach(element => {
    element.onclick = function(event) { selectInternForRubric('alice', 'Alice Johnson', 'Frontend Developer Intern', '3.50', 'Ready for Final Evaluation'); window.switchTab('tab-final-evaluation'); };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-weekly-reports-14"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-weekly-reports'); };
  });
  document.querySelectorAll('[data-onclick="showPortalToast-tr-15"]').forEach(element => {
    element.onclick = function(event) { showPortalToast('Company acceptance preview only. Nothing was sent.'); this.closest('tr').querySelector('.bw-badge-amber').className = 'bw-badge bw-badge-success'; this.closest('tr').querySelector('.bw-badge-success').innerHTML = '<i class=\'bi bi-check-circle-fill\'></i> Accepted'; this.remove(); };
  });
  document.querySelectorAll('[data-onclick="selectWeeklyIntern--16"]').forEach(element => {
    element.onclick = function(event) { selectWeeklyIntern('1', this, 'Alice Johnson'); };
  });
  document.querySelectorAll('[data-onclick="selectWeeklyIntern--17"]').forEach(element => {
    element.onclick = function(event) { selectWeeklyIntern('2', this, 'Ghaith Amourah'); };
  });
  document.querySelectorAll('[data-onclick="selectWeeklyIntern--18"]').forEach(element => {
    element.onclick = function(event) { selectWeeklyIntern('3', this, 'Omar Majed'); };
  });
  document.querySelectorAll('[data-onsubmit="preventDefault--19"]').forEach(element => {
    element.onsubmit = function(event) { event.preventDefault(); showPortalToast('Report validated. Submission will be available when the backend is connected.'); };
  });
  document.querySelectorAll('[data-onclick="autoFillRubricDemo--20"]').forEach(element => {
    element.onclick = function(event) { autoFillRubricDemo(); };
  });
  document.querySelectorAll('[data-onclick="resetRubricRatings--21"]').forEach(element => {
    element.onclick = function(event) { resetRubricRatings(); };
  });
  document.querySelectorAll('[data-onclick="insertFeedbackText--22"]').forEach(element => {
    element.onclick = function(event) { insertFeedbackText('Demonstrated exceptional technical velocity, writing robust code and excelling in code reviews.'); };
  });
  document.querySelectorAll('[data-onclick="insertFeedbackText--23"]').forEach(element => {
    element.onclick = function(event) { insertFeedbackText('Active and proactive communicator during daily standups and engineering sprint planning.'); };
  });
  document.querySelectorAll('[data-onclick="insertFeedbackText--24"]').forEach(element => {
    element.onclick = function(event) { insertFeedbackText('Strongly endorsed for a full-time junior engineering offer upon university graduation.'); };
  });
  document.querySelectorAll('[data-onclick="showPortalToast--25"]').forEach(element => {
    element.onclick = function(event) { showPortalToast('Reminder preview only. No message was sent.'); };
  });
  document.querySelectorAll('[data-onclick="showPortalToast--26"]').forEach(element => {
    element.onclick = function(event) { showPortalToast('Calendar integration is a placeholder.'); };
  });
  document.querySelectorAll('[data-onclick="showPortalToast--27"]').forEach(element => {
    element.onclick = function(event) { showPortalToast('Interview preview only. No invitation was sent.'); };
  });
  document.querySelectorAll('[data-onclick="getElementById-replyFeedbackText-28"]').forEach(element => {
    element.onclick = function(event) { const t = document.getElementById('replyFeedbackText'); if (t && t.value.trim()) { showPortalToast('Feedback preview only. No message was sent.'); t.value = ''; closeModal('feedbackModal'); } else { showPortalToast('Please enter feedback message first.', 'bi-exclamation-triangle-fill text-warning'); } };
  });
})();
