(function(){
var sc=document.currentScript||document.querySelector('script[src*="search.js"]');var base=sc.src.replace(/search\.js.*$/,'');
var root=base.replace(/assets\/$/,'');
function norm(s){s=String(s||'').toLowerCase().replace(/[\u064b-\u0652\u0670\u0640]/g,'');return s.replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')}
var NAMES={poetry:'الشعر',myth:'الأساطير',history:'تاريخ الشعر',intensive:'النقد',analysis:'تحليل القصائد',grammar:'القواعد',tefl:'TEFL'};
var DATA=null,loading=false;
function load(cb){if(DATA)return cb();if(loading)return;loading=true;var s=document.createElement('script');s.src=base+'search-index.js';s.onload=function(){DATA=window.SEARCH_INDEX;DATA.L.forEach(function(l){l.nt=norm(l.t);l.nh=norm(l.h.join(' '));l.nb=norm(l.b)});DATA.G.forEach(function(g){g.n=norm(g.t+' '+g.a+' '+g.d)});cb()};s.onerror=function(){loading=false;box.innerHTML='<p class="sr-empty">البحث محتاج إنترنت أول مرة.</p>'};document.head.appendChild(s)}
function toks(q){return norm(q).split(/[^a-z0-9\u0600-\u06ff]+/).filter(function(w){return w.length>1}).map(function(w){return w.length>3&&w.indexOf('ال')===0?w.slice(2):w})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function snip(l,ts){var b=l.b,nb=l.nb,p=-1;for(var i=0;i<ts.length&&p<0;i++)p=nb.indexOf(ts[i]);if(p<0)return '';var a=Math.max(0,p-40);return (a?'… ':'')+esc(b.substr(a,110))+' …'}
function scopeK(){var f=location.pathname.split('/').pop()||'index.html',m=f.match(/^track-(.+)\.html$/);if(m)return m[1]==='mythology'?'myth':m[1];if(/^modules?-tefl/.test(f))return 'tefl';if(/\/lessons\//.test(location.pathname)){var id=f.replace('.html','');var l=DATA.L.filter(function(x){return x.id===id})[0];return l?l.k:null}return null}
function find(q){var ts=toks(q);if(!ts.length)return null;var out=[];var SK=scopeK();
DATA.L.forEach(function(l){if(SK&&l.k!==SK)return;var sc=0,hit=0;ts.forEach(function(t){var h=0;if(l.nt.indexOf(t)>-1){h+=10}if(l.nh.indexOf(t)>-1){h+=5}var bi=l.nb.indexOf(t);if(bi>-1){h+=2+(l.nb.indexOf(t,bi+1)>-1?1:0)}if(h)hit++;sc+=h});if(hit===ts.length)out.push({l:l,s:sc});else if(hit&&ts.length>1&&!out.length)out.push({l:l,s:sc*0.3})});
out.sort(function(a,b){return b.s-a.s});
var gl=DATA.G.filter(function(g){if(SK){var gl0=titleOf(g.l);if(!gl0||gl0.k!==SK)return false}return ts.every(function(t){return g.n.indexOf(t)>-1})}).slice(0,4);
return {ts:ts,res:out.slice(0,8),gl:gl}}
window.__sr={find:find,setData:function(d){DATA=d;DATA.L.forEach(function(l){l.nt=norm(l.t);l.nh=norm(l.h.join(" "));l.nb=norm(l.b)});DATA.G.forEach(function(g){g.n=norm(g.t+" "+g.a+" "+g.d)})}};
var box,inp,wrap;
function lessonUrl(id){return root+'lessons/'+id+'.html'}
function titleOf(id){var l=DATA.L.filter(function(x){return x.id===id})[0];return l}
function draw(){var q=inp.value.trim();if(!q){box.innerHTML='';box.style.display='none';return}box.style.display='block';if(!DATA){box.innerHTML='<p class="sr-empty">لحظة…</p>';load(draw);return}
var r=find(q);if(!r||(!r.res.length&&!r.gl.length)){box.innerHTML='<p class="sr-empty">مفيش نتيجة. جرّب كلمة تانية، بالعربي أو بالإنجليزي.</p>';return}
var h='';if(r.gl.length){h+='<div class="sr-h">مصطلحات</div>';r.gl.forEach(function(g){var l=titleOf(g.l);h+='<a class="sr-it sr-term" href="'+lessonUrl(g.l)+'"><b>'+esc(g.t)+'</b> <span>'+esc(g.a)+'</span><small>'+esc(g.d)+'</small></a>'});}
if(r.res.length){h+='<div class="sr-h">دروس</div>';r.res.slice(0,6).forEach(function(x){var l=x.l;h+='<a class="sr-it" href="'+lessonUrl(l.id)+'"><b>'+esc(l.t)+'</b><span class="sr-k">'+(NAMES[l.k]||'')+'</span><small class="sr-m">'+esc(l.m||'')+'</small><small>'+snip(l,r.ts)+'</small></a>'});
var seen={};r.res.slice(0,6).forEach(function(x){seen[x.l.id]=1});var rel=[];var SK2=scopeK();r.res[0].l.r.forEach(function(id){var tl=titleOf(id);if(!seen[id]&&rel.length<3&&(!SK2||(tl&&tl.k===SK2)))rel.push(id)});
if(rel.length){h+='<div class="sr-h">دروس مرتبطة بيها</div>';rel.forEach(function(id){var l=titleOf(id);if(l)h+='<a class="sr-it sr-rel" href="'+lessonUrl(id)+'"><b>'+esc(l.t)+'</b><span class="sr-k">'+(NAMES[l.k]||'')+'</span></a>'})}}
box.innerHTML=h}
var PH='دوّر على درس أو كلمة أو مصطلح';
function init(){var bar=document.querySelector('.topbar .wrap');if(!bar||document.getElementById('srbar'))return;
wrap=document.createElement('div');wrap.id='srbar';wrap.className='sr-wrap';wrap.innerHTML='<div class="sr-row"><span class="sr-ic em">🔎</span><input id="srq" type="search" autocomplete="off" placeholder="'+(PH)+'" aria-label="بحث"></div><div id="srbox" class="sr-box" style="display:none"></div>';
bar.parentNode.appendChild(wrap);inp=wrap.querySelector('#srq');box=wrap.querySelector('#srbox');
inp.addEventListener('focus',function(){load(function(){})});inp.addEventListener('input',draw);
document.addEventListener('click',function(e){if(!wrap.contains(e.target)){box.style.display='none'}else if(inp.value&&box.innerHTML)box.style.display='block'});
inp.addEventListener('keydown',function(e){if(e.key==='Escape'){inp.value='';draw()}if(e.key==='Enter'){var a=box.querySelector('a.sr-it');if(a)location.href=a.href}})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()})();
