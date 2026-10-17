document.getElementById('passwordChangeForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const p1 = document.getElementById('newPasswordInput').value;
      const p2 = document.getElementById('confirmPasswordInput').value;
      if (p1 !== p2) {
        showPortalToast('Passwords do not match. Please verify.', 'bi-exclamation-triangle-fill text-danger');
        return;
      }
      showPortalToast('Password requirements checked. No password was changed.');
      this.reset();
    });
