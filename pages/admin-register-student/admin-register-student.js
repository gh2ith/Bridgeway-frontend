document.getElementById('adminRegisterStudentForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      showPortalToast('Form validated. Account creation will be available when the backend is connected.');
    });
