import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
class Element {
  constructor(tag,doc){Object.assign(this,{tagName:tag.toUpperCase(),doc,children:[],dataset:{},events:{},attributes:{},className:'',value:'',isConnected:true});this.classList={add:(name)=>this.className+=' '+name};}
  set textContent(value){this.text=String(value);this.children=[];}
  get textContent(){return (this.text||'')+this.children.map(n=>n.textContent).join('');}
  setAttribute(k,v){this.attributes[k]=v;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.text='';this.children=nodes;}
  matches(selector){return selector.split(',').some(s=>s.trim().startsWith('.')?this.className.split(' ').includes(s.trim().slice(1)):this.tagName===s.trim().toUpperCase());}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(){return null;}
  addEventListener(type,fn){(this.events[type]||=[]).push(fn);}
  fire(type){for(const fn of this.events[type]||[])fn({preventDefault(){}});}
  focus(){this.doc.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;this.fire('close');}
  remove(){this.isConnected=false;}
  setCustomValidity(message){this.validationMessage=message;}
  reportValidity(){return false;}
  getBoundingClientRect(){return {left:0,top:0,width:400,height:300};}
  scrollIntoView(){}
}
function setup(role,saved,animate=false){
  const events={},data=new Map(saved?[['bridgeway:workspace-cycle:v1',saved]]:[]);
  const doc={createElement:tag=>new Element(tag,doc),addEventListener:(type,fn)=>(events[type]||=[]).push(fn),dispatchEvent:event=>{for(const fn of events[event.type]||[])fn(event);},getElementById(){return null;}};
  doc.body=new Element('body',doc);doc.body.dataset.portalRole=role;doc.activeElement=doc.body;
  const env={window:{},document:doc,sessionStorage:{getItem:key=>data.get(key)||null,setItem:(key,v)=>data.set(key,v)},crypto:webcrypto,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},location:{pathname:'/pages/'+role+'/index.html'},console};
  vm.createContext(env);const portal=read('shared/js/portal.js');
  vm.runInContext(portal.slice(portal.indexOf('window.BridgewayPartners ='),portal.indexOf('// URL context')),env);
  env.window.BridgewayStudent={current:()=>env.window.BridgewayPartners.students.find(s=>s.id==='ghaith')};
  vm.runInContext(read('shared/js/report-visibility.js'),env);vm.runInContext(read('shared/js/workspace-cycle.js'),env);
  const ticketNav=new Element('button',doc);doc.querySelector=selector=>selector.startsWith('[data-tab=')?ticketNav:null;
  const downloads=[];env.window.BridgewayWorkbook={download:(sheets,filename)=>downloads.push({sheets,filename})};
  let finishAnimation,tearCalls=0;
  if(animate)env.window.BridgewayKinetic={ticketPaper(){
    const paper=new Element('article',doc),title=new Element('h3',doc),body=new Element('p',doc),brand=new Element('div',doc),stub=new Element('div',doc);
    brand.append(new Element('small',doc));stub.append(new Element('strong',doc));paper.append(brand,title,body,stub);return {paper,title,body,brand,stub};
  },tearTicket(){tearCalls++;return new Promise(resolve=>finishAnimation=resolve);}};
  const root=new Element('section',doc);env.window.BridgewayCycle.mountTickets(root,role==='platform_admin');
  return {root,doc,C:env.window.BridgewayCycle,data,downloads,ticketNav,get tearCalls(){return tearCalls;},finishAnimation:()=>finishAnimation()};
}
const student=setup('student');
assert.equal(student.ticketNav.querySelector('.bw-tab-badge'),null,'Ticket navigation has no numeric total');
assert.equal(student.root.querySelector('.support-masthead').querySelector('h1').textContent,'My Tickets');
assert(student.root.querySelector('.support-submit').querySelector('.mascot'),'Submit button includes the cap-with-headset mascot');
assert(student.root.querySelector('.support-submit').querySelector('.ticket-perf'),'Submit button includes the perforated stub line');
assert(!student.root.querySelector('.support-overview').hidden);
assert(student.root.querySelector('.support-views').hidden,'Student needs no view switch');
student.root.querySelector('.support-submit').fire('click');
const dialog=student.doc.body.children.at(-1),form=dialog.querySelector('form');
assert.equal(dialog.open,true);assert.equal(form.querySelector('.support-destination'),null,'Composer does not name the routed recipient');
const inputs=form.querySelectorAll('input');inputs[0].value='   ';form.querySelector('textarea').value='Details';form.fire('submit');
assert.equal(student.C.state.tickets.length,2,'Whitespace-only subjects do not create tickets');
inputs[0].value='<script>Ticket text</script>';inputs[1].value='Week 6';form.querySelector('textarea').value='Please clarify my report.';form.fire('submit');
assert.equal(dialog.open,false);assert.equal(student.C.state.tickets.length,3);
assert.equal(student.ticketNav.querySelector('.bw-tab-badge'),null,'Ticket navigation has no numeric total');
const created=student.C.state.tickets[0];assert.equal(created.owner,'student:ghaith');assert.equal(created.status,'In progress');
assert(student.root.querySelector('.support-overview').hidden);assert(!student.root.querySelector('.support-conversation').hidden);
assert(student.root.querySelector('.support-conversation').textContent.includes('<script>Ticket text</script>'),'Subject remains plain text');
assert.equal(student.root.querySelector('.support-thread-recipient'),null,'Conversation does not display routing metadata');
assert(student.root.querySelector('.support-ticket-details'),'Ticket metadata has its own sidebar');
assert(student.root.querySelector('.support-ticket-details').textContent.includes('Last activity'));
assert.equal(student.root.querySelector('.support-message').dataset.side,'mine','Viewer’s messages stay on the right');
assert.equal(student.root.querySelector('.support-message-avatar').textContent,'GA');
let reply=student.root.querySelector('.support-reply-form');assert.equal(reply.querySelector('select'),null,'Requester has no status control');
reply.querySelector('textarea').value='   ';reply.fire('submit');assert.equal(created.messages.length,1,'Whitespace replies must not be saved');assert.equal(student.root.querySelector('.support-reply-error').hidden,false);
reply.querySelector('textarea').value='One more detail';reply.querySelector('textarea').fire('input');assert.equal(student.root.querySelector('.support-reply-count').textContent,'15 / 3000');reply.fire('submit');assert.equal(created.messages.length,2);assert.equal(created.messages[1].sender,'student:ghaith');
student.root.querySelector('.support-back').fire('click');assert(!student.root.querySelector('.support-overview').hidden);
assert.equal(student.root.querySelector('.support-tools'),null,'Ticket list has no search or filters');
assert.equal(student.root.querySelectorAll('.support-ticket').length,2);
assert.equal(student.root.querySelector('.support-export'),null,'No separate ticket export button');
const saved=student.data.get('bridgeway:workspace-cycle:v1');
const supervisor=setup('supervisor',saved);assert.equal(supervisor.root.querySelectorAll('.support-ticket').length,2);
assert(!supervisor.root.querySelector('.support-views').hidden);
const supervisorViews=supervisor.root.querySelector('.support-views').querySelectorAll('button');
supervisorViews[0].fire('click');assert.equal(supervisor.root.querySelectorAll('.support-ticket').length,0,'Own view excludes received student tickets');
supervisorViews[1].fire('click');assert.equal(supervisor.root.querySelectorAll('.support-ticket').length,2);
supervisor.root.querySelector('.support-ticket').fire('click');assert.equal(supervisor.root.querySelector('.support-export-ticket'),null);reply=supervisor.root.querySelector('.support-reply-form');
assert.equal(supervisor.root.querySelector('.support-message').dataset.side,'other','Student messages appear on the left in the supervisor view');
assert.equal(reply.querySelector('select'),null,'Statuses are automatic, not a dropdown');
assert(supervisor.root.querySelector('.support-resolve'),'Receiving supervisor can resolve');
assert.equal(supervisor.root.querySelector('.support-resolve').disabled,true,'Send a reply before resolving');
const modalCount=supervisor.doc.body.children.length;supervisor.root.querySelector('.support-resolve').fire('click');assert.equal(supervisor.doc.body.children.length,modalCount,'Unanswered ticket cannot open confirmation');
reply.querySelector('textarea').value='Clarification recorded.';reply.fire('submit');
assert.equal(supervisor.root.querySelector('.support-resolve').disabled,false,'Sent reply enables resolution');
const requesterAgain=setup('student',supervisor.data.get('bridgeway:workspace-cycle:v1'));
requesterAgain.root.querySelectorAll('.support-ticket').find(b=>b.dataset.ticketId===created.id).fire('click');
const followup=requesterAgain.root.querySelector('.support-reply-form');followup.querySelector('textarea').value='One more question';followup.fire('submit');
const handlerAgain=setup('supervisor',requesterAgain.data.get('bridgeway:workspace-cycle:v1'));
handlerAgain.root.querySelectorAll('.support-ticket').find(b=>b.dataset.ticketId===created.id).fire('click');
assert.equal(handlerAgain.root.querySelector('.support-resolve').disabled,true,'New requester reply requires a fresh handler response');

assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).status,'Awaiting requester','Handler reply waits for the requester');
assert(supervisor.root.querySelector('.support-conversation-heading').querySelector('.support-resolve'),'Resolution is highlighted in the ticket header');
assert.equal(supervisor.root.querySelector('.support-reply-form').querySelector('.support-resolve'),null,'Reply footer does not contain the resolution action');
const finalForm=supervisor.root.querySelector('.support-reply-form');
const beforeResolution=supervisor.C.state.tickets.find(t=>t.id===created.id).messages.length;
supervisor.root.querySelector('.support-resolve').fire('click');
let resolutionDialog=supervisor.doc.body.children.at(-1);
assert.equal(resolutionDialog.open,true);assert.equal(resolutionDialog.querySelector('textarea'),null,'Resolution requires no additional text');
resolutionDialog.querySelectorAll('button').find(b=>b.textContent==='Cancel').fire('click');
assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).status,'Awaiting requester','Cancel leaves the ticket active');
assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).messages.length,beforeResolution);
supervisor.root.querySelector('.support-resolve').fire('click');resolutionDialog=supervisor.doc.body.children.at(-1);
const confirm=resolutionDialog.querySelector('.support-confirm-resolution');assert(confirm,'Explicit confirmation is required');
confirm.fire('click');confirm.fire('click');
assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).status,'Resolved');
assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).messages.length,beforeResolution,'Resolution does not add another message');
assert.equal(supervisor.root.querySelector('.support-reply-form'),null,'Handler cannot reply to closed tickets');
assert(supervisor.root.querySelector('.support-closed'));
finalForm.querySelector('textarea').value='Stale form reply';finalForm.fire('submit');assert.equal(supervisor.C.state.tickets.find(t=>t.id===created.id).messages.length,beforeResolution,'Stale submit cannot reopen a resolved ticket');
assert.equal(supervisor.ticketNav.querySelector('.bw-tab-badge'),null,'Ticket navigation has no numeric total');
assert.equal(supervisor.root.querySelectorAll('.support-message').at(-1).dataset.side,'mine','Supervisor’s own response appears on the right');
const restored=setup('student',supervisor.data.get('bridgeway:workspace-cycle:v1'));
assert(restored.root.textContent.includes('Clarification')===false,'History does not expose message bodies');
assert(restored.root.querySelectorAll('.support-status').some(s=>s.textContent==='Resolved'));
restored.root.querySelectorAll('.support-ticket').find(b=>b.dataset.ticketId===created.id).fire('click');
assert.equal(restored.root.querySelector('.support-resolve'),null,'Requester cannot resolve tickets');
assert.equal(restored.root.querySelector('.support-reply-form'),null,'Requester cannot reply or reopen a resolved ticket');assert(restored.root.querySelector('.support-closed'));
const platform=setup('platform_admin',saved);assert.equal(platform.root.querySelector('.support-submit'),null);assert.equal(platform.root.querySelectorAll('.support-ticket').length,1,'Platform sees college requests, not student tickets');
const college=setup('admin',saved);assert.equal(college.root.querySelectorAll('.support-ticket').length,0,'College does not receive student tickets');
assert(!college.root.querySelector('.support-views').hidden);
college.root.querySelector('.support-views').querySelectorAll('button')[0].fire('click');
assert.equal(college.root.querySelectorAll('.support-ticket').length,1,'College own requests appear under My tickets');
supervisor.root.querySelector('.support-back').fire('click');supervisor.root.querySelector('.support-submit').fire('click');
const ownForm=supervisor.doc.body.children.at(-1).querySelector('form');ownForm.querySelector('input').value='Supervisor request';ownForm.querySelector('textarea').value='Help with my account';ownForm.fire('submit');
assert.equal(supervisor.root.querySelector('.support-reply-form').querySelector('select'),null,'Supervisor cannot manage their own outgoing ticket');
supervisor.root.querySelector('.support-back').fire('click');assert.equal(supervisor.root.querySelectorAll('.support-ticket').length,1,'Creation returns to My tickets');
supervisorViews[1].fire('click');assert.equal(supervisor.root.querySelectorAll('.support-ticket').length,2,'Outgoing ticket stays out of received view');
const receivingCollege=setup('admin',supervisor.data.get('bridgeway:workspace-cycle:v1'));
assert.equal(receivingCollege.root.querySelectorAll('.support-ticket').length,1,'Supervisor request arrives in college received view');
receivingCollege.root.querySelector('.support-ticket').fire('click');assert.equal(receivingCollege.root.querySelector('.support-reply-form').querySelector('select'),null);assert(receivingCollege.root.querySelector('.support-resolve'));
const closingForm=receivingCollege.root.querySelector('.support-reply-form'),closingReply=closingForm.querySelector('textarea');
closingReply.value='Account issue addressed';closingReply.fire('input');
assert.equal(receivingCollege.root.querySelector('.support-resolve').disabled,true,'An unsent draft does not enable resolution');
closingForm.fire('submit');assert.equal(receivingCollege.C.state.tickets[0].status,'Awaiting requester');
const sentCount=receivingCollege.C.state.tickets[0].messages.length;
receivingCollege.root.querySelector('.support-resolve').fire('click');
assert.equal(receivingCollege.C.state.tickets[0].status,'Awaiting requester','Resolving waits for confirmation');
receivingCollege.doc.body.children.at(-1).querySelector('.support-confirm-resolution').fire('click');
assert.equal(receivingCollege.C.state.tickets[0].status,'Resolved');assert.equal(receivingCollege.C.state.tickets[0].messages.length,sentCount);assert.equal(receivingCollege.C.state.tickets[0].messages.at(-1).body,'Account issue addressed');
console.log('PASS: Logo CTA, form validation and creation, text safety, conversation navigation, unfiltered ticket history, requester reply, supervisor resolution, session reload, and role-scoped inboxes.');

const animated=setup('student',undefined,true);animated.root.querySelector('.support-submit').fire('click');
const receiptDialog=animated.doc.body.children.at(-1),receiptForm=receiptDialog.querySelector('form');
receiptForm.querySelector('input').value='Animation integration';receiptForm.querySelector('input').fire('input');receiptForm.querySelector('textarea').value='Keep my ticket animation.';receiptForm.querySelector('textarea').fire('input');
assert.equal(receiptForm.querySelector('h3').textContent,'Animation integration','Live preview updates before submission');assert.equal(receiptForm.querySelector('p').textContent,'This conversation is kept in your browser session.');
const draftPaper=receiptForm.querySelector('article');assert(draftPaper,'Paper is visible while drafting');
const originalCount=animated.C.state.tickets.length;receiptForm.fire('submit');receiptForm.fire('submit');
assert.equal(animated.C.state.tickets.length,originalCount+1,'Repeated submit during animation creates one ticket');
assert.equal(receiptDialog.open,true,'Keep receipt open for the tear animation');assert.equal(receiptForm.querySelector('article'),draftPaper,'Tear the same ticket shown during drafting');
const viewTicket=receiptForm.querySelector('button');assert.equal(viewTicket.disabled,true,'Wait for the tear before viewing');
await Promise.resolve();assert.equal(animated.tearCalls,1,'Composer invokes the real animation entry point');
animated.finishAnimation();await new Promise(resolve=>setImmediate(resolve));
assert.equal(viewTicket.disabled,false);viewTicket.fire('click');assert.equal(receiptDialog.open,false);
assert(!animated.root.querySelector('.support-conversation').hidden,'View ticket opens the created conversation');
console.log('PASS: Ticket creation invokes its animation, preserves the receipt, blocks duplicate creation, and enables View ticket after completion.');
