import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the shared routing against real portal records without a browser or writes.
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const accounts=[{id:'other',type:'supervisor',name:'Dr. Other',college:'college-2'}];
const sandbox={window:{},document:{addEventListener(){},createElement(){return {setAttribute(){},append(){},addEventListener(){},classList:{add(){}}};},getElementById(){return null;}},sessionStorage:{getItem(key){return key==='bridgeway:managed-accounts:v1'?JSON.stringify(accounts):null;}},location:{pathname:'/pages/platform-admin/platform-admin.html'},console};
vm.createContext(sandbox);
const portal=read('shared/js/portal.js');
vm.runInContext(portal.slice(portal.indexOf('window.BridgewayPartners ='),portal.indexOf('// URL context')),sandbox);
vm.runInContext(read('shared/js/report-visibility.js'),sandbox);
vm.runInContext(read('shared/js/workspace-cycle.js'),sandbox);
const C=sandbox.window.BridgewayCycle;
C.commit=()=>{};
const student={owner:'student:ghaith'},supervisor={owner:'supervisor:ahmad'},company={owner:'company:company-1'},college={owner:'admin:college-1'};
assert.equal(C.ticketRecipient(student),'supervisor:college-1:Dr. Ahmad S.');
for(const [ticket,requester,recipient,outsiders] of [
  [student,'student:ghaith','supervisor:ahmad',['platform','admin:college-1','student:sarah','company:company-1','supervisor:other']],
  [supervisor,'supervisor:ahmad','admin:college-1',['platform','admin:college-2','student:ghaith','supervisor:other']],
  [company,'company:company-1','platform',['admin:college-1','company:company-2','supervisor:ahmad']],
  [college,'admin:college-1','platform',['admin:college-2','supervisor:ahmad','student:ghaith']]
]){
  assert(C.ticketVisible(ticket,requester));
  assert(C.ticketVisible(ticket,recipient));
  assert(C.ticketCanManage(ticket,recipient));
  assert(!C.ticketCanManage(ticket,requester));
  for(const viewer of outsiders){assert(!C.ticketVisible(ticket,viewer),`${viewer} must not see ${requester}'s ticket`);assert(!C.ticketCanManage(ticket,viewer));}
}
assert.equal(C.ticketRecipient({owner:'supervisor:other'}),'admin:college-2');
assert(!C.ticketVisible({owner:'supervisor:other'},'admin:college-1'));
const waiting={owner:'student:lina'};
assert.equal(C.ticketRecipient(waiting),'');
assert(C.ticketVisible(waiting,'student:lina'));
assert(!C.ticketVisible(waiting,'platform'));
assert(!C.ticketVisible(waiting,'supervisor:ahmad'));
assert.equal(C.ticketDestinationLabel(waiting),'Awaiting supervisor assignment');
sandbox.window.BridgewayAcademicAssignments.set('Lina Haddad','college-1','Dr. Ahmad S.');
assert(C.ticketVisible(waiting,'supervisor:ahmad'),'Assignment routes existing waiting tickets');
sandbox.window.BridgewayAcademicAssignments.set('Ghaith Amourah','college-1','Dr. Replacement');
assert(!C.ticketVisible(student,'supervisor:ahmad'),'Previous supervisor loses inbox access');
assert(C.ticketVisible(student,'supervisor:college-1:Dr. Replacement'));
assert(!C.ticketVisible(student,'supervisor:college-2:Dr. Replacement'),'Same name at another college is out of scope');
assert(!C.ticketVisible({owner:'student:unknown'},'platform'));
const source=read('shared/js/workspace-cycle.js');
assert(source.includes('const managing=ticketCanManage(t)'));
assert(source.includes("if(managing&&t.status!=='Resolved')"),'Only receiving handlers get the resolve action');
assert(!source.includes("select('Ticket status'"),'Status dropdown must stay removed');
assert(read('shared/js/partnership-review.js').includes('state.tickets.filter(t=>C.ticketVisible(t)&&'),'Platform exports follow ticket routing');
console.log('PASS: Ticket destinations, requester/recipient visibility, status management, college scope, waiting assignments, reassignment, and platform export filtering.');
