/* Enter the student workspace at its header, including restored file previews. */
(() => {
  'use strict';
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  const reset=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
  const startAtTop=()=>{reset();requestAnimationFrame(reset);};
  document.addEventListener('DOMContentLoaded',startAtTop,{once:true});
  window.addEventListener('pageshow',startAtTop);
})();
