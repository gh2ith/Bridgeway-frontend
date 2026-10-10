(function () {
  'use strict';
  // CONFIGURATION & DOM REFERENCES
  // Access pass and form references
  const badgeCard = document.getElementById('badgeCard');
  const badgeName = document.getElementById('badgeName');
  const badgeRole = document.getElementById('badgeRole');
  const badgeInitials = document.getElementById('badgeInitials');
  const badgeIdSerial = document.getElementById('badgeIdSerial');

  // DOM Elements — Form & Roles
  const loginForm = document.getElementById('hrLoginForm');
  const emailInput = document.getElementById('loginEmail');
  const emailLabel = document.getElementById('loginEmailLabel');
  const emailHint = document.getElementById('loginEmailHint');
  const passwordInput = document.getElementById('loginPassword');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleIcon = document.getElementById('toggleIcon');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginSubmitBtnText = document.getElementById('loginSubmitBtnText');
  const loginToast = document.getElementById('loginToast');
  const loginToastMsg = document.getElementById('loginToastMsg');

  if (!badgeCard) return;

  // 5 Role Definitions & Metadata
  const ROLES = {
    student: {
      key: 'student',
      title: 'Student',
      label: 'Student Institutional Email',
      hint: 'Domain: <code>bau.edu.jo</code> or <code>oca.jo</code>',
      defaultEmail: 'student@bau.edu.jo',
      btnText: 'Sign In as Student',
      badgeName: 'Ghaith Al-Student',
      badgeRole: 'Student Intern • Al-Balqa Applied Univ.',
      badgeInitials: 'GA',
      badgeSerial: '#STU-2026-BAU',
      avatarBg: 'linear-gradient(135deg, #2563EB, #1D4ED8)'
    },
    supervisor: {
      key: 'supervisor',
      title: 'Supervisor',
      label: 'Academic Supervisor Institutional Email',
      hint: 'Domain: <code>bau.edu.jo</code> (Faculty of IT)',
      defaultEmail: 'dr.ahmad@bau.edu.jo',
      btnText: 'Sign In as Supervisor',
      badgeName: 'Dr. Ahmad S.',
      badgeRole: 'Academic Supervisor • SE Dept',
      badgeInitials: 'AS',
      badgeSerial: '#SUP-2026-OCA',
      avatarBg: 'linear-gradient(135deg, #059669, #047857)'
    },
    company: {
      key: 'company',
      title: 'Partner Company',
      label: 'Corporate HR / Mentor Email',
      hint: 'Domain: <code>techcorp.com</code> / Partner Org',
      defaultEmail: 'hr@techcorp.com',
      btnText: 'Sign In as Partner Company',
      badgeName: 'Tech Corp HR',
      badgeRole: 'Host Partner • Tech Corp Inc.',
      badgeInitials: 'TC',
      badgeSerial: '#CMP-2026-TC',
      avatarBg: 'linear-gradient(135deg, #4F46E5, #3730A3)'
    },
    platform_admin: {
      key: 'platform_admin', title: 'Platform Admin', label: 'Platform Administrator Email',
      hint: 'Platform account provided by Bridgeway', defaultEmail: 'platform@bridgeway.edu',
      btnText: 'Sign In as Platform Admin', badgeName: 'Platform Admin',
      badgeRole: 'Bridgeway Platform Administration', badgeInitials: 'PA',
      badgeSerial: '#PLT-2026-001', avatarBg: 'linear-gradient(135deg, #4338CA, #6366F1)'
    },
    admin: {
      key: 'admin',
      title: 'College Admin',
      label: 'University Administrator Email',
      hint: 'Domain: <code>uni.edu</code> or <code>bau.edu.jo</code>',
      defaultEmail: 'admin@uni.edu',
      btnText: 'Sign In as Administrator',
      badgeName: 'College Admin',
      badgeRole: 'College Administration',
      badgeInitials: 'UA',
      badgeSerial: '#ADM-2026-001',
      avatarBg: 'linear-gradient(135deg, #4338CA, #6366F1)'
    }
  };

  let activeRole = 'student';
  const passEmail=document.getElementById('passEmail'),passHint=document.getElementById('passHint');
  const privacyHint=document.getElementById('passPrivacyHint'),lockIcon=document.getElementById('passLockIcon');
  let pulseTimer;
  function syncPrivacy() {
    const focused=document.activeElement===passwordInput||document.activeElement===togglePasswordBtn;
    badgeCard.classList.toggle('is-private',focused);
    const revealed=passwordInput.type==='text';
    lockIcon.className=revealed?'bi bi-eye':'bi bi-lock';
    privacyHint.textContent=revealed?'Password visible in the form.':'Enter your password to continue.';
    passHint.textContent=focused?'Your identity is covered while you enter your password.':'Your pass responds as you type.';
  }
  passwordInput.addEventListener('focus',syncPrivacy);
  passwordInput.addEventListener('blur',()=>queueMicrotask(syncPrivacy));
  togglePasswordBtn.addEventListener('focus',syncPrivacy);
  togglePasswordBtn.addEventListener('blur',()=>queueMicrotask(syncPrivacy));
  passwordInput.addEventListener('input',()=>{
    badgeCard.classList.add('is-typing');
    clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>badgeCard.classList.remove('is-typing'),220);
  });
  togglePasswordBtn.addEventListener('click',()=>{
    const reveal=passwordInput.type==='password';passwordInput.type=reveal?'text':'password';
    toggleIcon.className=reveal?'bi bi-eye':'bi bi-eye-slash';syncPrivacy();
  });
  function triggerBadgeErrorShake() {
    badgeCard.classList.remove('is-error-kick');void badgeCard.offsetWidth;badgeCard.classList.add('is-error-kick');
    setTimeout(()=>badgeCard.classList.remove('is-error-kick'),500);
  }
  // 5-ROLE SELECTOR & BADGE IDENTITY SYNCHRONIZATION
  function selectRole(roleKey) {
    if (!ROLES[roleKey]) return;
    activeRole = roleKey;
    const roleData = ROLES[roleKey];

    // Update Role Cards Active State
    document.querySelectorAll('.lb-role-card').forEach(btn => {
      const isCurrent = btn.getAttribute('data-role') === roleKey;
      btn.classList.toggle('is-active', isCurrent);
      btn.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
    });

    // Update Inputs & Hints
    if (emailInput) {
      emailInput.placeholder = roleData.defaultEmail;
      emailInput.value = roleData.defaultEmail;
      emailInput.classList.remove('is-invalid');
    }
    if (emailLabel) {
      emailLabel.innerHTML = `<i class="bi bi-envelope me-1"></i> ${roleData.label}`;
    }
    if (emailHint) {
      emailHint.innerHTML = `<i class="bi bi-info-circle me-1"></i> ${roleData.hint}`;
    }
    if (loginSubmitBtnText) {
      loginSubmitBtnText.textContent = roleData.btnText;
    }
    if (emailError) emailError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';

    // Synchronize Badge Details
    if (badgeName) badgeName.textContent = roleData.badgeName;
    if (badgeRole) badgeRole.textContent = roleData.badgeRole;
    if (badgeInitials) badgeInitials.textContent = roleData.badgeInitials;
    if (badgeIdSerial) badgeIdSerial.textContent = roleData.badgeSerial;

    passEmail.textContent=emailInput.value;
  }

  // Bind Role Buttons
  document.querySelectorAll('.lb-role-card').forEach(card => {
    card.addEventListener('click', () => {
      const roleKey = card.getAttribute('data-role');
      selectRole(roleKey);
    });
  });

  // Live Email Typing Sync
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      passEmail.textContent=val||'Your email address';
      if (val && badgeName) {
        const usernamePart = val.split('@')[0];
        const formatted = usernamePart.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        badgeName.textContent = formatted || ROLES[activeRole].badgeName;

        if (badgeInitials) {
          const initials = formatted.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          badgeInitials.textContent = initials || ROLES[activeRole].badgeInitials;
        }
      } else if (!val) {
        if (badgeName) badgeName.textContent = ROLES[activeRole].badgeName;
        if (badgeInitials) badgeInitials.textContent = ROLES[activeRole].badgeInitials;
      }
    });
  }
  // FORM SUBMISSION & ROUTING
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      let hasError = false;
      if (!email || !email.includes('@')) {
        if (emailError) {
          emailError.textContent = 'Please enter a valid official email address.';
          emailError.style.display = 'block';
        }
        if (emailInput) emailInput.classList.add('is-invalid');
        hasError = true;
      } else {
        if (emailError) emailError.style.display = 'none';
        if (emailInput) emailInput.classList.remove('is-invalid');
      }

      if (!password) {
        if (passwordError) {
          passwordError.textContent = 'Please enter your password.';
          passwordError.style.display = 'block';
        }
        if (passwordInput) passwordInput.classList.add('is-invalid');
        hasError = true;
      } else {
        if (passwordError) passwordError.style.display = 'none';
        if (passwordInput) passwordInput.classList.remove('is-invalid');
      }

      if (hasError) {
        triggerBadgeErrorShake();
        return;
      }

      // Diagonal Light Sweep on Badge
      if (badgeCard) badgeCard.classList.add('is-pending');

      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Opening workspace...';
      }

      setTimeout(() => {
        const roleData = ROLES[activeRole];
        showToast(`Opening the ${roleData.title} demo workspace.`);

        setTimeout(() => {
          const dashboardMap = {
            student: '../student-dashboard/student-dashboard.html',
            supervisor: '../supervisor-dashboard/supervisor-dashboard.html',
            company: '../company-dashboard/company-dashboard.html',
            admin: '../admin-dashboard/admin-dashboard.html',
            platform_admin: '../platform-admin/platform-admin.html'
          };
          window.location.href = dashboardMap[activeRole] || '../student-dashboard/student-dashboard.html';
        }, 1200);
      }, 700);
    });
  }

  function showToast(message) {
    if (loginToast && loginToastMsg) {
      loginToastMsg.textContent = message;
      loginToast.style.display = 'flex';
      setTimeout(() => {
        loginToast.style.display = 'none';
      }, 3500);
    }
  }
  // FORGOT PASSWORD MODAL
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotModal = document.getElementById('forgotPasswordModal');
  const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetEmailInput = document.getElementById('resetEmail');

  function openForgotModal() {
    if (!forgotModal) return;
    if (emailInput && resetEmailInput) {
      resetEmailInput.value = emailInput.value.trim();
    }
    forgotModal.style.display = 'block';
    setTimeout(() => forgotModal.classList.add('show'), 10);
  }

  function closeForgotModal() {
    if (!forgotModal) return;
    forgotModal.classList.remove('show');
    setTimeout(() => forgotModal.style.display = 'none', 200);
  }

  if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); openForgotModal(); });
  if (closeForgotModalBtn) closeForgotModalBtn.addEventListener('click', closeForgotModal);
  if (forgotModal) {
    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) closeForgotModal();
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resetAlert = document.getElementById('resetSuccessAlert');
      const submitBtn = document.getElementById('resetSubmitBtn');
      if (resetAlert) resetAlert.classList.remove('d-none');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Verification Dispatched';
      }
      setTimeout(closeForgotModal, 1800);
    });
  }
  // DARK / LIGHT THEME CONTROLLER
  const loginThemeToggle = document.getElementById('loginThemeToggle');
  const loginThemeIcon = document.getElementById('loginThemeIcon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const isDark = theme === 'dark';
    if (loginThemeIcon) {
      loginThemeIcon.className = isDark ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars';
    }
  }

  const savedTheme =
    'light';
  applyTheme(savedTheme);

  if (loginThemeToggle) {
    loginThemeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
  // INITIALIZATION & LIFECYCLE
  function init() {
    selectRole('student');
    badgeCard.classList.add('is-landed');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
