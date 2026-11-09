// Independent presentation layer: no provider requests or access to API keys.
function initTamimIntro(){
  const intro=document.getElementById('tamim-intro');
  if(!intro)return;
  document.documentElement.classList.add('tamim-intro-ready');
  const update=()=>document.documentElement.classList.toggle('tamim-intro-visible',intro.getBoundingClientRect().bottom>90);
  update();
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  intro.querySelectorAll('a[href="#top"]').forEach(link=>link.addEventListener('click',()=>{
    const target=document.getElementById('top');
    if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  }));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initTamimIntro,{once:true});
else initTamimIntro();
