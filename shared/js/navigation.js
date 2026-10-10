/* portal-unified */
/* Shared page-only navigation. No session or persistent state. */
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('portalAccountToggle');
  const menu = document.getElementById('portalAccountDropdown');
  const wrap = button?.parentElement;
  function closeAccount() { if (menu) menu.hidden = true; button?.setAttribute('aria-expanded', 'false'); }
  button?.addEventListener('click', () => { menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); });
  button?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); menu.hidden = false; button.setAttribute('aria-expanded','true'); menu.querySelector('a').focus(); }
  });
  document.addEventListener('click', event => { if (wrap && !wrap.contains(event.target)) closeAccount(); });
  document.addEventListener('focusin', event => { if (wrap && !wrap.contains(event.target)) closeAccount(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu && !menu.hidden) { closeAccount(); button.focus(); } });
  const role = document.body.dataset.portalRole;
  document.querySelectorAll('a[href="../account-settings/account-settings.html"]').forEach(link => link.href = `../account-settings/account-settings.html?role=${role}`);
  document.querySelectorAll('.bw-masar-nav [data-tab]').forEach(item => {
    item.title = item.textContent.trim().replace(/\s+/g,' ');
    item.addEventListener('click', () => {
      document.querySelectorAll('.bw-masar-nav [data-tab]').forEach(other => {
        if (item === other) other.setAttribute('aria-current','page'); else other.removeAttribute('aria-current');
      });
    });
  });
  document.querySelectorAll('.bw-kpi-card[data-onclick]').forEach(card => {
    if (card.tagName !== 'BUTTON') {
      card.tabIndex = 0; card.setAttribute('role','button');
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); } });
    }
  });
  // Role context is a URL presentation hint only; real permissions belong to the backend.
  if (location.pathname.endsWith('account-settings.html')) {
    const roles = {
      student:['Student','Ghaith Amourah','GA','../student-dashboard/student-dashboard.html','../student-profile/student-profile.html','student@bau.edu.jo'],
      supervisor:['Supervisor','Dr. Ahmad','DA','../supervisor-dashboard/supervisor-dashboard.html','../account-settings/account-settings.html?role=supervisor','dr.ahmad@bau.edu.jo'],
      company:['Company','Tech Corp Inc.','TC','../company-dashboard/company-dashboard.html','../company-profile/company-profile.html','hr@techcorp.com'],
      admin:['College Admin','Al-Balqa Applied University','BA','../admin-dashboard/admin-dashboard.html','../account-settings/account-settings.html?role=admin','admin@bau.edu.jo'],
      platform_admin:['Platform Admin','Platform Admin','PA','../platform-admin/platform-admin.html','../account-settings/account-settings.html?role=platform_admin','platform@bridgeway.edu']
    };
    const requested = new URLSearchParams(location.search).get('role');
    const key = Object.hasOwn(roles,requested) ? requested : 'student';
    const [label,name,initials,dashboard,profile,email] = roles[key];
    document.body.dataset.portalRole = key;
    document.getElementById('portalRoleLabel').textContent = label;
    document.getElementById('portalAccountName').textContent = name;
    document.getElementById('portalInitials').textContent = initials;
    document.querySelector('.portal-role-label').textContent = label;
    const nav = document.querySelector('.bw-masar-nav');
    nav.replaceChildren();
    const link = document.createElement('a'); link.className = 'bw-masar-item'; link.href = dashboard;
    link.innerHTML = '<i class="bi bi-grid" aria-hidden="true"></i><span>Dashboard</span>'; nav.append(link);
    document.querySelectorAll('a[href="../student-dashboard/student-dashboard.html"]').forEach(item => item.href = dashboard);
    document.querySelectorAll('a[href="../student-profile/student-profile.html"], [data-portal-profile]').forEach(item => item.href = profile);
    document.querySelectorAll('[data-portal-settings]').forEach(item => item.href = `../account-settings/account-settings.html?role=${key}`);
    document.querySelectorAll('.bw-form-group > div > span:first-child').forEach(item => {
      if (item.textContent.includes('student@bau.edu.jo')) item.textContent = email;
      if (item.textContent.includes('Student / Undergraduate Intern')) item.textContent = label;
    });
  }
});
