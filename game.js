// ══ BGM ══
const bgmAudio=new Audio('1.mp3');
bgmAudio.loop=true;bgmAudio.volume=1.0;
let bgmOn=false;
function toggleBGM(){
  bgmOn=!bgmOn;
  if(bgmOn){bgmAudio.play().catch(()=>{});document.getElementById('bgmBtn').textContent='🎵 ON';}
  else{bgmAudio.pause();document.getElementById('bgmBtn').textContent='🔇 OFF';}
}

// ══ SFX ══
let ac=null;
function initAC(){if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();}
function sfx(type){
  initAC();if(!ac)return;
  let o=ac.createOscillator(),gn=ac.createGain();
  o.connect(gn);gn.connect(ac.destination);
  let t=ac.currentTime;
  if(type==='ok'){
    o.type='sine';o.frequency.setValueAtTime(523,t);o.frequency.linearRampToValueAtTime(1046,t+.25);
    gn.gain.setValueAtTime(.12,t);gn.gain.linearRampToValueAtTime(0,t+.3);o.start(t);o.stop(t+.3);
  }else if(type==='err'){
    o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.linearRampToValueAtTime(110,t+.2);
    gn.gain.setValueAtTime(.1,t);gn.gain.linearRampToValueAtTime(0,t+.2);o.start(t);o.stop(t+.2);
  }else if(type==='clk'){
    o.type='sine';o.frequency.value=880;
    gn.gain.setValueAtTime(.06,t);gn.gain.linearRampToValueAtTime(0,t+.06);o.start(t);o.stop(t+.06);
  }else if(type==='win'){
    [523,659,784,1046].forEach((f,i)=>{
      let o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);o2.frequency.value=f;
      g2.gain.setValueAtTime(.12,t+i*.12);g2.gain.linearRampToValueAtTime(0,t+i*.12+.18);
      o2.start(t+i*.12);o2.stop(t+i*.12+.2);
    });
  }
}

// ══ DNA/RNA 변환표 ══
const CP={A:'T',T:'A',G:'C',C:'G'};
// DNA 센스가닥 → mRNA: A→U, T→A, G→C, C→G
const toRNA={A:'U',T:'A',G:'C',C:'G'};
// mRNA 코돈 → 아미노산
const AM={
  AUG:'Met(개시)',UAA:'Stop(종결)',UAG:'Stop(종결)',UGA:'Stop(종결)',
  GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly',
  AAA:'Lys',AAG:'Lys',GAA:'Glu',GAG:'Glu',
  UUU:'Phe',UUC:'Phe',AUA:'Ile',AUC:'Ile',AUU:'Ile',
  GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',
  UCU:'Ser',UCC:'Ser',AGU:'Ser',AGC:'Ser',
  CCU:'Pro',CCC:'Pro',CCA:'Pro',
  GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
  CAA:'Gln',CAG:'Gln',AAU:'Asn',AAC:'Asn',
  GAU:'Asp',GAC:'Asp',UGU:'Cys',UGC:'Cys',
  AGA:'Arg',AGG:'Arg',CUU:'Leu',CUG:'Leu',UUA:'Leu',
  CAU:'His',CAC:'His',UGG:'Trp',
  CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
  ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',
  UAC:'Tyr',UAU:'Tyr',
  CUC:'Leu',CUA:'Leu',UUG:'Leu',
  CCG:'Pro',CCU:'Pro',
};

function dnaToRNA(seq){return seq.map(b=>toRNA[b]||'?');}

// ══ 환자 데이터 (DNA 센스가닥 기준) ══
const ALL=[
  // 0. 김영희 - 낫모양 적혈구
  // 2번 코돈 CAC(His)→CTC(Leu): 7번 A→T
  // ATG GTG CAC GTG GAG → ATG GTG CTC GTG GAG
  {id:0,name:'김영희(35)',dis:'낫모양 적혈구 증후군',icon:'🩸',
   order:'DNA: CAC → CTC (CRISPR)\nmRNA: GUG(발린) → GAG(글루탐산)\n필요 도구: ✂️ CRISPR-Cas9',
   tool:'crispr',
   seq:['A','T','G','G','T','G','C','A','C','G','T','G','G','A','G'],
   mutIdx:[7],correct:['T'],
   sciHd:'낫모양 적혈구 증후군 & CRISPR-Cas9',
   sci:'HBB 유전자 2번 코돈 CAC(히스티딘)→CTC(류신) 변이로 적혈구가 낫 모양이 돼요. CRISPR로 A→T 교체하면 CAC→CTC가 되어 정상 단백질이 회복됩니다! 2023년 FDA 승인 Casgevy가 이 원리입니다.',
   pts:100},

  // 1. 이민준 - 뒤센 근이영양증
  // TAC 뒤(index6) 위치에 TAA 삽입
  // ATG TAC CTG AAC GGT → ATG TAC TAA CTG AAC GGT
  // mRNA: AUC AUG CTG... → AUC AUG AUU GAC...  (AUG 뒤에 AUU)
  {id:1,name:'이민준(8)',dis:'뒤센 근이영양증',icon:'💪',
   order:'DMD 엑손\nDNA: TAC 뒤에 TAA 삽입\nmRNA: AUG 뒤에 AUU(아이소류신) 삽입',
   tool:'insert',
   seq:['A','T','G','T','A','C','C','T','G','A','A','C','G','G','T'],
   mutIdx:[6],correct:['T','A','A'],
   sciHd:'삽입 변이 & 엑손 스키핑',
   sci:'디스트로핀 단백질 결핍으로 근육이 점점 약해져요. TAC 코돈 뒤에 TAA를 삽입하면 mRNA에서 AUG(개시) 바로 뒤에 AUU(아이소류신)가 생겨 리딩 프레임이 복구됩니다.',
   pts:120},

  // 2. 유아진 - 고콜레스테롤혈증
  // 모든 C 메틸화 (위치: 0,2,7,9,13)
  {id:2,name:'유아진(26)',dis:'가족성 고콜레스테롤혈증',icon:'🫀',
   order:'PCSK9 유전자 CpG 섬\n모든 시토신(C)에 메틸화(🔵) 적용',
   tool:'methyl',
   seq:['C','G','C','G','T','T','A','C','G','C','G','A','T','C','G'],
   mutIdx:[0,2,7,9,13],correct:['mC','mC','mC','mC','mC'],
   sciHd:'DNA 메틸화 (후성유전학)',
   sci:'DNA의 시토신(C)에 메틸기(-CH₃)를 붙이면 유전자 서열 변화 없이 발현을 억제해요. CpG 섬 메틸화로 PCSK9 발현을 줄이면 LDL 콜레스테롤이 감소합니다. 가역적이라는 것도 특징!',
   pts:150},

  // 3. 최준서 - 헌팅턴병
  // CAG 3개 → 2개: 마지막 CAG (6,7,8번) 결실
  // CAG CAG CAG ATG → CAG CAG ATG
  {id:3,name:'최준서(22)',dis:'헌팅턴병',icon:'🧠',
   order:'CAG 3개 → 2개로 결실',
   tool:'delete',
   seq:['C','A','G','C','A','G','C','A','G','A','T','G'],
   mutIdx:[6,7,8],correct:[],
   sciHd:'삼뉴클레오티드 반복 & 결실',
   sci:'정상: CAG 10~35회. 환자: 36회 이상이면 폴리글루타민 사슬이 뉴런을 파괴해요. 결실 편집으로 여분의 CAG를 제거하면 정상 범위로 돌아옵니다.',
   pts:130},

  // 4. 오지은 - BRCA1
  // ATC→TAC: seq[3]A→T, seq[4]T→A
  // 변이 mRNA: UAG(종결) → 정상 mRNA: AUG(개시)
  {id:4,name:'오지은(41)',dis:'BRCA1 유방암 변이',icon:'🎀',
   order:'BRCA1 조기종결 변이\nDNA: ATC → TAC (CRISPR)\nmRNA: UAG(종결) → AUG(개시)로 교체',
   tool:'crispr',
   seq:['A','T','G','A','T','C','G','C','T','A','T','G','C','T','A'],
   mutIdx:[3,4],correct:['T','A'],
   sciHd:'BRCA1 & 개시·종결코돈',
   sci:'종결코돈 UAG가 생기면 번역이 조기에 중단돼요. BRCA1이 불완전해지면 DNA 손상 복구가 실패해 유방암 위험이 높아집니다. CRISPR로 ATC→TAC 교체하면 mRNA의 UAG(종결)이 AUG(개시)로 바뀌어 정상 번역이 복구됩니다.',
   pts:140},

  // 5. 홍길동 - 알파-1 항트립신
  // TTC(Phe)→CTC(Leu): 3번 위치 T→C
  // ATG TTC GCT GAA GAA → ATG CTC GCT GAA GAA
  {id:5,name:'홍길동(19)',dis:'알파-1 항트립신 결핍',icon:'🫁',
   order:'SERPINA1 Z변이\nDNA: TTC → CTC (CRISPR)\nmRNA: AAG(라이신) → GAG(글루탐산)',
   tool:'crispr',
   seq:['A','T','G','T','T','C','G','C','T','G','A','A','G','A','A'],
   mutIdx:[3],correct:['C'],
   sciHd:'알파-1 항트립신 결핍증',
   sci:'SERPINA1 Z변이(TTC→CTC)로 단백질이 잘못 접혀 간에 축적되고 폐·간을 손상시켜요. CRISPR로 페닐알라닌→류신으로 교체하면 단백질이 정상적으로 분비됩니다.',
   pts:140},
];

// ══ 닉네임 & 점수판 ══
let usedIds=[];
let scores=[];
let currentNick='플레이어';

function fmtTime(sec){
  let m=Math.floor(sec/60),s=sec%60;
  return m>0?`${m}분 ${s}초`:`${s}초`;
}
function saveScore(score,elapsed){
  let d=new Date();
  scores.push({nick:currentNick,score,elapsed,date:`${d.getMonth()+1}/${d.getDate()}`});
  scores.sort((a,b)=>b.score-a.score||a.elapsed-b.elapsed);
  scores=scores.slice(0,10);
}
function renderScores(){
  let el=document.getElementById('scoreList');
  if(!scores.length){
    el.innerHTML='<div style="text-align:center;color:var(--lt);font-size:13px;padding:30px 0;">아직 기록이 없어요!<br>게임을 플레이해 보세요 🌷</div>';
    return;
  }
  const M=['🥇','🥈','🥉'],cls=['r1','r2','r3'];
  el.innerHTML=scores.map((s,i)=>`
    <div class="score-row ${cls[i]||''}">
      <span style="font-size:16px;width:26px;text-align:center;">${M[i]||'#'+(i+1)}</span>
      <span style="flex:1;font-size:12px;">${s.nick}</span>
      <span style="font-size:9px;color:var(--lt);">${s.date} · ${fmtTime(s.elapsed)}</span>
      <span style="font-weight:700;color:var(--hot);font-size:12px;">⭐${s.score}pt</span>
    </div>`).join('');
}
function clearScores(){scores=[];renderScores();}

// ══ 닉네임 ══
function askNick(onDone){
  let el=document.getElementById('nickPop');
  el.style.display='flex';
  document.getElementById('nickInput').value='';
  setTimeout(()=>document.getElementById('nickInput').focus(),50);
  window._nickDone=onDone;
}
function confirmNick(){
  let v=document.getElementById('nickInput').value.trim();
  currentNick=v||'익명 연구원';
  document.getElementById('nickPop').style.display='none';
  if(window._nickDone)window._nickDone();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.getElementById('nickPop').style.display==='flex')confirmNick();
});

// ══ 게임 상태 ══
const TOTAL_TIME=90;
let g={
  score:0,aid:null,tool:'crispr',ins:'A',
  seq:[],meth:[],done:[],fail:[],
  tmr:null,timeLeft:TOTAL_TIME,queue:[],current:null,
  startTime:0,patStartTime:0,hintOn:false,gameActive:false,
};

function show(id){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  if(id==='S')renderScores();
}

function pickPatients(){
  let available=ALL.filter(p=>!usedIds.includes(p.id));
  if(!available.length){usedIds=[];available=[...ALL];}
  let sh=[...available].sort(()=>Math.random()-.5);
  sh.forEach(p=>usedIds.push(p.id));
  return sh;
}

// 시작: 닉네임 → 게임방법(시작 버튼) → 게임
function startGame(){
  askNick(()=>{
    show('H');
    document.getElementById('howStartBtn').style.display='inline-block';
    document.getElementById('howBackBtn').style.display='none';
    window._pendingStart=true;
  });
}

function doStartGame(){
  window._pendingStart=false;
  document.getElementById('howStartBtn').style.display='none';
  document.getElementById('howBackBtn').style.display='inline-block';
  g.score=0;g.done=[];g.fail=[];g.aid=null;g.seq=[];g.meth=[];
  g.queue=pickPatients();
  g.current=null;g.timeLeft=TOTAL_TIME;
  g.startTime=Date.now();g.patStartTime=Date.now();
  g.hintOn=false;g.gameActive=true;
  if(g.tmr)clearInterval(g.tmr);
  document.getElementById('sv').textContent='0';
  updateTimerUI();clearEditUI();
  show('G');startGlobalTimer();nextPatient();
}

function updateTimerUI(){
  let t=Math.max(0,g.timeLeft);
  let m=Math.floor(t/60),s=t%60;
  let str=(m>0?m+'분 ':'')+String(s).padStart(2,'0')+'초';
  let col=t>45?'var(--hot)':t>20?'#d4a000':'#e03030';
  document.getElementById('sv').textContent=g.score;
  let timerEl=document.getElementById('globalTimer');
  if(timerEl){timerEl.textContent='⏱ '+str;timerEl.style.color=col;}
}

function startGlobalTimer(){
  if(g.tmr)clearInterval(g.tmr);
  g.tmr=setInterval(()=>{
    g.timeLeft=Math.max(0,g.timeLeft-1);
    updateTimerUI();renderSinglePat();
    let patElapsed=Math.round((Date.now()-g.patStartTime)/1000);
    if(patElapsed>=30&&!g.hintOn){g.hintOn=true;applyToolHint(true);}
    if(g.timeLeft<=0){clearInterval(g.tmr);endGame(false);}
  },1000);
}

function applyToolHint(on){
  if(!g.current)return;
  let toolMap={crispr:'tc',insert:'ti',delete:'td',methyl:'tm'};
  let correctId=toolMap[g.current.tool];
  ['tc','ti','td','tm'].forEach(id=>{
    let el=document.getElementById(id);if(!el)return;
    if(on&&id===correctId){
      el.style.animation='hintPill 0.7s ease-in-out infinite';
      el.style.borderColor='#ffd84d';el.style.color='#7a4a00';el.style.background='#fff4c2';
    }else{
      el.style.animation='';
      if(!el.classList.contains('on')){el.style.borderColor='';el.style.color='';el.style.background='';}
    }
  });
}
function clearHintGlow(){
  g.hintOn=false;
  ['tc','ti','td','tm'].forEach(id=>{
    let el=document.getElementById(id);
    if(el){el.style.animation='';el.style.borderColor='';el.style.color='';el.style.background='';}
  });
}
function clearEditUI(){
  document.getElementById('oTxt').innerHTML='<span style="color:var(--lt);">환자 처리 중...</span>';
  ['dnaRow','rnaRow','codonRow'].forEach(id=>document.getElementById(id).innerHTML='');
  document.getElementById('sTxt').innerHTML='<span style="color:var(--lt);">환자를 선택하면 설명이 나와요!</span>';
}

function nextPatient(){
  if(g.timeLeft<=0)return;
  clearHintGlow();sTool('crispr');sIns('A');
  if(g.queue.length===0){endGame(true);return;}
  g.current=g.queue.shift();
  g.seq=[...g.current.seq];g.meth=[];g.aid=g.current.id;
  g.patStartTime=Date.now();g.hintOn=false;
  renderSinglePat();loadPatient(g.current);
}

function renderSinglePat(){
  let p=g.current;
  if(!p){document.getElementById('pRow').innerHTML='<div style="color:var(--lt);font-size:11px;padding:4px;">대기 중...</div>';return;}
  let pct=(g.timeLeft/TOTAL_TIME)*100;
  let col=pct>50?'#f4a0bf':pct>22?'#fcd34d':'#f87171';
  let doneN=g.done.length;
  let cur=`<div class="pcard sel" style="cursor:default;min-width:110px;max-width:155px;">
    <div class="pn">${p.icon} ${p.name}</div>
    <div class="pd">${p.dis}</div>
    <div style="font-size:8px;color:var(--lt);margin-top:2px;">${doneN+1}/${ALL.length}번째 환자</div>
    <div class="tbar"><div class="tfill" style="width:${pct.toFixed(1)}%;background:${col};"></div></div>
  </div>`;
  let waiting=g.queue.slice(0,3).map(q=>`
    <div style="background:rgba(255,255,255,.5);border:1.5px dashed var(--stripe);border-radius:8px;padding:3px 6px;font-size:8.5px;color:var(--md);min-width:70px;max-width:95px;flex-shrink:0;">
      <div style="font-weight:700;color:var(--lt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.icon} ${q.name}</div>
      <div style="font-size:7px;color:var(--lt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.dis}</div>
    </div>`).join('');
  let moreQ=g.queue.length>3?`<div style="font-size:8px;color:var(--lt);align-self:center;flex-shrink:0;">+${g.queue.length-3}명</div>`:'';
  document.getElementById('pRow').innerHTML=cur+(g.queue.length?waiting+moreQ:'');
}

function resetEdit(){
  if(!g.current)return;sfx('clk');
  g.seq=[...g.current.seq];g.meth=[];renderSeq();
}

function loadPatient(p){
  document.getElementById('oTxt').innerHTML=
    `<b style="color:var(--hot);">${p.icon} ${p.name}</b> — ${p.dis}<br>
     ${p.order.replace(/\n/g,'<br>')}
     <br><span style="color:var(--lt);font-size:9px;">필요 도구: ${tL(p.tool)}</span>`;
  document.getElementById('sHd').textContent='🔬 '+p.sciHd;
  document.getElementById('sTxt').textContent=p.sci;
  renderSeq();
}
function tL(t){return{crispr:'✂️ CRISPR-Cas9',insert:'➕ 삽입',delete:'✂ 결실',methyl:'🔵 메틸화'}[t]||t;}

// ══ 렌더링: DNA → mRNA → 코돈(아미노산) ══
function renderSeq(){
  if(!g.current)return;
  let isIns=g.tool==='insert';

  // DNA 센스가닥 (편집)
  let dnaHTML='';
  for(let i=0;i<g.seq.length;i++){
    if(i%3===0){if(i>0)dnaHTML+='</div>';dnaHTML+=`<div class="codon-group">`;}
    if(isIns)dnaHTML+=`<div class="insert-cursor" onclick="insertAt(${i})">+</div>`;
    let b=g.seq[i],isM=g.meth.includes(i);
    dnaHTML+=`<div class="base ${isM?'mC':b}" onclick="clk(${i})">${isM?'mC':b}</div>`;
  }
  if(isIns&&g.seq.length>0)dnaHTML+=`<div class="insert-cursor" onclick="insertAt(${g.seq.length})">+</div>`;
  if(g.seq.length>0)dnaHTML+='</div>';
  document.getElementById('dnaRow').innerHTML=dnaHTML;

  // mRNA (DNA 센스가닥 변환: A→U, T→A, G→C, C→G)
  let rna=dnaToRNA(g.seq);
  let rnaHTML='';
  for(let i=0;i<rna.length;i++){
    if(i%3===0){if(i>0)rnaHTML+='</div>';rnaHTML+=`<div class="codon-group">`;}
    let rb=rna[i];
    let rCls=rb==='U'?'T':rb; // U는 T와 같은 색
    rnaHTML+=`<div class="base ${rCls} st" style="font-size:9px;opacity:0.85;">${rb}</div>`;
  }
  if(rna.length>0)rnaHTML+='</div>';
  document.getElementById('rnaRow').innerHTML=rnaHTML;

  // 코돈 & 아미노산
  let codonHTML='';
  for(let i=0;i<rna.length;i+=3){
    let codon=rna.slice(i,i+3).join('');
    let aa=AM[codon];
    let isStart=codon==='AUG';
    let isStop=['UAA','UAG','UGA'].includes(codon);
    let bg=isStart?'#b8f5b0':isStop?'#ffd5d5':'#eeeeff';
    let bdr=isStart?'#4aaa44':isStop?'#dd6666':'#9999cc';
    let tc=isStart?'#1a7a20':isStop?'#aa2222':'#333388';
    if(codon.length===3){
      codonHTML+=`<div style="display:flex;flex-direction:column;align-items:center;gap:1px;flex-shrink:0;">
        <div style="font-size:7.5px;font-weight:700;color:#999;letter-spacing:0.5px;">${codon}</div>
        <div style="background:${bg};border:1.5px solid ${bdr};border-radius:5px;padding:1px 4px;font-size:7px;font-weight:700;color:${tc};white-space:nowrap;">${aa||'?'}</div>
      </div>`;
    } else if(codon.length>0){
      codonHTML+=`<div style="font-size:7px;color:var(--lt);">${codon}</div>`;
    }
  }
  document.getElementById('codonRow').innerHTML=codonHTML||'<span style="color:var(--lt);font-size:8px;">—</span>';
}

function sTool(t){
  g.tool=t;
  [['crispr','tc'],['insert','ti'],['delete','td'],['methyl','tm']]
    .forEach(([x,id])=>document.getElementById(id).classList.toggle('on',x===t));
  renderSeq();
}
function sIns(b){
  g.ins=b;
  ['A','T','G','C'].forEach(x=>document.getElementById('i'+x.toLowerCase()).classList.toggle('on',x===b));
}
function insertAt(pos){
  if(!g.current)return;sfx('clk');
  g.seq.splice(pos,0,g.ins);renderSeq();
}
function clk(i){
  if(!g.current)return;sfx('clk');
  if(g.tool==='crispr'){let r={A:'T',T:'G',G:'C',C:'A'};g.seq[i]=r[g.seq[i]]||g.seq[i];}
  else if(g.tool==='insert'){insertAt(i);return;}
  else if(g.tool==='delete'){g.seq.splice(i,1);}
  else if(g.tool==='methyl'){if(g.seq[i]==='C'&&!g.meth.includes(i))g.meth.push(i);}
  renderSeq();
}

function submit(){
  if(!g.current){if(g.queue.length>0)nextPatient();return;}
  let p=g.current;
  if(chk(p)){
    sfx('ok');clearHintGlow();
    g.score+=p.pts;
    document.getElementById('sv').textContent=g.score;
    g.done.push(p.id);g.current=null;
    let msg=`✅ ${p.icon} ${p.name} 치료 완료!\n+${p.pts}pt`;
    if(g.queue.length>0){pop('✅ 성공!',msg,false,true,false);}
    else{clearInterval(g.tmr);setTimeout(()=>endGame(true),200);}
  }else{
    sfx('err');
    pop('😢 오류!','올바르지 않아요.\n다시 확인해 보세요!',false,false,true);
  }
}

function chk(p){
  if(p.tool==='methyl')return p.mutIdx.every(i=>g.meth.includes(i));
  if(p.tool==='delete'){
    let o=p.seq.join('');
    let ex=o.slice(0,p.mutIdx[0])+o.slice(p.mutIdx[p.mutIdx.length-1]+1);
    return g.seq.join('')===ex;
  }
  if(p.tool==='insert'){
    let ex=[...p.seq];ex.splice(p.mutIdx[0],0,...p.correct);
    return g.seq.join('')===ex.join('');
  }
  return p.mutIdx.every((si,li)=>g.seq[si]===p.correct[li]);
}

function endGame(success){
  clearInterval(g.tmr);clearHintGlow();sfx('win');
  g.gameActive=false;
  let elapsed=TOTAL_TIME-g.timeLeft;
  saveScore(g.score,elapsed);
  let done=g.done.length,timeStr=fmtTime(elapsed);
  let rankHTML=buildRankHTML();
  pop('🎉 연구 완료!',
    `${currentNick}님 수고했어요!\n\n치료 성공: ${done}/${ALL.length}명\n최종 점수: ⭐${g.score}pt\n소요 시간: ${timeStr}`,
    true,false,false,rankHTML);
}

function buildRankHTML(){
  if(!scores.length)return '';
  const M=['🥇','🥈','🥉'];
  return '<div style="font-size:9px;color:var(--hot);font-weight:700;margin:8px 0 4px;">🏆 랭킹</div>'+
    scores.slice(0,5).map((s,i)=>
      `<div style="display:flex;gap:6px;font-size:9px;padding:2px 0;border-bottom:1px solid var(--stripe);">
        <span>${M[i]||'#'+(i+1)}</span>
        <span style="flex:1;">${s.nick}</span>
        <span style="color:var(--hot);font-weight:700;">⭐${s.score}pt</span>
      </div>`).join('');
}

// showConfirm: 게임 종료 후만 true
function pop(t,b,showH,showNext,showConfirm,rankHTML=''){
  document.getElementById('pT').textContent=t;
  document.getElementById('pB').textContent=b;
  document.getElementById('popH').style.display=showH?'inline-block':'none';
  document.getElementById('popNext').style.display=showNext?'inline-block':'none';
  document.getElementById('popC').style.display=showConfirm?'inline-block':'none';
  let rankEl=document.getElementById('popRank');
  if(rankEl){rankEl.innerHTML=rankHTML;rankEl.style.display=rankHTML?'block':'none';}
  document.getElementById('pop').classList.add('on');
}
function closePop(){document.getElementById('pop').classList.remove('on');}
function popNext(){closePop();clearEditUI();nextPatient();}
function goTitle(){
  closePop();
  if(g.tmr)clearInterval(g.tmr);
  clearHintGlow();g.gameActive=false;
  document.getElementById('howStartBtn').style.display='none';
  document.getElementById('howBackBtn').style.display='inline-block';
  show('T');
}
