import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// File previews cannot fetch HTML. Both protocols must mount locally and keep the shell.
const source=readFileSync(new URL('../shared/js/student-profile-view.js',import.meta.url),'utf8');
for(const protocol of ['file:','http:']) {
  let ready,mounted=0,content=0;
  const location={protocol,hash:'#tab-opportunities',href:'unchanged'};
  const profileLink={setAttribute(){},removeAttribute(){}};
  const account={open:true};
  const cancel={addEventListener(){}};
  let panel;
  const main={insertBefore(node){panel=node;},querySelector(){return null;}};
  const document={
    addEventListener(name,fn){if(name==='DOMContentLoaded')ready=fn;},
    createElement(){return {classList:{contains:()=>true},setAttribute(){},replaceChildren(){},querySelector:()=>cancel,append(){},addEventListener(){}};},
    querySelector(selector){return selector==='.bw-main-content'?main:selector==='.studio-account'?account:profileLink;}
  };
  const window={addEventListener(){},switchTab(id){assert.equal(id,'tab-profile');},scrollTo(){},
    BridgewayStudentProfileContent(){content++;return {};},
    BridgewayMountStudentProfile(root,options){assert.equal(root,panel);assert.equal(options.embedded,true);mounted++;}
  };
  vm.runInNewContext(source,{window,document,location,history:{pushState(a,b,hash){location.hash=hash;}},MutationObserver:class{observe(){}}});
  ready();
  await window.BridgewayOpenStudentProfile();
  await window.BridgewayOpenStudentProfile();
  assert.equal(mounted,1,`${protocol}: profile mounts once`);
  assert.equal(content,1,`${protocol}: profile content is local`);
  assert.equal(location.href,'unchanged',`${protocol}: no separate-page fallback`);
  assert.equal(location.hash,'#tab-profile');
  assert.equal(account.open,false);
}
console.log('PASS: File and HTTP previews mount one profile in the existing shell, without fetching HTML or navigating away.');
