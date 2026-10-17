/* One visibility policy per assigned supervisor. Report review state is separate. */
(() => {
  'use strict';
  function initialize(state,students){
    if(!state.reportVisibility||typeof state.reportVisibility!=='object'||Array.isArray(state.reportVisibility))state.reportVisibility={};
    for(const s of students){
      if(!s.supervisor||typeof state.reportVisibility[s.supervisor]==='boolean')continue;
      // Preserve privacy when migrating mixed per-week locks: any hidden report
      // starts the supervisor-wide policy in restricted mode.
      state.reportVisibility[s.supervisor]=students.filter(p=>p.supervisor===s.supervisor).some(p=>(state.plans[p.id]||[]).some(w=>w.locked));
    }
  }
  function restricted(state,students,id){
    const supervisor=students.find(s=>s.id===id)?.supervisor;
    if(supervisor&&typeof state.reportVisibility?.[supervisor]==='boolean')return state.reportVisibility[supervisor];
    return (state.plans[id]||[]).some(w=>w.locked);
  }
  function set(state,supervisor,value){
    if(typeof supervisor!=='string'||!supervisor||typeof value!=='boolean')return false;
    state.reportVisibility ||= {};state.reportVisibility[supervisor]=value;return true;
  }
  window.BridgewayReportVisibility={initialize,restricted,set};
})();
