/* Bridgeway-native interaction studies. No uploads, network requests, or framework dependency. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
  const button=(text,fn,cls='cycle-button')=>{const n=el('button',text,cls);n.type='button';n.addEventListener('click',fn);return n;};
  const motion=(n,frames,options)=>{if(reduced.matches||!n.isConnected)return Promise.resolve();const animation=n.animate(frames,options);return animation.finished.catch(()=>{});};
  function pulse(n){if(!reduced.matches)motion(n,[{transform:'translateY(1px) scale(.98)'},{transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});}
  function buttonState(n,label){
    if(n.textContent===label)return;
    const width=n.getBoundingClientRect().width;n.textContent=label;
    const next=n.getBoundingClientRect().width;
    if(!reduced.matches)motion(n,[{width:width+'px',opacity:.65},{width:next+'px',opacity:1}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
    n.classList.add('bw-dynamic-action');
  }
  function undoToast(text,undo){
    const toast=el('div',null,'bw-undo-toast');toast.setAttribute('role','status');
    const copy=el('span',text),action=button('Undo',()=>{clearTimeout(timer);undo();toast.remove();}),close=button('×',()=>{clearTimeout(timer);toast.remove();});
    close.setAttribute('aria-label','Dismiss notice');toast.append(copy,action,close);document.body.append(toast);
    let timer;const start=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(!toast.contains(document.activeElement))toast.remove();},8000);};
    toast.addEventListener('pointerenter',()=>clearTimeout(timer));toast.addEventListener('pointerleave',start);
    toast.addEventListener('focusin',()=>clearTimeout(timer));toast.addEventListener('focusout',start);start();
  }
  function confirmDelete({title,onDelete,onUndo,copy={}}){
    const holdLabel=copy.hold||'Hold to delete';
    const d=el('dialog',null,'cycle-dialog bw-delete-dialog'),heading=el('h2',copy.heading||'Delete this post?');
    if(copy.compact)d.classList.add('bw-reject-dialog');
    heading.id='delete-'+crypto.randomUUID();d.setAttribute('aria-labelledby',heading.id);
    const description=el('p',copy.description||'The post will leave discovery. Existing applications and training history stay intact. You can restore it from the Deleted filter.','cycle-muted');
    description.id=heading.id+'-description';d.setAttribute('aria-describedby',description.id);
    d.append(heading,el('p',title,'bw-delete-name'),description);
    const hold=el('button',null,'bw-hold-delete');hold.type='button';
    const icon=el('i',null,copy.icon||'bi bi-trash3');icon.setAttribute('aria-hidden','true');
    const label=el('span',holdLabel);hold.append(icon,label);
    hold.setAttribute('aria-label',copy.accessibleHold||'Hold for one second to delete this post. A click confirmation alternative follows.');
    const hint=el('p',copy.hint||'Hold for one second. Release early to cancel.','bw-hold-hint');
    const alternate=button('Use click confirmation',()=>{cancel();hold.hidden=true;hint.textContent=copy.alternateHint||'Delete this post? It can be restored later.';alternate.hidden=true;confirm.hidden=false;confirm.focus();},'bw-delete-alternative');
    const confirm=button(copy.confirm||'Confirm delete',finish,'cycle-button is-danger');confirm.hidden=true;
    const keep=button(copy.keep||'Keep post',()=>d.close());
    const actions=el('div',null,'bw-delete-actions');actions.append(keep);if(!copy.holdOnly)actions.append(confirm);d.append(hold,hint);if(!copy.holdOnly)d.append(alternate);d.append(actions);
    const opener=document.activeElement;let frame=0,start=0,pointer=null,heldKey=null,finished=false;
    function cancel(){cancelAnimationFrame(frame);frame=0;hold.style.setProperty('--hold','0%');label.textContent=holdLabel;hold.classList.remove('is-holding');pointer=null;heldKey=null;}
    function finish(){if(finished)return;finished=true;cancel();onDelete();d.close();undoToast(copy.notice||'Post moved to Deleted.',onUndo);}
    function tick(t){const progress=Math.min(1,(t-start)/1000);hold.style.setProperty('--hold',(progress*100)+'%');if(progress===1)finish();else frame=requestAnimationFrame(tick);}
    function begin(){start=performance.now();hold.classList.add('is-holding');label.textContent='Keep holding…';frame=requestAnimationFrame(tick);}
    hold.addEventListener('pointerdown',event=>{if(event.button!==0||finished||frame)return;event.preventDefault();hold.focus();pointer=event.pointerId;hold.setPointerCapture(pointer);begin();});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])hold.addEventListener(type,()=>{if(pointer!==null)cancel();});
    hold.addEventListener('keydown',event=>{if(![' ','Enter'].includes(event.key))return;event.preventDefault();if(event.repeat||finished||frame)return;heldKey=event.key;begin();});
    hold.addEventListener('keyup',event=>{if(event.key===heldKey){event.preventDefault();cancel();}});
    hold.addEventListener('blur',cancel);
    if(copy.holdOnly){hold.addEventListener('focus',()=>{hint.textContent='Hold 1 second · Mouse, Space or Enter';});hold.addEventListener('blur',()=>{hint.textContent=copy.hint;});}
    const blur=()=>cancel();window.addEventListener('blur',blur);
    d.addEventListener('close',()=>{cancel();window.removeEventListener('blur',blur);d.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
    window.BridgewayUX?.decorateConfirmation(d,heading.textContent);document.body.append(d);d.showModal();keep.focus();return d;
  }
  function confirmReject({title,onReject,onUndo}){
    return confirmDelete({title,onDelete:onReject,onUndo,copy:{
      heading:'Reject application?',hold:'Hold to reject',keep:'Cancel',icon:'bi bi-x-circle',compact:true,holdOnly:true,
      description:'This will decline the applicant for this role. You can undo this decision.',hint:'Hold 1 second · Release to cancel',
      accessibleHold:'Hold for one second to reject. Use mouse, Space or Enter. Release early to cancel.',notice:'Application rejected.'
    }});
  }
  function cvDrop(zone,input,onFile){
    if(!zone||zone.dataset.magnetic)return;zone.dataset.magnetic='true';zone.classList.add('bw-magnetic-cv');
    input.setAttribute('aria-label','Select or replace your CV');
    const hint=zone.querySelector('span'),originalHint=hint?.textContent;
    function reset(){zone.style.setProperty('--drop-x','0px');zone.style.setProperty('--drop-y','0px');zone.classList.remove('is-near','is-over');if(hint)hint.textContent=originalHint;}
    function over(event){
      if(!Array.from(event.dataTransfer?.types||[]).includes('Files'))return;
      const r=zone.getBoundingClientRect();if(!r.width||!r.height){reset();return;}
      const dx=event.clientX-(r.left+r.width/2),dy=event.clientY-(r.top+r.height/2);
      const distance=Math.hypot(Math.max(0,Math.abs(dx)-r.width/2),Math.max(0,Math.abs(dy)-r.height/2));
      if(distance>100){reset();return;}
      const inside=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
      zone.classList.add('is-near');zone.classList.toggle('is-over',inside);
      const strength=reduced.matches||inside?0:(1-distance/100)*7/Math.max(1,Math.hypot(dx,dy));
      zone.style.setProperty('--drop-x',dx*strength+'px');zone.style.setProperty('--drop-y',dy*strength+'px');
      if(hint)hint.textContent=inside?'Release to select your CV':'Bring your CV closer';
    }
    window.addEventListener('dragover',over);window.addEventListener('dragend',reset);window.addEventListener('drop',reset);
    zone.addEventListener('dragover',event=>{if(Array.from(event.dataTransfer?.types||[]).includes('Files')){event.preventDefault();event.dataTransfer.dropEffect='copy';}});
    zone.addEventListener('drop',event=>{if(!Array.from(event.dataTransfer?.types||[]).includes('Files'))return;event.preventDefault();reset();const file=event.dataTransfer.files[0];if(file)onFile(file);});
  }
  function cvState(zone,file){if(!zone)return;zone.classList.toggle('has-file',!!file);const label=zone.querySelector('label');if(label)label.textContent=file?'Replace your CV':'Select your CV';const icon=zone.querySelector('i');if(icon)icon.className=file?'bi bi-file-earmark-check':'bi bi-file-earmark-arrow-up';}
  function ticketPaper(){
    const paper=el('article',null,'bw-paper-ticket'),main=el('div',null,'bw-ticket-main'),stub=el('div',null,'bw-ticket-stub');
    const brand=el('div',null,'bw-ticket-brand');brand.append(el('i',null,'bi bi-chat-square-text'),el('span','Bridgeway Support'),el('small','Draft'));
    const title=el('h3','Your support ticket'),body=el('p','A clear subject and description help keep the conversation on track.','bw-ticket-description');
    main.append(brand,title,body);stub.append(el('span','Keep the conversation together.'),el('strong','Workspace'));
    paper.append(main,stub);
    // The source component uses react-parallax-tilt; keep the same restrained
    // six-degree response without introducing React into these static portals.
    paper.addEventListener('pointermove',event=>{
      if(reduced.matches||event.pointerType!=='mouse'||paper.classList.contains('is-cut')||paper.classList.contains('is-cutting')||paper.closest('.is-issued'))return;
      const r=paper.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
      paper.style.transform=`perspective(1100px) rotateX(${-y*6}deg) rotateY(${x*6}deg) scale(1.012)`;
    });
    paper.addEventListener('pointerleave',()=>{paper.style.transform='';});
    return {paper,title,body,brand,stub};
  }
  function playSnapAcoustic(){
    try {
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtx)return;
      const ctx=new AudioCtx();
      if(ctx.state==='suspended')ctx.resume();
      const now=ctx.currentTime;
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(320,now);
      osc.frequency.exponentialRampToValueAtTime(80,now+0.06);
      gain.gain.setValueAtTime(0.18,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.07);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.08);

      const length=Math.floor(ctx.sampleRate*0.12);
      const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<length;i++){
        const t=i/length;
        data[i]=(Math.random()*2-1)*Math.sin(t*Math.PI)*0.08;
      }
      const noise=ctx.createBufferSource();noise.buffer=buffer;
      const filter=ctx.createBiquadFilter();filter.type='bandpass';
      filter.frequency.setValueAtTime(2200,now);filter.Q.setValueAtTime(1.5,now);
      noise.connect(filter);filter.connect(ctx.destination);
      noise.start(now);noise.onended=()=>ctx.close();
    } catch {}
  }
  function burstFibers(target){
    if(reduced.matches||!target)return;
    const burst=el('div',null,'bw-ticket-burst');
    for(let i=0;i<10;i++){
      const p=el('span',null,'bw-ticket-fiber');
      const x=10+i*8.5+(Math.random()*4-2);
      const dx=(Math.random()-0.5)*36;
      const dy=14+Math.random()*24;
      p.style.cssText=`position:absolute;left:${x}%;top:calc(100% - 2px);width:${Math.random()>0.5?3:2}px;height:${Math.random()>0.5?2.5:1.5}px;background:${i%2===0?'#ffffff':'#7dd3fc'};border-radius:1px;pointer-events:none;`;
      burst.append(p);
      motion(p,[
        {transform:'translate(0,0) scale(1)',opacity:0.95},
        {transform:`translate(${dx}px,${dy}px) scale(0.6)`,opacity:0}
      ],{duration:320+i*15,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    }
    target.append(burst);
    setTimeout(()=>burst.remove(),500);
  }
  async function tearTicket(paper,from,dialogFrom){
    if(paper.dataset.tearing)return;
    paper.dataset.tearing='true';paper.style.transform='';
    const stub=paper.querySelector('.bw-ticket-stub'),main=paper.querySelector('.bw-ticket-main');
    const stubHeight=stub.getBoundingClientRect().height;
    const finish=()=>{
      paper.style.setProperty('--torn-space',stubHeight+'px');
      paper.classList.remove('is-cutting');paper.classList.add('is-cut');stub.hidden=true;
    };
    if(reduced.matches){finish();return;}
    const modal=paper.closest?.('dialog');
    if(modal&&dialogFrom){const target=modal.getBoundingClientRect();motion(modal,[{width:dialogFrom.width+'px',height:dialogFrom.height+'px'},{width:target.width+'px',height:target.height+'px'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});}
    const r=paper.getBoundingClientRect(),scale=r.width?from.width/r.width:1;
    try {
      await motion(paper,[{transform:'translate('+(from.left-r.left)+'px,'+(from.top-r.top)+'px) scale('+scale+')'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
      if(!paper.isConnected)return;
      // Phase 1 (140ms): Physical cardstock tension pull
      await Promise.all([
        motion(main,[
          {transform:'none'},
          {transform:'translateY(-4px)'}
        ],{duration:140,easing:'ease-out',fill:'forwards'}),
        motion(stub,[
          {transform:'none'},
          {transform:'translateY(3px)'}
        ],{duration:140,easing:'ease-out',fill:'forwards'})
      ]);
      if(!paper.isConnected)return;
      // Phase 2 (260ms): Crisp horizontal perforation fracture & clean separation
      paper.classList.add('is-cutting');
      burstFibers(main);
      playSnapAcoustic();
      const snap='perspective(900px) translateY(16px) rotateX(14deg) scale(0.99)';
      await Promise.all([
        motion(stub,[
          {transform:'translateY(3px)'},
          {transform:'perspective(900px) translateY(8px) rotateX(6deg) scale(0.995)',offset:0.35},
          {transform:snap}
        ],{duration:260,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'}),
        motion(main,[
          {transform:'translateY(-4px)'},
          {transform:'translateY(-6px)'}
        ],{duration:260,easing:'ease-out',fill:'forwards'})
      ]);
      if(!paper.isConnected)return;
      // Phase 3 (stub 440ms, main 400ms): Gravity slide ejection & damped elastic cardstock recoil
      paper.classList.remove('is-cutting');paper.classList.add('is-cut');
      await Promise.all([
        motion(stub,[
          {transform:snap,opacity:1},
          {transform:'perspective(900px) translateY(60px) rotateX(20deg) scale(0.96)',opacity:0.9,offset:0.35},
          {transform:'perspective(900px) translateY(120px) rotateX(26deg) scale(0.93)',opacity:0.45,offset:0.70},
          {transform:'perspective(900px) translateY(175px) rotateX(32deg) scale(0.90)',opacity:0}
        ],{duration:440,easing:'cubic-bezier(.35,0,.75,.45)',fill:'forwards'}),
        motion(main,[
          {transform:'translateY(-6px)'},
          {transform:'translateY(3px)',offset:0.30},
          {transform:'translateY(-1.2px)',offset:0.60},
          {transform:'translateY(0.4px)',offset:0.85},
          {transform:'none'}
        ],{duration:400,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'})
      ]);
    } finally { finish(); }
  }
  function credential({student,company,hours,complete,start,end}){
    const card=el('section',null,'bw-credential'+(complete?' is-complete':''));card.setAttribute('aria-label',complete?'Training completion card':'Training verification progress');
    if(!complete){
      card.classList.add('is-progress');
      const bar=el('progress');bar.max=320;bar.value=hours;bar.setAttribute('aria-label',hours+' of 320 hours supervisor-verified');
      card.append(el('h2','Your completion card'),el('p',hours+' / 320 h verified','bw-credential-company'),bar,el('small','The blue/silver card unlocks after all eight weeks and 320 hours are verified.'));return card;
    }
    card.append(el('div',complete?'✓':'◷','bw-credential-seal'),el('p',complete?'Training completion card':'Your training record','bw-credential-kicker'),el('h2',complete?'Eight weeks. Earned.':'Building your experience.'),el('strong',student),el('p',company,'bw-credential-company'));
    const facts=el('div',null,'bw-credential-facts');facts.append(el('strong',hours+' / 320 h'),el('span',complete?'Supervisor-verified':'Verified so far'));card.append(facts);
    if(start)card.append(el('p','Started '+start+(end?' · Finished '+end:''),'bw-credential-dates'));
    card.append(el('small',complete?'Training summary · Not an official certificate.':'Your completion card unlocks when all eight weeks and 320 hours are verified.'));
    if(complete){
      card.tabIndex=0;
      card.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType==='touch')return;const r=card.getBoundingClientRect();card.style.setProperty('--foil-x',((event.clientX-r.left)/r.width*100)+'%');card.style.setProperty('--foil-y',((event.clientY-r.top)/r.height*100)+'%');});
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--foil-x','50%');card.style.setProperty('--foil-y','50%');});
    }
    return card;
  }
  function meetingPass(meeting){
    meeting.classList.add('bw-meeting-pass');
    const join=meeting.querySelector('#studentMeetingJoin');
    if(join&&!meeting.querySelector('.bw-meeting-stub')){const stub=el('div',null,'bw-meeting-stub');stub.append(join);meeting.append(stub);}
  }
  const fadeSelector='.cycle-plan-nav,.cycle-ticket-list,.evaluation-roster,#weeklyStudentList,#supervisorReportStudents,#evaluationStudentList,.company-student-list';
  const watched=new WeakSet();
  const dynamic=new WeakSet();
  function dynamicButtons(root){
    const selector='.cycle-button.is-primary,.company-primary';
    const nodes=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
    nodes.forEach(n=>{if(dynamic.has(n))return;dynamic.add(n);n.classList.add('bw-dynamic-action');let previous=n.textContent,width=n.getBoundingClientRect().width;
      new ResizeObserver(()=>{width=n.getBoundingClientRect().width;}).observe(n);
      new MutationObserver(()=>{if(n.textContent===previous)return;previous=n.textContent;const next=n.getBoundingClientRect().width;if(!reduced.matches)motion(n,[{width:width+'px',opacity:.5},{width:next+'px',opacity:1}],{duration:230,easing:'ease-out'});width=next;}).observe(n,{childList:true,subtree:true,characterData:true});
    });
  }
  function fades(root){
    const nodes=[...(root.matches?.(fadeSelector)?[root]:[]),...root.querySelectorAll(fadeSelector)];
    nodes.forEach(n=>{if(watched.has(n))return;watched.add(n);n.classList.add('bw-scroll-fade');
      const update=()=>{const vertical=getComputedStyle(n).overflowY!=='visible'&&n.scrollHeight>n.clientHeight+2;n.style.setProperty('--fade-top',vertical&&n.scrollTop>2?'14px':'0px');n.style.setProperty('--fade-bottom',vertical&&n.scrollTop+n.clientHeight<n.scrollHeight-2?'18px':'0px');};
      n.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(n);new MutationObserver(update).observe(n,{childList:true,subtree:true});update();
    });
  }
  window.BridgewayKinetic={buttonState,confirmDelete,confirmReject,undoToast,cvDrop,cvState,ticketPaper,tearTicket,credential,meetingPass};
  document.addEventListener('DOMContentLoaded',()=>{
    document.addEventListener('click',event=>{const n=event.target.closest('.cycle-button.is-primary,.company-primary');if(n&&!n.disabled)pulse(n);});
    fades(document);dynamicButtons(document);
    new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(n=>{if(n.nodeType===1){fades(n);dynamicButtons(n);}}))).observe(document.body,{childList:true,subtree:true});
  });
})();
