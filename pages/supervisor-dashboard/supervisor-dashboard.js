// Compact header example, scoped to this portal.
document.addEventListener('DOMContentLoaded',()=>{
  const breadcrumb=document.querySelector('.company-breadcrumb');
  const identity=document.createElement('div');identity.className='supervisor-workspace-identity';
  const college=document.createElement('strong');college.textContent='Al-Balqa Applied University';
  const department=document.createElement('span');department.textContent='Software Engineering · Supervisor workspace';
  identity.append(college,department);breadcrumb.replaceWith(identity);
  const tools=document.getElementById('supervisorHeadingTools');
  const sync=()=>{
    const toggle=tools.querySelector('.bw-arrange-toggle');if(!toggle)return;
    const editing=toggle.getAttribute('aria-pressed')==='true';
    toggle.setAttribute('aria-label',editing?'Finish arranging cards':'Arrange cards');
    toggle.title=editing?'Finish arranging cards':'Arrange cards';
  };
  new MutationObserver(sync).observe(tools,{childList:true,subtree:true});sync();
});
/* Fixed examples for this supervisor; no backend, persistence, or editing. */
document.addEventListener('DOMContentLoaded',()=>{
 const records=[
  {id:'sarah',name:'Sarah Ahmad',studentId:window.BridgewayPartners.students.find(s=>s.id==='sarah').studentId,company:'Nexus Cloud Systems',role:'Full-Stack .NET Developer Intern',mentor:'Eng. Omar F.',date:'October 8, 2026',scores:[5,5,4,5,4,4,5,5],comments:'Sarah completed the training requirements and consistently delivered reliable work. She showed strong ownership and learned new tools quickly. Continue developing estimation skills and communicating blockers earlier.'},
  {id:'ghaith',name:'Ghaith Amourah',studentId:'20220148',company:'Tech Corp Inc.',role:'Software Engineering Intern',scores:null}
 ];
 const criteria=['Performance Level','Sense of Responsibility','Accuracy in Execution','Attendance & Punctuality','Teamwork & Collaboration','Adaptability & Flexibility','Speed of Learning','Curriculum Completion'];
 const ratings=['','Weak','Acceptable','Good','Very Good','Excellent'];
 const $=id=>document.getElementById(id);
 const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 let selected='';
 function renderList(){
  const query=$('supervisorEvaluationSearch').value.trim().toLowerCase();
  const matches=records.filter(record=>`${record.name} ${record.studentId} ${record.company}`.toLowerCase().includes(query));
  if (!matches.some(record=>record.id===selected)) selected='';
  const list=$('supervisorEvaluationStudents');list.replaceChildren();
  matches.forEach(record=>{const button=make('button',null,'evaluation-student-button');button.type='button';button.setAttribute('aria-pressed',String(record.id===selected));button.setAttribute('aria-controls','supervisorEvaluationSubmitted supervisorEvaluationPending');button.append(make('strong',record.name),make('span',`${record.studentId} / ${record.company}`),make('small',record.scores?'Submitted':'Not submitted'));button.addEventListener('click',()=>{selected=record.id;list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderDetail();});list.append(button);});
  $('supervisorEvaluationCount').textContent=`${matches.length} of ${records.length} assigned students`;
  $('supervisorEvaluationEmpty').hidden=matches.length>0;
  renderDetail();
 }
 function renderDetail(){
  const record=records.find(item=>item.id===selected);
  document.querySelector('.evaluation-detail').hidden=!record;
  $('supervisorEvaluationPrompt').hidden=Boolean(record);
  if(!record)return;
  $('supervisorEvaluationName').textContent=record.name;
  $('supervisorEvaluationIdentity').textContent=`${record.studentId} / ${record.company} / ${record.role}`;
  $('supervisorEvaluationStatus').textContent=record.scores?'Submitted':'Not submitted';
  $('supervisorEvaluationStatus').className=`bw-badge ${record.scores?'bw-badge-success':'bw-badge-amber'}`;
  $('supervisorEvaluationPending').hidden=Boolean(record.scores);
  $('supervisorEvaluationSubmitted').hidden=!record.scores;
  $('supervisorEvaluationScores').replaceChildren();
  for(const id of ['Company','Mentor','Date','Score','Comments'])$(`supervisorEvaluation${id}`).textContent='';
  if(!record.scores)return;
  window.BridgewayRadar.mount($('supervisorEvaluationRadar')).update(record.scores,{submitted:true});
  $('supervisorEvaluationCompany').textContent=record.company;$('supervisorEvaluationMentor').textContent=record.mentor;$('supervisorEvaluationDate').textContent=record.date;
  const score=record.scores.reduce((sum,n)=>sum+n,0);$('supervisorEvaluationScore').textContent=`${score} / 40 (${score/40*100}%)`;
  record.scores.forEach((score,index)=>{const row=make('tr');const label=make('th',criteria[index]);label.scope='row';row.append(label,make('td',`${score} / 5`),make('td',ratings[score]));$('supervisorEvaluationScores').append(row);});
  $('supervisorEvaluationComments').textContent=record.comments;
 }
 $('supervisorEvaluationSearch').addEventListener('input',renderList);
 $('clearSupervisorEvaluation').addEventListener('click',()=>{selected='';renderList();$('supervisorEvaluationSearch').focus();});
 renderList();renderDetail();
});

// Weekly reports use the same selection-first workspace as company evaluations.
document.addEventListener('DOMContentLoaded', () => {
  const model = window.BridgewayPartners;
  const students = model.students.filter(student => student.supervisor === 'Dr. Ahmad S.' && student.stage === 'Placed');
  const search = document.getElementById('supervisorReportSearch');
  const list = document.getElementById('supervisorReportStudents');
  const detail = document.getElementById('supervisorReportDetail');
  const prompt = document.getElementById('supervisorReportPrompt');
  const tracker=document.querySelector('.report-week-tracker');
  const reviewStates=new Map();
  detail.insertBefore(tracker,detail.querySelector('.report-student-summary'));
  function renderTimeline(student) {
    const timeline=document.getElementById('curriculumTimelineGrid');
    timeline.setAttribute('role','list');timeline.setAttribute('aria-label','Weekly training status');
    timeline.replaceChildren();
    for(let week=1;week<=8;week++) {
      const verified=week<student.weeks || student.weeks===8 || (week===student.weeks && reviewStates.get(student.id)==='verified');
      const review=week===student.weeks && !verified;
      const revision=review && reviewStates.get(student.id)==='revision';
      const item=document.createElement('div');item.className=`report-week ${verified?'is-verified':review?'is-review':'is-upcoming'}`;
      item.setAttribute('role','listitem');
      item.setAttribute('aria-label',`Week ${week}: ${verified?'Verified, 40 hours':revision?'Revision requested, 40 hours':review?'In review, 40 hours':'Upcoming'}`);
      const title=document.createElement('strong');title.textContent=week;title.setAttribute('aria-hidden','true');
      const state=document.createElement('span');state.textContent=verified?'Verified':revision?'Revision':review?'In review':'Upcoming';state.setAttribute('aria-hidden','true');
      const hours=document.createElement('small');hours.textContent=verified||review?'40 h':'—';hours.setAttribute('aria-hidden','true');
      item.append(title,state,hours);timeline.append(item);
    }
  }
  let selected = '';
  function render() {
    const query = search.value.trim().toLowerCase();
    const matches = students.filter(student => {
      const company = model.organizations.find(company => company.id === student.company).name;
      return `${student.name} ${student.studentId} ${company}`.toLowerCase().includes(query);
    });
    if (!matches.some(student => student.id === selected)) selected = '';
    list.replaceChildren();
    matches.forEach(student => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'evaluation-student-button';
      button.setAttribute('aria-pressed', String(student.id === selected));
      button.setAttribute('aria-controls', detail.id);
      const company = model.organizations.find(company => company.id === student.company).name;
      const status=reviewStates.get(student.id);
      [['strong',student.name],['span',`${student.studentId} / ${company}`],['small',student.weeks === 8 ? 'All weeks verified' : `Week ${student.weeks} · ${status==='verified'?'Verified':status==='revision'?'Revision requested':'Pending review'}`]].forEach(([tag,text]) => {
        const node = document.createElement(tag);node.textContent = text;button.append(node);
      });
      button.addEventListener('click', () => window.reviewStudentReport(student.name));
      list.append(button);
    });
    document.getElementById('supervisorReportCount').textContent = `${matches.length} of ${students.length} assigned students`;
    document.getElementById('supervisorReportEmpty').hidden = matches.length > 0;
    detail.hidden = !selected;
    prompt.hidden = Boolean(selected);
  }
  const review = window.reviewStudentReport;
  window.reviewStudentReport = (...args) => {
    const student = students.find(student => student.name === args[0]);
    if (!student) return;
    selected = student.id;
    search.value = '';
    review(...args);
    renderTimeline(student);
    render();
  };
  search.addEventListener('input', render);
  document.addEventListener('bridgeway:report-reviewed',event=>{
    const student=students.find(student=>student.name===event.detail.name);
    if(!student)return;
    reviewStates.set(student.id,event.detail.status);renderTimeline(student);render();
    const row=[...document.querySelectorAll('#supervisedStudentsTable tbody tr')].find(row=>row.cells[0].textContent.includes(student.name));
    const badge=row?.cells[4]?.querySelector('.bw-badge');
    if(badge){badge.textContent=event.detail.status==='verified'?'Verified':'Revision';badge.className=`bw-badge ${event.detail.status==='verified'?'bw-badge-success':'bw-badge-amber'}`;}
  });
  document.getElementById('clearSupervisorReport').addEventListener('click', () => {selected='';render();search.focus();});
  render();
});

// Explicit handlers keep HTML presentation-only and preserve native event semantics.
(function () {
  document.querySelectorAll('[data-onclick="switchTab-tab-roster-1"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-roster'); };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-reports-2"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-reports'); };
  });
  document.querySelectorAll('[data-onclick="reviewStudentReport-GA-3"]').forEach(element => {
    element.onclick = function(event) { reviewStudentReport('Ghaith Amourah', 'Tech Corp Inc. • Company Mentor: Eng. Khalid T.', '240h / 320h', 'Week 6', 'GA') };
  });
  document.querySelectorAll('[data-onclick="switchTab-tab-endorsement-4"]').forEach(element => {
    element.onclick = function(event) { window.switchTab('tab-endorsement') };
  });
  document.querySelectorAll('[data-onclick="reviewStudentReport-SA-5"]').forEach(element => {
    element.onclick = function(event) { reviewStudentReport('Sarah Ahmad', 'Nexus Cloud Systems • Company Mentor: Eng. Omar F.', '320h / 320h', 'Week 8', 'SA') };
  });
})();
