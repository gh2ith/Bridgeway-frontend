// Live Form Preview Sync
    const titleInput = document.getElementById('formRoleTitle');
    const modeSelect = document.getElementById('formWorkMode');
    const reqsInput = document.getElementById('formRoleReqs');
    const capacityInput = document.getElementById('formCapacity');
    const deadlineInput = document.getElementById('formDeadline');

    const previewTitle = document.getElementById('previewTitle');
    const previewCompany = document.getElementById('previewCompany');
    const previewTags = document.getElementById('previewTags');
    const previewSeats = document.getElementById('previewSeats');
    const previewDeadline = document.getElementById('previewDeadline');

    function updatePreview() {
      if (previewTitle && titleInput) previewTitle.textContent = titleInput.value || 'Untitled Role';
      if (previewCompany && modeSelect) previewCompany.textContent = `Tech Corp Inc. • ${modeSelect.value}`;
      if (previewSeats && capacityInput) previewSeats.textContent = `${capacityInput.value} of ${capacityInput.value} Seats Open`;
      if (previewDeadline && deadlineInput) previewDeadline.innerHTML = `<i class="bi bi-calendar-event"></i> Ends ${deadlineInput.value}`;

      if (previewTags && reqsInput) {
        const tokens = reqsInput.value.split(',').map(s => s.trim()).filter(Boolean);
        previewTags.replaceChildren(...tokens.map(t => { const tag=document.createElement('span'); tag.className='bw-opp-tag'; tag.textContent=t; return tag; }));
      }
    }

    [titleInput, modeSelect, reqsInput, capacityInput, deadlineInput].forEach(el => {
      if (el) el.addEventListener('input', updatePreview);
    });

    // Form Submit
    document.getElementById('standalonePostForm').addEventListener('submit', (e) => {
      e.preventDefault();
      showPortalToast('Form validated. Publishing will be available when the backend is connected.');
    });
