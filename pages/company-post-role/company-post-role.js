// Live Form Preview Sync
    const titleInput = document.getElementById('formRoleTitle');
    const modeSelect = document.getElementById('formWorkMode');
    const reqsInput = document.getElementById('formRoleReqs');
    const capacityInput = document.getElementById('formCapacity');
    const deadlineInput = document.getElementById('formDeadline');
    const descriptionInput = document.getElementById('formRoleDesc');

    const previewTitle = document.getElementById('previewTitle');
    const previewCompany = document.getElementById('previewCompany');
    const previewTags = document.getElementById('previewTags');
    const previewSeats = document.getElementById('previewSeats');
    const previewDeadline = document.getElementById('previewDeadline');

    function updatePreview() {
      if (previewTitle && titleInput) previewTitle.textContent = titleInput.value || 'Untitled Role';
      const description = document.getElementById('previewDescription');
      if(description && descriptionInput) description.textContent=descriptionInput.value || 'Describe the work and responsibilities to show them here.';
      if (previewCompany && modeSelect) previewCompany.textContent = `Tech Corp Inc. • ${modeSelect.value}`;
      if (previewSeats && capacityInput) previewSeats.textContent = `${capacityInput.value} of ${capacityInput.value} Seats Open`;
      if (previewDeadline && deadlineInput) previewDeadline.innerHTML = `<i class="bi bi-calendar-event"></i> Ends ${deadlineInput.value}`;

      if (previewTags && reqsInput) {
        const tokens = reqsInput.value.split(',').map(s => s.trim()).filter(Boolean);
        previewTags.replaceChildren(...tokens.map(t => { const tag=document.createElement('span'); tag.className='bw-opp-tag'; tag.textContent=t; return tag; }));
      }
    }

    [titleInput, modeSelect, reqsInput, capacityInput, deadlineInput, descriptionInput].forEach(el => {
      if (el) el.addEventListener('input', updatePreview);
    });

    updatePreview();
    // Form Submit
    document.getElementById('standalonePostForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const C=window.BridgewayCycle;
      if(!C)return;
      if(!titleInput.value.trim()||!descriptionInput.value.trim()||!reqsInput.value.trim())return;
      C.state.listings.unshift({id:crypto.randomUUID(),title:titleInput.value.trim(),company:'company-1',category:({'Software & Web':'software','Cybersecurity':'cybersecurity','Cloud & DevOps':'cloud','Data Science & AI':'data','Mobile Development':'mobile'})[document.getElementById('formRoleCategory').value],location:modeSelect.value,skills:reqsInput.value.trim(),description:descriptionInput.value.trim(),capacity:Number(capacityInput.value),deadline:deadlineInput.value,status:'Pending review',review:'',created:new Date().toISOString()});
      C.commit('Internship submitted for platform review');
      window.BridgewayUX?.remember(e.currentTarget);
      const content=C.section('Ready for platform review','This listing is pending. It becomes discoverable across active colleges only after Platform Admin approves it.');
      const link=C.E('a','Open publication desk','cycle-button is-primary');link.href='../company-dashboard/company-dashboard.html#tab-posts';content.append(link);C.dialog('Listing submitted',content);
    });
