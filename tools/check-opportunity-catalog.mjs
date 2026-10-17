import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Isolated DOM double: exercise large catalogs without modifying preview records.
class Element {
  constructor(tag,text='',className='') { Object.assign(this,{tag,textContent:text,className,children:[],dataset:{},attributes:{},events:{},clientWidth:900});this.style={setProperty(){}};this.classList={toggle(){},remove(){},add(){}}; }
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,fn){this.events[k]=fn;}
  get lastChild(){return this.children.at(-1);}
  querySelectorAll(selector){return this.children.flatMap(n=>[...(selector.startsWith('.')?n.className.split(' ').includes(selector.slice(1)):n.tag===selector)?[n]:[],...n.querySelectorAll(selector)]);}
  querySelector(selector){return this.querySelectorAll(selector)[0];}
  focus(){this.focused=true;}
  click(){this.events.click?.();}
}
const E=(...args)=>new Element(...args),A=(n,...children)=>(n.append(...children),n),B=(text,fn)=>{const n=E('button',text);n.addEventListener('click',fn);return n;};
let opened;
const context={window:{},matchMedia:()=>({matches:true,addEventListener(){}}),ResizeObserver:class{observe(){}},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},setTimeout};
vm.runInNewContext(fs.readFileSync(new URL('../shared/js/opportunity-deck.js',import.meta.url),'utf8'),context);
const host=E('div');
const gallery=context.window.BridgewayOpportunityDeck(host,{C:{E,A,B,org:id=>id,date:d=>d,dialog:(title,panel)=>{opened=panel;}},roleFit:()=>E('p','Sample fit'),applyAction:()=>B('Apply',()=>{}),placed:false});
const roles=Array.from({length:53},(_,i)=>({id:`role-${i}`,title:`Role ${i}`,company:'company-1',category:'software',skills:'Git, JavaScript',location:'Amman',description:'Test role',deadline:'2026-12-10',capacity:3}));
gallery.render(roles);
assert.equal(host.querySelectorAll('.gallery-card').length,5);
const grid=host.querySelector('.role-catalog-grid');
const more=host.querySelectorAll('button').find(b=>b.textContent==='Load more internships');
assert.equal(grid.children.length,12);
more.click();assert.equal(grid.children.length,24);assert.equal(grid.children[12].querySelector('button').focused,true);
grid.children[23].querySelector('button').click();assert.equal(opened.querySelector('h2').textContent,'Role 23');
more.click();more.click();more.click();assert.equal(grid.children.length,53);assert.equal(more.hidden,true);
gallery.render(roles.slice(0,2));assert.equal(grid.children.length,2);assert.equal(host.querySelectorAll('.gallery-card').length,2);assert.equal(more.hidden,true);
gallery.render([]);assert.equal(grid.children.length,0);assert.equal(host.querySelectorAll('.gallery-card').length,0);
gallery.render(roles);assert.equal(grid.children.length,12);assert.equal(more.hidden,false);
const search=host.querySelector('.role-catalog-search').querySelector('input');
const featured=host.querySelectorAll('.gallery-card');
search.value='Role 1';search.events.input();assert.equal(grid.children.length,11);
assert.equal(host.querySelectorAll('.gallery-card')[0],featured[0],'Catalog search must not rebuild featured cards');
assert.equal(host.querySelectorAll('.gallery-card').length,5);
assert(grid.children[0].querySelector('.role-seat-count').textContent==='3 seats');
assert(grid.children[0].querySelector('.role-deadline').textContent.startsWith('Deadline: '));
search.value='No matching company';search.events.input();assert.equal(grid.children.length,0);
assert.equal(host.querySelector('.role-catalog-empty').hidden,false);assert.equal(more.hidden,true);
host.querySelector('.role-catalog-empty').querySelector('button').click();assert.equal(grid.children.length,12);
assert.equal(search.focused,true);
const studio=fs.readFileSync(new URL('../shared/js/student-studio.js',import.meta.url),'utf8');
assert(!studio.includes("select('Role family'"));assert(!studio.includes("select('Sort by'"));
console.log('PASS: 53 roles, five animated cards, 12-item batches, shared details, filtering/reset and empty recovery.');
