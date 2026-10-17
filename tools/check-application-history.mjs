import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../shared/js/student-studio.js',import.meta.url),'utf8').replaceAll('\r\n','\n');
const fn=source.match(/function renderApplications\(\)\{[\s\S]*?\n      applicationCards\(\);\n    \}/)?.[0];
assert(fn);
const E=(tag,text='')=>({tag,textContent:text,dataset:{},children:[],append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;}});
const table=E('tbody'),A=(n,...items)=>(n.append(...items),n);
const state={listings:[{id:'role',title:'Software intern',location:'Amman'}],histories:[{student:'one',role:'Unrelated training placement',start:'2026-08-01'}],applications:[
  {id:'first',student:'one',listing:'role',company:'host',status:'Withdrawn',at:'2026-09-10T10:00:00Z'},
  {id:'second',student:'one',listing:'role',company:'host',status:'Placed',at:'2026-10-01T22:00:00Z'},
  {id:'missing-listing',student:'one',listing:'removed',company:'host',status:'Rejected'},
  {id:'someone-else',student:'two',listing:'role',company:'host',status:'Pending',at:'2026-10-15T10:00:00Z'}
]};
const original=JSON.stringify(state);
const context={E,A,B:text=>E('button',text),status:text=>E('span',text),C:{state,org:id=>id},s:{id:'one'},document:{getElementById:()=>table},applicationCards(){},Intl,Date};
vm.runInNewContext(`(${fn})()`,context);
assert.deepEqual(table.children.map(r=>r.dataset.cycleApplication),['second','first','missing-listing']);
assert.equal(table.children[0].dataset.recordContext,'Applied 2 Oct 2026','Application day uses Amman time');
assert.equal(table.children[0].children[4].children[0].textContent,'Accepted','Placement state is shown as the company acceptance decision');
assert.equal(table.children[1].children[4].children[0].textContent,'Withdrawn','Withdrawn attempts remain in history');
assert.equal(table.children[2].dataset.recordContext,'Application date not recorded','Do not substitute training dates');
assert.equal(JSON.stringify(state),original,'Rendering never changes application or placement records');
state.applications=[];vm.runInNewContext(`(${fn})()`,context);assert.equal(table.children.length,0,'Placement alone must not fabricate an application attempt');
assert(!source.includes('Open my training'));
assert(!source.includes('Training started'));
console.log('PASS: Actual application attempts, Amman dates, withdrawn history, missing listings/dates, no training fallback, and unchanged records.');
