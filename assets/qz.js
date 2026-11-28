(function(){
const PAGE=document.body.dataset.page, root=document.getElementById('qz'), BANK=window.BANK||[];
const DAY=864e5, byId={}; BANK.forEach(b=>byId[b.id]=b);
[window.MODTESTS,window.MODPRACT].forEach(m=>Object.keys(m||{}).forEach(k=>m[k].forEach(e=>e.items.forEach(b=>{ byId[b.id]=b; }))));
const EXAMS=window.EXAMS||[]; EXAMS.forEach(e=>(e.items||[]).forEach(b=>{ byId[b.id]=b; }));
function S(){ const s=state(); s.sr=s.sr||{}; s.exams=s.exams||{}; return s; }
function sv(s){ save(s); if(window.refreshHeader) refreshHeader(); }
function addXp(n){ const s=S(); s.xp+=n; sv(s); }
function srMiss(id){ const s=S(); s.sr[id]={st:0,due:Date.now()}; sv(s); }
function srRight(id){ const s=S(), r=s.sr[id]; if(!r) return; if(r.st===0){ s.sr[id]={st:1,due:Date.now()+7*DAY}; } else { delete s.sr[id]; s.srm=(s.srm||0)+1; } sv(s); }
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function prep(b){ const ms=Array.isArray(b.a); const ix=shuf(b.o.map((_,i)=>i)); if(b.o.length===2||b.type==='tf') ix.sort((x,y)=>x-y); return {b, ix, ms, a:ms?b.a.map(x=>ix.indexOf(x)).sort((x,y)=>x-y):ix.indexOf(b.a)}; }
function el(h){ root.innerHTML=h; window.scrollTo(0,0); }
const NAMES={tefl:'TEFL',tefl2:'TEFL',poetry:'الشعر',intensive:'المنهج النقدي',analysis:'تحليل القصائد',grammar:'القواعد',all:'كل الأسئلة',myth:'الأساطير',history:'تاريخ الشعر'};
let sfxOn=function(k){ };
function tone(f,t,d){ try{ const c=new (window.AudioContext||window.webkitAudioContext)(), o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.value=.12; o.connect(g); g.connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+d); }catch(e){} }
const snd={right(){ if(window.CHIP) CHIP.right(); }, wrong(){ if(window.CHIP) CHIP.wrong(); }};
function exT(b,i){ let e=(b.ex||[])[i]; if(e&&typeof e==='object') return (e.en?'<div dir="ltr" style="text-align:left;margin-bottom:4px">'+e.en+'</div>':'')+(e.ar?'<div>'+e.ar+'</div>':''); const en=(b.exe||[])[i], ar=(b.exa||[])[i]; if(en||ar) return (en?'<div dir="ltr" style="text-align:left;margin-bottom:4px">'+en+'</div>':'')+(ar?'<div>'+ar+'</div>':''); return e||''; }
function qLayers(b){ if(!b.qh&&!b.qs) return b.q; return (b.qh?'<div dir="ltr" style="text-align:left;font-weight:900">'+b.qh+'</div>':'')+(b.qs?'<div dir="ltr" style="text-align:left;font-size:.88em;color:#4a4a4a;margin-top:8px">'+b.qs+'</div>':'')+'<div style="font-size:.82em;color:#666;margin-top:8px;border-top:1px dashed #ddd;padding-top:8px">'+b.q+'</div>'; }
function optT(b,i){ const o=b.o[i]; return /^[\x00-\x7F]/.test(String(o).replace(/<[^>]*>/g,''))?'<span dir="ltr" style="display:block;text-align:left">'+o+'</span>':o; }
function qHtml(p,n,total,extra){ return '<div class="pl-top" style="display:flex;justify-content:space-between;font-weight:900;color:#666;margin:6px 0 14px"><span>'+n+' / '+total+'</span><span>'+(extra||'')+'</span></div><div class="pl-card"><div class="pl-q">'+qLayers(p.b)+'</div>'+p.ix.map((i,k)=>'<button class="pl-opt" data-k="'+k+'">'+optT(p.b,i)+'</button>').join('')+'<div id="qfb"></div></div>'; }
function fbHtml(p,k,ok){ const b=p.b, ch=p.ix[k];
  if(ok) return '<div class="pl-fb ok"><div style="font-weight:800">✅ صح!</div><div style="font-size:17px;margin:6px 0">'+exT(b,b.a)+'</div><button class="pl-next" id="qgo">كمّل</button></div>';
  return '<div class="pl-fb no"><div style="font-weight:800">❌ إجابتك مش صح</div><div style="font-size:17px;margin:6px 0">'+exT(b,ch)+'</div></div><div class="pl-fb ok"><div style="font-weight:800">✅ الإجابة الصح</div><div style="font-size:17px;margin:6px 0">'+exT(b,b.a)+'</div><div style="font-size:13px;color:#666">📘 الشرح من إعداد الموقع</div><button class="pl-next" id="qgo">فهمت، كمّل</button></div>'; }

function sameSet(a,b){ return a.length===b.length&&a.every((x,i)=>x===b[i]); }
function optReview(p,sel){ const A=p.ms?p.a:[p.a]; return p.ix.map((oi,k)=>{ const good=A.indexOf(k)>-1, ch=sel.indexOf(k)>-1; return '<div style="margin:8px 0;padding:8px 10px;border-radius:12px;background:'+(good?'rgba(88,204,2,.18)':ch?'rgba(255,75,75,.15)':'rgba(0,0,0,.04)')+'"><div style="font-weight:900">'+(good?'✅ ':'❌ ')+(ch?'(اخترت) ':'')+optT(p.b,oi)+'</div><div style="font-size:.85em;font-weight:700">'+exT(p.b,oi)+'</div></div>'; }).join(''); }
function askMs(p,cb){ const sel=new Set(); let lock=false; const fb=document.getElementById('qfb');
  root.querySelectorAll('.pl-opt').forEach(o=>o.onclick=()=>{ if(lock) return; const k=+o.dataset.k; if(sel.has(k)) sel.delete(k); else sel.add(k); o.classList.toggle('sel',sel.has(k)); });
  fb.innerHTML='<button class="pl-next" id="qok">تأكيد الإجابة</button>';
  document.getElementById('qok').onclick=()=>{ if(!sel.size){ alert('اختار إجابة واحدة على الأقل'); return; } lock=true; const s=[...sel].sort((x,y)=>x-y), ok=sameSet(s,p.a);
    root.querySelectorAll('.pl-opt').forEach(x=>{ const k=+x.dataset.k; x.disabled=true; x.classList.remove('sel'); if(p.a.indexOf(k)>-1) x.classList.add('right'); else if(sel.has(k)) x.classList.add('wrong'); });
    fb.innerHTML='<div class="pl-fb '+(ok?'ok':'no')+'"><div style="font-weight:800">'+(ok?'✅ صح!':'❌ مش مظبوط، الإجابة لازم تكون كل الصح بس')+'</div>'+optReview(p,s)+'<button class="pl-next" id="qgo">'+(ok?'كمّل':'فهمت، كمّل')+'</button></div>'; cb(ok); }; }
// ---- instant-feedback session (practice and review)
function session(list,mode,onEnd){
  const Q=list.map(prep); const N0=Q.length; let i=0, right=0, wrong=0;
  function show(){ if(i>=Q.length){ return onEnd({right,wrong,total:N0}); }
    const p=Q[i]; el(qHtml(p,Math.min(i+1,N0),N0,p.b.lt)); p.tries=p.tries||0;
    if(p.ms){ return askMs(p,ok=>{ if(ok){ if(!p.tries) right++; snd.right(); addXp(mode==='review'?5:(p.tries?0:2)); srRight(p.b.id); } else { wrong++; snd.wrong(); srMiss(p.b.id); if(p.tries<3){ p.tries++; Q.push(p); } } document.getElementById('qgo').onclick=()=>{ i++; show(); }; }); }
    let done=false; root.querySelectorAll('.pl-opt').forEach(o=>o.onclick=()=>{ if(done) return; done=true; const k=+o.dataset.k, ok=k===p.a;
      root.querySelectorAll('.pl-opt').forEach(x=>{ x.disabled=true; if(+x.dataset.k===p.a) x.classList.add('right'); }); if(!ok) o.classList.add('wrong');
      if(ok){ if(!p.tries) right++; snd.right(); addXp(mode==='review'?5:(p.tries?0:2)); srRight(p.b.id); } else { wrong++; snd.wrong(); srMiss(p.b.id); if(p.tries<3){ p.tries++; Q.push(p); } }
      document.getElementById('qfb').innerHTML=fbHtml(p,k,ok); document.getElementById('qgo').onclick=()=>{ i++; show(); }; }); }
  show(); }
// ---- timed mock exam
function exam(set,pool,full){ const n=full?pool.length:Math.min(20,pool.length), secs=n*45; const Q=shuf(pool).slice(0,n).map(prep), ans=new Array(n).fill(-1); let i=0, left=secs, tm=null;
  function fmt(t){ return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); }
  function show(){ const p=Q[i]; el(qHtml(p,i+1,n,'⏱ <span id="qt">'+fmt(left)+'</span>')+'<div style="display:flex;gap:10px;margin-top:14px"><button class="pl-next" id="qprev" style="background:#e5e5e5;color:#555;box-shadow:0 6px 0 #cfcfcf"'+(i?'':' disabled')+'>السابق</button>'+(i<n-1?'<button class="pl-next" id="qnx">التالي</button>':'<button class="pl-next" id="qfin" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">سلّم الامتحان</button>')+'</div>');
    root.querySelectorAll('.pl-opt').forEach(o=>{ if(+o.dataset.k===ans[i]) o.classList.add('right'); o.onclick=()=>{ ans[i]=+o.dataset.k; root.querySelectorAll('.pl-opt').forEach(x=>x.classList.toggle('right',+x.dataset.k===ans[i])); }; });
    const pv=document.getElementById('qprev'); if(pv) pv.onclick=()=>{ i--; show(); }; const nx=document.getElementById('qnx'); if(nx) nx.onclick=()=>{ i++; show(); };
    const fi=document.getElementById('qfin'); if(fi) fi.onclick=()=>{ const un=ans.filter(x=>x<0).length; if(un&&!confirm('فيه '+un+' سؤال من غير إجابة. تسلّم برضه؟')) return; finish(); }; }
  function finish(){ clearInterval(tm); const used=secs-left; let ok=0; const bad=[];
    Q.forEach((p,j)=>{ if(ans[j]===p.a) ok++; else { bad.push([p,ans[j]]); srMiss(p.b.id); } });
    const pct=Math.round(ok/n*100), s=S(); const r=s.exams[set]||{best:0,n:0,last:null,hist:[]}; r.n++; r.last=pct; r.best=Math.max(r.best,pct); r.hist=(r.hist||[]).concat([{t:Date.now(),pct,ok,n,used}]).slice(-20); s.exams[set]=r; s.xp+=20; sv(s);
    const msg=pct>=85?'ممتاز! 🎉':pct>=60?'كويس، كمّل 💪':'محتاج مراجعة، والأسئلة الغلط هتيجيلك في «المراجعة» 📚';
    el('<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(pct>=60?'#58cc02':'#ff4b4b')+'">'+pct+'%</div><h2>'+ok+' من '+n+' · '+fmt(used)+' دقيقة</h2><p>'+msg+'</p><p style="color:#666">أفضل نتيجة: '+r.best+'% · عدد المحاولات: '+r.n+' · +'+(ok*2)+' نقطة</p></div>'+
      (bad.length?'<h3 style="margin:18px 0 8px">الأسئلة اللي غلطت فيها:</h3>'+bad.map(([p,k])=>'<div class="plan-card" style="margin-bottom:12px"><div style="font-size:20px;font-weight:800;margin-bottom:8px">'+qLayers(p.b)+'</div>'+(k>=0?'<div class="pl-fb no" style="position:static;border-radius:14px;margin:6px 0"><b>إجابتك:</b> '+optT(p.b,p.ix[k])+'<div style="font-size:16px;margin-top:4px">'+(p.b.ex[p.ix[k]]||'')+'</div></div>':'<div style="color:#b30000;margin:6px 0">من غير إجابة</div>')+'<div class="pl-fb ok" style="position:static;border-radius:14px;margin:6px 0"><b>الصح:</b> '+optT(p.b,p.b.a)+'<div style="font-size:16px;margin-top:4px">'+(p.b.ex[p.b.a]||'')+'</div></div><div style="font-size:13px;color:#666">📘 الشرح من إعداد الموقع</div></div>').join(''):'<p style="text-align:center;font-weight:800">كل إجاباتك صح! 🌟</p>')+
      '<button class="pl-next" id="qagain">امتحان جديد</button><a class="pl-next" href="exam.html" style="text-align:center;text-decoration:none;margin-top:12px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6">رجوع للامتحانات</a>');
    document.getElementById('qagain').onclick=()=>exam(set,pool,full); }
  tm=setInterval(()=>{ left--; const t=document.getElementById('qt'); if(t) t.textContent=fmt(Math.max(left,0)); if(left<=0){ clearInterval(tm); alert('انتهى الوقت'); finish(); } },1000);
  show(); }
function practiceList(k){ const d=due(), inP=d.filter(b=>k==='all'||b.c===k), ids={}; inP.forEach(b=>ids[b.id]=1); return shuf(inP).concat(shuf(pool(k)).filter(b=>!ids[b.id])); }
function pool(set){ return set==='all'?BANK:BANK.filter(b=>b.c===set); }
function examHome(){ const s=S(); const sets=SITE.sets;
  let h='<div class="lesson-head"><div class="emoji"><span class="em">📝</span></div><h1>الامتحانات</h1><p style="color:var(--ink-soft)">تدريب بتصحيح فوري وشرح لكل إجابة، أو امتحان تجريبي بوقت. نتيجتك بتتحفظ.</p></div>';
  sets.forEach(k=>{ const n=pool(k).length, r=s.exams[k]; const en=Math.min(20,n);
    h+='<div class="plan-card" style="margin-bottom:14px"><h2 style="margin:0 0 6px">'+NAMES[k]+'</h2><p style="color:#666;margin:0 0 12px">'+n+' سؤال'+(r?' · آخر نتيجة '+r.last+'% · أفضل '+r.best+'%':'')+'</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="pl-next" style="flex:1;min-width:140px" data-m="p" data-k="'+k+'">تدريب</button><button class="pl-next" style="flex:1;min-width:140px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6" data-m="e" data-k="'+k+'">امتحان تجريبي · '+en+' سؤال · '+Math.round(en*45/60)+' دقيقة</button></div></div>'; });
  h+='<div class="plan-card" style="margin-bottom:14px;opacity:.7"><h2 style="margin:0 0 6px">الأساطير وتاريخ الشعر</h2><p style="color:#666;margin:0">أسئلتهم المستقلة بتتضاف قريباً.</p></div><p style="text-align:center"><a href="review.html" style="font-weight:900;color:#0b6fa8">📚 المراجعة المتباعدة</a></p>';
  if(EXAMS.length) h='<a class="pl-next" href="exams.html" style="display:block;text-align:center;text-decoration:none;margin-bottom:16px;background:#ce82ff;box-shadow:0 6px 0 #a560d1">🧪 امتحانات الدروس والوحدات والكورسات</a>'+h;
  el(h); root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; if(b.dataset.m==='p') session(practiceList(k),'practice',r=>end(r,k)); else exam(k,pool(k)); }); }
function end(r,k){ el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🎯</div><h2>خلصت التدريب: '+r.right+' من '+r.total+'</h2><p style="color:#666">الأسئلة اللي غلطت فيها بتتحط في «المراجعة» فوراً، وتقدر تراجعها دلوقتي.</p></div><a class="pl-next" href="exam.html" style="text-align:center;text-decoration:none">رجوع</a>'); }

// ---- fixed exams: several models per lesson / unit / course
const SCOPES={lesson:'امتحان درس',unit:'امتحان وحدة',course:'امتحان كورس'};
function esc2(t){ return String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function examsHome(){ const s=S(); const tracks={}; EXAMS.forEach(e=>{ (tracks[e.track]=tracks[e.track]||[]).push(e); });
  let h='<div class="lesson-head"><div class="emoji"><span class="em">🧪</span></div><h1>امتحانات محددة</h1><p style="color:var(--ink-soft)">امتحانات بوقت وبأسئلة ثابتة، على مستوى الدرس أو الوحدة أو الكورس، وفي كل مستوى أكتر من نموذج. أسئلتك الغلط بتروح «المراجعة» فوراً.</p></div>';
  if(!EXAMS.length) h+='<div class="plan-card" style="text-align:center;color:#666">الامتحانات بتتضاف قريباً.</div>';
  Object.keys(tracks).forEach(t=>{ h+='<h2 style="margin:22px 0 10px">'+(NAMES[t]||t)+'</h2>';
    ['lesson','unit','course'].forEach(sc=>{ const L=tracks[t].filter(e=>e.scope===sc); if(!L.length) return;
      h+='<h3 style="margin:14px 0 8px;color:#666">'+SCOPES[sc]+'</h3>';
      L.forEach(e=>{ const r=s.exams[e.id]; const m=e.minutes||Math.ceil(e.items.length*0.75);
        h+='<div class="plan-card" style="margin-bottom:12px"><h3 style="margin:0 0 4px">'+esc2(e.title||e.id)+(e.model?' · نموذج '+esc2(e.model):'')+'</h3><p style="color:#666;margin:0 0 10px">'+e.items.length+' سؤال · '+m+' دقيقة · النجاح '+(e.pass_percent||60)+'%'+(r?' · آخر نتيجة '+r.last+'% · أفضل '+r.best+'%':'')+'</p><button class="pl-next" data-ex="'+esc2(e.id)+'">ابدأ</button>'+(e.pdf?' <a href="'+e.pdf+'" target="_blank" rel="noopener" style="font-weight:900;color:#0b6fa8;margin-right:14px">📄 نسخة PDF للطباعة</a>':'')+'</div>'; }); }); });
  h+='<p style="text-align:center;margin-top:16px"><a href="exam.html" style="font-weight:900;color:#0b6fa8">📝 تدريب وامتحان عشوائي</a></p>';
  el(h); root.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>fixedExam(EXAMS.filter(e=>e.id===b.dataset.ex)[0])); }
function fixedExam(e){ const n=e.items.length, secs=(e.minutes||Math.ceil(n*0.75))*60, pass=e.pass_percent||60; const Q=e.items.map(prep), ans=new Array(n).fill(-1); let i=0,left=secs,tm=null;
  function fmt(t){ return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); }
  function show(){ const p=Q[i]; el(qHtml(p,i+1,n,'⏱ <span id="qt">'+fmt(left)+'</span>')+'<div style="display:flex;gap:10px;margin-top:14px"><button class="pl-next" id="qprev" style="background:#e5e5e5;color:#555;box-shadow:0 6px 0 #cfcfcf"'+(i?'':' disabled')+'>السابق</button>'+(i<n-1?'<button class="pl-next" id="qnx">التالي</button>':'<button class="pl-next" id="qfin">تسليم</button>')+'</div>');
    root.querySelectorAll('.pl-opt').forEach(o=>{ if(+o.dataset.k===ans[i]) o.classList.add('right'); o.onclick=()=>{ ans[i]=+o.dataset.k; root.querySelectorAll('.pl-opt').forEach(x=>x.classList.toggle('right',+x.dataset.k===ans[i])); }; });
    const pv=document.getElementById('qprev'); if(pv) pv.onclick=()=>{ i--; show(); }; const nx=document.getElementById('qnx'); if(nx) nx.onclick=()=>{ i++; show(); };
    const fi=document.getElementById('qfin'); if(fi) fi.onclick=()=>{ const un=ans.filter(x=>x<0).length; if(un&&!confirm('فيه '+un+' سؤال من غير إجابة. تسلّم برضه؟')) return; finish(); }; }
  function finish(){ clearInterval(tm); const used=secs-left; let ok=0; const bad=[];
    Q.forEach((p,j)=>{ if(ans[j]===p.a) ok++; else { bad.push([p,ans[j]]); srMiss(p.b.id); } });
    const pct=Math.round(ok/n*100), s=S(); const r=s.exams[e.id]||{best:0,n:0,last:null,hist:[]}; r.n++; r.last=pct; r.best=Math.max(r.best,pct); r.hist=(r.hist||[]).concat([{t:Date.now(),pct,ok,n,used}]).slice(-20); s.exams[e.id]=r; s.xp+=20; sv(s);
    const passed=pct>=pass;
    el('<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(passed?'#58cc02':'#ff4b4b')+'">'+pct+'%</div><h2>'+(passed?'نجحت 🎉':'لسه محتاج مراجعة 📚')+'</h2><p>'+ok+' من '+n+' · '+fmt(used)+' دقيقة · حد النجاح '+pass+'%</p><p style="color:#666">أفضل نتيجة: '+r.best+'% · المحاولات: '+r.n+' · +'+(ok*2)+' نقطة</p></div>'+
      (bad.length?'<h3 style="margin:18px 0 8px">الأسئلة اللي غلطت فيها:</h3>'+bad.map(([p,k])=>'<div class="plan-card" style="margin-bottom:12px"><div style="font-size:20px;font-weight:800;margin-bottom:8px">'+qLayers(p.b)+'</div>'+(k>=0?'<div class="pl-fb no" style="position:static;border-radius:14px;margin:6px 0"><b>إجابتك:</b> '+optT(p.b,p.ix[k])+'<div style="font-size:16px;margin-top:4px">'+exT(p.b,p.ix[k])+'</div></div>':'<div class="pl-fb no" style="position:static;border-radius:14px;margin:6px 0">من غير إجابة</div>')+'<div class="pl-fb ok" style="position:static;border-radius:14px;margin:6px 0"><b>الصح:</b> '+optT(p.b,p.b.a)+'<div style="font-size:16px;margin-top:4px">'+exT(p.b,p.b.a)+'</div></div>'+(p.b.l?'<a href="lessons/'+p.b.l+'.html" style="font-weight:900;color:#0b6fa8">راجع الدرس</a>':'')+'</div>').join(''):'')+
      '<button class="pl-next" id="qagain">نموذج تاني من نفس الامتحان</button><a class="pl-next" href="exams.html" style="text-align:center;text-decoration:none;margin-top:12px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6">رجوع للامتحانات</a>');
    document.getElementById('qagain').onclick=()=>fixedExam(e); }
  tm=setInterval(()=>{ left--; const t=document.getElementById('qt'); if(t) t.textContent=fmt(Math.max(left,0)); if(left<=0){ clearInterval(tm); alert('انتهى الوقت'); finish(); } },1000);
  show(); }
// ---- spaced review
function due(){ const s=S(), t=Date.now(); return Object.keys(s.sr).filter(id=>byId[id]&&s.sr[id].due<=t).map(id=>byId[id]); }
function reviewHome(){ const s=S(), d=due(), all=Object.keys(s.sr).filter(id=>byId[id]); const later=all.length-d.length; const nxt=all.filter(id=>s.sr[id].due>Date.now()).map(id=>s.sr[id].due).sort()[0];
  let h='<div class="lesson-head"><div class="emoji"><span class="em">📚</span></div><h1>المراجعة</h1><p style="color:var(--ink-soft)">أي سؤال تغلط فيه بيتحط هنا فوراً، وبيتكرر لحد ما تجاوبه صح. بعد كده بيرجعلك بعد أسبوع، لحد ما تثبت معلومتها.</p></div>';
  h+='<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(d.length?'#ff9600':'#58cc02')+'">'+d.length+'</div><h2>'+(d.length?'سؤال جاهز للمراجعة دلوقتي':'مفيش مراجعة مستحقة دلوقتي ✅')+'</h2><p style="color:#666">'+(later?later+' سؤال تاني مستني موعده'+(nxt?' (أقرب واحد: '+new Date(nxt).toLocaleString('ar-EG',{weekday:'long',hour:'numeric',minute:'2-digit'})+')':''):'')+'</p><p style="color:#666">ثبّتّ حتى الآن: '+(s.srm||0)+' سؤال</p>'+(d.length?'<button class="pl-next" id="qgo0">ابدأ المراجعة</button>':'<a class="pl-next" href="exam.html" style="display:block;text-decoration:none">تدريب على الأسئلة</a>')+'</div>';
  el(h); const g=document.getElementById('qgo0'); if(g) g.onclick=()=>session(shuf(d),'review',r=>{ el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🌟</div><h2>خلصت المراجعة: '+r.right+' من '+r.total+'</h2><p style="color:#666">اللي غلطت فيه هتلاقيه في المراجعة فوراً، واللي صح هيرجعلك بعد أسبوع.</p></div><a class="pl-next" href="review.html" style="text-align:center;text-decoration:none">تمام</a>'); }); }

// ---- module mode: exam.html?m=<module id>&k=p (practice) | t (module test) | e (module exam)
function moduleMode(){
  const q=new URLSearchParams(location.search), mid=q.get('m'), k=q.get('k')||'p', M=(window.MODULES||[]).find(x=>x.id===mid);
  if(!M) return examHome();
  const back='<a class="pl-next" href="module-'+M.id+'.html" style="display:block;text-align:center;text-decoration:none;margin-top:14px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6">← رجوع للموديول</a>';
  const lp=BANK.filter(b=>(M.lessons||[]).indexOf(b.l)>-1);
  const soon=(t)=>el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">⏳</div><h2>'+t+'</h2><p style="color:#666">لسه بيتجهّز، وهيظهر هنا أول ما يجهز.</p></div>'+back);
  if(k==='p'){ const ps=(window.MODPRACT||{})[mid]; if(ps&&ps.length){ const E=ps[Math.floor(Math.random()*ps.length)]; session(shuf(E.items),'practice',r=>el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🎯</div><h2>خلصت التدريب: '+r.right+' من '+r.total+'</h2><p style="color:#666">الأسئلة اللي غلطت فيها بتتحط في «المراجعة» فوراً.</p></div><button class="pl-next" id="qagain">تدريب تاني</button>'+back)); setTimeout(()=>{const a=document.getElementById('qagain'); if(a) a.onclick=()=>location.reload();},0); return; } if(!lp.length) return soon('التدريب'); session(shuf(lp),'practice',r=>el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🎯</div><h2>خلصت التدريب: '+r.right+' من '+r.total+'</h2><p style="color:#666">الأسئلة اللي غلطت فيها بتتحط في «المراجعة» فوراً.</p></div>'+back)); return; }
  const src=(k==='t'?window.MODTESTS:window.MODEXAMS)||{}, sets=src[mid]||[];
  if(!sets.length) return soon(k==='t'?'اختبار الموديول':'امتحان الموديول');
  modTest(sets,(k==='t'?'mod:':'modx:')+mid,back); }
function modTest(sets,key,back){ const E=sets[Math.floor(Math.random()*sets.length)], pass=70, n=E.items.length, Q=E.items.map(prep), ans=Q.map(p=>p.ms?[]:-1); let i=0;
  function show(){ const p=Q[i]; el(qHtml(p,i+1,n,E.model?'نموذج '+E.model:'')+(p.ms?'<div style="color:#666;font-weight:700;margin-top:6px">اختار كل الإجابات الصح</div>':'')+'<div style="display:flex;gap:10px;margin-top:14px"><button class="pl-next" id="qprev" style="background:#e5e5e5;color:#555;box-shadow:0 6px 0 #cfcfcf"'+(i?'':' disabled')+'>السابق</button>'+(i<n-1?'<button class="pl-next" id="qnx">التالي</button>':'<button class="pl-next" id="qfin" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">سلّم الاختبار</button>')+'</div>');
    root.querySelectorAll('.pl-opt').forEach(o=>{ const k=+o.dataset.k, on=p.ms?ans[i].indexOf(k)>-1:ans[i]===k; if(on) o.classList.add(p.ms?'sel':'right'); o.onclick=()=>{ if(p.ms){ const s=new Set(ans[i]); if(s.has(k)) s.delete(k); else s.add(k); ans[i]=[...s].sort((x,y)=>x-y); o.classList.toggle('sel',s.has(k)); } else { ans[i]=k; root.querySelectorAll('.pl-opt').forEach(x=>x.classList.toggle('right',+x.dataset.k===k)); } }; });
    const pv=document.getElementById('qprev'); if(pv) pv.onclick=()=>{ i--; show(); }; const nx=document.getElementById('qnx'); if(nx) nx.onclick=()=>{ i++; show(); };
    const fi=document.getElementById('qfin'); if(fi) fi.onclick=()=>{ const un=ans.filter(x=>Array.isArray(x)?!x.length:x<0).length; if(un&&!confirm('فيه '+un+' سؤال من غير إجابة. تسلّم برضه؟')) return; finish(); }; }
  function finish(){ let ok=0; const bad=[]; Q.forEach((p,j)=>{ const g=p.ms?sameSet(ans[j],p.a):ans[j]===p.a; if(g) ok++; else { bad.push([p,p.ms?ans[j]:(ans[j]>=0?[ans[j]]:[])]); srMiss(p.b.id); } });
    const pct=Math.round(ok/n*100), s=S(), r=s.exams[key]||{best:0,n:0,last:null,hist:[]}; r.n++; r.last=pct; r.best=Math.max(r.best,pct); r.hist=(r.hist||[]).concat([{t:Date.now(),pct,ok,n}]).slice(-20); s.exams[key]=r; s.xp+=20; sv(s); const passed=pct>=pass;
    el('<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(passed?'#58cc02':'#ff4b4b')+'">'+pct+'%</div><h2>'+(passed?'نجحت 🎉':'لسه محتاج مراجعة 📚')+'</h2><p>'+ok+' من '+n+' · حد النجاح '+pass+'%</p><p style="color:#666">أفضل نتيجة: '+r.best+'% · المحاولات: '+r.n+' · +'+(ok*2)+' نقطة</p></div>'+
      (bad.length?'<h3 style="margin:18px 0 8px">الأسئلة اللي غلطت فيها (وبتتحط في «المراجعة»):</h3>'+bad.map(([p,sl])=>'<div class="plan-card" style="margin-bottom:12px"><div style="font-size:20px;font-weight:800;margin-bottom:8px">'+qLayers(p.b)+'</div>'+(sl.length?'':'<div style="color:#b30000;font-weight:800">من غير إجابة</div>')+optReview(p,sl)+(p.b.l?'<a href="lessons/'+p.b.l+'.html" style="font-weight:900;color:#0b6fa8">راجع الدرس</a>':'')+'</div>').join(''):'<p style="text-align:center;font-weight:800">كل إجاباتك صح! 🌟</p>')+
      '<button class="pl-next" id="qagain">نموذج تاني</button>'+back); document.getElementById('qagain').onclick=()=>modTest(sets,key,back); }
  show(); }
window.addEventListener('DOMContentLoaded',()=>{ if(PAGE==='exam') { if(location.search.indexOf('m=')>-1) moduleMode(); else examHome(); } else if(PAGE==='exams') examsHome(); else reviewHome(); });
})();
