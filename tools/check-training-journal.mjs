import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../shared/js/student-training-journal.js',import.meta.url),'utf8'),window={};
vm.runInNewContext(source,{window});
const view=window.BridgewayTrainingJournal.view;
const week={title:'API development',hours:40,revision:2,status:'submitted',objectives:[{text:'Build an endpoint',done:true,evidence:'PRIVATE_EVIDENCE'}],actualHours:38,notes:'PRIVATE_COMPANY_NOTES',review:'PRIVATE_REVIEW',ratings:[4],locked:false};
const visible=view(week);assert.equal(visible.objectives[0].done,true);assert.equal(visible.actualHours,38);assert(!('rating' in visible.objectives[0]),'Legacy supervisor scores must not be shown as valid student assessments');
assert.equal(visible.notes,week.notes,'Student feedback must use the exact company report notes');
assert.equal(visible.review,week.review,'Supervisor notes remain distinct from company feedback');
assert(!source.includes('View applications & interviews'),'No unrelated interview action in company feedback');
assert(!('evidence' in visible.objectives[0]),'Student journal must not expose evidence');
assert(!source.includes('journal-evidence'),'Evidence disclosure must be removed, not relabeled');
assert(source.includes('journal-objective-status'),'Use the existing objective completion state instead');
const hidden=view({...week,locked:true});assert.equal(hidden.title,week.title);assert.equal(hidden.hours,40);assert.equal(hidden.objectives[0].text,'Build an endpoint');assert.equal(hidden.actualHours,null);assert.equal(hidden.objectives[0].done,null);assert(!('rating' in hidden.objectives[0]));assert(!JSON.stringify(hidden).includes('PRIVATE_'));
assert(!JSON.stringify(view(week,true)).includes('PRIVATE_'),'Global restriction hides every report regardless of its old lock flag');
assert.equal(view({...week,locked:true},false).notes,week.notes,'Global visible policy supersedes legacy individual locks');
const planned=view({...week,status:'draft'});assert.equal(planned.status,'Planned');assert.equal(planned.actualHours,null);assert.equal(planned.objectives[0].done,null);
assert.equal(view({...week,status:'revision'}).status,'Changes requested');assert.equal(view({...week,status:'verified'}).status,'Verified');
assert(!source.includes('C.training('),'Journal must render its own focused student interface');assert(!/fetch\(|sessionStorage\.setItem|\.status\s*=(?!=)/.test(source),'Journal must not mutate reports or transmit data');
assert(source.includes("animation?.cancel()"));assert(source.includes("prefers-reduced-motion"));assert(source.includes("trainingWeek"));
console.log('PASS: Student journal visibility locks, planned/review/verified states, readonly model, deep linking, and interruptible reduced-motion-aware transitions.');

for(const status of ['verified','submitted','revision','draft']){
  const result=view({...week,status},true);
  assert.equal(result.status,'Report hidden');assert.equal(result.state,'hidden');
  assert.equal(view({...week,status},false).state,status,'Visible reports keep their actual state');
}
// Render hidden reports to catch leaks outside the view model: badge, nav, ARIA and CSS state.
const node=(tag,text='',className='')=>({tag,textContent:text||'',className,dataset:{},attributes:{},children:[],append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},setAttribute(k,v){this.attributes[k]=v;},addEventListener(){}});
const walk=n=>[n,...n.children.flatMap(walk)];
const sandbox={window:{},document:{addEventListener(){}},matchMedia:()=>({matches:true}),URLSearchParams,location:{search:''}};
vm.runInNewContext(source,sandbox);
for(const status of ['verified','submitted','revision','draft']){
  const root=node('div'),C={E:node,A:(n,...items)=>{n.append(...items);return n;},B:text=>node('button',text),org:()=> 'Company',hours:()=>200,reportRestricted:()=>true,state:{plans:{one:[{...week,status}]}}};
  sandbox.window.BridgewayTrainingJournal.mount(root,C,{id:'one',weeks:1});
  const all=walk(root),station=all.find(n=>n.className==='journal-station');
  assert(station.attributes['aria-label'].includes('Report hidden'));
  assert.equal(station.dataset.state,'hidden');
  assert.equal(all.find(n=>n.className==='journal-state').textContent,'Report hidden');
  assert.equal(all.find(n=>n.className==='journal-week').dataset.state,'hidden');
  assert.equal(all.find(n=>n.className==='journal-review').dataset.state,'hidden');
  assert(!walk(station).some(n=>['Verified','In review','Changes requested','Planned'].includes(n.textContent)));
  assert(all.some(n=>n.tag==='strong'&&n.textContent==='200'),'Verified-hour total stays visible');
}
console.log('PASS: Restricted weekly status is hidden in the view model, week selectors, badge, accessible labels and styling; aggregate verified hours remain available.');
