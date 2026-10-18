/* Guided listing creation and editing. Records belong to this browser session. */
document.addEventListener('DOMContentLoaded',()=>{
  const root=document.getElementById('internshipEditor'),form=document.getElementById('standalonePostForm'),C=window.BridgewayCycle;
  if(!root||!form||!C)return;
  const $=id=>document.getElementById(id),panels=[...root.querySelectorAll('.ie-panel')],steps=[...root.querySelectorAll('[data-step]')];
  const title=$('formRoleTitle'),category=$('formRoleCategory'),custom=$('formCustomCategory'),city=$('formRoleCity'),description=$('formRoleDesc'),capacity=$('formCapacity'),deadline=$('formDeadline'),skillInput=$('postingSkillInput'),error=$('postingError');
  const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;return node;};
  const icon=name=>{const node=make('i',null,'bi '+name);node.setAttribute('aria-hidden','true');return node;};
  let step=0,technologies=[],prerequisites=[],submitted=false;
  const alias={frontend:'listing-tech',software:'listing-software'},requested=new URLSearchParams(location.search).get('listing');
  const editing=requested?C.state.listings.find(l=>l.id===(alias[requested]||requested)&&l.company==='company-1'&&l.status!=='Deleted'):null;
  const todayParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=type=>todayParts.find(p=>p.type===type).value;deadline.min=`${part('year')}-${part('month')}-${part('day')}`;
  const skillRecord=make('input');skillRecord.type='hidden';skillRecord.name='technologies';form.append(skillRecord);
  const mode=()=>form.querySelector('[name=workplaceMode]:checked').value;
  const categoryLabel=()=>category.value==='other'?custom.value.trim():category.selectedOptions[0].textContent;
  const announce=text=>{$('postingAnnouncement').textContent=text;};
  function syncSkillRecord(){skillRecord.value=JSON.stringify(technologies);skillRecord.dispatchEvent(new Event('input',{bubbles:true}));}
  function renderSkills(){
    const tags=$('postingSkillTags');tags.replaceChildren();
    technologies.forEach((text,index)=>{const tag=make('span',text,'ie-tag'),remove=make('button',null,'ie-remove');remove.type='button';remove.setAttribute('aria-label',`Remove ${text}`);remove.append(icon('bi-x-lg'));remove.addEventListener('click',()=>{technologies.splice(index,1);renderSkills();syncSkillRecord();announce(`${text} removed.`);skillInput.focus();});tag.append(remove);tags.append(tag);});
    const suggestions=$('postingSkillSuggestions');suggestions.replaceChildren();
    const common={software:['Git','SQL','JavaScript','Docker'],cloud:['Docker','Linux','AWS','CI/CD'],cybersecurity:['Linux','Networking','Python'],data:['Python','SQL','Data analysis'],mobile:['Flutter','Kotlin','Swift','Git']}[category.value]||[];
    const available=common.filter(text=>!technologies.some(t=>t.toLowerCase()===text.toLowerCase()));
    if(available.length)suggestions.append(make('span','Quick add'));
    available.forEach(text=>{const button=make('button',`+ ${text}`);button.type='button';button.addEventListener('click',()=>addSkills(text));suggestions.append(button);});
  }
  function addSkills(value=skillInput.value){
    const entries=value.split(/[,\n]+/).map(v=>v.trim()).filter(Boolean),added=[];
    for(const text of entries){if(!technologies.some(t=>t.toLowerCase()===text.toLowerCase())){technologies.push(text);added.push(text);}}
    if(!entries.length)return;
    if(!added.length){announce('That skill is already listed.');skillInput.value='';return;}
    skillInput.value='';skillInput.setCustomValidity('');error.textContent='';renderSkills();syncSkillRecord();announce(`${added.join(', ')} added.`);skillInput.focus();
  }
  function renderPrerequisites(){
    const list=$('postingPrerequisites');list.replaceChildren();
    prerequisites.forEach((text,index)=>{
      const row=make('div',null,'ie-req-row'),number=make('span',`${index+1}.`),input=make('input'),remove=make('button',null,'ie-remove');number.setAttribute('aria-hidden','true');input.value=text;input.name='prerequisite';input.maxLength=300;input.setAttribute('aria-label',`Prerequisite ${index+1}`);input.placeholder='e.g. Basic understanding of object-oriented programming';
      input.addEventListener('input',()=>{prerequisites[index]=input.value;});remove.type='button';remove.setAttribute('aria-label',`Remove prerequisite ${index+1}`);remove.append(icon('bi-x-lg'));remove.addEventListener('click',()=>{prerequisites.splice(index,1);renderPrerequisites();form.dispatchEvent(new Event('input',{bubbles:true}));announce('Prerequisite removed.');$('postingAddPrerequisite').focus();});row.append(number,input,remove);list.append(row);
    });
  }
  function updateCategory(){const other=category.value==='other';$('customCategoryField').hidden=!other;custom.disabled=!other;custom.required=other;renderSkills();}
  function updateCityHint(){$('postingCityHint').textContent=mode()==='Remote'?'Select the company’s base city. The internship remains remote.':'Select the city where the internship is based.';}
  function showStep(next,focus=true){
    step=next;panels.forEach((panel,index)=>{panel.hidden=index!==step;});
    steps.forEach((button,index)=>{if(index===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');button.querySelector('.ie-step-number').textContent=index<step?'✓':String(index+1);});
    $('postingBack').hidden=step===0;$('postingNext').hidden=step===2;$('postingSubmit').hidden=step!==2;
    $('postingNext').replaceChildren(make('span',step===0?'Continue':'Review internship'),icon('bi-arrow-right'));$('postingStepLabel').textContent=`Step ${step+1} of 3`;error.textContent='';
    if(step===2)renderReview();
    if(focus){panels[step].querySelector('h2').focus({preventScroll:true});root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
  }
  function validatePanel(index){
    if(index===1&&skillInput.value.trim())addSkills();
    for(const field of panels[index].querySelectorAll('input,textarea,select')){
      if(field.disabled)continue;field.setCustomValidity('');
      if(field.required&&!field.value.trim())field.setCustomValidity('Enter a value for this field.');
      if(!field.checkValidity()){showStep(index);field.reportValidity();field.focus();return false;}
    }
    if(index===1&&!technologies.length){showStep(1);skillInput.setCustomValidity('Add at least one technology or skill.');skillInput.reportValidity();skillInput.focus();return false;}
    return true;
  }
  function navigate(next){if(submitted)return;if(next>step){for(let i=0;i<next;i++)if(!validatePanel(i))return;}showStep(next);}
  function renderReview(){
    const area=$('postingReviewContent');area.replaceChildren();
    const company=C.org(editing?.company||'company-1');area.append(make('div',title.value.trim(),'ie-review-title'));
    const meta=make('div',null,'ie-review-meta');[[company,'bi-building'],[`${city.value}, Jordan`,'bi-geo-alt'],[mode(),'bi-briefcase']].forEach(([text,name])=>{const item=make('span');item.append(icon(name),document.createTextNode(text));meta.append(item);});area.append(meta);
    const facts=make('dl',null,'ie-summary');
    const deadlineText=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Amman'}).format(new Date(deadline.value+'T00:00:00Z'));
    [['Category',categoryLabel()],['Open places',capacity.value],['Application deadline',deadlineText]].forEach(([label,text])=>{const item=make('div');item.append(make('dt',label),make('dd',text));facts.append(item);});area.append(facts,make('h3','Work and responsibilities'),make('p',description.value.trim()),make('h3','Technologies & skills'));
    const tags=make('div',null,'ie-tags');technologies.forEach(text=>tags.append(make('span',text,'ie-tag')));area.append(tags);
    const reqs=prerequisites.map(text=>text.trim()).filter(Boolean);if(reqs.length){const list=make('ul');reqs.forEach(text=>list.append(make('li',text)));area.append(make('h3','Prerequisites'),list);}
    const editSkills=make('button','Edit skills & availability','ie-btn quiet ie-skills-edit');editSkills.type='button';editSkills.addEventListener('click',()=>showStep(1));area.append(editSkills);
    const note=make('div',null,'ie-notice'),copy=make('div');copy.append(make('strong','Submission starts a review, not publication.'),make('p',editing?.status==='Published'?'Submitting these changes returns this listing to Platform Admin review. Existing applications and training remain intact.':'Platform Admin must approve the listing before students at active colleges can discover it. Your company reviews applications after students apply.'));note.append(icon('bi-shield-check'),copy);area.append(note);
  }
  if(requested&&!editing){error.textContent='This listing is unavailable for editing. Return to the publication desk to choose a listing.';form.querySelectorAll('input,select,textarea,button').forEach(n=>{n.disabled=true;});steps.forEach(n=>{n.disabled=true;});return;}
  if(editing){
    root.querySelector('h1').textContent='Edit internship';document.title='Bridgeway — Edit internship';
    title.value=editing.title;description.value=editing.description;capacity.value=editing.capacity;deadline.value=editing.deadline;
    const known=[...category.options].some(o=>o.value===editing.category&&o.value!=='other');category.value=known?editing.category:'other';custom.value=known?'':editing.categoryLabel||editing.category||'';
    const oldLocation=editing.location||'',cityName=editing.city||[...city.options].find(o=>o.value&&oldLocation.toLowerCase().includes(o.value.toLowerCase()))?.value;
    if(cityName)city.value=cityName;
    const oldMode=editing.workplaceMode||(/remote/i.test(oldLocation)?'Remote':/hybrid/i.test(oldLocation)?'Hybrid':'On-site');form.querySelector(`[name=workplaceMode][value="${oldMode}"]`)?.click();
    const oldSkills=(editing.skills||'').split(',').map(text=>text.trim()).filter(Boolean),isRequirement=text=>/\b(gpa|minimum|experience|familiarity|understanding)\b/i.test(text);
    technologies=Array.isArray(editing.technologies)?[...editing.technologies]:oldSkills.filter(text=>!isRequirement(text));prerequisites=Array.isArray(editing.prerequisites)?[...editing.prerequisites]:oldSkills.filter(isRequirement);
  }
  updateCategory();updateCityHint();renderPrerequisites();skillRecord.value=JSON.stringify(technologies);showStep(0,false);
  category.addEventListener('change',()=>{updateCategory();if(!custom.disabled)custom.focus();});
  form.querySelectorAll('[name=workplaceMode]').forEach(input=>input.addEventListener('change',updateCityHint));
  $('postingAddSkill').addEventListener('click',()=>addSkills());
  $('postingAddPrerequisite').addEventListener('click',()=>{prerequisites.push('');renderPrerequisites();$('postingPrerequisites').lastElementChild.querySelector('input').focus();});
  form.addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('');error.textContent='';});
  form.addEventListener('keydown',event=>{if(event.key!=='Enter'||event.target.tagName!=='INPUT')return;event.preventDefault();if(event.target===skillInput)addSkills();});
  steps.forEach(button=>button.addEventListener('click',()=>navigate(Number(button.dataset.step))));
  $('postingNext').addEventListener('click',()=>navigate(step+1));$('postingBack').addEventListener('click',()=>showStep(step-1));root.querySelector('[data-edit-role]').addEventListener('click',()=>showStep(0));
  // Validate hidden steps before the shared submit confirmation handles this form.
  form.addEventListener('submit',event=>{
    if(submitted){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!validatePanel(0)||!validatePanel(1)||step!==2){event.preventDefault();event.stopImmediatePropagation();if(step!==2&&!error.textContent)announce('Review the internship before submitting.');}
  },true);
  form.addEventListener('submit',event=>{
    event.preventDefault();if(submitted)return;
    const data={title:title.value.trim(),company:'company-1',category:category.value,categoryLabel:categoryLabel(),city:city.value,workplaceMode:mode(),location:`${city.value} · ${mode()}`,technologies:[...technologies],skills:technologies.join(', '),prerequisites:prerequisites.map(text=>text.trim()).filter(Boolean),description:description.value.trim(),capacity:Number(capacity.value),deadline:deadline.value,status:'Pending review',review:'',updated:new Date().toISOString()};
    if(editing){editing.revisions||=[];editing.revisions.push({at:data.updated,status:editing.status,review:editing.review||''});Object.assign(editing,data);}else C.state.listings.unshift({id:crypto.randomUUID(),...data,created:data.updated});
    submitted=true;form.dataset.committed='true';C.commit(editing?'Internship changes submitted for platform review':'Internship submitted for platform review');window.BridgewayUX?.remember(form);
    form.querySelectorAll('input,select,textarea,button').forEach(n=>{n.disabled=true;});steps.forEach(n=>{n.disabled=true;});$('postingSubmit').textContent='Submitted for review';
    const content=C.section('Pending Platform Admin review','The pending listing is retained in this browser session. It becomes discoverable across active colleges only after Platform Admin approves it.');
    const link=make('a','Open publication desk','cycle-button is-primary');link.href='../company-dashboard/company-dashboard.html#tab-posts';content.append(link);C.dialog('Listing submitted',content);
  });
});
