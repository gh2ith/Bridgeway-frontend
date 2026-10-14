/* A visual companion to the existing eight scores, not a grading system. */
(() => {
  const labels=['Performance','Responsibility','Accuracy','Attendance','Teamwork','Adaptability','Learning','Curriculum'];
  const full=['Performance Level','Sense of Responsibility','Accuracy in Execution','Attendance & Punctuality','Teamwork & Collaboration','Adaptability & Flexibility','Speed of Learning','Curriculum Completion'];
  const ns='http://www.w3.org/2000/svg', charts=new WeakMap();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const point=(index,radius)=>{const angle=index*Math.PI/4-Math.PI/2;return [240+Math.cos(angle)*radius,210+Math.sin(angle)*radius];};
  function svgNode(tag,attributes={}) {const node=document.createElementNS(ns,tag);Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,value));return node;}
  function mount(host) {
    if(charts.has(host))return charts.get(host);
    const card=document.createElement('section');card.className='evaluation-radar';
    const heading=document.createElement('div');heading.className='evaluation-radar-heading';
    const title=document.createElement('h3');title.textContent='Evaluation at a glance';
    const state=document.createElement('span');state.className='evaluation-radar-state';
    heading.append(title,state);
    const svg=svgNode('svg',{viewBox:'0 0 480 420',preserveAspectRatio:'xMidYMid meet','aria-hidden':'true',focusable:'false'});
    for(let level=1;level<=5;level++) {
      svg.append(svgNode('polygon',{points:labels.map((_,i)=>point(i,level*23).join(',')).join(' '),class:'radar-grid'}));
      const marker=svgNode('text',{x:247,y:210-level*23+4,class:'radar-level'});marker.textContent=level;svg.append(marker);
    }
    labels.forEach((label,i)=>{
      const [x,y]=point(i,115);svg.append(svgNode('line',{x1:240,y1:210,x2:x,y2:y,class:'radar-axis'}));
      const [tx,ty]=point(i,156);const text=svgNode('text',{x:tx,y:ty+4,'text-anchor':i===0||i===4?'middle':i<4?'start':'end',class:'radar-label'});text.textContent=label;svg.append(text);
    });
    const shape=svgNode('polygon',{class:'radar-shape'});svg.append(shape);
    const dots=labels.map(()=>{const dot=svgNode('circle',{r:4,class:'radar-dot'});svg.append(dot);return dot;});
    const empty=svgNode('text',{x:240,y:225,'text-anchor':'middle',class:'radar-empty'});empty.textContent='Select ratings to begin';svg.append(empty);
    const note=document.createElement('p');note.className='evaluation-radar-note';
    const accessible=document.createElement('p');accessible.className='radar-accessible';
    card.append(heading,svg,note,accessible);host.append(card);
    let current=Array(8).fill(0),target=[...current],velocity=[...current],frame=0,previous=0;
    function draw() {
      shape.setAttribute('points',current.map((value,i)=>point(i,Math.max(0,Math.min(5,value))*23).join(',')).join(' '));
      dots.forEach((dot,i)=>{const [x,y]=point(i,Math.max(0,Math.min(5,current[i]))*23);dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.style.display=target[i]?'':'none';});
    }
    function settle() {cancelAnimationFrame(frame);frame=0;current=[...target];velocity.fill(0);draw();}
    function tick(time) {
      frame=0;
      if(reduced.matches || document.hidden || !card.getClientRects().length){settle();return;}
      const dt=Math.min(2,(time-previous)/16.67)||1;previous=time;
      let moving=false;
      for(let i=0;i<8;i++) {
        velocity[i]=(velocity[i]+(target[i]-current[i])*.14*dt)*Math.pow(.68,dt);
        current[i]+=velocity[i]*dt;
        if(Math.abs(target[i]-current[i])>.002 || Math.abs(velocity[i])>.002)moving=true;
      }
      draw();if(moving)frame=requestAnimationFrame(tick);else settle();
    }
    function update(values,{submitted=false}={}) {
      target=labels.map((_,i)=>Number.isFinite(values?.[i]) && values[i]>=1 && values[i]<=5?values[i]:0);
      const count=target.filter(Boolean).length;
      state.textContent=submitted?'Submitted':`${count} of 8 rated`;
      card.classList.toggle('is-complete',count===8);card.classList.toggle('is-empty',count===0);
      note.textContent=submitted?'Company-submitted scores · Each axis is rated out of 5.':count===8?'All eight criteria rated · Review the scores before submitting.':'Unrated criteria sit at the center. This assessment is incomplete.';
      accessible.textContent=full.map((name,i)=>`${name}: ${target[i]?`${target[i]} out of 5`:'not rated'}`).join('. ')+'.';
      empty.style.display=count?'none':'';
      if(reduced.matches || !card.getClientRects().length){settle();return;}
      if(!frame){previous=performance.now();frame=requestAnimationFrame(tick);}
    }
    reduced.addEventListener('change',()=>{if(reduced.matches)settle();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
    const chart={update};charts.set(host,chart);return chart;
  }
  window.BridgewayRadar={mount};
  document.addEventListener('DOMContentLoaded',()=>{
    const criteria=document.getElementById('rubricCriteriaContainer');
    const host=document.getElementById('companyEvaluationRadar');if(!criteria||!host)return;
    const chart=mount(host);
    const rows=[...criteria.querySelectorAll('.bw-rubric-rating-row')];
    rows.forEach((row,i)=>{
      row.setAttribute('role','group');row.setAttribute('aria-label',full[i]);
      const name=row.querySelector('.bw-rubric-criterion-name');name.textContent=name.textContent.replace(/^\d+\.\s*/,'');
      row.querySelectorAll('.bw-scale-btn').forEach(button=>{const rating=button.textContent.trim().replace(/^([1-5])(?=\D)/,'$1 ');button.title=rating;button.setAttribute('aria-label',`${full[i]}: ${rating}`);});
    });
    const sync=()=>chart.update(rows.map(row=>{row.querySelectorAll('.bw-scale-btn').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('is-active'))));const value=row.querySelector('.bw-scale-btn.is-active')?.dataset.val;return value?Number(value):null;}));
    new MutationObserver(sync).observe(criteria,{subtree:true,attributes:true,attributeFilter:['class']});sync();
  });
})();
