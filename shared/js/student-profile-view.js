/* Keep profile editing inside the student workspace's existing header. */
(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{
    const main=document.querySelector('.bw-main-content');
    const panel=document.createElement('section');panel.id='tab-profile';panel.className='bw-tab-panel student-profile-studio';panel.setAttribute('aria-label','Student profile');main.insertBefore(panel,main.querySelector('.cycle-preview'));
    let loading=null;
    async function load(){
      panel.replaceChildren(window.BridgewayStudentProfileContent());
      window.BridgewayMountStudentProfile(panel,{embedded:true});
      const cancel=panel.querySelector('.profile-cancel');
      cancel.href='#tab-opportunities';cancel.addEventListener('click',event=>{event.preventDefault();window.switchTab('tab-opportunities');history.replaceState(null,'','#tab-opportunities');});
    }
    window.BridgewayOpenStudentProfile=async(focusCV=false)=>{
      window.switchTab('tab-profile');
      document.querySelector('.studio-account').open=false;
      if(!location.hash.startsWith('#tab-profile'))history.pushState(null,'','#tab-profile');
      if(!loading){panel.textContent='Opening your profile…';loading=load().catch(()=>{loading=null;panel.replaceChildren();const text=document.createElement('p');text.textContent='Your profile could not be opened. Please try again.';const retry=document.createElement('button');retry.type='button';retry.className='cycle-button';retry.textContent='Try again';retry.addEventListener('click',()=>window.BridgewayOpenStudentProfile(focusCV));panel.append(text,retry);});}
      await loading;
      if(!panel.classList.contains('is-active'))return;
      document.querySelector('.studio-account-menu .studio-profile')?.setAttribute('aria-current','page');
      if(focusCV)panel.querySelector('#student-cv')?.scrollIntoView({block:'center'});
      else window.scrollTo({top:0,behavior:'instant'});
    };
    const route=()=>{if(location.hash==='#tab-profile'||location.hash==='#tab-profile-cv')window.BridgewayOpenStudentProfile(location.hash==='#tab-profile-cv');};
    window.addEventListener('hashchange',route);window.addEventListener('popstate',route);route();
    new MutationObserver(()=>{if(!panel.classList.contains('is-active'))document.querySelector('.studio-account-menu .studio-profile')?.removeAttribute('aria-current');}).observe(panel,{attributes:true,attributeFilter:['class']});
  });
})();
