const LS_EXTRA='screenlist_extra',LS_PIN='screenlist_pin',DEFAULT_PIN='1234';
const SECTION_ORDER=['Movie','Series','Animation','Marvel','DC'];
const SECTION_LABEL={Movie:'Movies',Series:'Series',Animation:'Animation',Marvel:'Marvel',DC:'DC'};
const SECTION_BLURB={
  Movie:'Live-action films',
  Series:'TV shows & series',
  Animation:'Animated titles',
  Marvel:'Marvel universe',
  DC:'DC universe'
};
let actor='',allMovies=[],view='home';
const $=id=>document.getElementById(id);
function loadExtras(){try{return JSON.parse(localStorage.getItem(LS_EXTRA)||'[]')}catch(e){return[]}}
function saveExtras(list){localStorage.setItem(LS_EXTRA,JSON.stringify(list))}
function getPin(){return localStorage.getItem(LS_PIN)||DEFAULT_PIN}
function mergeMovies(){
  const extras=loadExtras().map(m=>({...m,_local:true}));
  const keys=new Set(MOVIES.map(m=>(m.title+'|'+(m.year||'')).toLowerCase()));
  allMovies=[...MOVIES,...extras.filter(m=>!keys.has((m.title+'|'+(m.year||'')).toLowerCase()))];
}
function yearKey(m){
  if(!m.year)return 'Unknown';
  const n=parseInt(String(m.year).slice(0,4),10);
  return isNaN(n)?'Unknown':String(n);
}
function sectionOf(m){
  const tags=(m.tags||[]).map(t=>String(t).toLowerCase());
  if(tags.includes('marvel')) return 'Marvel';
  if(tags.includes('dc')) return 'DC';
  if(m.type==='Animation') return 'Animation';
  if(m.type==='Series') return 'Series';
  return 'Movie';
}
function sectionCounts(){
  const by={Movie:0,Series:0,Animation:0,Marvel:0,DC:0};
  allMovies.forEach(m=>{by[sectionOf(m)]++});
  return by;
}
function showHome(){
  view='home';
  actor='';
  if($('q')) $('q').value='';
  if($('t')) $('t').value='';
  $('homeView').classList.remove('hidden');
  $('browseView').classList.add('hidden');
  $('subtitle').textContent='Pick a section to browse';
  renderHome();
  writeUrlParams();
}
function showBrowse(section){
  view='browse';
  if(section!==undefined) $('t').value=section||'';
  $('homeView').classList.add('hidden');
  $('browseView').classList.remove('hidden');
  const t=$('t').value;
  $('subtitle').textContent=t?(SECTION_LABEL[t]||t):'All titles';
  if(t) actor='';
  updateStats();
  renderChips();
  render();
}
function readUrlParams(){
  const p=new URLSearchParams(location.search);
  if(p.has('q')) $('q').value=p.get('q')||'';
  if(p.has('type')){
    const t=p.get('type')||'';
    if(['','Movie','Series','Animation','Marvel','DC'].includes(t)) $('t').value=t;
  }
  if(p.has('sort')){
    const s=p.get('sort');
    if(['section','year','az','new','old'].includes(s)) $('o').value=s;
  }
  if(p.has('actor')) actor=p.get('actor')||'';
  const hasBrowse=p.has('type')||p.has('q')||p.has('actor')||p.has('sort')||p.has('all');
  if(hasBrowse) showBrowse();
  else showHome();
}
function writeUrlParams(){
  const p=new URLSearchParams();
  if(view==='home'){
    const qs=p.toString();
    const url=qs?(location.pathname+'?'+qs):location.pathname;
    if(url!==location.pathname+location.search) history.replaceState(null,'',url);
    return;
  }
  const q=$('q').value.trim();const t=$('t').value;const o=$('o').value;
  if(q) p.set('q',q);if(t) p.set('type',t);if(o&&o!=='year') p.set('sort',o);if(actor) p.set('actor',actor);
  if(!q&&!t&&!actor&&(!o||o==='year')) p.set('all','1');
  const qs=p.toString();const url=qs?(location.pathname+'?'+qs):location.pathname;
  if(url!==location.pathname+location.search) history.replaceState(null,'',url);
}
function renderHome(){
  const by=sectionCounts();
  $('sectionList').innerHTML=SECTION_ORDER.map((key,i)=>{
    const n=String(i+1).padStart(2,'0');
    const count=by[key]||0;
    const blurb=SECTION_BLURB[key]||'';
    const pill=escapeHtml(blurb)+(count?' \u00b7 '+count:'');
    return '<button type="button" class="section-row" data-section="'+key+'">'+'<span class="section-num">'+n+'</span>'+'<span class="section-title">'+escapeHtml(SECTION_LABEL[key])+'</span>'+'<span class="section-pill">'+pill+'</span>'+'</button>';
  }).join('');
  document.querySelectorAll('.section-row').forEach(row=>{
    row.onclick=()=>showBrowse(row.dataset.section);
  });
}
function updateStats(){
  const el=$('stats');
  if(!el) return;
  const t=$('t').value;
  if(t){
    el.classList.add('hidden');
    el.innerHTML='';
    return;
  }
  el.classList.remove('hidden');
  const by=sectionCounts();
  const actorCounts={};
  allMovies.forEach(m=>(m.cast||[]).forEach(a=>{actorCounts[a]=(actorCounts[a]||0)+1}));
  const top=Object.entries(actorCounts).sort((a,b)=>b[1]-a[1])[0];
  const years=allMovies.map(yearKey).filter(y=>y!=='Unknown').map(Number).filter(n=>!isNaN(n));
  const yMin=years.length?Math.min(...years):'\u2014';
  const yMax=years.length?Math.max(...years):'\u2014';
  const range=yMin===yMax?yMin:(yMin+'\u2013'+yMax);
  const topName=top?top[0].split(' ')[0]:'\u2014';
  const topLabel=top?('Top: '+top[0]):'Top actor';
  el.innerHTML=
    '<div class="stat"><span class="stat-num">'+allMovies.length+'</span><span class="stat-label">Titles</span></div>'+
    '<div class="stat"><span class="stat-num">'+by.Movie+'</span><span class="stat-label">Movies</span></div>'+
    '<div class="stat"><span class="stat-num">'+by.Animation+'</span><span class="stat-label">Animation</span></div>'+
    '<div class="stat"><span class="stat-num">'+by.Series+'</span><span class="stat-label">Series</span></div>'+
    '<div class="stat"><span class="stat-num">'+by.Marvel+'</span><span class="stat-label">Marvel</span></div>'+
    '<div class="stat"><span class="stat-num">'+by.DC+'</span><span class="stat-label">DC</span></div>'+
    '<div class="stat"><span class="stat-num">'+topName+'</span><span class="stat-label">'+topLabel+'</span></div>'+
    '<div class="stat"><span class="stat-num">'+range+'</span><span class="stat-label">Years</span></div>';
}
function buildChips(){
  const counts={};
  const t=$('t').value;
  const pool=t?allMovies.filter(m=>sectionOf(m)===t):allMovies;
  pool.forEach(m=>(m.cast||[]).forEach(a=>{counts[a]=(counts[a]||0)+1}));
  return Object.entries(counts).filter(e=>e[1]>=2).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
}
function renderChips(){
  const el=$('chips');
  if(!el) return;
  const t=$('t').value;
  if(t){
    el.classList.add('hidden');
    el.innerHTML='';
    actor='';
    return;
  }
  el.classList.remove('hidden');
  const topActors=buildChips();
  el.innerHTML=['All',...topActors].map(a=>
    '<span class="chip '+((a==='All'?actor==='':a===actor)?'on':'')+'" data-a="'+a+'">'+a+'</span>'
  ).join('');
  document.querySelectorAll('.chip').forEach(c=>{
    c.onclick=()=>{actor=c.dataset.a==='All'?'':c.dataset.a;renderChips();render()}
  });
}
function escapeHtml(s){
  return String(s)
    .replace(/\u0026/g,'\u0026amp;')
    .replace(/\u003c/g,'\u0026lt;')
    .replace(/\u003e/g,'\u0026gt;')
    .replace(/\u0022/g,'\u0026quot;')
    .replace(/'/g,'\u0026#39;');
}
function posterBlock(m){
  if(m.poster){
    return '<img class="poster" src="'+escapeHtml(m.poster)+'" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><div class="poster-ph" style="display:none">'+(m.title?escapeHtml(m.title.charAt(0)):'?')+'</div>';
  }
  const letter=m.title?escapeHtml(m.title.charAt(0).toUpperCase()):'?';
  return '<div class="poster-ph">'+letter+'</div>';
}
function cardHTML(m){
  const year=m.year?'<span class="year">'+m.year+'</span>':'Year unknown';
  const cast=(m.cast&&m.cast.length)?'<div class="cast">'+m.cast.join(', ')+'</div>':'';
  const sec=sectionOf(m);
  let typeTag='';
  if(sec==='Series') typeTag='<span class="tag series">Series</span>';
  else if(sec==='Animation') typeTag='<span class="tag animation">Animation</span>';
  else if(sec==='Marvel') typeTag='<span class="tag marvel">Marvel</span>';
  else if(sec==='DC') typeTag='<span class="tag dc">DC</span>';
  const localTag=m._local?'<span class="tag local">Local</span>':'';
  const extraTags=(m.tags||[]).filter(x=>{
    const t=String(x).toLowerCase();
    return t!=='marvel'&&t!=='dc';
  }).map(x=>'<span class="tag">'+escapeHtml(x)+'</span>').join('');
  return '<article class="card">'+posterBlock(m)+'<div class="card-body"><h3>'+escapeHtml(m.title)+'</h3><div class="meta">'+year+'</div>'+cast+'<div class="tags">'+typeTag+localTag+extraTags+'</div></div></article>';
}
function bindGroupHeaders(){
  document.querySelectorAll('.year-header').forEach(h=>{
    h.onclick=()=>h.closest('.year-group').classList.toggle('collapsed');
  });
}
function renderGroups(groups, order, labelFn){
  $('g').innerHTML=order.filter(k=>groups[k]&&groups[k].length).map(k=>{
    const films=groups[k];
    films.sort((a,b)=>a.title.localeCompare(b.title));
    const label=labelFn(k);
    return '<div class="year-group"><div class="year-header"><div class="year-line"></div><span class="year-label">'+escapeHtml(label)+'</span><div class="year-line"></div><span class="year-count">'+films.length+' title'+(films.length!==1?'s':'')+'</span><svg class="year-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div><div class="movie-grid">'+films.map(cardHTML).join('')+'</div></div>';
  }).join('');
  bindGroupHeaders();
}
function render(){
  if(view!=='browse') return;
  const q=$('q').value.toLowerCase().trim(),t=$('t').value,o=$('o').value;
  $('subtitle').textContent=t?(SECTION_LABEL[t]||t):'All titles';
  let list=allMovies.filter(m=>{
    if(t&&sectionOf(m)!==t)return false;
    if(actor&&!(m.cast||[]).includes(actor))return false;
    if(q){const hay=(m.title+' '+(m.cast||[]).join(' ')).toLowerCase();if(!hay.includes(q))return false}
    return true;
  });
  if(o==='az')list.sort((a,b)=>a.title.localeCompare(b.title));
  else if(o==='new')list.sort((a,b)=>(parseInt(b.year)||0)-(parseInt(a.year)||0));
  else if(o==='old')list.sort((a,b)=>(parseInt(a.year)||9999)-(parseInt(b.year)||9999));
  const countEl=$('count');
  if(countEl){
    if(t){
      countEl.classList.add('hidden');
      countEl.textContent='';
    } else {
      countEl.classList.remove('hidden');
      countEl.textContent=list.length+' of '+allMovies.length+' titles';
    }
  }
  writeUrlParams();
  if(!list.length){
    $('g').innerHTML='<div class="empty"><svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg><h3>No matches</h3><p>Nothing fits that search or filter. Try another section or clear filters.</p><button type="button" class="btn" id="emptyClear">Clear filters</button></div>';
    const btn=$('emptyClear');if(btn)btn.onclick=()=>{$('q').value='';actor='';renderChips();render()};
    return;
  }
  if(o==='section'&&!t){
    const groups={};
    list.forEach(m=>{const s=sectionOf(m);if(!groups[s])groups[s]=[];groups[s].push(m)});
    renderGroups(groups,SECTION_ORDER,k=>SECTION_LABEL[k]||k);
  } else if(o==='year'){
    const groups={};
    list.forEach(m=>{const y=yearKey(m);if(!groups[y])groups[y]=[];groups[y].push(m)});
    const years=Object.keys(groups).sort((a,b)=>{if(a==='Unknown')return 1;if(b==='Unknown')return -1;return Number(b)-Number(a)});
    renderGroups(groups,years,k=>k);
  } else {
    $('g').innerHTML='<div class="movie-grid">'+list.map(cardHTML).join('')+'</div>';
  }
}
function openAdmin(){$('adminModal').classList.add('open');$('pinGate').style.display='block';$('adminForm').style.display='none';$('pinInput').value='';$('pinMsg').textContent='';$('pinInput').focus()}
function closeAdmin(){$('adminModal').classList.remove('open')}
function unlockAdmin(){
  if($('pinInput').value===getPin()){$('pinGate').style.display='none';$('adminForm').style.display='block';$('adminMsg').textContent='';}
  else{$('pinMsg').textContent='Wrong PIN';$('pinMsg').className='admin-msg err'}
}
function saveMovie(){
  const title=$('fTitle').value.trim();
  if(!title){$('adminMsg').textContent='Title is required';$('adminMsg').className='admin-msg err';return}
  const entry={title,year:$('fYear').value.trim(),type:$('fType').value,cast:$('fCast').value.split(',').map(s=>s.trim()).filter(Boolean),tags:$('fTags').value.split(',').map(s=>s.trim()).filter(Boolean)};
  const poster=$('fPoster').value.trim();if(poster) entry.poster=poster;
  const extras=loadExtras();extras.push(entry);saveExtras(extras);
  const newPin=$('fNewPin').value.trim();if(newPin)localStorage.setItem(LS_PIN,newPin);
  const omdbKey=$('fOmdb')&&$('fOmdb').value.trim();if(omdbKey&&typeof setOmdbKey==='function'){setOmdbKey(omdbKey);fetchPostersFromOmdb(allMovies,function(){if(view==='browse')render();});$('adminMsg').textContent='Loading posters\u2026';$('adminMsg').className='admin-msg ok';}
  if(!omdbKey){$('adminMsg').textContent='Saved locally';$('adminMsg').className='admin-msg ok';}
  $('fTitle').value='';$('fYear').value='';$('fCast').value='';$('fTags').value='';$('fPoster').value='';$('fNewPin').value='';
  mergeMovies();if(typeof applyPosterCache==='function')applyPosterCache(allMovies);
  if(view==='home') renderHome();
  else {updateStats();renderChips();render();}
}
function exportJSON(){
  const extras=loadExtras();
  if(!extras.length){$('adminMsg').textContent='No local titles yet';$('adminMsg').className='admin-msg err';return}
  const text=extras.map(m=>JSON.stringify(m,null,2)).join(',\n');
  navigator.clipboard.writeText(text).then(()=>{$('adminMsg').textContent='Copied \u2014 paste into movies.js';$('adminMsg').className='admin-msg ok'}).catch(()=>{console.log(text);$('adminMsg').textContent='See console';$('adminMsg').className='admin-msg err'});
}
$('adminBtn').onclick=openAdmin;
$('adminBtnHome').onclick=openAdmin;
$('browseAllBtn').onclick=()=>showBrowse('');
$('backHome').onclick=showHome;
$('pinCancel').onclick=closeAdmin;$('pinSubmit').onclick=unlockAdmin;
$('pinInput').onkeydown=e=>{if(e.key==='Enter')unlockAdmin()};
$('fClose').onclick=closeAdmin;$('fSave').onclick=saveMovie;$('fExport').onclick=exportJSON;
$('adminModal').addEventListener('click',e=>{if(e.target===$('adminModal'))closeAdmin()});
document.addEventListener('keydown',function(e){
  if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
    if(view==='browse'){e.preventDefault();$('q').focus();}
  }
  if(e.key==='Escape'&&view==='browse') showHome();
});
['q','t','o'].forEach(id=>$(id).addEventListener('input',()=>{
  if(id==='t'){actor='';updateStats();renderChips();}
  render();
}));
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});
}
mergeMovies();
if(typeof applyPosterCache==='function')applyPosterCache(allMovies);
readUrlParams();
if(typeof fetchPostersFromOmdb==='function'){fetchPostersFromOmdb(allMovies,function(){if(view==='browse')render();});}
