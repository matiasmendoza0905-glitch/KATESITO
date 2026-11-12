/* Navegación interactiva Ka'téecito: compatible con páginas HTML locales y sin dependencias */
(()=>{
 'use strict';
 const header=document.getElementById('kate-global-header');
 if(!header)return;
 const track=header.querySelector('.kate-track');
 const pages=[...track.querySelectorAll('a[href]')].map((a,i)=>({title:a.textContent.trim().replace(/^\d+\s*/,''),href:a.getAttribute('href'),number:i+1}));
 const current=Math.max(0,pages.findIndex(x=>x.href===decodeURIComponent(location.pathname.split('/').pop()||'index.html')));
 const prev=pages[current-1],next=pages[current+1],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const styleButton=(name,body,disabled=false)=>`<button class="ki-${name}" type="button" ${disabled?'disabled':''}>${body}</button>`;
 const dock=document.createElement('aside');dock.className='ki-dock';dock.setAttribute('aria-label','Navegación rápida entre pestañas');
 dock.innerHTML=`<div class="ki-dock-main">${styleButton('prev','<span aria-hidden="true">←</span><span class="ki-long"> Anterior</span>',!prev)}<button class="ki-counter" type="button" aria-label="Abrir índice de secciones"><strong>${String(current+1).padStart(2,'0')} <small>/ ${pages.length}</small></strong><span>${escapeHTML(pages[current].title)}</span></button>${styleButton('next','<span class="ki-long">Siguiente </span><span aria-hidden="true">→</span>',!next)}<button class="ki-top" type="button" title="Volver al inicio de esta página" aria-label="Volver arriba">↑</button></div><div class="ki-page-progress"><span style="width:${((current+1)/pages.length*100).toFixed(3)}%"></span></div>`;
 document.body.appendChild(dock);
 const progress=document.createElement('div');progress.className='ki-scroll-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<span></span>';header.appendChild(progress);
 const go=(page)=>{if(page){document.documentElement.classList.add('ki-leaving');window.setTimeout(()=>{location.href=page.href},reduce?0:115)}};
 dock.querySelector('.ki-prev').addEventListener('click',()=>go(prev));
 dock.querySelector('.ki-next').addEventListener('click',()=>go(next));
 dock.querySelector('.ki-top').addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'instant':'smooth'}));
 function progressUpdate(){const range=document.documentElement.scrollHeight-innerHeight;const value=range>0?Math.min(100,Math.max(0,scrollY/range*100)):100;progress.firstElementChild.style.width=value+'%';dock.classList.toggle('ki-scrolled',scrollY>180)}
 addEventListener('scroll',progressUpdate,{passive:true});addEventListener('resize',progressUpdate,{passive:true});progressUpdate();
 const dialog=document.createElement('section');dialog.className='ki-picker';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Buscar secciones');dialog.hidden=true;
 dialog.innerHTML=`<div class="ki-picker-shade"></div><div class="ki-picker-box"><div class="ki-picker-heading"><div><strong>Explora Ka'téecito</strong><small>Busca y cambia de pestaña al instante</small></div><button type="button" class="ki-close" aria-label="Cerrar">✕</button></div><div class="ki-search-wrap"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input aria-label="Buscar una pestaña" type="search" placeholder="Ej.: identidad visual, auditoría…" autocomplete="off"></div><p class="ki-results-label">Todas las secciones</p><div class="ki-results" role="listbox" aria-label="Pestañas disponibles"></div><div class="ki-picker-help"><span>↑ ↓ para seleccionar · Enter para abrir</span><span>Esc para cerrar</span></div></div>`;
 document.body.appendChild(dialog);
 const input=dialog.querySelector('input'),results=dialog.querySelector('.ki-results');let selected=0,filtered=[];let previousFocus=null;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function render(){const q=normalize(input.value);filtered=pages.filter(x=>normalize(x.title).includes(q)||String(x.number)===q);selected=Math.min(selected,filtered.length-1);if(selected<0)selected=0;
  results.innerHTML=filtered.length?filtered.map((p,i)=>`<a role="option" aria-selected="${i===selected}" class="${p.number===current+1?'ki-current':''} ${i===selected?'ki-selected':''}" href="${escapeHTML(p.href)}"><span class="ki-result-num">${String(p.number).padStart(2,'0')}</span><span>${escapeHTML(p.title)}</span>${p.number===current+1?'<em>Actual</em>':''}<span class="ki-result-arrow">↗</span></a>`).join(''):'<p class="ki-none">No hay secciones con ese nombre.</p>';
 }
 function open(){previousFocus=document.activeElement;dialog.hidden=false;document.body.classList.add('ki-picker-open');selected=current;input.value='';render();input.focus();}
 function close(){dialog.hidden=true;document.body.classList.remove('ki-picker-open');previousFocus?.focus?.();}
 dock.querySelector('.ki-counter').addEventListener('click',open);
 const originalMenu=header.querySelector('.kate-menu-button');if(originalMenu){originalMenu.setAttribute('title','Mostrar todas las secciones. Atajo: Ctrl + K');}
 dialog.querySelector('.ki-close').addEventListener('click',close);dialog.querySelector('.ki-picker-shade').addEventListener('click',close);
 input.addEventListener('input',()=>{selected=0;render()});
 input.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(filtered.length){selected=(selected+(e.key==='ArrowDown'?1:-1)+filtered.length)%filtered.length;render();results.querySelector('.ki-selected')?.scrollIntoView({block:'nearest'})}}if(e.key==='Enter'&&filtered[selected]){e.preventDefault();go(filtered[selected])}});
 results.addEventListener('mousemove',e=>{const el=e.target.closest('a');if(!el)return;const idx=[...results.querySelectorAll('a')].indexOf(el);if(idx>=0&&idx!==selected){selected=idx;results.querySelectorAll('a').forEach((a,i)=>{a.classList.toggle('ki-selected',i===idx);a.setAttribute('aria-selected',i===idx?'true':'false')})}});
 dialog.addEventListener('click',e=>{if(e.target.closest('a[href]')){e.preventDefault();const target=pages.find(p=>p.href===e.target.closest('a').getAttribute('href'));go(target)}});
 document.addEventListener('keydown',e=>{
  const editable=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable;
  if(e.key==='Escape'&&!dialog.hidden){e.preventDefault();close();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.hidden?open():close();return}
  if(!dialog.hidden){if(e.key==='Tab'){const controls=[dialog.querySelector('.ki-close'),input,...results.querySelectorAll('a')].filter(Boolean);if(controls.length){const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}return}
  if(!editable&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.key==='/'){e.preventDefault();open()}
  if(!editable&&e.shiftKey&&!e.altKey&&!e.ctrlKey&&!e.metaKey){if(e.key==='ArrowLeft'&&prev){e.preventDefault();go(prev)}if(e.key==='ArrowRight'&&next){e.preventDefault();go(next)}}
 });
 // Deslizar desde el borde de la pantalla: no interfiere con carruseles, mapas ni deslizamiento habitual.
 let gesture=null;
 document.addEventListener('touchstart',e=>{if(!dialog.hidden||e.touches.length!==1)return;const t=e.touches[0];if(t.clientX>30&&t.clientX<innerWidth-30)return;if(e.target.closest('input,textarea,select,button,a,[data-no-page-swipe],.kate-track,.kate-local-sections'))return;gesture={x:t.clientX,y:t.clientY,time:Date.now()};},{passive:true});
 document.addEventListener('touchend',e=>{if(!gesture||e.changedTouches.length!==1)return;const t=e.changedTouches[0],dx=t.clientX-gesture.x,dy=t.clientY-gesture.y;if(Math.abs(dx)>85&&Math.abs(dy)<65&&Date.now()-gesture.time<850)go(dx<0?next:prev);gesture=null},{passive:true});
 // Botón de acceso directo a la búsqueda junto al menú actual.
 const searchBtn=document.createElement('button');searchBtn.type='button';searchBtn.className='ki-search-shortcut';searchBtn.title='Buscar secciones (Ctrl + K)';searchBtn.setAttribute('aria-label','Buscar una sección');searchBtn.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/></svg>';
 searchBtn.addEventListener('click',open);header.querySelector('.kate-nav-controls')?.appendChild(searchBtn);
 // La navegación superior puede moverse con la rueda en sentido horizontal.
 track.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(e.shiftKey){e.preventDefault();track.scrollLeft+=e.deltaY}},{passive:false});
 // Al tocar una sección, el menú mantiene los enlaces normales: también funciona sin JS.
})();
