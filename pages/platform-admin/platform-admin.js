/* Static demo records and basic UI interactions. All edits reset on reload. */
document.addEventListener('DOMContentLoaded', () => {
  const organizations = window.BridgewayPartners.organizations;
  const partnerships = window.BridgewayPartners.links;
  const issues = [
    {id:'BW-102',title:'Replace the college administrator contact',organization:'college-2',status:'Open',description:'The college has requested an update to its administrator contact. Confirm the replacement contact details with the college.',resolution:''},
    {id:'BW-101',title:'Partnership access question',organization:'company-2',status:'In progress',description:'The company needs help confirming which colleges are linked to its account.',resolution:''}
  ];
  const $ = id => document.getElementById(id);
  let nextId = 10;
  let editingOrganization = null;
  let editingIssue = null;
  const titles = {
    'platform-overview':['Platform overview','Manage the colleges and companies that make Bridgeway possible.'],
    'platform-companies':['Company accounts','Create accounts, maintain contact details, and manage company access.'],
    'platform-colleges':['College accounts','Manage college details and their administrator accounts.'],
    'platform-partnerships':['Partnerships','Connect colleges and companies for internship opportunities.'],
    'platform-issues':['Escalated issues','Resolve requests raised by colleges and companies.']
  };
  const orgName = id => organizations.find(org => org.id === id)?.name || 'Organization';
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function action(text, callback, label) {
    const node = element('button',text,'bw-tag-btn'); node.type='button';
    if (label) node.setAttribute('aria-label',label);
    node.addEventListener('click',callback); return node;
  }
  function badge(status) {
    return element('span',status,`platform-status${status==='Paused'?' is-paused':['Suspended','Inactive','Resolved'].includes(status)?' is-muted': ['Open','In progress'].includes(status)?' is-pending':''}`);
  }
  function cell(row, content) { const td=element('td'); td.append(content); row.append(td); return td; }
  function identity(name,meta) { const div=element('div'); div.append(element('span',name,'platform-record-name'),element('span',meta,'platform-record-meta')); return div; }
  function filterTable(panelId) {
    const query=document.querySelector(`[data-platform-search="${panelId}"]`).value.trim().toLowerCase();
    const rows=Array.from($(`${panelId}-rows`).rows); let count=0;
    rows.forEach(row => {row.hidden=!row.textContent.toLowerCase().includes(query); if(!row.hidden) count++;});
    document.querySelector(`[data-result-count="${panelId}"]`).textContent=`${count} of ${rows.length} records`;
    document.querySelector(`[data-empty="${panelId}"]`).hidden=count>0;
  }
  function render() {
    for(const type of ['company','college']) {
      const panel=type==='company'?'platform-companies':'platform-colleges';
      const body=$(`${panel}-rows`); body.replaceChildren();
      organizations.filter(org=>org.type===type).forEach(org=>{
        const row=element('tr');
        cell(row,identity(org.name,type==='company'?'Company account':'College account'));
        cell(row,identity(org.admin,org.email)); cell(row,element('span',org.location)); cell(row,badge(org.status));
        cell(row,action('Manage',()=>openOrganization(type,org.id),`Manage ${org.name}`)); body.append(row);
      }); filterTable(panel);
    }
    const partnershipBody=$('platform-partnerships-rows'); partnershipBody.replaceChildren();
    partnerships.forEach(link=>{
      const row=element('tr'); cell(row,element('span',orgName(link.college))); cell(row,element('span',orgName(link.company))); cell(row,badge(window.BridgewayPartners.effective(link)?'Active':link.status==='Active'?'Account suspended':'Paused'));
      cell(row,action('View cycle',()=>openPartnerCycle(link),`View partnership ${orgName(link.college)} and ${orgName(link.company)}`));
      cell(row,action(link.status==='Active'?'Pause':'Resume',async()=>{
        if(link.status==='Active'&&!await window.confirmPartnershipPause(`Are you sure you want to pause the partnership between ${orgName(link.college)} and ${orgName(link.company)}? New applications and placements will stop; existing training continues. This change is preview-only.`))return;
        const members=organizations.filter(org=>[link.college,link.company].includes(org.id));
        if(link.status!=='Active' && members.some(org=>org.status!=='Active')) {showPortalToast('Activate both organization accounts before reactivating this partnership.'); return;}
        link.status=link.status==='Active'?'Inactive':'Active'; render(); showPortalToast(link.status==='Active'?'Partnership resumed in this preview.':'Partnership paused. New applications stop; existing placements continue.');
      },`${link.status==='Active'?'Pause':'Resume'} ${orgName(link.college)} and ${orgName(link.company)} partnership`)); partnershipBody.append(row);
    }); filterTable('platform-partnerships');
    const issueBody=$('platform-issues-rows'); issueBody.replaceChildren();
    issues.forEach(issue=>{
      const row=element('tr'); cell(row,identity(issue.title,issue.id)); cell(row,element('span',orgName(issue.organization))); cell(row,badge(issue.status));
      cell(row,action('View issue',()=>openIssue(issue),`View ${issue.id}`)); issueBody.append(row);
    }); filterTable('platform-issues');
    const priority=$('platformPriorityIssues'); priority.replaceChildren();
    issues.filter(issue=>issue.status!=='Resolved').forEach(issue=>{
      const row=element('div'), info=element('div'); info.append(element('strong',issue.title),element('small',`${orgName(issue.organization)} · ${issue.status}`)); row.append(info,action('Review',()=>openIssue(issue),`Review ${issue.id}`)); priority.append(row);
    });
    if(!priority.children.length) priority.append(element('p','No open issues.','platform-empty'));
    $('platformCompanyCount').textContent=organizations.filter(org=>org.type==='company').length;
    $('platformCollegeCount').textContent=organizations.filter(org=>org.type==='college').length;
    $('platformPartnershipCount').textContent=partnerships.filter(link=>window.BridgewayPartners.effective(link)).length;
    $('platformIssueCount').textContent=issues.filter(issue=>issue.status!=='Resolved').length;
    for(const [id,key] of [['platformStudentCount','students'],['platformListingCount','listings'],['platformPlacementCount','placements']]) $(''+id).textContent=organizations.reduce((sum,org)=>sum+(org[key]||0),0);
  }
  function openPartnerCycle(link) {
    let dialog=document.getElementById('partnerCycleDialog');
    if(!dialog){dialog=element('dialog',undefined,'partner-preview');dialog.id='partnerCycleDialog';document.body.append(dialog);}
    dialog.replaceChildren(); const heading=element('h2',`${orgName(link.college)} + ${orgName(link.company)}`);heading.id='partnerCycleTitle';dialog.setAttribute('aria-labelledby',heading.id);dialog.append(heading);
    const active=window.BridgewayPartners.effective(link);
    dialog.append(element('p',active?'Active: students in this college can apply to this company open listings.':'Paused: no new applications or placements are available through this link.'));
    const students=window.BridgewayPartners.students.filter(s=>s.college===link.college&&s.company===link.company);
    dialog.append(element('h3','Company view'),element('p','Only this company applicants and confirmed interns are visible. Partner college directories are never shared.'));
    students.forEach(s=>dialog.append(element('p',`${s.name} - ${s.stage} - ${s.role}`)));
    if(!students.length)dialog.append(element('p','No applicants or interns for this partnership yet.'));
    dialog.append(element('h3','College & supervisor view'),element('p','The college confirms placements and assigns supervisors. Assigned supervisors review weekly reports and the college reviews the final evaluation.'));
    dialog.append(element('p','Existing placements retain reports and evaluations when this link is paused. Changes are temporary on this page; other pages show the same baseline sample data.','partner-scope'));
    dialog.append(action('Close',()=>dialog.close()));dialog.showModal();
  }
  function openOrganization(type,id=null) {
    editingOrganization=id;
    const form=$('organizationForm'); form.reset();
    $('organizationType').disabled=Boolean(id); $('organizationType').value=type;
    $('organizationError').hidden=true; $('organizationAccessGroup').hidden=!id; $('platformRecovery').hidden=!id; $('platformRecoveryNote').hidden=true;
    if(id) {
      const org=organizations.find(item=>item.id===id);
      for(const field of ['name','location','phone','admin','email','status']) form.elements[field].value=org[field];
    }
    updateOrganizationTitle(); $('organizationDialog').showModal();
  }
  function updateOrganizationTitle() {
    $('organizationDialogTitle').textContent=`${editingOrganization?'Manage':'Create'} ${$('organizationType').value} account`;
    $('organizationSubmit').textContent=editingOrganization?'Save changes':'Create account';
  }
  document.querySelectorAll('[data-create-org]').forEach(button=>button.addEventListener('click',()=>openOrganization(button.dataset.createOrg)));
  $('organizationType').addEventListener('change',updateOrganizationTitle);
  $('organizationForm').addEventListener('submit',event=>{
    event.preventDefault(); const form=event.currentTarget;
    const values={type:$('organizationType').value};
    for(const key of ['name','location','phone','admin','email','status']) values[key]=form.elements[key].value.trim();
    if(!values.name||!values.location||!values.admin) { $('organizationError').textContent='Enter the organization name, city, and administrator name.'; $('organizationError').hidden=false; return; }
    if(organizations.some(org=>org.id!==editingOrganization&&org.email.toLowerCase()===values.email.toLowerCase())) { $('organizationError').textContent='This administrator email is already assigned to an account.'; $('organizationError').hidden=false; return; }
    const current=organizations.find(org=>org.id===editingOrganization);
    if(current) Object.assign(current,values); else organizations.push({id:`${values.type}-${nextId++}`,...values,students:0,listings:0,placements:0});
    $('organizationDialog').close(); render();
    window.switchTab(values.type==='company'?'platform-companies':'platform-colleges');
    showPortalToast(current?'Account details updated in this preview.':'Account added to this preview.');
  });
  $('platformRecovery').addEventListener('click',()=>{$('platformRecoveryNote').hidden=false;});
  $('platformAddPartnership').addEventListener('click',()=>{
    for(const type of ['college','company']) {
      const select=$(`partnership${type==='college'?'College':'Company'}`); select.replaceChildren();
      const placeholder=element('option',`Select a ${type}`); placeholder.value=''; select.append(placeholder);
      organizations.filter(org=>org.type===type&&org.status==='Active').forEach(org=>{const option=element('option',org.name);option.value=org.id;select.append(option);});
    }
    $('partnershipError').hidden=true; $('partnershipDialog').showModal();
  });
  $('partnershipForm').addEventListener('submit',event=>{
    event.preventDefault(); const college=$('partnershipCollege').value,company=$('partnershipCompany').value;
    if(partnerships.some(link=>link.college===college&&link.company===company)) { $('partnershipError').textContent='This partnership already exists. You can reactivate it from the table if needed.'; $('partnershipError').hidden=false; return; }
    partnerships.push({id:`partnership-${nextId++}`,college,company,status:'Active'}); $('partnershipDialog').close(); render(); showPortalToast('Partnership added to this preview.');
  });
  function openIssue(issue) {
    editingIssue=issue.id; $('issueDialogTitle').textContent=issue.title; $('issueOrganization').textContent=`${issue.id} · ${orgName(issue.organization)}`;
    $('issueDescription').textContent=issue.description; $('issueStatus').value=issue.status; $('issueResolution').value=issue.resolution; $('issueDialog').showModal();
  }
  $('issueForm').addEventListener('submit',event=>{
    event.preventDefault(); const issue=issues.find(item=>item.id===editingIssue); issue.status=$('issueStatus').value; issue.resolution=$('issueResolution').value.trim(); $('issueDialog').close(); render(); showPortalToast('Issue updated in this preview.');
  });
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelectorAll('[data-platform-search]').forEach(input=>input.addEventListener('input',()=>filterTable(input.dataset.platformSearch)));
  document.querySelectorAll('[data-platform-tab]').forEach(button=>button.addEventListener('click',()=>window.switchTab(button.dataset.platformTab)));
  function updateTitle() {
    const panel=document.querySelector('.bw-tab-panel.is-active'); const title=titles[panel?.id]; if(!title)return;
    $('platformPageTitle').textContent=title[0]; $('platformPageDescription').textContent=title[1];
    $('platformOverviewTools').hidden=panel.id!=='platform-overview';
  }
  document.querySelectorAll('.bw-tab-panel').forEach(panel=>new MutationObserver(updateTitle).observe(panel,{attributes:true,attributeFilter:['class']}));
  render(); updateTitle();
});
