(function(){

const MICBAR='<div class="pl-mic" id="plmicbar"><button type="button" class="pl-micb" id="plmic">🎤 اكتب بصوتك</button><button type="button" class="pl-micb" id="pllang">عربي</button><button type="button" class="pl-micb" id="plrec">⏺ سجّل صوتك</button><span class="pl-micst" id="plmst"></span><div id="plaudio"></div></div>';
let _sr=null,_mr=null,_stream=null,_lang='ar-EG',_act=false;
function _st(t){ const e=document.getElementById('plmst'); if(e) e.textContent=t||''; }
function _db(cb){ try{ const r=indexedDB.open('adab-rec',1); r.onupgradeneeded=()=>r.result.createObjectStore('r'); r.onsuccess=()=>cb(r.result); r.onerror=()=>cb(null); }catch(e){ cb(null); } }
function _saveRec(key,blob){ _db(d=>{ if(!d) return; try{ d.transaction('r','readwrite').objectStore('r').put(blob,key); }catch(e){} }); }
function _loadRec(key,cb){ _db(d=>{ if(!d) return cb(null); try{ const q=d.transaction('r').objectStore('r').get(key); q.onsuccess=()=>cb(q.result||null); q.onerror=()=>cb(null); }catch(e){ cb(null); } }); }
function _showAudio(blob){ const box=document.getElementById('plaudio'); if(!box) return; box.innerHTML=''; const a=document.createElement('audio'); a.controls=true; a.src=URL.createObjectURL(blob); a.style.cssText='width:100%;margin-top:8px'; box.appendChild(a); }
function micStop(){ _act=false; try{ _sr&&_sr.stop(); }catch(e){} _sr=null; try{ if(_mr&&_mr.state!=='inactive') _mr.stop(); }catch(e){} _mr=null; if(_stream){ _stream.getTracks().forEach(t=>t.stop()); _stream=null; } const m=document.getElementById('plmic'), r=document.getElementById('plrec'); if(m){ m.textContent='🎤 اكتب بصوتك'; m.classList.remove('on'); } if(r){ r.textContent='⏺ سجّل صوتك'; r.classList.remove('on'); } }
function micInit(key){ const bar=document.getElementById('plmicbar'); if(!bar) return; const ta=document.getElementById('plw');
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; const mic=document.getElementById('plmic'), lang=document.getElementById('pllang'), rec=document.getElementById('plrec');
  if(!SR) { mic.style.display='none'; lang.style.display='none'; }
  if(!(navigator.mediaDevices&&window.MediaRecorder)) rec.style.display='none';
  _loadRec(key,b=>{ if(b) _showAudio(b); });
  lang.onclick=()=>{ _lang=_lang==='ar-EG'?'en-US':'ar-EG'; lang.textContent=_lang==='ar-EG'?'عربي':'English'; if(_act){ micStop(); } };
  mic.onclick=()=>{ if(_act){ micStop(); _st(''); return; } micStop(); if(ta.readOnly) return; _act=true; mic.textContent='⏹ وقّف'; mic.classList.add('on'); _st('بيسمعك… اتكلم'); let base=ta.value;
    const go=()=>{ if(!_act) return; const r=new SR(); _sr=r; r.lang=_lang; r.interimResults=true; r.continuous=false; let fin='';
      r.onresult=e=>{ let t=''; for(let i=e.resultIndex;i<e.results.length;i++){ t+=e.results[i][0].transcript; if(e.results[i].isFinal){ fin+=e.results[i][0].transcript+' '; } } ta.value=(base+(base&&!/\s$/.test(base)?' ':'')+(fin||t)).trim(); };
      r.onend=()=>{ base=ta.value; if(_act) setTimeout(go,150); };
      r.onerror=e=>{ if(e.error==='not-allowed'||e.error==='service-not-allowed'){ _st('الميكروفون مش مسموح. فعّله من إعدادات المتصفح.'); micStop(); } else if(e.error==='network'){ _st('الكتابة بالصوت محتاجة إنترنت.'); micStop(); } };
      try{ r.start(); }catch(e){} }; go(); };
  rec.onclick=async()=>{ if(_mr&&_mr.state==='recording'){ micStop(); return; } micStop(); if(ta.readOnly&&false) return;
    try{ _stream=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ _st('الميكروفون مش مسموح.'); return; }
    const chunks=[]; _mr=new MediaRecorder(_stream); _mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    const mr=_mr; mr.onstop=()=>{ const b=new Blob(chunks,{type:mr.mimeType||'audio/webm'}); if(b.size){ _saveRec(key,b); _showAudio(b); _st('اتحفظ التسجيل على جهازك.'); } };
    mr.start(); rec.textContent='⏹ وقّف التسجيل'; rec.classList.add('on'); _st('بيسجّل…'); }; }
const root=document.getElementById('player'); if(!root||!window.STEPS) return;
const S=window.STEPS.filter(s=>!s.hide), LID=window.LESSON_ID, M=window.AUDIO_MANIFEST||{audio:{},pdf:{}};
function st(){ const s=state(); s.steps=s.steps||{}; s.sx=s.sx||{}; s.combo=s.combo||0; return s; }
function sv(s){ save(s); refreshHeader(); }
let idx=Math.min((st().steps[LID]||0),S.length-1); if(idx>=S.length-1) idx=0; // finished lessons restart
const QC=new URLSearchParams(location.search).get('card'); const PEEK=QC!==null&&/^\d+$/.test(QC); if(PEEK) idx=Math.min(+QC,S.length-1);
let gained=0, back=false, missed=[], reviewed=false;
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function burst(el){ if(RM||!el) return; const r=el.getBoundingClientRect(); const cols=['#58cc02','#1cb0f6','#ffc800','#ff4b4b','#ce82ff']; for(let i=0;i<16;i++){ const p=document.createElement('i'); p.className='pl-cf'; p.style.left=(r.left+r.width/2)+'px'; p.style.top=(r.top+r.height/2+scrollY)+'px'; p.style.background=cols[i%5]; const a=Math.random()*Math.PI*2, d=50+Math.random()*70; p.style.setProperty('--dx',Math.cos(a)*d+'px'); p.style.setProperty('--dy',(Math.sin(a)*d-30)+'px'); document.body.appendChild(p); setTimeout(()=>p.remove(),1000); } }
function xp(n,label){ const s=st(); s.xp+=n; gained+=n; sv(s); sfx('xp'); const d=document.createElement('div'); d.className='pl-xp'; d.textContent='+'+n+(label?' '+label:''); document.body.appendChild(d); setTimeout(()=>d.remove(),1150); }
function once(k,n,label){ const s=st(); if(s.sx[k]) return; s.sx[k]=1; sv(s); xp(n,label); }
// ---- sound: shared <audio> element (unlocked by the first tap) + WebAudio sfx
const A=new Audio(); A.preload='auto';
let unlocked=false, speed=1;
function soundOn(){ return st().mute!==true; }
function stopAudio(){ A.onplay=A.onpause=A.onended=A.ontimeupdate=A.onerror=null; stopWA(); try{A.pause()}catch(e){} document.querySelectorAll('.pl-card.playing').forEach(c=>c.classList.remove('playing')); }
let ctx=null;
function ac(){ if(!ctx){ try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){} } if(ctx&&ctx.state==='suspended') ctx.resume(); return ctx; }
function tone(f,t0,d,type,vol){ const c=ac(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,c.currentTime+t0);
  g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.exponentialRampToValueAtTime(vol||0.18,c.currentTime+t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+d);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+d+0.05); }
function bell(f,t0,d,vol){ tone(f,t0,d,'sine',vol); tone(f*2,t0,d*0.7,'sine',(vol||0.18)*0.45); tone(f*3,t0,d*0.4,'triangle',(vol||0.18)*0.18); }
const SFX={
  click(){ tone(520,0,0.05,'triangle',0.10); tone(780,0.03,0.06,'triangle',0.08); },
  right(){ bell(784,0,0.22,0.2); bell(1047,0.09,0.22,0.2); bell(1568,0.19,0.5,0.2); },
  wrong(){ tone(196,0,0.16,'triangle',0.2); tone(147,0.12,0.34,'triangle',0.2); tone(98,0.12,0.34,'sine',0.14); },
  combo(n){ const base=[784,880,988,1047,1175,1319]; const k=Math.min(n,8)-3; const f0=523*Math.pow(1.122,k);
    [0,4,7,12].forEach((st_,i)=>bell(f0*Math.pow(2,st_/12),i*0.07,0.3,0.18)); bell(f0*2*1.5,0.34,0.6,0.16); },
  done(){ const seq=[[523,0],[659,0.12],[784,0.24],[1047,0.36]]; seq.forEach(([f,t])=>bell(f,t,0.28,0.2)); [523,659,784,1047].forEach(f=>bell(f,0.6,0.9,0.14)); bell(1568,0.75,1.0,0.14); bell(2093,0.9,1.0,0.1); },
  xp(){ tone(1175,0,0.05,'square',0.05); tone(1568,0.05,0.09,'square',0.05); }
};
function sfx(n,a){ if(!soundOn()||st().nosfx===true) return; try{ if(window.CHIP&&CHIP[n]) CHIP[n](a); else SFX[n](a) }catch(e){} }
try{ if(window.CHIP) CHIP.voice=function(){ return !A.paused } }catch(e){}
const blobs={}, bufs={};
function rawUrl(id){ return M.audio[id]; }
function toBytes(u){ const m=u.match(/^data:([^;,]+)?(;base64)?,(.*)$/s); const bin=atob(m[3]); const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return {a,mime:m[1]||'audio/mpeg'}; }
function clipUrl(id){ const v=rawUrl(id);
  if(/^data:/.test(v)){ if(!blobs[id]){ try{ const r=toBytes(v); blobs[id]=URL.createObjectURL(new Blob([r.a],{type:r.mime})); }catch(e){ blobs[id]=v; } } return blobs[id]; }
  return '../audio/'+v; }
function hasClip(id){ return id && M.audio && M.audio[id]; }
let cur=null; // WebAudio fallback source
function stopWA(){ if(cur){ try{cur.stop()}catch(e){} cur=null; } }
function showErr(card,msg){ if(!card) return; card.classList.remove('playing'); let e=card.querySelector('.pl-err'); if(!e){ e=document.createElement('div'); e.className='pl-err'; const ab=card.querySelector('.pl-audio'); (ab&&ab.parentNode)?ab.parentNode.insertBefore(e,ab.nextSibling):card.insertBefore(e,card.firstChild); } e.innerHTML=msg; }
function clearErr(card){ const e=card&&card.querySelector('.pl-err'); if(e) e.remove(); }
function playWA(id,card){ // fallback: decode with WebAudio
  const c=ac(); if(!c) { showErr(card,'🔇 المتصفح ده مش بيشغّل الصوت. جرّب تفتح الملف في Chrome.'); return; }
  const go=buf=>{ stopWA(); const src=c.createBufferSource(); src.buffer=buf; src.playbackRate.value=speed; src.connect(c.destination); src.onended=()=>{ if(card) card.classList.remove('playing'); }; src.start(0); cur=src; if(card) card.classList.add('playing'); clearErr(card); };
  if(bufs[id]) return go(bufs[id]);
  try{ const r=/^data:/.test(rawUrl(id))?toBytes(rawUrl(id)).a.buffer:null;
    const dec=r?Promise.resolve(r):fetch(clipUrl(id)).then(x=>x.arrayBuffer());
    dec.then(ab=>new Promise((ok,no)=>c.decodeAudioData(ab,ok,no))).then(buf=>{ bufs[id]=buf; go(buf); }).catch(er=>showErr(card,'🔇 الصوت ما اشتغلش على الجهاز ده ('+(er&&er.name||'decode')+'). جرّب Chrome أو اضغط ▶ تاني.'));
  }catch(er){ showErr(card,'🔇 الصوت ما اشتغلش ('+er.message+')'); }
}
function playClip(id,card){
  if(!soundOn()||!hasClip(id)) return;
  stopWA();
  A.onplay=A.onpause=A.onended=A.ontimeupdate=A.onerror=null;
  const btn=card&&card.querySelector('.pl-play'); let failed=false;
  A.src=clipUrl(id); A._id=id; A.playbackRate=speed;
  A.onplay=()=>{ clearErr(card); if(card) card.classList.add('playing'); if(btn) btn.textContent='⏸'; };
  A.onpause=()=>{ if(card) card.classList.remove('playing'); if(btn) btn.textContent='▶'; };
  A.onended=()=>{ if(card) card.classList.remove('playing'); if(btn) btn.textContent='▶'; };
  A.ontimeupdate=()=>uiTime(card); A.onloadedmetadata=()=>uiTime(card); A.ondurationchange=()=>uiTime(card);
  A.onerror=()=>{ if(failed) return; failed=true; playWA(id,card); };
  const pr=A.play();
  if(pr&&pr.catch) pr.catch(er=>{
    if(er&&er.name==='NotAllowedError'){ showErr(card,'🎧 اضغط ▶ عشان الصوت يشتغل (المتصفح بيمنع التشغيل التلقائي قبل أول ضغطة).'); const bb=card&&card.querySelector('.pl-play'); if(bb) bb.classList.add('pulse'); unlocked=false; }
    else if(!failed){ failed=true; playWA(id,card); }
  });
}
function audioBox(id){
  if(!hasClip(id)) return '';
  return '<div class="pl-audio pl-yt"><div class="pl-row"><button class="pl-skip" data-d="-3" aria-label="رجوع ٣ ثواني">⏪ 3</button><button class="pl-play" aria-label="تشغيل">▶</button><button class="pl-skip" data-d="3" aria-label="تقدّم ٣ ثواني">3 ⏩</button><span class="pl-spds">'+[0.5,0.8,1,2].map(v=>'<button class="pl-spd'+(speed===v?' on':'')+'" data-s="'+v+'">'+v+'×</button>').join('')+'</span><button class="pl-ar" aria-label="روح للنص العربي">عربي ⬇</button></div><div class="pl-seekrow"><span class="pl-t pl-cur">0:00</span><div class="pl-wave pl-track" role="slider" aria-label="شريط الصوت" tabindex="0"><i></i><b class="pl-knob"></b></div><span class="pl-t pl-dur">--:--</span></div></div>';
}
function fmtT(t){ if(!isFinite(t)||t<0) return '--:--'; t=Math.floor(t); return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); }
function uiTime(card){ if(!card) return; const id=card._aid; const live=A._id===id&&A.duration&&isFinite(A.duration); const d=live?A.duration:(card._dur||0); const c=live?A.currentTime:0;
  const bar=card.querySelector('.pl-wave i'), kn=card.querySelector('.pl-knob'), ce=card.querySelector('.pl-cur'), de=card.querySelector('.pl-dur'); const p=d?Math.min(100,c/d*100):0;
  if(bar) bar.style.width=p+'%'; if(kn) kn.style.left=p+'%'; if(ce) ce.textContent=fmtT(c); if(de) de.textContent=d?fmtT(d):'--:--'; }
function seekTo(card,id,t){ const live=A._id===id&&A.src;
  if(live){ try{ A.currentTime=Math.max(0,Math.min(t,(A.duration&&isFinite(A.duration))?A.duration-0.05:t)); }catch(e){} uiTime(card); }
  else { playClip(id,card); A.addEventListener('loadedmetadata',function(){ try{ A.currentTime=Math.max(0,t); }catch(e){} },{once:true}); } }
function arTarget(card){ const box=card.querySelector('.pl-text'); if(!box) return null;
  const sel='.u,.lead,.li,p,li,div'; const all=[...box.querySelectorAll(sel)].filter(e=>!e.querySelector(sel)&&e.textContent.trim().length>2);
  const isAr=e=>{ const t=e.textContent; const a=(t.match(/[\u0600-\u06FF]/g)||[]).length, l=(t.match(/[A-Za-z]/g)||[]).length; return a>l; };
  let seenEn=false; for(const e of all){ if(!isAr(e)) seenEn=true; else if(seenEn) return e; } return null; }
const AR_RE=/[\u0600-\u06FF]/g, EN_RE=/[A-Za-z]/g;
function leafBlocks(box){ const sel='.u,.lead,.li,p,li,div'; return [...box.querySelectorAll(sel)].filter(e=>!e.querySelector(sel)&&e.textContent.trim().length>2); }
function blockLang(e){ const t=e.textContent; const a=(t.match(AR_RE)||[]).length, l=(t.match(EN_RE)||[]).length; return a>l?'ar':'en'; }
function setupTabs(card){ const box=card&&card.querySelector('.pl-text'); if(!box||card.querySelector('.pl-tabs')) return;
  const bl=leafBlocks(box); bl.forEach(e=>e.dataset.l=blockLang(e)); const hasAr=bl.some(e=>e.dataset.l==='ar'), hasEn=bl.some(e=>e.dataset.l==='en'); if(!(hasAr&&hasEn)) return;
  const bar=document.createElement('div'); bar.className='pl-tabs'; bar.innerHTML='<button type="button" class="pl-tab" data-l="en">English</button><button type="button" class="pl-tab" data-l="ar">عربي</button>';
  box.parentNode.insertBefore(bar,box);
  const apply=l=>{ bl.forEach(e=>e.classList.toggle('pl-hid',e.dataset.l!==l)); bar.querySelectorAll('.pl-tab').forEach(b=>b.classList.toggle('on',b.dataset.l===l)); };
  let init=(()=>{ try{ return localStorage.getItem('pltab'); }catch(e){ return null; } })(); if(init!=='ar'&&init!=='en') init=bl[0].dataset.l;
  apply(init);
  bar.querySelectorAll('.pl-tab').forEach(b=>{ b.onclick=()=>{ apply(b.dataset.l); try{ localStorage.setItem('pltab',b.dataset.l); }catch(e){} langSeek(card,b.dataset.l); }; }); }
/*pl-lm*/ let LM=null; try{ const sc=[...document.scripts].find(x=>/player\.js/.test(x.src)); const u=sc?sc.src.replace(/player\.js.*$/,'langmap.json'):'../assets/langmap.json'; fetch(u).then(r=>r.ok?r.json():null).then(j=>{ LM=j; }).catch(()=>{}); }catch(e){}
function langSeek(card,l){ try{ const id=card._aid; const e=LM&&LM[id]; if(!e) return; const t=(l===e[0])?0:e[1]; unlocked=true; seekTo(card,id,t); }catch(x){} }
function wireAudio(card,id){
  const b=card.querySelector('.pl-play'); if(!b) return; const card0=card; card._aid=id;
  try{ const pd=new Audio(); pd.preload='metadata'; pd.src=clipUrl(id); pd.onloadedmetadata=()=>{ if(isFinite(pd.duration)){ card._dur=pd.duration; uiTime(card); } }; }catch(e){}
  card.querySelectorAll('.pl-skip').forEach(k=>{ k.onclick=()=>{ unlocked=true; const base=(A._id===id)?A.currentTime:0; seekTo(card,id,base+(+k.dataset.d)); }; });
  const arb=card.querySelector('.pl-ar'); const tg=arTarget(card);
  if(arb){ if(!tg) arb.style.display='none'; else arb.onclick=()=>{ const tb=card.querySelector('.pl-tab[data-l="ar"]'); if(tb) tb.click(); const tx=card.querySelector('.pl-tabs')||tg; tx.scrollIntoView({behavior:'smooth',block:'center'}); tg.classList.add('pl-flash'); setTimeout(()=>tg.classList.remove('pl-flash'),1600); }; }
  const tr=card.querySelector('.pl-track');
  if(tr){ let drag=false; const at=ev=>{ const r=tr.getBoundingClientRect(); const p=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)); const d=(A._id===id&&A.duration&&isFinite(A.duration))?A.duration:(card._dur||0); if(!d) return; unlocked=true; seekTo(card,id,p*d); };
    tr.onpointerdown=ev=>{ drag=true; try{ tr.setPointerCapture(ev.pointerId); }catch(e){} at(ev); ev.preventDefault(); };
    tr.onpointermove=ev=>{ if(drag) at(ev); }; tr.onpointerup=tr.onpointercancel=()=>{ drag=false; };
    tr.onkeydown=ev=>{ if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){ const base=(A._id===id)?A.currentTime:0; seekTo(card,id,base+(ev.key==='ArrowRight'?5:-5)); ev.preventDefault(); } }; }
  card.querySelectorAll('.pl-spd').forEach(sp=>{ sp.onclick=()=>{ speed=+sp.dataset.s; A.playbackRate=speed; card.querySelectorAll('.pl-spd').forEach(x=>x.classList.toggle('on',+x.dataset.s===speed)); }; });
  b.onclick=()=>{ unlocked=true; ac(); if((!A.paused&&!A.ended&&A._id===id)||cur){ stopWA(); A.pause(); if(card0) card0.classList.remove('playing'); b.textContent='▶'; } else { const s0=st(); if(s0.mute){ s0.mute=false; save(s0); } playClip(id,card); } };
  // preload next clips (warm the cache)
  let n=0; for(let j=idx+1;j<S.length&&n<2;j++){ if(hasClip(S[j].a)){ if(!/^data:/.test(M.audio[S[j].a])){ const p=new Audio(clipUrl(S[j].a)); p.preload='auto'; } else clipUrl(S[j].a); n++; } }
}
function esc(t){ return t; }

function review(){
  stopAudio(); const queue=missed.slice(); let qi=0;
  function one(){
    if(qi>=queue.length){ reviewed=true; missed=[]; sfx('done'); render(); scrollTo(0,0); return; }
    const o=queue[qi]; let opts, ans, idxs0=[0,1,2,3];
    if(o.t==='tf'){ opts=['صح ✅','غلط ❌']; ans=o.ans?0:1; }
    else { const idxs=o.opts.map((_,i)=>i); for(let i=idxs.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [idxs[i],idxs[j]]=[idxs[j],idxs[i]]; } opts=idxs.map(i=>o.opts[i]); ans=idxs.indexOf(o.ans); idxs0=idxs; }
    let h='<div class="pl-top"><div class="pl-bar"><i style="width:'+Math.round(qi/queue.length*100)+'%"></i></div><div class="pl-count">'+(qi+1)+' / '+queue.length+'</div></div>';
    h+='<div class="pl-card" id="plc"><div class="big">🔁</div><h2 style="margin:0 0 6px">مراجعة الأخطاء</h2><div class="pl-hint" style="color:#666;margin-bottom:10px">الأسئلة اللي غلطت فيها، حلّها صح قبل ما تخلّص.</div><div class="pl-q">'+o.q+'</div>';
    opts.forEach((t,k)=>{ h+='<button class="pl-opt" data-k="'+k+'">'+t+'</button>'; });
    h+='<div id="plfb"></div></div>';
    root.innerHTML=h;
    root.querySelectorAll('.pl-opt').forEach(b=>b.onclick=()=>{
      const k=+b.dataset.k, fb=document.getElementById('plfb'); unlocked=true; ac();
      if(k===ans){ b.classList.add('right'); sfx('right'); burst(b); const q=st(); const key=LID+':rv:'+S.indexOf(o); if(!q.sx[key]){ q.sx[key]=1; save(q); xp(3); }
        fb.innerHTML='<div class="pl-fb ok">✅ صح! '+(o.why?'<div style="font-size:17px;font-weight:600;margin-top:4px">'+o.why+'</div>':'')+'<button class="pl-next" id="plgo">كمّل</button></div>';
        document.getElementById('plgo').onclick=()=>{ sfx('click'); qi++; one(); scrollTo(0,0); };
      } else { sfx('wrong'); b.classList.add('wrong'); const oix=(o.t==='tf'?k:idxs0[k]); fb.innerHTML='<div class="pl-fb no">❌ لأ، '+((o.ex&&o.ex[oix])?o.ex[oix]:'جرّب تاني')+'</div>'; setTimeout(()=>{b.classList.remove('wrong');b.style.opacity=.45;b.disabled=true;},420); }
    });
  }
  one(); scrollTo(0,0);
}
function wireBar(){ const bar=document.querySelector('.pl-top .pl-bar'), cnt=document.querySelector('.pl-top .pl-count'); if(!bar||!cnt||S.length<2) return; const fill=bar.querySelector('i'); let drag=false, tgt=idx;
  const pos=ev=>{ const e=document.elementFromPoint(ev.clientX,ev.clientY); const sg=e&&e.closest&&e.closest('.pl-seg'); if(sg&&bar.contains(sg)) return segs.indexOf(sg); let best=tgt,bd=1e9; segs.forEach((x,k)=>{ const r=x.getBoundingClientRect(); const d=Math.hypot(ev.clientX-(r.left+r.width/2),ev.clientY-(r.top+r.height/2)); if(d<bd){ bd=d; best=k; } }); return best; };
  const N=S.length, K=N; bar.classList.add('pl-segs'); let hh=''; for(let k=0;k<K;k++) hh+='<b class="pl-seg"><span class="pl-num">'+(k+1)+'</span></b>'; bar.innerHTML=hh; const segs=[...bar.children];
  const paint=n=>{ segs.forEach((e,k)=>{ e.className='pl-seg'+(k<n?' done':(k===n?' cur':'')); }); const c=segs[n]; if(c&&bar.scrollHeight>bar.clientHeight){ bar.scrollTop=Math.max(0,c.offsetTop-bar.clientHeight/2+c.offsetHeight/2); } };
  const show=n=>{ tgt=n; paint(n); cnt.textContent=(n+1)+' / '+S.length; }; paint(idx);
  const go=n=>{ if(n===idx) return; idx=n; back=false; render(); scrollTo(0,0); };
  bar.setAttribute('role','slider'); bar.tabIndex=0; bar.setAttribute('aria-label','انتقل لكارت');
  bar.onpointerdown=ev=>{ drag=true; try{ bar.setPointerCapture(ev.pointerId); }catch(e){} show(pos(ev)); ev.preventDefault(); };
  bar.onpointermove=ev=>{ if(drag) show(pos(ev)); };
  bar.onpointerup=ev=>{ if(!drag) return; drag=false; go(pos(ev)); };
  bar.onpointercancel=()=>{ drag=false; show(idx); };
  bar.onkeydown=ev=>{ const d=(ev.key==='ArrowRight'||ev.key==='ArrowUp')?1:(ev.key==='ArrowLeft'||ev.key==='ArrowDown')?-1:0; if(d){ go(Math.max(0,Math.min(S.length-1,idx+d))); ev.preventDefault(); } };
  cnt.style.cursor='pointer'; cnt.onclick=()=>{ const v=prompt('اكتب رقم الكارت (1 - '+S.length+')',idx+1); const n=parseInt(String(v||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)),10); if(n>=1&&n<=S.length) go(n-1); };
}
function render(){ render0(); try{ addRev(); }catch(e){} try{ wireBar(); }catch(e){} }
function addRev(){ const cur=S[idx]; if(cur&&cur.t==='learn'&&idx>0&&document.getElementById('plc')){ const r=document.createElement('button'); r.className='pl-btn2'; r.type='button'; r.id='plrestart'; r.style.cssText='margin:10px auto 0;display:block'; r.textContent='🔁 أعيد الدرس من الأول'; r.onclick=()=>{ idx=0; back=false; render(); window.scrollTo(0,0); }; document.getElementById('plc').appendChild(r); return; } if(!cur||['mc','tf','recall','write'].indexOf(cur.t)<0||!document.getElementById('plc')) return;
  const b=document.createElement('button'); b.className='pl-btn2'; b.id='plrev'; b.type='button'; b.style.cssText='margin:10px auto 0;display:block'; b.textContent='📖 ارجع لنص الدرس';
  const host=document.getElementById('plc'); host.appendChild(b);
  b.onclick=()=>{ if(document.getElementById('plrevbox')) return; const o=document.createElement('div'); o.id='plrevbox'; o.setAttribute('role','dialog'); o.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center';
    let body=''; for(let i=0;i<idx;i++){ const x=S[i]; if(x.t==='section') body+='<h3 style="margin:16px 0 6px;color:#58a700">'+x.h.replace(/^(<span class="em">.*?<\/span>\s*)+/,'')+'</h3>'; else if(x.t==='learn') body+='<div class="pl-text" style="margin:0 0 12px;padding:10px 12px;border:1px solid #e5e5e5;border-radius:14px">'+x.h+'</div>'; }
    o.innerHTML='<div style="background:#fff;width:100%;max-width:680px;max-height:86vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px 16px 24px;direction:rtl"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:1.05rem;flex:1;min-width:0">📖 نص الدرس</b><button type="button" class="pl-btn2" id="plrevx" style="margin:0;width:auto;flex:none;padding:6px 12px;font-size:.85rem;white-space:nowrap;min-height:0">رجوع للسؤال ✖</button></div>'+(body||'<div class="u">لسه ما فيش نص قبل السؤال ده.</div>')+'</div>';
    document.body.appendChild(o); const close=()=>{ o.remove(); }; document.getElementById('plrevx').onclick=close; o.addEventListener('click',e=>{ if(e.target===o) close(); }); }; }
function render0(){
  stopAudio();
  if(S[idx].t==='end'&&missed.length&&!reviewed){ review(); return; }
  const s=S[idx]; const pct=Math.round(idx/(S.length-1)*100);
  const st0=st(); if(!PEEK) st0.steps[LID]=idx; if(!PEEK) st0.last={id:LID,t:Date.now(),title:(document.querySelector('#lhead h1')||{}).textContent||LID}; save(st0);
  let h='<div class="pl-top"><div class="pl-bar"><i style="width:'+pct+'%"></i></div><div class="pl-count">'+(idx+1)+' / '+S.length+'</div><button class="pl-mute" id="plmute" aria-label="الصوت">'+(soundOn()?'🔊':'🔇')+'</button></div>';
  h+='<div class="pl-card'+(back?' back':'')+(s.t==='section'?' pl-section':'')+(s.t==='end'?' pl-end':'')+'" id="plc">';
  const nxt='<div class="pl-nav">'+(idx>0&&s.t!=='end'?'<button class="pl-back" aria-label="رجوع">→</button>':'')+'<button class="pl-next" id="plnext">التالي</button></div>';
  if(s.t==='learn'){ h+=audioBox(s.a)+'<div class="pl-text">'+s.h+'</div>'+nxt; }
  else if(s.t==='section'){ h+='<div class="big">'+(((document.querySelector('.lesson-head .emoji .em')||{}).textContent||'').trim()||'📄')+'</div><h2>'+s.h.replace(/^(<span class="em">.*?<\/span>\s*)+/,'')+'</h2>'+nxt; }
  else if(s.t==='mc'||s.t==='tf'){
    h+='<div class="pl-q">'+s.q+'</div>';
    const opts=s.t==='tf'?['صح ✅','غلط ❌']:s.opts;
    opts.forEach((o,k)=>{ h+='<button class="pl-opt" data-k="'+k+'">'+o+'</button>'; });
    h+='<div id="plfb"></div>';
  }
  else if(s.t==='recall'){ h+='<div class="pl-q">'+s.q+'</div><div class="pl-hint" style="color:#666;margin-bottom:10px">فكّر في إجابتك الأول، وبعدين اضغط.</div><button class="pl-next" id="plshow" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">اعرض الإجابة النموذجية</button><div id="plfb"></div>'; }
  else if(s.t==='write'){ h+='<div class="pl-q">'+s.q+'</div>'+(s.a?'<div id="plmodel"></div>':'')+'<textarea class="pl-write" id="plw" placeholder="اكتب إجابتك هنا، أو اتكلم بالميكروفون… بتتحفظ عندك"></textarea>'+MICBAR+(s.a?'<button class="pl-next" id="plsub" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">سلّم إجابتي وقارنها</button><button class="pl-btn2" id="plshowm" style="margin-top:8px">اعرض الإجابة النموذجية</button>':'')+'<div class="pl-nav"'+(s.a?' style="display:none" id="plnavw"':'')+'>'+(idx>0?'<button class="pl-back" aria-label="رجوع">→</button>':'')+'<button class="pl-next" id="plnext">التالي</button></div>'; }
  else if(s.t==='end'){
    const pdf=M.pdf&&M.pdf[LID];
    h+='<div class="big">🏆</div><h2>برافو! خلصت الدرس</h2><div class="xps">⭐ كسبت '+gained+' نقطة في الدرس ده</div>';
    h+=pdf?'<a class="pl-btn2" href="../pdf/'+pdf+'" target="_blank" rel="noopener">📄 حمّل PDF الدرس كامل بالتمارين</a>':'<div class="pl-btn2 off">📄 PDF الدرس كامل بالتمارين — قريبًا</div>';
    if(s.teaser) h+='<div class="pl-text" style="font-size:20px;line-height:1.9;margin:8px 0">'+s.teaser+'</div>';
    h+='<button class="pl-next" id="plfin">أنهي الدرس ✅</button><button class="pl-btn2" id="plrest">↺ ابدأ الدرس من الأول</button>';
    if(s.extra) h+='<div class="pl-src">'+s.extra+'</div>';
  }
  h+='</div>';
  root.innerHTML=h; back=false;
  const card=document.getElementById('plc'); try{ setupTabs(card); }catch(e){} wireAudio(card,s.a);
  document.getElementById('plmute').onclick=()=>{ const q=st(); q.mute=soundOn(); save(q); if(q.mute) stopAudio(); else { ac(); sfx('click'); } document.getElementById('plmute').textContent=soundOn()?'🔊':'🔇'; };
  if(s.t==='section'&&!back&&idx>0) sfx('power');
  if(s.t==='learn'&&unlocked) playClip(s.a,card);
  if(s.t==='learn'&&!unlocked&&hasClip(s.a)){ const bb=card.querySelector('.pl-play'); if(bb) bb.classList.add('pulse'); const hint=document.createElement('div'); hint.className='pl-tap'; hint.textContent='🎧 اضغط ▶ مرة واحدة وبعدها الصوت هيشتغل لوحده'; card.insertBefore(hint,card.firstChild); }
  const bk=card.querySelector('.pl-back'); if(bk) bk.onclick=()=>{ unlocked=true; sfx('click'); if(idx>0){ idx--; back=true; render(); scrollTo(0,0);} };
  const nb=document.getElementById('plnext');
  if(nb) nb.onclick=()=>{ unlocked=true; ac(); sfx('jump');
    if(s.t==='write'){ const v=document.getElementById('plw').value; const q=st(); q.answers=q.answers||{}; q.answers[s.key]=v; save(q); if(v.trim()){ const wc=v.trim().split(/\s+/).length; once(LID+':'+idx,wc>=15?10:3,wc>=15?'كتبت!':''); } }
    go(1);
  };
  if(s.t==='write'&&s.a){ document.getElementById('plshowm').onclick=()=>{ unlocked=true; sfx('click'); const w=document.getElementById('plw'); const q=st(); q.answers=q.answers||{}; if(w.value.trim()){ q.answers[s.key]=w.value; save(q); } w.readOnly=true; micStop(); document.getElementById('plmodel').insertAdjacentHTML('afterbegin','<div class="pl-fb info"><div style="font-size:17px;font-weight:600">الإجابة النموذجية:</div>'+s.a+'</div>'); document.getElementById('plmodel').scrollIntoView({behavior:'smooth',block:'center'}); document.getElementById('plsub').remove(); document.getElementById('plshowm').remove(); const nv=document.getElementById('plnavw'); if(nv) nv.style.display=''; }; document.getElementById('plsub').onclick=()=>{ unlocked=true; sfx('click'); const w=document.getElementById('plw'); const v=w.value.trim(); if(!v){ w.focus(); return; } const q=st(); q.answers=q.answers||{}; q.answers[s.key]=w.value; save(q); const wc=v.split(/\s+/).length; once(LID+':'+idx,wc>=15?10:3,wc>=15?'كتبت!':''); if(wc<15){ const n=document.createElement('div'); n.className='pl-hint'; n.style.cssText='color:#666;margin:8px 0'; n.textContent='جرّب تكتب أكتر من كده المرة الجاية (١٥ كلمة أو أكتر تديك نقاط أكتر).'; document.getElementById('plmodel').appendChild(n); } w.readOnly=true; micStop(); document.getElementById('plmodel').insertAdjacentHTML('afterbegin','<div class="pl-fb info"><div style="font-size:17px;font-weight:600">الإجابة النموذجية:</div>'+s.a+'</div>'); document.getElementById('plmodel').scrollIntoView({behavior:'smooth',block:'center'}); document.getElementById('plsub').remove(); const sm=document.getElementById('plshowm'); if(sm) sm.remove(); const nv=document.getElementById('plnavw'); if(nv) nv.style.display=''; }; }
  if(s.t==='write'){ const q=st(); const w=document.getElementById('plw'); if(q.answers&&q.answers[s.key]) w.value=q.answers[s.key]; micInit(s.key); }
  if(s.t==='mc'||s.t==='tf'){
    let tries=0, done=false;
    card.querySelectorAll('.pl-opt').forEach(b=>b.onclick=()=>{
      if(done) return; const k=+b.dataset.k;
      const ok=s.t==='tf'? ((k===0)===s.ans) : (k===s.ans);
      const fb=document.getElementById('plfb');
      unlocked=true; ac(); if(ok){ done=true; b.classList.add('right'); const q=st(); q.combo=(q.combo||0)+1; save(q); if(q.combo>=3&&tries===0) sfx('combo',q.combo); else sfx('right');
        burst(b); const pts=tries===0?10:4; if(!q.sx[LID+':'+idx]){ q.sx[LID+':'+idx]=1; save(q); xp(pts, tries===0&&q.combo>=3?'🔥':''); }
        fb.innerHTML='<div class="pl-fb ok">✅ صح! '+(s.why?'<div style="font-size:17px;font-weight:600;margin-top:4px">'+s.why+'</div>':'')+'<button class="pl-next" id="plgo">كمّل</button></div>';
        document.getElementById('plgo').onclick=()=>{ sfx('jump'); go(1); };
      } else { sfx('wrong'); tries++; if(missed.indexOf(s)<0){ missed.push(s); try{ const _q=st(); _q.sr=_q.sr||{}; const _id=LID+':'+S.indexOf(s); if(!_q.sr[_id]){ _q.sr[_id]={st:0,due:Date.now()}; save(_q); } }catch(e){} } b.classList.add('wrong'); const q=st(); q.combo=0; save(q);
        if(s.ex){ done=true; card.querySelectorAll('.pl-opt').forEach(o=>{ o.disabled=true; if(+o.dataset.k===(s.t==='tf'?(s.ans?0:1):s.ans)) o.classList.add('right'); });
          const ra=(s.t==='tf'?(s.ans?0:1):s.ans); fb.innerHTML='<div class="pl-fb no"><div style="font-weight:800">❌ إجابتك مش صح</div><div style="font-size:17px;margin:6px 0">'+(s.ex[k]||'')+'</div></div><div class="pl-fb ok"><div style="font-weight:800">✅ الإجابة الصح</div><div style="font-size:17px;margin:6px 0">'+(s.ex[ra]||s.why||'')+'</div><div style="font-size:13px;color:#666">📘 الشرح من إعداد الموقع</div><button class="pl-next" id="plgo">فهمت، كمّل</button></div>';
          document.getElementById('plgo').onclick=()=>{ sfx('jump'); go(1); };
        } else { fb.innerHTML='<div class="pl-fb no">❌ لأ، جرّب تاني</div>'; setTimeout(()=>{b.classList.remove('wrong');b.style.opacity=.45;b.disabled=true;},420); } }
    });
  }
  if(s.t==='recall'){
    document.getElementById('plshow').onclick=()=>{ unlocked=true; ac(); sfx('click');
      document.getElementById('plshow').remove();
      document.getElementById('plfb').innerHTML='<div class="pl-fb info"><div style="font-size:17px;font-weight:600">الإجابة:</div>'+s.a+'<button class="pl-next" id="plknew">عرفتها ✅</button><button class="pl-btn2" id="plreview" style="margin-top:8px">هراجعها 🔁</button></div>';
      document.getElementById('plknew').onclick=()=>{ sfx('right'); once(LID+':'+idx,5); go(1); };
      document.getElementById('plreview').onclick=()=>{ once(LID+':'+idx,1); go(1); };
    };
  }
  if(s.t==='end'){
    document.getElementById('plrest').onclick=()=>{ unlocked=true; sfx('click'); idx=0; gained=0; missed=[]; reviewed=false; render(); scrollTo(0,0); };
    document.getElementById('plfin').onclick=()=>{ sfx('done'); const q=st(); if(!q.done[LID]){ q.done[LID]=Date.now(); q.xp+=20; save(q); xp(20,'🎉'); } else sv(q); const b=document.getElementById('plfin'); b.textContent='✅ الدرس متكمل'; b.disabled=true; confetti(); };
    if(st().done[LID]){ const b=document.getElementById('plfin'); b.textContent='✅ الدرس متكمل'; b.disabled=true; }
    else { try{confetti()}catch(e){} setTimeout(()=>sfx('done'),50); }
  }
  refreshHeader();
}
function go(d){ if(idx+d<0||idx+d>=S.length) return; idx+=d; render(); const t=document.getElementById('plc'); if(t) window.scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-90)}); }
render();

// ---- offline download for this lesson
(function(){ if(!('caches' in window)) return; const head=document.getElementById('lhead'); if(!head) return;
  const SITE=({'poetry-journey':'poetry-offline','learn-tefl':'tefl-offline','tefl-practical':'tefl2-offline'})[location.pathname.split('/')[1]]||'poetry-offline'
  const CN=SITE;
  const urls=()=>{ const u=[location.pathname]; const pdf=M.pdf&&M.pdf[LID]; if(pdf) u.push(new URL('../pdf/'+pdf,location.href).pathname);
    S.forEach(x=>{ if(x.a&&M.audio&&M.audio[x.a]&&!/^data:/.test(M.audio[x.a])) u.push(new URL('../audio/'+M.audio[x.a],location.href).pathname); });
    return Array.from(new Set(u)); };
  const b=document.createElement('button'); b.className='pdf-link'; b.style.cssText='cursor:pointer;font-family:inherit;font-size:inherit;margin-inline-start:8px'; head.appendChild(b);
  const fmt=n=>(n/1048576).toFixed(1)+' MB';
  async function paint(){ const q=st(); const o=q.off&&q.off[LID]; b.disabled=false; b.textContent=o?'✅ متحمّل للأوفلاين ('+fmt(o)+') · اضغط للحذف':'⬇️ حمّل الدرس للأوفلاين'; }
  b.onclick=async()=>{ const q0=st(); if(q0.off&&q0.off[LID]){ const c=await caches.open(CN); for(const u of urls()) await c.delete(u); delete q0.off[LID]; save(q0); return paint(); }
    b.disabled=true; const c=await caches.open(CN); const L=urls(); let tot=0, i=0;
    try{ for(const u of L){ const r=await fetch(u,{cache:'reload'}); if(!r.ok) throw new Error(u); const bl=await r.clone().blob(); tot+=bl.size; await c.put(u,r); i++; b.textContent='⏳ بيتحمّل '+i+' / '+L.length; }
      const q=st(); q.off=q.off||{}; q.off[LID]=tot; save(q); paint(); }
    catch(e){ b.disabled=false; b.textContent='⚠️ فشل التحميل. جرّب تاني وإنت على النت'; } };
  paint(); })();

// ---- glossary: tap an English term to see its meaning and jump to the lesson that explains it
(function(){ const G=(window.GLOSSARY||[]).concat(window.GGLOSSARY||[]); if(!G.length) return; const map={}; G.forEach(e=>{ map[e.t]=e; });
  const hostC=document.getElementById('player');
  function norm(t){ t=t.trim().toLowerCase(); if(map[t]) return map[t]; if(t.endsWith('s')&&map[t.slice(0,-1)]) return map[t.slice(0,-1)]; if(t.endsWith('es')&&map[t.slice(0,-2)]) return map[t.slice(0,-2)]; return null; }
  function sheet(e){ const old=document.getElementById('glsheet'); if(old) old.remove(); const here=(e.l===LID);
    const d=document.createElement('div'); d.id='glsheet'; d.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;justify-content:center';
    d.innerHTML='<div style="background:#fff;width:100%;max-width:640px;border-radius:22px 22px 0 0;padding:20px 20px 24px;font-size:19px;line-height:1.8"><div style="font-weight:900;font-size:24px;direction:ltr;text-align:start">'+e.t+' <span style="font-size:18px;color:#666;direction:rtl">· '+e.a+'</span></div><div style="margin:8px 0 14px">'+e.d+'</div>'+(e.e?'<div class="en" dir="ltr">'+e.e+'</div>':'')+''+(here?'':'<a class="pl-next" style="display:block;text-align:center;text-decoration:none" href="'+(location.pathname.replace(/[^\/]*$/,''))+e.l+'.html?card='+e.k+'">📖 شوف الشرح في الدرس</a>')+'<a href="'+(location.pathname.replace(/[^\/]*$/,''))+'../'+((window.GGLOSSARY||[]).indexOf(e)>-1?'grammar-glossary.html':(location.pathname.split('/')[1]==='tefl-practical'?'glossary-tefl2.html':'glossary.html'))+'" style="display:block;text-align:center;margin-top:12px;font-weight:900;color:#0b6fa8">كل المصطلحات</a></div>';
    d.onclick=ev=>{ if(ev.target===d) d.remove(); }; document.body.appendChild(d); }
  function mark(){ root.querySelectorAll('.en').forEach(sp=>{ if(sp.dataset.gl) return; const e=norm(sp.textContent); if(!e) return; sp.dataset.gl=1; sp.style.cssText+=';border-bottom:2px dotted #1cb0f6;cursor:pointer'; sp.addEventListener('click',ev=>{ ev.stopPropagation(); ev.preventDefault(); sheet(e); }); }); }
  new MutationObserver(mark).observe(root,{childList:true,subtree:true}); mark();
  if(PEEK&&hostC){ const b=document.createElement('a'); b.href='#'; b.textContent='→ رجوع للدرس اللي كنت فيه'; b.className='pdf-link'; b.style.cssText+=';display:block;text-align:center;margin:0 0 12px'; b.onclick=ev=>{ ev.preventDefault(); if(history.length>1) history.back(); else location.href='../index.html'; }; hostC.parentNode.insertBefore(b,hostC); }
})();
})();

/* ملحقات: per-lesson extra links (assets/appendix.js: window.APPENDIX={lessonId:[[label,url,kind],...]}); hidden when the list is empty */
(function(){try{var id=window.LESSON_ID;if(!id)return;var s=document.createElement('script');s.src='../assets/appendix.js';s.onload=function(){try{var L=(window.APPENDIX||{})[id];if(!L||!L.length||document.querySelector('.resources,.appendix'))return;var ic={video:'▶️',pdf:'📄',book:'📚',link:'🔗',article:'📰'};var d=document.createElement('details');d.className='appendix';d.style.cssText='margin:12px 0;padding:12px 14px;border:2px solid #e5e5e5;border-radius:16px;background:#fff';var sm=document.createElement('summary');sm.textContent='📎 ملحقات';sm.style.cssText='font-weight:900;font-size:1.1em;cursor:pointer';d.appendChild(sm);L.forEach(function(x){var a=document.createElement('a');a.href=x[1];a.target='_blank';a.rel='noopener';var tg=x[3]?' ['+x[3]+']':'';if(x[1]){a.textContent=(ic[x[2]||'link']||'🔗')+' '+x[0]+tg;a.style.cssText='display:block;margin:8px 0;font-weight:700;word-break:break-word';d.appendChild(a)}else{var sp=document.createElement('div');sp.textContent='📚 '+x[0]+tg;sp.style.cssText='margin:8px 0;font-weight:700';d.appendChild(sp)}});var els=document.querySelectorAll('.pdf-link,details.mm');var last=els.length?els[els.length-1]:null;if(last&&last.parentNode)last.parentNode.insertBefore(d,last.nextSibling);else{var p=document.getElementById('player');if(p&&p.parentNode)p.parentNode.insertBefore(d,p)}}catch(e){}};s.onerror=function(){};document.head.appendChild(s)}catch(e){}})();

/* no-clip state: visible "sound coming soon" badge when a lesson has no audio clips */
(function(){function go(){try{var p=document.getElementById('player');if(!p||!window.STEPS||document.querySelector('.nosound'))return;var M=window.AUDIO_MANIFEST||{audio:{}};var A=M.audio||{};var any=window.STEPS.some(function(s){return s.a&&A[s.a]});if(any)return;var d=document.createElement('div');d.className='nosound';d.textContent='🔇 الصوت قريبًا';d.style.cssText='margin:10px 0;padding:10px 14px;border-radius:14px;background:#f3f4f6;color:#555;font-weight:800;text-align:center';p.parentNode.insertBefore(d,p)}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(go,300)});else setTimeout(go,300)})();


/* pronunciation tab for verb lessons: UK|US toggle, per-lesson (all 5) and per-verb clips; clip ids L01-all5-uk, L01V1-f0-uk (looked up in AUDIO_MANIFEST.audio); 'soon' state until the clip exists */
(function(){try{var id=window.LESSON_ID||'';var m=/^verb-(\d+)$/.exec(id);if(!m||!window.STEPS)return;var n=('0'+parseInt(m[1],10)).slice(-2);var K='poetry-pron-acc';var acc=localStorage.getItem(K)||'uk';
function go(){var p=document.getElementById('player');if(!p||document.getElementById('pron'))return;var M=window.AUDIO_MANIFEST||{audio:{}};var A=M.audio||{};
var verbs=window.STEPS.filter(function(s){return s.t==='section'&&/الفعل/.test(s.h||'')}).map(function(s){return (s.h||'').replace(/<[^>]+>/g,'').replace('الفعل','').trim()});
var d=document.createElement('details');d.id='pron';d.style.cssText='margin:12px 0;padding:12px 14px;border:2px solid #e5e5e5;border-radius:16px;background:#fff';
var au=new Audio();
function url(c){var u=A[c];return u?(typeof u==='string'?u:u.url||''):''}
function row(label,cid){var r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:10px;margin:8px 0;font-weight:800';var b=document.createElement('button');b.type='button';b.style.cssText='min-width:48px;min-height:44px;border-radius:12px;border:2px solid #1cb0f6;background:#fff;font-size:1.1em';var t=document.createElement('span');var u=url(cid);t.textContent=label;r.appendChild(b);r.appendChild(t);if(u){b.textContent='▶';b.setAttribute('aria-label','تشغيل');b.onclick=function(){try{au.pause();au.src=u;au.play()}catch(e){}}}else{b.textContent='🔇';b.disabled=true;b.style.opacity='.6';var s=document.createElement('small');s.textContent='الصوت قريبًا';s.style.cssText='color:#777;font-weight:700';r.appendChild(s)}return r}
function paint(){d.innerHTML='';var sm=document.createElement('summary');sm.textContent='🔊 النطق (بريطاني وأمريكي)';sm.style.cssText='font-weight:900;font-size:1.1em;cursor:pointer';d.appendChild(sm);
var tg=document.createElement('div');tg.style.cssText='display:flex;gap:8px;margin:10px 0';[['uk','🇬🇧 UK'],['us','🇺🇸 US']].forEach(function(x){var b=document.createElement('button');b.type='button';b.textContent=x[1];b.style.cssText='flex:1;min-height:44px;border-radius:12px;border:2px solid #1cb0f6;font-weight:900;background:'+(acc===x[0]?'#1cb0f6;color:#fff':'#fff');b.onclick=function(){acc=x[0];localStorage.setItem(K,acc);var o=d.open;paint();d.open=o};tg.appendChild(b)});d.appendChild(tg);
d.appendChild(row('الدرس كله (الخمس أفعال)','L'+n+'-all5-'+acc));verbs.forEach(function(v,i){d.appendChild(row(v,'L'+n+'V'+(i+1)+'-f0-'+acc))})}
paint();var els=document.querySelectorAll('.pdf-link,details.mm,details.appendix');var last=els.length?els[els.length-1]:null;if(last&&last.parentNode)last.parentNode.insertBefore(d,last.nextSibling);else p.parentNode.insertBefore(d,p)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(go,450)});else setTimeout(go,450)}catch(e){}})();
