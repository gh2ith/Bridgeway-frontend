/* Partnership review joins workspace records by organization and placement IDs.
   Attendance declarations and allegations are never treated as verified findings. */
(() => {
  'use strict';
  const C = window.BridgewayCycle, M = window.BridgewayPartners;
  if (!C || !M) return;
  const {E,A,B,field,select,section,dialog} = C;
  const icon=name=>{const node=E('i',null,`bi ${name}`);node.setAttribute('aria-hidden','true');return node;};
  const state = C.state;
  const organization = id => M.organizations.find(o => o.id===id);
  const latest = h => state.histories.find(p => p.student===h.student)?.id===h.id;
  const plan = h => state.archivedPlans?.[h.id] || (latest(h) ? state.plans[h.student] : null);
  const evaluation = h => state.archivedEvaluations?.[h.id] || (latest(h) ? state.evaluations[h.student] : null);
  const placementHours = h => Number.isFinite(h.verifiedHours) ? h.verifiedHours : plan(h) ? plan(h).filter(w=>w.status==='verified').reduce((n,w)=>n+Number(w.actualHours||0),0) : null;
  const asDate = value => value && Number.isFinite(Date.parse(value)) ? new Date(value.slice(0,10)+'T00:00:00Z') : null;
  const missing = value => value ?? 'Not recorded';
  const scopeKey = (college,company) => `${college}:${company}`;
  const keyForHistory = h => scopeKey(C.student(h.student)?.college,h.company);
  const ticketPlacement = t => state.histories.find(h=>h.id===(t.review?.placement||t.placement)) || (t.reference?.startsWith('report:')?state.histories.find(h=>h.student===t.reference.split(':')[1]):null);
  function links() {
    const result = M.links.map(l=>({...l}));
    for(const h of state.histories) {
      const s = C.student(h.student);
      if(s && !result.some(l=>l.college===s.college&&l.company===h.company)) result.push({id:`history:${s.college}:${h.company}`,college:s.college,company:h.company,status:'History only'});
    }
    return result;
  }
  function ticketScope(t) {
    if(t.reference?.startsWith('partnership:')) { const [,college,company]=t.reference.split(':'); return scopeKey(college,company); }
    if(t.review?.placement||t.placement) { const h=ticketPlacement(t); if(h)return keyForHistory(h); }
    if(t.reference?.startsWith('report:')) {
      const [,id] = t.reference.split(':');
      const h = state.histories.find(h=>h.student===id);
      if(h)return keyForHistory(h);
    }
    return null; // Free-text names are not evidence of an organization association.
  }
  function collect(filters={}) {
    const q=(filters.query||'').trim().toLowerCase();
    let pairs=links().filter(l=>(!filters.college||l.college===filters.college)&&(!filters.company||l.company===filters.company)&&(!q||`${C.org(l.college)} ${C.org(l.company)} ${l.status}`.toLowerCase().includes(q)));
    let histories=state.histories.filter(h=>pairs.some(l=>keyForHistory(h)===scopeKey(l.college,l.company))&&(!filters.from||h.start>=filters.from)&&(!filters.to||h.start<=filters.to));
    if(filters.from||filters.to)pairs=pairs.filter(l=>histories.some(h=>keyForHistory(h)===scopeKey(l.college,l.company)));
    const keys=new Set(pairs.map(l=>scopeKey(l.college,l.company)));
    const unfiltered=!filters.college&&!filters.company&&!filters.from&&!filters.to&&!q;
    const tickets=state.tickets.filter(t=>C.ticketVisible(t)&&(keys.has(ticketScope(t))||!ticketScope(t)&&unfiltered)&&(!(filters.from||filters.to)||histories.some(h=>h.id===ticketPlacement(t)?.id)));
    const summary=pairs.map(l=>{
      const hs=histories.filter(h=>keyForHistory(h)===scopeKey(l.college,l.company));
      const weeks=hs.flatMap(h=>plan(h)||[]), attendance=weeks.filter(w=>w.attendance), ts=tickets.filter(t=>ticketScope(t)===scopeKey(l.college,l.company));
      const values=hs.map(placementHours), finished=hs.filter(h=>['Completed','Left'].includes(h.status));
      return {link:l,histories:hs,students:new Set(hs.map(h=>h.student)).size,active:hs.filter(h=>h.status==='Active').length,completed:hs.filter(h=>h.status==='Completed').length,left:hs.filter(h=>h.status==='Left').length,closed:finished.length,verified:values.some(v=>v===null)?null:values.reduce((a,b)=>a+b,0),unknownHours:values.filter(v=>v===null).length,attendance:attendance.length,absent:attendance.length?attendance.reduce((n,w)=>n+w.attendance.unexcused,0):null,late:attendance.length?attendance.reduce((n,w)=>n+w.attendance.late,0):null,openTickets:ts.filter(t=>t.status!=='Resolved').length,tickets:ts.length};
    });
    return {pairs,histories,tickets,summary,filters};
  }
  function sheets(data,options={}) {
    const stamp=new Date().toISOString().slice(0,10), filters=data.filters;
    const scope=`Exported ${stamp}. College: ${filters.college?C.org(filters.college):'All'}. Company: ${filters.company?C.org(filters.company):'All'}.`;
    const dateScope=filters.from&&filters.to?`Placement starts: ${filters.from} to ${filters.to}.`:filters.from?`Placement starts from ${filters.from}.`:filters.to?`Placement starts through ${filters.to}.`:'All placement dates.';
    const ordered=rows=>rows.sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||String(a[1]).localeCompare(String(b[1])));
    const reportStatus=value=>({draft:'Not submitted',submitted:'Awaiting review',verified:'Approved',revision:'Changes requested',returned:'Changes requested'}[value]||value);
    const weekly=[], archived=[];
    const legacy=(record,values,prefix='')=>{
      for(const [key,value] of Object.entries(values||{})){
        if(value==null||value==='')continue;
        const label=prefix+(Array.isArray(values)?`Entry ${Number(key)+1}`:key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase()));
        if(typeof value==='object')legacy(record,value,label+' / ');
        else archived.push([record,label,value]);
      }
    };
    for(const h of data.histories) {
      const s=C.student(h.student), weeks=plan(h);
      if(!weeks){weekly.push([s.name,C.org(h.company),null,'Archive not available','Not recorded',null,null,null,null,'',h.id]);continue;}
      weeks.forEach((w,i)=>{
        const reported=w.status!=='draft', done=w.objectives.filter(o=>o.done).length;
        weekly.push([s.name,C.org(h.company),i+1,w.title,reportStatus(w.status),w.hours,reported?w.actualHours:null,w.status==='verified'?w.actualHours:null,reported?`${done} / ${w.objectives.length}`:'Not reported',w.notes||'',h.id]);
        legacy(`${h.id} / Week ${i+1}`,{attendance:w.attendance,priorSupervisorRatings:w.ratings});
      });
    }
    const partnerships={
      name:'Partnerships',title:'Partnership overview',note:scope,
      context:`${dateScope}${filters.query?' Search: '+filters.query+'.':''}${data.summary.some(r=>r.unknownHours)?' Blank hours mean records are missing.':''}`,
      widths:[32,29,14,12,15,17],freezeColumns:0,statusStyle:'text',
      headers:['College','Company','Status','Students','Active interns','Verified hours'],
      headerLabels:['College','Company','Status','Students','Active\ninterns','Verified\nhours'],
      rows:ordered(data.summary.map(r=>[C.org(r.link.college),C.org(r.link.company),M.effective(r.link)?'Active':'Inactive',r.students,r.active,r.verified]))
    };
    const placements={
      name:'Placements',title:'Student placement history',note:scope,context:'One row per placement. Company acceptance and academic supervision are separate.',
      widths:[23,16,28,25,30,16,14,14,16,24],freezeColumns:2,
      headers:['Student','Student ID','College','Company','Internship','Outcome','Start date','End date','Verified hours','Academic supervisor'],
      rows:ordered(data.histories.map(h=>{const s=C.student(h.student);return [s.name,s.studentId,C.org(s.college),C.org(h.company),h.role,h.status,asDate(h.start),asDate(h.end),placementHours(h),latest(h)?s.supervisor||'Not assigned':'Historical assignment unavailable'];}))
    };
    const reports={
      name:'Weekly reports',title:'Weekly training reports',note:scope,context:'Companies write reports. Supervisors approve reports and verify hours. Blank hours are not zero.',
      widths:[23,25,8,28,20,12,12,12,16,42],freezeColumns:2,
      headers:['Student','Company','Week','Weekly focus','Report status','Planned hours','Reported hours','Verified hours','Objectives complete','Company feedback'],
      headerLabels:['Student','Company','Week','Weekly focus','Report status','Planned\nhours','Reported\nhours','Verified\nhours','Objectives\ncomplete','Company feedback'],
      rows:ordered(weekly.map(row=>row.slice(0,10)))
    };
    const tickets={
      name:'Tickets',title:'Support tickets',note:scope,context:'Tickets visible in this workspace. Organization filters include explicitly linked tickets only. Resolved does not establish a finding.',
      widths:[18,34,21,24,28,25,16,48],freezeColumns:1,
      headers:['Ticket ID','Subject','Status','Requester','College','Company','Last updated','Latest message'],
      rows:data.tickets.slice().sort((a,b)=>String(b.messages.at(-1)?.at||b.created).localeCompare(String(a.messages.at(-1)?.at||a.created))).map(t=>{
        const [college,company]=(ticketScope(t)||'').split(':'),last=t.messages.at(-1);
        return [t.id,t.subject,t.status,t.messages[0]?.author||t.owner,college?C.org(college):'',company?C.org(company):'',asDate(t.updated||last?.at||t.created),last?.body||''];
      })
    };
    const result=[partnerships,placements,reports,tickets];
    if(options.details){
      const ids=[...new Set(data.pairs.flatMap(l=>[l.college,l.company]))];
      result.push(
        {name:'Contacts',title:'Organization contacts',note:scope,widths:[34,15,17,26,36,26],headers:['Organization','Type','Account status','Administrator','Email','Organization ID'],rows:ids.map(id=>{const o=organization(id);return [C.org(id),o?.type,o?.status,o?.admin,o?.email,id];})},
        {name:'Report reviews',title:'Company reports and supervisor decisions',note:scope,widths:[25,26,9,22,54,54,24],headers:['Student','Placement ID','Week','Report status','Company feedback','Supervisor notes','Student report access'],rows:ordered(data.histories.flatMap(h=>(plan(h)||[]).map((w,i)=>{const s=C.student(h.student);return [s.name,h.id,i+1,reportStatus(w.status),w.notes||'',w.review||'',window.BridgewayReportVisibility.restricted(state,[s],s.id)?'Restricted':'Visible'];})))},
        {name:'Evaluations',title:'Company final evaluations',note:scope,widths:[25,26,17,18,55,26],headers:['Student','Placement ID','Company total / 40','Evaluation date','End reason','Training archive'],rows:ordered(data.histories.map(h=>{const ev=evaluation(h);return [C.student(h.student).name,h.id,ev?ev.scores.reduce((a,b)=>a+b,0):null,asDate(ev?.date),h.reason||'',plan(h)?'Available':'Not recorded'];}))},
      );
      for(const t of data.tickets){legacy(t.id,t.review);legacy(t.id,{reviewHistory:t.reviewHistory});}
      if(archived.length)result.push({name:'Historical fields',title:'Retained historical fields',note:'Existing records from retired workflows. These fields do not introduce an active review or attendance workflow.',widths:[38,30,105],headers:['Record','Historical field','Stored value'],rows:archived});
    }
    return result;
  }
  function exportDialog(initial={}) {
    const body=E('div',null,'partnership-export'), heading=E('p','Choose the company and college you need to review. The workbook includes the records behind each total.','cycle-muted');
    const college=select('College',[['','All colleges'],...M.organizations.filter(o=>o.type==='college').map(o=>[o.id,o.name])],initial.college||''), company=select('Company',[['','All companies'],...M.organizations.filter(o=>o.type==='company').map(o=>[o.id,o.name])],initial.company||''), from=field('Placement start from','','date'),to=field('Placement start to','','date');
    const preview=E('div',null,'partnership-export-preview'), counts=E('p',null,'cycle-muted'), note=E('p','Contains student and support records. Share only with authorized reviewers.','cycle-callout');
    const detailed=E('input');detailed.type='checkbox';
    const detailChoice=A(E('label',null,'partnership-export-detail'),detailed,A(E('span'),E('strong','Include detailed records'),E('small','Contacts, report reviews and evaluations.')));
    const download=B('Download Excel workbook',()=>{
      const filters=read(); if(from.input.value&&to.input.value&&from.input.value>to.input.value){to.input.setCustomValidity('End date must be on or after the start date.');to.input.reportValidity();return;}
      try{window.BridgewayWorkbook.download(sheets(collect(filters),{details:detailed.checked}),`bridgeway-partnership-review-${new Date().toISOString().slice(0,10)}.xlsx`);C.say('Excel workbook downloaded.');}catch(error){console.error('Partnership export failed',error);C.say('The workbook could not be created. Please refresh and try again.');}
    },true);
    download.prepend(icon('bi-file-earmark-excel'));body.append(heading,A(E('div',null,'partnership-export-filters'),college.wrap,company.wrap,from.wrap,to.wrap),counts,preview,detailChoice,note,A(E('div',null,'cycle-actions'),download));
    function read(){return {college:college.input.value,company:company.input.value,from:from.input.value,to:to.input.value,query:initial.query||''};}
    function render(){to.input.setCustomValidity('');const invalidRange=from.input.value&&to.input.value&&from.input.value>to.input.value;const data=collect(read());download.disabled=!data.pairs.length||Boolean(invalidRange);counts.textContent=`${data.pairs.length} company–college link${data.pairs.length===1?'':'s'} · ${data.histories.length} placement record${data.histories.length===1?'':'s'} · ${data.tickets.length} ticket${data.tickets.length===1?'':'s'}${initial.query?' · Search: '+initial.query:''}`;
      preview.replaceChildren();for(const [title,copy] of [['Partnerships','Active or inactive, students, active interns and verified hours'],['Placements','Student, host company, dates, outcomes and academic supervisor'],['Weekly reports','Weekly focus, hours, objective progress and company feedback'],['Tickets','Status, requester, last update and latest message']])preview.append(A(E('div'),E('i',null,'bi bi-file-earmark-spreadsheet'),A(E('div'),E('strong',title),E('p',copy))));
      if(!data.pairs.length)counts.textContent='No partnership or placement records match. Broaden the filters to export.';
      if(invalidRange){counts.textContent='End date must be on or after the start date.';to.input.setCustomValidity(counts.textContent);}
    }
    for(const f of [college,company,from,to])f.input.addEventListener('change',render);
    render();return dialog('Export partnership review',body);
  }
  // Historical t.review/reviewHistory data remains available to workbook exports.
  window.BridgewayPartnerships={collect,sheets,placementHours,open:exportDialog};
  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.dataset.portalRole!=='platform_admin')return;
    const host=document.querySelector('#platform-partnerships .platform-panel');if(!host)return;
    const bar=A(E('section',null,'partnership-export-bar'),A(E('div'),E('h3','Partnership records'),E('p','Download a clear overview of students, placements, weekly reports and linked tickets.')),
      B('Export partnership workbook',()=>exportDialog({query:document.querySelector('[data-platform-search="platform-partnerships"]')?.value||''}),true));
    bar.querySelector('button').prepend(icon('bi-file-earmark-excel'));host.querySelector('.company-section-heading').after(bar);
  });
})();
