import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
class Element{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.dataset={};this.attributes={};this.isConnected=true;this.textContent='';this.type='button';}
  setAttribute(k,v){this.attributes[k]=v;}
  hasAttribute(k){return k in this.attributes;}
  get classList(){return {contains:name=>(this.className||'').split(' ').includes(name),add:name=>{if(!this.classList.contains(name))this.className=((this.className||'')+' '+name).trim();}};}
  prepend(...nodes){this.children.unshift(...nodes);}
  querySelector(selector){return this.children.find(n=>selector==='p'?n.tagName==='P':n.tagName==='H2')||null;}
  querySelectorAll(){return this.children.filter(n=>n.tagName==='DIV'&&!n.classList.contains('bw-decision-mark'));}
  append(...nodes){this.children.push(...nodes);}
  addEventListener(type,fn){(this.events[type]||=[]).push(fn);}
  remove(){this.isConnected=false;}
  focus(){this.focused=true;}
  showModal(){this.open=true;}
  close(value=''){this.returnValue=value;this.open=false;for(const fn of this.events.close||[])fn();}
  closest(selector){return selector==='button'?this:null;}
}
const events={},body=new Element('body'),window={addEventListener(){}};
const document={activeElement:new Element('button'),body,createElement:tag=>new Element(tag),addEventListener:(name,fn)=>(events[name]||=[]).push(fn)};
vm.runInNewContext(fs.readFileSync(new URL('../shared/js/portal-ux.js',import.meta.url),'utf8'),{window,document,crypto:webcrypto,location:{pathname:'/pages/supervisor-dashboard/supervisor-dashboard.html'}});
const ux=window.BridgewayUX;
for(const text of ['Restrict view','Make reports visible','Accept applicant','Reject applicant','Withdraw application','Approve & publish','Pause publication','Resume publication','Activate placement','Verify 40 hours','Request revision','Submit report','Resubmit report','Submit final evaluation','Save & submit for review','Confirm time'])assert(ux.actionPolicy(text),text);
for(const text of ['Explore','Close','Next role','Training record','Confirm application','Delete post','Cancel interview','Save training plan'])assert.equal(ux.actionPolicy(text),null,'Do not duplicate existing confirmations or interrupt ordinary actions: '+text);
let promise=ux.confirmAction(ux.actionPolicy('Restrict view')),dialog=body.children.at(-1);assert.equal(dialog.open,true);assert.equal(dialog.children.find(n=>n.className==='bw-ux-confirm-actions').children[0].textContent,'Cancel');assert(dialog.classList.contains('bw-decision-dialog'));assert(dialog.attributes['aria-describedby']);dialog.close('cancel');assert.equal(await promise,false);
promise=ux.confirmAction(ux.actionPolicy('Restrict view'));dialog=body.children.at(-1);dialog.close('confirmed');assert.equal(await promise,true);
let clicks=0;const target=new Element('button');target.textContent='Restrict view';target.click=()=>{const e={target,preventDefault(){},stopImmediatePropagation(){}};for(const fn of events.click)fn(e);clicks++;};
for(const fn of events.click)fn({target,preventDefault(){},stopImmediatePropagation(){}});assert.equal(clicks,0,'Opening a confirmation must not run the original action');dialog=body.children.at(-1);dialog.close('cancel');await Promise.resolve();assert.equal(clicks,0);
for(const fn of events.click)fn({target,preventDefault(){},stopImmediatePropagation(){}});dialog=body.children.at(-1);dialog.close('confirmed');await Promise.resolve();assert.equal(clicks,1,'Confirmation replays the existing handler exactly once');
let submissions=0;const form={isConnected:true,reportValidity:()=>true,requestSubmit:()=>submissions++},submit=new Element('button');submit.textContent='Submit report';submit.form=form;submit.type='submit';
for(const fn of events.submit)fn({target:form,submitter:submit,preventDefault(){},stopImmediatePropagation(){}});assert.equal(submissions,0);body.children.at(-1).close('confirmed');await Promise.resolve();assert.equal(submissions,1);
assert(fs.readFileSync(new URL('../shared/js/portal.js',import.meta.url),'utf8').includes("toast.setAttribute('role','status')"));
console.log('PASS: Consequential-action coverage, safe cancel, one-time replay, form validation path, accessible dialogs, and no duplicate apply/delete confirmations.');
