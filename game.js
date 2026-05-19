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

// ══ DATA ══
const CP={A:'T',T:'A',G:'C',C:'G'};
const AM={
  ATG:'Met',TAA:'Stop',TAG:'Stop',TGA:'Stop',
  GGT:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly',
  AAA:'Lys',AAG:'Lys',GAA:'Glu',GAG:'Glu',
  TTT:'Phe',TTC:'Phe',ATA:'Ile',ATC:'Ile',ATT:'Ile',
  GTT:'Val',GTC:'Val',GTA:'Val',GTG:'Val',
  TCT:'Ser',TCC:'Ser',AGT:'Ser',AGC:'Ser',
  CCT:'Pro',CCC:'Pro',CCA:'Pro',
  GCT:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
  CAA:'Gln',CAG:'Gln',AAT:'Asn',AAC:'Asn',
  GAT:'Asp',GAC:'Asp',TGT:'Cys',TGC:'Cys',
  AGA:'Arg',AGG:'Arg',CTT:'Leu',CTG:'Leu',TTA:'Leu'
};

const ALL=[
  {id:0,name:'김영희(35)',dis:'낫모양 적혈구 증후군',icon:'🩸',
   order:'HBB 6번 코돈\nGTG→GAG 교체 (CRISPR)',tool:'crispr',
   seq:['A','T','G','G','T','G','C','A','T','G','T','G','G','T','G','A','G'],
   mutIdx:[4,5],correct:['A','G'],
   sciHd:'낫모양 적혈구 증후군 & CRISPR-Cas9',
   sci:'HBB 유전자 6번 코돈 GAG(글루탐산)이 GTG(발린)으로 바뀌어 적혈구가 낫 모양이 돼요. CRISPR-Cas9으로 절단 후 정상 서열로 교체합니다. 2023년 FDA 승인 Casgevy가 이 원리입니다!',
   pts:100},
  {id:1,name:'이민준(8)',dis:'뒤센 근이영양증',icon:'💪',
   order:'DMD 엑손 앞\nTAA 스톱코돈 삽입 (3번 위치 앞)',tool:'insert',
   seq:['A','T','G','C','T','G','A','A','C','G','G','T','C','A','G'],
   mutIdx:[3],correct:['T','A','A'],
   sciHd:'삽입 변이 & 엑손 스키핑',
   sci:'디스트로핀 단백질 결핍으로 근육이 점점 약해져요. TAA(스톱코돈) 삽입으로 변이 엑손을 번역에서 제외하면 짧지만 기능하는 단백질이 만들어집니다.',
   pts:120},
  {id:2,name:'유아진(26)',dis:'가족성 고콜레스테롤혈증',icon:'🫀',
   order:'PCSK9 유전자 CpG 섬의 시토신(C) 메틸화로 발현 억제',tool:'methyl',
   seq:['C','G','C','G','T','T','A','C','G','C','G','A','T','C','G'],
   mutIdx:[0,2,7,9,13],correct:['mC','mC','mC','mC','mC'],
   sciHd:'DNA 메틸화 (후성유전학)',
   sci:'DNA의 시토신(C)에 메틸기(-CH₃)를 붙여 유전자 서열 변화 없이 유전자 발현을 억제합니다. CpG 섬 메틸화는 전사인자의 결합을 방해해 PCSK9 발현을 감소시키며, 이는 LDL 콜레스테롤 수치를 낮추는 데 도움을 줄 수 있습니다.',
   pts:150},
  {id:3,name:'최준서(22)',dis:'헌팅턴병',icon:'🧠',
   order:'HTT CAG 반복 구간\n여분의 CAG 결실 (4~9번 염기 삭제)',tool:'delete',
   seq:['C','A','G','C','A','G','C','A','G','C','A','G','A','T','G'],
   mutIdx:[3,4,5,6,7,8],correct:[],
   sciHd:'삼뉴클레오티드 반복 & 결실',
   sci:'정상: CAG 10~35회. 환자: 36회 이상. 폴리글루타민 사슬이 뉴런을 파괴해요. 결실 편집으로 여분의 CAG를 제거합니다.',
   pts:130},
  {id:4,name:'오지은(41)',dis:'BRCA1 유방암 변이',icon:'🎀',
   order:'BRCA1 변이 코돈\nATG 교체 (CRISPR)',tool:'crispr',
   seq:['T','T','A','T','G','C','T','A','G','C','T','A','T','G','C'],
   mutIdx:[2,3],correct:['A','T'],
   sciHd:'BRCA1 & 유방암',
   sci:'BRCA1 변이 시 DNA 손상 복구 실패로 유방암·난소암 위험이 급증해요. CRISPR로 변이 코돈을 정상 ATG로 교체합니다.',
   pts:140},
  {id:5,name:'홍길동(19)',dis:'알파-1 항트립신 결핍',icon:'🫁',
   order:'SERPINA1 Z변이\nAAG→GAG 교체 (CRISPR)',tool:'crispr',
   seq:['A','T','G','A','A','G','G','C','T','G','A','A','G','A','A','G','G'],
   mutIdx:[3],correct:['G'],
   sciHd:'알파-1 항트립신 결핍증',
   sci:'SERPINA1 Z변이로 단백질이 간에 축적되어 폐·간을 손상시켜요. CRISPR로 AAG를 GAG로 교체해 정상 단백질을 회복합니다.',
   pts:140},
  {id:6,name:'이서준(45)',dis:'파킨슨병 (LRRK2)',icon:'🫨',
   order:'LRRK2 G2019S 변이\nAGC→GGC 교체 (CRISPR)',tool:'crispr',
   seq:['A','T','G','G','A','G','C','T','G','G','G','C','A','G','C','G','A'],
   mutIdx:[5,6],correct:['G','G'],
   sciHd:'LRRK2 변이 & 파킨슨병',
   sci:'G2019S 변이로 키나아제 활성이 과도해져 도파민 신경세포를 파괴해요. CRISPR로 AGC→GGC 교체하는 연구가 활발합니다.',
   pts:160},
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
  let entry={nick:currentNick,score,elapsed,date:`${d.getMonth()+1}/${d.getDate()}`};
  scores.push(entry);
  scores.sort((a,b)=>b.score-a.score||a.elapsed-b.elapsed);
  scores=scores.slice(0,10);
}

function renderScores(){
  let el=document.getElementById('scoreList');
  if(!scores.length){
    el.innerHTML='<div style="text-align:center;color:var(--lt);font-size:13px;padding:30px 0;">아직 기록이 없어요!<br>게임을 플레이해 보세요 🌷</div>';
    return;
  }
  const M=['🥇','🥈','🥉'];
  const cls=['r1','r2','r3'];
  el.innerHTML=scores.map((s,i)=>`
    <div class="score-row ${cls[i]||''}">
      <span style="font-size:16px;width:26px;text-align:center;">${M[i]||'#'+(i+1)}</span>
      <span style="flex:1;font-size:12px;">${s.nick}</span>
      <span style="font-size:9px;color:var(--lt);">${s.date} · ${fmtTime(s.elapsed)}</span>
      <span style="font-weight:700;color:var(--hot);font-size:12px;">⭐${s.score}pt</span>
    </div>`).join('');
}
function clearScores(){scores=[];renderScores();}

// ══ 닉네임 입력 ══
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
  score:0,
  aid:null,
  tool:'crispr',ins:'A',
  seq:[],meth:[],
  done:[],fail:[],
  tmr:null,
  timeLeft:TOTAL_TIME,
  queue:[],
  current:null,
  startTime:0,
  patStartTime:0,
  hintOn:false,
};

function show(id){
  document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  if(id==='S')renderScores();
}

function pickPatients(n){
  let available=ALL.filter(p=>!usedIds.includes(p.id));
  if(available.length<n){usedIds=[];available=[...ALL];}
  let sh=[...available].sort(()=>Math.random()-.5);
  let picked=sh.slice(0,n);
  picked.forEach(p=>usedIds.push(p.id));
  return picked;
}

function startGame(){
  askNick(()=>{
    g.score=0;g.done=[];g.fail=[];g.aid=null;g.seq=[];g.meth=[];
    g.queue=pickPatients(7);
    g.current=null;
    g.timeLeft=TOTAL_TIME;
    g.startTime=Date.now();
    g.patStartTime=Date.now();
    g.hintOn=false;
    if(g.tmr)clearInterval(g.tmr);
    document.getElementById('sv').textContent='0';
    updateTimerUI();
    clearEditUI();
    show('G');
    startGlobalTimer();
    nextPatient();
  });
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
    updateTimerUI();
    renderSinglePat();

    // 30초 경과: 도구 힌트만 반짝 (위치 힌트 없음)
    let patElapsed=Math.round((Date.now()-g.patStartTime)/1000);
    if(patElapsed>=30&&!g.hintOn){
      g.hintOn=true;
      applyToolHint(true);
    }

    if(g.timeLeft<=0){
      clearInterval(g.tmr);
      endGame(false);
    }
  },1000);
}

// 힌트: 올바른 도구 pill만 반짝 (위치는 알려주지 않음)
function applyToolHint(on){
  if(!g.current)return;
  let p=g.current;
  let toolMap={crispr:'tc',insert:'ti',delete:'td',methyl:'tm'};
  let correctId=toolMap[p.tool];
  ['tc','ti','td','tm'].forEach(id=>{
    let el=document.getElementById(id);
    if(!el)return;
    if(on&&id===correctId){
      el.style.animation='hintPill 0.7s ease-in-out infinite';
      el.style.borderColor='#ffd84d';
      el.style.color='#7a4a00';
      el.style.background='#fff4c2';
    } else {
      el.style.animation='';
      if(!el.classList.contains('on')){
        el.style.borderColor='';el.style.color='';el.style.background='';
      }
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
  document.getElementById('sRow').innerHTML='';
  document.getElementById('aRow').innerHTML='';
  document.getElementById('cRow').textContent='';
  document.getElementById('sTxt').innerHTML='<span style="color:var(--lt);">환자를 선택하면 설명이 나와요!</span>';
}

function nextPatient(){
  if(g.timeLeft<=0)return;
  clearHintGlow();
  sTool('crispr');
  sIns('A');
  if(g.queue.length===0){
    endGame(true);
    return;
  }
  g.current=g.queue.shift();
  g.seq=[...g.current.seq];
  g.meth=[];
  g.aid=g.current.id;
  g.patStartTime=Date.now();
  g.hintOn=false;
  renderSinglePat();
  loadPatient(g.current);
}

function renderSinglePat(){
  let p=g.current;
  if(!p){
    document.getElementById('pRow').innerHTML='<div style="color:var(--lt);font-size:11px;padding:4px;">대기 중...</div>';
    return;
  }
  let pct=(g.timeLeft/TOTAL_TIME)*100;
  let col=pct>50?'#f4a0bf':pct>22?'#fcd34d':'#f87171';
  let total=g.done.length+g.queue.length+1;
  let doneN=g.done.length;

  let cur=`<div class="pcard sel" style="cursor:default;min-width:110px;max-width:155px;">
    <div class="pn">${p.icon} ${p.name}</div>
    <div class="pd">${p.dis}</div>
    <div style="font-size:8px;color:var(--lt);margin-top:2px;">${doneN+1}/7번째 환자</div>
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
  if(!g.current)return;
  sfx('clk');
  g.seq=[...g.current.seq];
  g.meth=[];
  renderSeq();
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

function showTmpMsg(msg,ms,cb){
  document.getElementById('pRow').innerHTML=`<div style="flex:1;text-align:center;font-size:12px;color:var(--hot);padding:4px;">${msg}</div>`;
  setTimeout(cb,ms);
}

function tL(t){return{crispr:'✂️ CRISPR-Cas9',insert:'➕ 삽입',delete:'✂ 결실',methyl:'🔵 메틸화'}[t]||t;}

// ══ 염기 렌더링 - 3개씩 코돈 그룹 ══
function renderSeq(){
  if(!g.current)return;
  let p=g.current;
  let isInsertMode=g.tool==='insert';

  // 센스 가닥: 코돈 그룹(3개씩) + 삽입 모드면 커서 표시
  let senseHTML='';
  for(let i=0;i<g.seq.length;i++){
    // 코돈 그룹 시작
    if(i%3===0){
      if(i>0)senseHTML+='</div>';
      senseHTML+=`<div class="codon-group">`;
    }
    // 삽입 모드: 각 염기 앞에 삽입 커서 표시
    if(isInsertMode){
      senseHTML+=`<div class="insert-cursor" onclick="insertAt(${i})" title="${i}번 위치 앞에 삽입">+</div>`;
    }
    let b=g.seq[i];
    let isM=g.meth.includes(i);
    // 변이 표시 없음 (위치 힌트 제거)
    senseHTML+=`<div class="base ${isM?'mC':b}" onclick="clk(${i})">${isM?'mC':b}</div>`;
  }
  // 삽입 모드: 맨 끝에도 커서
  if(isInsertMode&&g.seq.length>0){
    senseHTML+=`<div class="insert-cursor" onclick="insertAt(${g.seq.length})" title="끝에 삽입">+</div>`;
  }
  if(g.seq.length>0)senseHTML+='</div>';
  document.getElementById('sRow').innerHTML=senseHTML;

  // 안티센스 가닥: 코돈 그룹(3개씩)
  let antiHTML='';
  for(let i=0;i<g.seq.length;i++){
    if(i%3===0){
      if(i>0)antiHTML+='</div>';
      antiHTML+=`<div class="codon-group">`;
    }
    let b=g.seq[i];
    antiHTML+=`<div class="base ${CP[b]||'C'} st">${CP[b]||'?'}</div>`;
  }
  if(g.seq.length>0)antiHTML+='</div>';
  document.getElementById('aRow').innerHTML=antiHTML;

  // 코돈 라벨
  let cod=[];
  for(let i=0;i<g.seq.length;i+=3){
    let c=g.seq.slice(i,i+3).join('');
    cod.push(`[${c}]${AM[c]||'?'}`);
  }
  document.getElementById('cRow').textContent='코돈: '+cod.join('  ');
}

function corr(p,i){
  if(p.tool==='methyl')return g.meth.includes(i);
  if(p.tool==='delete')return false;
  let li=p.mutIdx.indexOf(i);if(li<0)return true;
  return g.seq[i]===p.correct[li];
}

function sTool(t){
  g.tool=t;
  [['crispr','tc'],['insert','ti'],['delete','td'],['methyl','tm']]
    .forEach(([x,id])=>document.getElementById(id).classList.toggle('on',x===t));
  renderSeq(); // 도구 바꾸면 삽입 커서 업데이트
}
function sIns(b){
  g.ins=b;
  ['A','T','G','C'].forEach(x=>document.getElementById('i'+x.toLowerCase()).classList.toggle('on',x===b));
}

// 삽입: position 위치 앞에 삽입
function insertAt(pos){
  if(!g.current)return;
  sfx('clk');
  g.seq.splice(pos,0,g.ins);
  renderSeq();
}

// 클릭: CRISPR/결실/메틸화
function clk(i){
  if(!g.current)return;sfx('clk');
  if(g.tool==='crispr'){let r={A:'T',T:'G',G:'C',C:'A'};g.seq[i]=r[g.seq[i]]||g.seq[i];}
  else if(g.tool==='insert'){
    // 삽입 모드면 클릭한 염기 앞에 삽입
    insertAt(i);
    return;
  }
  else if(g.tool==='delete'){g.seq.splice(i,1);}
  else if(g.tool==='methyl'){if(g.seq[i]==='C'&&!g.meth.includes(i))g.meth.push(i);}
  renderSeq();
}

function submit(){
  if(!g.current){
    if(g.queue.length>0)nextPatient();
    return;
  }
  let p=g.current;
  if(chk(p)){
    sfx('ok');
    clearHintGlow();
    g.score+=p.pts;
    document.getElementById('sv').textContent=g.score;
    g.done.push(p.id);
    g.current=null;
    let msg=`✅ ${p.icon} ${p.name} 치료 완료!\n+${p.pts}pt`;
    if(g.queue.length>0){
      pop('✅ 성공!',msg,false,true);
    }else{
      clearInterval(g.tmr);
      setTimeout(()=>endGame(true),200);
    }
  }else{
    sfx('err');
    pop('😢 오류!',`올바르지 않아요.\n다시 확인해 보세요!\n\n힌트: ${p.order.replace(/\n/g,' ')}`,false,false);
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
    // 원본 서열에 correct 배열을 mutIdx[0] 위치 앞에 삽입한 결과와 비교
    let ex=[...p.seq];
    ex.splice(p.mutIdx[0],0,...p.correct);
    return g.seq.join('')===ex.join('');
  }
  return p.mutIdx.every((si,li)=>g.seq[si]===p.correct[li]);
}

function endGame(success){
  clearInterval(g.tmr);
  clearHintGlow();
  sfx('win');
  let elapsed=TOTAL_TIME-g.timeLeft;
  saveScore(g.score,elapsed);
  let done=g.done.length;
  let timeStr=fmtTime(elapsed);
  pop('🎉 연구 완료!',
    `${currentNick}님 수고했어요!\n\n치료 성공: ${done}/7명\n최종 점수: ⭐${g.score}pt\n소요 시간: ${timeStr}`,
    true,false);
}

function pop(t,b,showH,showNext){
  document.getElementById('pT').textContent=t;
  document.getElementById('pB').textContent=b;
  document.getElementById('popH').style.display=showH?'inline-block':'none';
  document.getElementById('popNext').style.display=showNext?'inline-block':'none';
  document.getElementById('pop').classList.add('on');
}
function closePop(){document.getElementById('pop').classList.remove('on');}
function popNext(){closePop();clearEditUI();nextPatient();}
function goTitle(){closePop();if(g.tmr)clearInterval(g.tmr);clearHintGlow();show('T');}
