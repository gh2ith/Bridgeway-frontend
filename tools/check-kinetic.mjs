// Isolated interaction checks: no real records, uploads, or browser preferences.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../shared/js/bridgeway-kinetic.js',import.meta.url),'utf8');
class Node {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.dataset={};this.attributes={};this.className='';this._text='';this.isConnected=true;this.props={};this.style={setProperty:(k,v)=>this.props[k]=v};this.classList={add:(...names)=>{this.className=[...new Set([...this.className.split(' ').filter(Boolean),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(' ').filter(n=>!names.includes(n)).join(' ');},toggle:(name,value)=>{if(value)this.classList.add(name);else this.classList.remove(name);}};}
  get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
  set textContent(value){this._text=String(value);this.children=[];}
  get firstElementChild(){return this.children[0];}
  get lastElementChild(){return this.children.at(-1);}
  append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.isConnected=false;}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(type,fn){(this.events[type]||=[]).push(fn);}
  emit(type,event={}){for(const fn of this.events[type]||[])fn({button:0,pointerId:1,preventDefault(){},...event});}
  click(){this.emit('click');}
  focus(){this.focused=true;}
  setPointerCapture(){}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close');}
  getBoundingClientRect(){return {left:0,top:0,right:320,bottom:200,width:320,height:200};}
  animate(frames,options){this.animation={frames,options};(this.animations||=[]).push(this.animation);return {finished:Promise.resolve()};}
  contains(n){return this.children.includes(n)||this.children.some(c=>c.contains(n));}
  matches(selector){return selector.startsWith('.')?this.className.split(' ').includes(selector.slice(1)):this.tag===selector;}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0];}
}
function setup(reduced=false){
  const body=new Node('body'),callbacks=new Map(),frames=new Map(),listeners={};let now=0,serial=0;
  const win={addEventListener:(type,fn)=>(listeners[type]||=[]).push(fn),removeEventListener(){}};
  const context={window:win,document:{body,activeElement:null,createElement:tag=>new Node(tag),addEventListener(){}},crypto:webcrypto,matchMedia:()=>({matches:reduced}),performance:{now:()=>now},requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:fn=>{const id=++serial;callbacks.set(id,fn);return id;},clearTimeout:id=>callbacks.delete(id),ResizeObserver:class{observe(){}},MutationObserver:class{observe(){}}};
  vm.runInNewContext(source,context);
  return {kit:win.BridgewayKinetic,body,listeners,step(t){now=t;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(t));}};
}
const env=setup();let deleted=0,restored=0;
let dialog=env.kit.confirmDelete({title:'Test role',onDelete:()=>deleted++,onUndo:()=>restored++});
let hold=dialog.querySelector('.bw-hold-delete');
hold.emit('pointerdown');env.step(400);assert.equal(deleted,0);
hold.emit('pointerup');env.step(1400);assert.equal(deleted,0,'Early release must cancel deletion');
hold.emit('pointerdown');env.step(1900);assert.equal(deleted,0);
env.step(2401);assert.equal(deleted,1,'A full one-second hold deletes exactly once');
env.step(3000);assert.equal(deleted,1);
env.body.querySelector('.bw-undo-toast').querySelector('button').click();assert.equal(restored,1);
dialog=env.kit.confirmDelete({title:'Test role',onDelete:()=>deleted++,onUndo:()=>restored++});
dialog.querySelector('.bw-delete-alternative').click();
const confirm=dialog.querySelectorAll('button').find(n=>n.textContent==='Confirm delete');
assert.equal(confirm.hidden,false);confirm.click();assert.equal(deleted,2);
env.body.querySelector('.bw-undo-toast').querySelector('button').click();assert.equal(restored,2);
dialog=env.kit.confirmDelete({title:'Test role',onDelete:()=>deleted++,onUndo:()=>restored++});
dialog.querySelector('.bw-hold-delete').emit('pointerdown');dialog.close();env.step(5000);assert.equal(deleted,2,'Closing a dialog cancels an unfinished hold');
const rejectEnv=setup();let rejected=0,undone=0;
let rejection=rejectEnv.kit.confirmReject({title:'Test applicant — Test role',onReject:()=>rejected++,onUndo:()=>undone++});
assert.equal(rejection.querySelector('h2').textContent,'Reject application?');
assert(rejection.textContent.includes('This will decline the applicant for this role. You can undo this decision.'));
assert.equal(rejection.querySelector('.bw-delete-alternative'),undefined,'No click-confirmation link in rejection dialog');
let rejectHold=rejection.querySelector('.bw-hold-delete');
assert.equal(rejectHold.textContent,'Hold to reject');
rejectHold.emit('pointerdown');rejectEnv.step(600);rejectHold.emit('pointerup');rejectEnv.step(1200);
assert.equal(rejected,0,'Releasing early must not reject an applicant');
rejectHold.emit('pointerdown');rejectEnv.step(2201);assert.equal(rejected,1);
rejectEnv.step(3000);assert.equal(rejected,1,'Holding must reject exactly once');
rejectEnv.body.querySelector('.bw-undo-toast').querySelector('button').click();assert.equal(undone,1);
rejection=rejectEnv.kit.confirmReject({title:'Test applicant',onReject:()=>rejected++,onUndo:()=>undone++});
rejectHold=rejection.querySelector('.bw-hold-delete');
rejectHold.emit('keydown',{key:' '});rejectEnv.step(3400);rejectHold.emit('keyup',{key:' '});rejectEnv.step(4500);assert.equal(rejected,1,'Early keyboard release must cancel');
rejectHold.emit('keydown',{key:'Enter'});rejectHold.emit('keydown',{key:'Enter',repeat:true});rejectEnv.step(5501);assert.equal(rejected,2,'Keyboard hold must reject exactly once');
rejection=rejectEnv.kit.confirmReject({title:'Test applicant',onReject:()=>rejected++,onUndo:()=>undone++});
rejection.querySelector('.bw-hold-delete').emit('pointerdown');rejection.close();rejectEnv.step(5000);assert.equal(rejected,2,'Closing must cancel an unfinished rejection');
const dynamic=new Node('button');dynamic.textContent='Preview profile changes';env.kit.buttonState(dynamic,'Preview validated');assert.equal(dynamic.textContent,'Preview validated');
const zone=new Node('div'),input=new Node('input');zone.append(new Node('i'),new Node('label'),new Node('span'),input);let selected;
env.kit.cvDrop(zone,input,file=>selected=file);
zone.emit('drop',{dataTransfer:{types:['text/html'],files:[{name:'untrusted.html'}]}});assert.equal(selected,undefined);
const file={name:'example.pdf',size:1024};
zone.emit('drop',{dataTransfer:{types:['Files'],files:[file]}});assert.equal(selected,file);
env.kit.cvState(zone,file);assert(zone.className.includes('has-file'));assert.equal(zone.querySelector('label').textContent,'Replace your CV');
env.kit.cvState(zone,null);assert(!zone.className.includes('has-file'));
const paper=env.kit.ticketPaper();paper.title.textContent='A real preview subject';
await env.kit.tearTicket(paper.paper,{left:10,top:20,width:240});
assert(paper.paper.className.includes('is-cut'));assert.equal(paper.stub.hidden,true);
assert.equal(paper.stub.animation.options.duration,440,'Detached stub should have a distinct falling phase');
assert.deepEqual(paper.stub.animations.map(a=>a.options.duration),[140,260,440],'Tension, clean snap fracture, and gravity slide must run in sequence');
assert.deepEqual(paper.paper.querySelector('.bw-ticket-main').animations.map(a=>a.options.duration),[140,260,400],'Kept half should respond to tension and settle with damped recoil');
assert(paper.stub.animations[1].frames.some(f=>f.transform.includes('rotateX(14deg)')),'The clean snap should fracture cleanly with 3D depth before sliding');
const tearCount=paper.stub.animations.length;
await env.kit.tearTicket(paper.paper,{left:10,top:20,width:240});
assert.equal(paper.stub.animations.length,tearCount,'Repeated calls must not replay or duplicate the tear');
assert.equal(paper.stub.animation.frames.at(-1).opacity,0,'Falling stub must fade completely');
assert.equal(paper.paper.props['--torn-space'],'200px','Reserve the removed stub height to prevent a layout jump');
assert.equal(paper.paper.dataset.tearing,'true','Guard against duplicate tear animations');
assert.equal(paper.paper.className.includes('is-cutting'),false,'Clear transitional state after completion');
const ticketCss=fs.readFileSync(new URL('../shared/css/bridgeway-kinetic.css',import.meta.url),'utf8');
assert(ticketCss.includes('transform-origin:14px 0'),'Stub must hinge at the last attached perforation');
assert(ticketCss.includes('circle at 5px 100%')&&ticketCss.includes('circle at 5px 0'),'Both paper halves retain matching scalloped edges');
assert(!ticketCss.includes('bw-ticket-cut'),'Remove the old sweeping cut line');
const calm=setup(true),still=calm.kit.ticketPaper();
await calm.kit.tearTicket(still.paper,{left:0,top:0,width:200});
assert.equal(still.stub.hidden,true,'Reduced motion must immediately reach the same completion state');
assert.equal(still.paper.props['--torn-space'],'200px','Reduced motion must preserve the same layout');
const pending=env.kit.credential({student:'Sample Student',company:'Sample Company',hours:200,complete:false});
assert(!pending.className.includes('is-complete'));assert(pending.textContent.includes('200 / 320 h'));
const completed=env.kit.credential({student:'Sample Student',company:'Sample Company',hours:320,complete:true,start:'2026-08-10',end:'2026-10-04'});
assert(completed.className.includes('is-complete'));assert(completed.textContent.includes('Not an official certificate'));
assert(!/fetch\(|XMLHttpRequest|FileReader|\.arrayBuffer\(/.test(source),'Interactions must not upload/read file contents');
console.log('PASS: Hold timing/cancellation, accessible confirm, Undo, file-only drop, ticket cut/reduced motion, and sample credential states.');
