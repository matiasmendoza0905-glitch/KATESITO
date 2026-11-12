(()=>{const head=document.getElementById('kate-global-header');if(!head)return;
const track=head.querySelector('.kate-track'),menuButton=head.querySelector('.kate-menu-button'),panel=head.querySelector('.kate-menu-panel'),left=head.querySelector('[data-move="left"]'),right=head.querySelector('[data-move="right"]');
const active=track.querySelector('[aria-current="page"]');
// Desplazamiento por pestañas: cada pulsación revela la siguiente pestaña oculta.
const tabs=[...track.querySelectorAll('a[href]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxScroll=()=>Math.max(0,track.scrollWidth-track.clientWidth);
function update(){
 const max=maxScroll(),pos=track.scrollLeft;
 left.disabled=max<2||pos<=2;
 right.disabled=max<2||pos>=max-2;
 left.setAttribute('aria-label','Mostrar pestañas anteriores');
 right.setAttribute('aria-label','Mostrar pestañas siguientes');
}
function move(dir){
 const rect=track.getBoundingClientRect();
 const threshold=5;
 let target=null;
 if(dir>0){
  target=tabs.find(a=>a.getBoundingClientRect().right>rect.right+threshold);
 }else{
  target=[...tabs].reverse().find(a=>a.getBoundingClientRect().left<rect.left-threshold);
 }
 if(target){
  const tr=target.getBoundingClientRect();
  const targetLeft=dir>0 ? track.scrollLeft+tr.right-rect.right+18 : track.scrollLeft+tr.left-rect.left-18;
  const next=Math.max(0,Math.min(maxScroll(),targetLeft));
  track.scrollTo({left:next,behavior:reduced?'auto':'smooth'});
 }else{
  track.scrollTo({left:dir>0?maxScroll():0,behavior:reduced?'auto':'smooth'});
 }
 // Disabled state recalculated on scroll (and after smooth motion).
 requestAnimationFrame(update);
}
left.addEventListener('click',()=>move(-1));
right.addEventListener('click',()=>move(1));
track.addEventListener('scroll',update,{passive:true});
track.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&track.scrollWidth>track.clientWidth&&!(e.ctrlKey||e.metaKey)){e.preventDefault();track.scrollLeft+=e.deltaY;}},{passive:false});
track.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const links=[...track.querySelectorAll('a')];const i=links.indexOf(document.activeElement);if(i<0)return;const next=links[i+(e.key==='ArrowRight'?1:-1)];if(next){e.preventDefault();next.focus();next.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}});
addEventListener('resize',update,{passive:true});
function close(){panel.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false')}
menuButton.addEventListener('click',()=>{const open=panel.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!head.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(!(e.shiftKey&&['ArrowLeft','ArrowRight'].includes(e.key))||e.altKey||e.ctrlKey||e.metaKey)return;if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable)return;const dest=document.querySelector(e.key==='ArrowRight'?'.kate-page-switcher .kate-next':'.kate-page-switcher .kate-prev');if(dest){e.preventDefault();location.href=dest.href}});
requestAnimationFrame(()=>{if(active){const pos=active.getBoundingClientRect().left-track.getBoundingClientRect().left+track.scrollLeft-(track.clientWidth-active.offsetWidth)/2;track.scrollLeft=Math.max(0,Math.min(maxScroll(),pos))}update()});
})();