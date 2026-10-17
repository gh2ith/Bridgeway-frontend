/* Presentation only: reuse live DOM and handlers; never copy or change workflow data. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  function animate(node,frames,duration=340,delay=0) {
    if (!node || reduced.matches || !node.getClientRects().length) return;
    running.get(node)?.cancel();
    const effect=node.animate(frames,{duration,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    running.set(node,effect);
    effect.finished.catch(()=>{}).finally(()=>{if(running.get(node)===effect)running.delete(node);});
  }
  function reveal(node,direction=1) { animate(node,[{opacity:0,transform:`translate(${direction*18}px,8px)`},{opacity:1,transform:'none'}]); }
  function expand(node,from) {
    if(!node || !from)return;
    const to=node.getBoundingClientRect();
    if(!to.width || !to.height)return;
    const x=from.left-to.left,y=from.top-to.top;
    animate(node,[{transformOrigin:'top left',transform:`translate(${x}px,${y}px) scale(${Math.max(.35,from.width/to.width)},${Math.max(.35,from.height/to.height)})`,opacity:.65},{transformOrigin:'top left',transform:'none',opacity:1}],430);
  }
  window.BridgewayMotion={reveal,expand};
  reduced.addEventListener('change',()=>{if(reduced.matches){running.forEach(effect=>effect.cancel());running.clear();}});
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.classList.add('bw-motion-ready');
    const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
    // One expanded opportunity, with the actual apply control and its original listener.
    const grid=document.querySelector('#tab-opportunities .bw-opportunities-grid');
    if(grid && grid.dataset.discovery !== 'true') {
      let selected=null,origin=null,returnFocus=null;
      const back=make('button','Back to opportunities','bw-reading-back');back.type='button';
      function close(restoreFocus=true) {
        if(!selected)return;
        const from=selected.getBoundingClientRect(),card=selected;
        selected.classList.remove('bw-opportunity-expanded');grid.classList.remove('bw-reading-opportunities');
        back.remove();selected=null;
        returnFocus?.setAttribute('aria-expanded','false');
        expand(card,from);if(restoreFocus)returnFocus?.focus({preventScroll:true});
      }
      back.addEventListener('click',close);
      grid.querySelectorAll('.bw-opp-card').forEach((card,index)=>{
        card.id ||= `opportunity-preview-${index}`;
        const title=card.querySelector('.bw-opp-title');
        card.tabIndex=0;
        card.setAttribute('aria-label',`View ${title.textContent}`);card.setAttribute('aria-expanded','false');
        function open() {
          if(selected===card)return;
          if(selected)close();
          origin=card.getBoundingClientRect();selected=card;returnFocus=card;
          grid.classList.add('bw-reading-opportunities');card.classList.add('bw-opportunity-expanded');
          card.setAttribute('aria-expanded','true');card.prepend(back);
          title.tabIndex=-1;title.focus({preventScroll:true});card.scrollIntoView({block:'nearest',behavior:'instant'});
          expand(card,origin);
        }
        card.addEventListener('click',event=>{
          if(event.target.closest('button,a,input,select,textarea,[role="button"]'))return;
          open();
        });
        card.addEventListener('keydown',event=>{
          if(event.target!==card || !['Enter',' '].includes(event.key))return;
          event.preventDefault();open();
        });
      });
      grid.addEventListener('keydown',event=>{if(event.key==='Escape'&&selected){event.preventDefault();close();}});
      document.getElementById('oppSearchInput')?.addEventListener('input',()=>close(false));
      document.querySelectorAll('button[data-category]').forEach(button=>button.addEventListener('click',()=>close(false)));
      document.querySelectorAll('.bw-tab-btn').forEach(button=>button.addEventListener('click',()=>close(false)));
    }
    // Focus the existing table row. The original action controls remain live, not cloned.
    document.querySelectorAll('#supervisedStudentsTable,#tab-students table,#companyAcceptedTableBody').forEach(source=>{
      const table=source.matches('table')?source:source.closest('table');
      if(!table)return;
      const area=table.parentElement,back=make('button','Back to students','bw-reading-back');back.type='button';back.hidden=true;area.before(back);
      let selected=null,opener=null;
      function close(restoreFocus=true) {
        if(!selected)return;
        const row=selected;row.classList.remove('bw-record-expanded');table.classList.remove('bw-reading-record');
        selected=null;back.hidden=true;opener?.setAttribute('aria-expanded','false');if(restoreFocus)opener?.focus({preventScroll:true});reveal(table,-1);
      }
      back.addEventListener('click',close);
      function decorate() {
        const labels=[...table.querySelectorAll('thead th')].map(node=>node.textContent.trim());
        table.querySelectorAll('tbody tr').forEach(row=>{
          if(row.querySelector('.bw-record-open') || row.cells.length<2 || row.cells[0].colSpan>1)return;
          [...row.cells].forEach((cell,index)=>{cell.dataset.recordLabel=labels[index]||'Details';});
          const identity=row.cells[0];if(!identity)return;
          const name=table.id==='supervisedStudentsTable'?identity.querySelector('[data-style="s10"]'):null;
          const button=make('button',name?name.textContent:'View record',name?'bw-record-open bw-record-name':'bw-record-open');button.type='button';button.setAttribute('aria-expanded','false');
          button.setAttribute('aria-label',`View student record: ${identity.textContent.trim().replace(/\s+/g,' ').slice(0,80)}`);
          if(name)name.replaceWith(button);else identity.append(button);
          button.addEventListener('click',()=>{
            close();const from=row.getBoundingClientRect();selected=row;opener=button;
            row.classList.add('bw-record-expanded');table.classList.add('bw-reading-record');back.hidden=false;button.setAttribute('aria-expanded','true');
            back.focus({preventScroll:true});area.scrollIntoView({block:'nearest',behavior:'instant'});expand(row,from);
          });
        });
      }
      decorate();new MutationObserver(()=>{if(selected&&!selected.isConnected)close();decorate();}).observe(table.querySelector('tbody'),{childList:true});
      area.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
      back.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
      const panel=table.closest('.bw-tab-panel');
      panel?.querySelectorAll('input[type="search"],input[type="text"]').forEach(input=>input.addEventListener('input',()=>close(false)));
      panel?.querySelectorAll('[data-accepted-filter],[data-filter]').forEach(button=>button.addEventListener('click',()=>close(false)));
      document.querySelectorAll('.bw-tab-btn').forEach(button=>button.addEventListener('click',()=>close(false)));
    });
    // Weekly reports become a one-document-at-a-time reader; no new report content.
    const reports=[...document.querySelectorAll('.training-report')];
    reports.forEach(report=>report.addEventListener('toggle',()=>{
      if(!report.open)return;
      reports.forEach(other=>{if(other!==report)other.open=false;});
      document.querySelectorAll('[data-training-week]').forEach(button=>button.setAttribute('aria-pressed',String(`training-week-${button.dataset.trainingWeek}`===report.id)));
      reveal(report.querySelector('.training-report-body'));
    }));
    // Observe existing detail renderers rather than replacing role-specific selection logic.
    let lastSource=null;
    document.addEventListener('click',event=>{
      const source=event.target.closest('[data-spotlight-review],.spotlight-name-button,.evaluation-student-button,.company-student-button,[data-listing-details],.company-meeting-actions button');
      if(source)lastSource=source.getBoundingClientRect();
    },true);
    document.querySelectorAll('#studentSpotlight,#companyWeeklyDetail,#supervisorReportDetail,.evaluation-detail,.evaluation-form-area,.listing-detail,#partnershipMapDetail').forEach(panel=>{
      let queued=false;
      new MutationObserver(()=>{
        if(queued)return;queued=true;
        requestAnimationFrame(()=>{queued=false;if(!panel.getClientRects().length)return;if(lastSource&&panel.id==='studentSpotlight')expand(panel,lastSource);else reveal(panel);});
      }).observe(panel,{attributes:true,attributeFilter:['hidden'],childList:true,subtree:true,characterData:true});
    });
    const weekSelect=document.getElementById('programWeekSelect');
    weekSelect?.addEventListener('change',()=>reveal(document.querySelector('#companyWeeklyDetail .weekly-report-context')));
    // Filtering keeps spatial continuity, animating only visible results and existing meters.
    let filterFrame=0;
    function filterMotion(event) {
      const control=event.target.closest('input[type="search"],input[type="text"],select,.bw-tag-btn,[data-filter],[data-training-filter],[data-accepted-filter],[data-listing-filter]');
      if(!control || control.closest('.bw-modal-backdrop,dialog'))return;
      const panel=control.closest('.bw-tab-panel');if(!panel)return;
      const items=[...panel.querySelectorAll('.bw-opp-card,tbody tr,.training-report,.company-meeting-row')];
      const before=new Map(items.filter(node=>node.getClientRects().length).map(node=>[node,node.getBoundingClientRect()]));
      cancelAnimationFrame(filterFrame);
      filterFrame=requestAnimationFrame(()=>{
        filterFrame=0;
        let index=0;
        items.filter(node=>node.getClientRects().length).forEach(node=>{
          const prior=before.get(node),next=node.getBoundingClientRect();
          if(prior) {const dy=prior.top-next.top;if(Math.abs(dy)>1)animate(node,[{transform:`translateY(${dy}px)`},{transform:'none'}],300);}
          else animate(node,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],280,Math.min(index++*35,140));
        });
      });
    }
    document.addEventListener('click',filterMotion,true);document.addEventListener('input',filterMotion,true);document.addEventListener('change',filterMotion,true);
    // Keep real values untouched: a brief vertical reveal signals updated metrics.
    document.querySelectorAll('.bw-kpi-value,.platform-metrics strong,.platform-totals dd').forEach(value=>{
      let previous=value.textContent;
      new MutationObserver(()=>{
        if(value.textContent===previous)return;
        previous=value.textContent;
        animate(value,[{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'none'}],300);
      }).observe(value,{childList:true,characterData:true,subtree:true});
    });
    document.querySelectorAll('.bw-progress-fill').forEach(meter=>{
      new MutationObserver(()=>animate(meter,[{opacity:.5,transform:'scaleX(.8)'},{opacity:1,transform:'none'}],380)).observe(meter,{attributes:true,attributeFilter:['style','data-style']});
    });
    document.querySelectorAll('.bw-tab-panel').forEach(panel=>{
      let active=panel.classList.contains('is-active');
      new MutationObserver(()=>{
        const next=panel.classList.contains('is-active');
        if(next&&!active){reveal(panel);panel.querySelectorAll('.bw-progress-fill,.training-completion progress,.bw-circular-progress').forEach(meter=>animate(meter,[{opacity:.45,transform:'scaleX(.7)'},{opacity:1,transform:'none'}],480));}
        active=next;
      }).observe(panel,{attributes:true,attributeFilter:['class']});
    });
  });
})();
