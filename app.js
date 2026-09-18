(() => {
"use strict";

const $ = id => document.getElementById(id);

const els = {
  script: $("script"), cueText: $("cueText"), viewport: $("cueViewport"),
  cameraBtn: $("cameraBtn"), preview: $("preview"), cameraStatus: $("cameraStatus"),
  recordBtn: $("recordBtn"), stopRecordBtn: $("stopRecordBtn"), recordStatus: $("recordStatus"),
  recordFloat: $("recordFloat"), stopFloat: $("stopFloat"),
  speechTestBtn: $("speechTestBtn"), followBtn: $("followBtn"), speechStopBtn: $("speechStopBtn"),
  speechStatus: $("speechStatus"), transcript: $("transcript"), speechHint: $("speechHint"),
  upBtn: $("upBtn"), downBtn: $("downBtn"), resetBtn: $("resetBtn"), autoBtn: $("autoBtn"),
  fontSizeDesk: $("fontSizeDesk"), opacityDesk: $("opacityDesk"), speedDesk: $("speedDesk"), handDesk: $("handDesk"),
  fontSizeMobile: $("fontSizeMobile"), opacityMobile: $("opacityMobile"), handMobile: $("handMobile"),
  floatControls: $("floatControls"), fullscreenBtn: $("fullscreenBtn"), sampleBtn: $("sampleBtn"),
  diagnostics: $("diagnostics")
};

let stream = null, recorder = null, chunks = [];
let offset = 0, autoTimer = null;
let speech = null, speechMode = "off", speechRunning = false, restartTimer = null;
let finalSpeech = "", lastMatchedWord = 0, speechProgressWord = 0, speechMatchedHistory = "", speechRecognizedCount = 0, speechFinalProcessed = new Set(), speechFinalSignatures = new Set(), lastMatchTime = 0, highlightedWord = -1, animationFrame = null, speechResultCursor = 0;

const SAMPLE = `Здравейте и благодаря за поканата.

Днес ще говорим за една тема, която засяга много хора, и ще се опитаме да я разгледаме спокойно, ясно и разбираемо. Когато човек се сблъска с много информация, често е трудно да разбере кое е важно, кое е актуално и кое може да му бъде полезно на практика. Затова според мен първата стъпка е да подредим въпросите и да търсим отговорите един по един.

Когато подготвям интервю, не се опитвам да запомня всяка дума. Подреждам основните идеи, оставям достатъчно място за естествен разговор и използвам кратки изречения, които мога да следвам спокойно. Така вниманието остава върху човека срещу мен, а не върху опита да си спомня следващото изречение.

Понякога една тема изглежда сложна, защото съдържа много подробности. Ако обаче разделим разговора на няколко основни части, всичко става по-лесно. Първо обясняваме какъв е въпросът. След това казваме какво знаем до момента. После разглеждаме различните възможности и накрая стигаме до практичните неща, които човек може да направи.

За мен е важно информацията да идва от надеждни източници. Това е особено важно, когато става дума за здраве, лечение, научни изследвания или решения, които могат да имат значение за ежедневието. Проверената информация не означава, че всички хора трябва да направят едно и също. Тя означава, че човек има по-добра основа, върху която да разговаря със специалисти и да взема собствените си решения.

В ежедневието често се случва плановете ни да се променят. Понякога имаме повече енергия, понякога по-малко. Понякога можем да направим много, а друг път е необходимо да забавим темпото. Затова не смятам, че има смисъл да се стремим към идеален ден. По-полезно е да намерим ритъм, който можем да поддържаме.

Движението е добър пример. Не е необходимо човек да започва с дълга тренировка или с голяма промяна. Може да започне с няколко минути движение, с кратка разходка, с упражнения вкъщи или с активност, съобразена с индивидуалните възможности. Важното е да има постоянство и да се избира подходящо натоварване.

Същото важи и за почивката. Добрата организация на деня не означава да запълним всяка минута. Напротив, трябва да оставим време за възстановяване, за сън и за нещата, които ни помагат да се чувстваме по-спокойни. Когато човек започне да наблюдава собственото си ежедневие, постепенно може да разбере кои навици му помагат и кои го натоварват.

Храненето също често се превръща в тема с много противоречиви съвети. Затова предпочитам да се придържам към доказана информация и да избягвам крайни обещания. Една промяна има по-голям шанс да остане част от ежедневието, ако е реалистична, постепенно въведена и съобразена с конкретния човек.

Има значение и начинът, по който говорим за трудностите. Когато човек има проблем, не винаги има нужда някой веднага да му каже какво да направи. Понякога първо е необходимо да бъде чут. След това можем да обсъдим какви са възможностите, какви са ограниченията и кои следващи стъпки са реалистични.

Точно затова вярвам, че добрият разговор трябва да оставя място за въпроси. Ако не разбираме нещо, трябва да можем да го попитаме отново. Ако информацията е противоречива, трябва да можем да проверим източника. Ако даден съвет не е подходящ за конкретния човек, трябва да има възможност да се обсъдят алтернативи.

Когато говорим за медицински теми, особено важно е да правим разлика между информация и лична медицинска препоръка. Общата информация може да помогне на човек да разбере темата, но конкретното решение трябва да бъде обсъдено със съответния медицински специалист. Това е начинът информацията да бъде полезна, без да създава фалшива сигурност.

В един интервю разговор е важно също да не бързаме. Ако говорим твърде бързо, можем да пропуснем важна дума или да направим изречението трудно за следене. Затова autocue инструментът трябва да помага, а не да пречи. Текстът трябва да се движи плавно, а контролите да бъдат достъпни, когато човек държи телефона с една ръка.

Ако използваме гласово следене, идеята е проста: човекът чете текста, браузърът разпознава казаното на български и инструментът намира приблизително същите думи в сценария. Когато намери достатъчно добро съвпадение, текстът се премества напред. Ако някоя дума бъде пропусната или разпозната малко по-различно, инструментът не трябва веднага да се връща назад.

Затова при подготовката на интервю е полезно изреченията да бъдат естествени. Кратките изречения, нормалната пунктуация и ясният език помагат както на човека, който чете, така и на системата за разпознаване на реч.

В края на един такъв разговор бих казал, че не е необходимо да знаем всички отговори още днес. По-важно е да задаваме правилните въпроси, да проверяваме информацията и да правим следващата разумна стъпка. Понякога тази стъпка е разговор със специалист. Друг път е промяна в ежедневието, повече движение, повече почивка или просто по-добра организация.

Надявам се този разговор да бъде полезен и практичен. Благодаря ви, че отделихте време да го чуете. Нека продължим с ясна информация, спокойствие и внимание към това, което наистина има значение.`;


function setupCollapsibleSections(){
  const cards=document.querySelectorAll(".collapsible-card");
  cards.forEach(card=>{
    const title=card.querySelector(".collapse-title");
    if(!title) return;
    const toggle=()=>{
      const collapsed=card.classList.toggle("is-collapsed");
      title.setAttribute("aria-expanded",String(!collapsed));
    };
    title.addEventListener("click",toggle);
    title.addEventListener("keydown",e=>{
      if(e.key==="Enter"||e.key===" "){
        e.preventDefault();
        toggle();
      }
    });
  });
}

function log(message) {
  const t = new Date().toLocaleTimeString("bg-BG");
  els.diagnostics.textContent = `[${t}] ${message}`;
}

function normalize(s) {
  return (s || "").toLocaleLowerCase("bg-BG")
    .replace(/ё/g,"е")
    .replace(/[^a-zа-я0-9\s]/gi," ")
    .replace(/\s+/g," ").trim();
}
function tokenize(s){ return normalize(s).split(" ").filter(Boolean); }

function syncSettings(from) {
  const size = from === "mobile" ? els.fontSizeMobile.value : els.fontSizeDesk.value;
  const opacity = from === "mobile" ? els.opacityMobile.value : els.opacityDesk.value;
  const speed = els.speedDesk.value;
  if(from === "mobile"){
    els.fontSizeDesk.value=size; els.opacityDesk.value=opacity;
  }else{
    els.fontSizeMobile.value=size; els.opacityMobile.value=opacity;
  }
  render();
}
function syncHand(value) {
  const side = value || "right";
  els.handDesk.value=side; els.handMobile.value=side; els.floatControls.dataset.side=side;
  log(`Контролите за превъртане са преместени ${side==="left"?"вляво":"вдясно"}.`);
}

function render() {
  const text = els.script.value || "Постави текста си тук…";
  els.cueText.style.fontSize=els.fontSizeDesk.value+"px";
  els.cueText.style.opacity=Number(els.opacityDesk.value)/100;
  els.cueText.style.transform=`translateY(${offset}px)`;

  // Build indexed word spans. This keeps the visual text essentially identical,
  // while allowing speech-following to position the exact next word.
  els.cueText.replaceChildren();
  const parts = text.split(/(\s+)/);
  let wordIndex = 0;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      els.cueText.appendChild(document.createTextNode(part));
    } else if (part) {
      const span = document.createElement("span");
      span.className = "cue-word";
      span.dataset.wordIndex = String(wordIndex);
      if(wordIndex===highlightedWord) span.classList.add("speech-highlight");
      span.textContent = part;
      wordIndex++;
      els.cueText.appendChild(span);
    }
  }
}

function getMaxOffset(){
  // cueText is absolutely positioned and translated with transform.
  // Its scrollHeight can be smaller than the visible content area in this
  // layout, which previously made max offset become 0 and blocked movement.
  const contentHeight=els.cueText.getBoundingClientRect().height;
  const viewportHeight=els.viewport.getBoundingClientRect().height;
  const safety=viewportHeight*0.22;
  return Math.max(0, contentHeight-viewportHeight+safety);
}
function moveBy(px){
  const max=getMaxOffset();
  offset=Math.max(-max,Math.min(80,offset+px));
  els.cueText.style.transform=`translateY(${offset}px)`;
}
function resetCue(){
  offset=0; lastMatchedWord=0; speechProgressWord=0; speechMatchedHistory=""; finalSpeech=""; highlightedWord=-1; speechResultCursor=""; speechFinalSignatures=new Set(); speechRecognizedCount=0;
  if(animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame=null;
  render();
}

function startAuto(){
  stopAuto();
  autoTimer=setInterval(()=>moveBy(-(0.45+Number(els.speedDesk.value)*0.22)),35);
  els.autoBtn.textContent="⏸ Пауза";
}
function stopAuto(){
  if(autoTimer)clearInterval(autoTimer);
  autoTimer=null; els.autoBtn.textContent="▶ Авто";
}

async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){
    els.cameraStatus.textContent="Няма API";
    log("Камерата изисква HTTPS/localhost и актуален браузър.");
    return;
  }
  els.cameraBtn.disabled=true;
  els.cameraStatus.textContent="Стартира…";
  try{
    let s;
    try{
      s=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:720}},audio:true
      });
      log("Камера + микрофон са разрешени.");
    }catch(e){
      log(`Камера+микрофон: ${e.name}. Пробвам камера самостоятелно…`);
      s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"user"}},audio:false});
      log("Камерата работи без микрофон.");
    }
    stream=s; els.preview.srcObject=s; els.preview.muted=true;
    await els.preview.play();
    const hasAudio=s.getAudioTracks().length>0;
    els.cameraStatus.textContent=hasAudio?"Камера + звук":"Само камера";
    els.cameraBtn.textContent="✓ Камерата работи";
    els.recordBtn.disabled=!window.MediaRecorder;
    els.recordFloat.disabled=!window.MediaRecorder;
    log(hasAudio?"Камерата и микрофонът са готови за запис.":"Камерата е готова; записът ще бъде без звук.");
  }catch(e){
    els.cameraBtn.disabled=false; els.cameraStatus.textContent="Грешка";
    let m=e.name||"UnknownError";
    if(e.name==="NotAllowedError")m+=" — разреши камерата и микрофона за този сайт.";
    if(e.name==="NotFoundError")m+=" — не е намерена камера.";
    if(e.name==="NotReadableError")m+=" — камерата се използва от друга програма.";
    if(e.name==="SecurityError")m+=" — използвай HTTPS.";
    log("Камерата не стартира: "+m);
  }
}

function mime(){
  const types=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4"];
  return types.find(t=>window.MediaRecorder?.isTypeSupported(t))||"";
}
function updateRecordButtons(active){
  // Camera-card and floating recording buttons have identical behavior:
  // ● Record -> ⏸ Pause -> ▶ Continue.
  els.recordBtn.disabled=!stream;
  els.recordFloat.disabled=!stream;
  els.stopRecordBtn.disabled=!active;
  els.stopFloat.disabled=!active;

  if(!active){
    els.recordBtn.textContent="●";
    els.recordFloat.textContent="●";
  }
}
function startRecording(){
  if(!stream||!window.MediaRecorder){log("Първо стартирай камерата.");return;}
  chunks=[];
  try{ recorder=new MediaRecorder(stream,mime()?{mimeType:mime()}:undefined); }
  catch(e){log("Записът не може да започне: "+e.message);return;}
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onstop=saveRecording;
  recorder.onerror=e=>log("Грешка при записа.");
  recorder.start(250);
  updateRecordButtons(true);
  els.recordStatus.textContent="● Записва…";
  els.recordBtn.textContent="⏸";
  els.recordFloat.textContent="⏸";
  log("Видео записът започна.");
}
function toggleRecording(){
  if(!recorder||recorder.state==="inactive"){startRecording();return;}
  if(recorder.state==="recording"){
    recorder.pause(); els.recordStatus.textContent="⏸ Пауза"; els.recordBtn.textContent="▶"; els.recordFloat.textContent="▶";
    log("Видео записът е на пауза.");
  }else if(recorder.state==="paused"){
    recorder.resume(); els.recordStatus.textContent="● Записва…"; els.recordBtn.textContent="⏸"; els.recordFloat.textContent="⏸";
    log("Видео записът продължи.");
  }
}
function stopRecording(){
  if(recorder&&recorder.state!=="inactive"){recorder.stop();els.recordStatus.textContent="Обработва…";log("Видео записът е спрян.");}
}
function saveRecording(){
  if(!chunks.length){els.recordStatus.textContent="Няма данни";updateRecordButtons(false);return;}
  const type=recorder.mimeType||"video/webm";
  const blob=new Blob(chunks,{type});
  const url=URL.createObjectURL(blob);
  const ext=type.includes("mp4")?"mp4":"webm";
  const a=document.createElement("a");
  a.href=url;a.download=`bg-autocue-${Date.now()}.${ext}`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  els.recordStatus.textContent="✓ Записът е готов";
  els.recordBtn.textContent="●";
  els.recordFloat.textContent="●";
  updateRecordButtons(false);
  log("Файлът с видеото е създаден и изтеглянето е стартирано.");
}

function speechSupported(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);}
function newSpeech(){
  const C=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!C)return null;
  const r=new C();
  r.lang="bg-BG";r.continuous=true;r.interimResults=true;r.maxAlternatives=3;
  return r;
}
function lev(a,b){
  const dp=new Array(b.length+1);
  for(let j=0;j<=b.length;j++)dp[j]=j;
  for(let i=1;i<=a.length;i++){
    let prev=dp[0];dp[0]=i;
    for(let j=1;j<=b.length;j++){
      const temp=dp[j];
      dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=temp;
    }
  }
  return dp[b.length];
}
function sim(a,b){
  if(a===b)return 1;
  if(!a||!b)return 0;
  if((a.startsWith(b)||b.startsWith(a)) && Math.min(a.length,b.length)>=4){ const ratio=Math.min(a.length,b.length)/Math.max(a.length,b.length); return ratio>=0.55?0.93:ratio; }
  if(a.length>=5&&b.length>=5){
    const d=lev(a,b), m=Math.max(a.length,b.length);
    return 1-d/m;
  }
  return 0;
}
function wordMatchScore(scriptWord, spokenWord){
  if(!scriptWord || !spokenWord)return 0;
  if(scriptWord===spokenWord)return 1;
  if(scriptWord.length<=3 || spokenWord.length<=3)return 0;

  const s=sim(scriptWord,spokenWord);
  if(scriptWord.length===4 || spokenWord.length===4)
    return s>=0.90?s:0;
  return s>=0.68?s:0;
}

function findMatch(spoken){
  const sw=tokenize(els.script.value);
  const tw=tokenize(spoken).slice(-14);
  if(!sw.length||!tw.length)return {index:-1,score:0,count:0,matches:[]};

  const base=Math.max(0,Math.min(speechProgressWord,sw.length-1));
  const limit=Math.min(sw.length,base+10);
  const stop=new Set([
    "и","а","в","във","на","за","с","със","от","до","по","при","че","да",
    "се","си","е","са","ще","не","но","като","която","който","кои","това",
    "тези","този","тази","то","го","ги","му","ми","ме","ви","те","аз","ти",
    "ние","вие","той","тя","как","какво","към","или","ако","след","преди","още","само"
  ]);

  // Word-by-word forward tracking is deliberately used instead of rigid phrase
  // matching. SpeechRecognition often returns a mostly-correct sentence with a
  // few substitutions or omissions. Each recognized word gets one chance to
  // find the earliest compatible script word within the next 10 words.
  let cursor=base;
  const matches=[];

  for(const spokenWord of tw){
    if(cursor>=limit)break;
    if(stop.has(spokenWord) && spokenWord.length<=3){
      // A short grammatical word may help continuity only when it is the next
      // or immediately following script word. Never let it jump across text.
      const exact=sw[cursor]===spokenWord ? cursor : (sw[cursor+1]===spokenWord ? cursor+1 : -1);
      if(exact>=0){
        matches.push({scriptIndex:exact,score:1,spokenWord});
        cursor=exact+1;
      }
      continue;
    }

    let chosen=-1, chosenScore=0;
    for(let i=cursor;i<limit;i++){
      const score=wordMatchScore(sw[i],spokenWord);
      if(score>0){
        chosen=i;chosenScore=score;
        break; // earliest valid match: never jump farther for a nicer score
      }
    }

    if(chosen>=0){
      matches.push({scriptIndex:chosen,score:chosenScore,spokenWord});
      cursor=chosen+1;
    }
  }

  if(!matches.length)return {index:-1,score:0,count:0,matches:[]};

  const strong=matches.filter(m=>m.score>=0.82);
  const average=matches.reduce((sum,m)=>sum+m.score,0)/matches.length;
  const last=matches[matches.length-1];

  // At least one strong content-word match is enough to move. Multiple weaker
  // matches also count when they form a forward chain.
  if(strong.length<1 && matches.length<2)
    return {index:-1,score:average,count:matches.length,matches};

  const confidence=Math.min(1,Math.max(0.50,average));
  return {
    index:Math.min(sw.length-1,last.scriptIndex+1),
    score:confidence,
    count:matches.length,
    matches
  };
}
function getWordElement(index){
  if(!els.cueText)return null;
  return els.cueText.querySelector(`.cue-word[data-word-index="${index}"]`);
}

function moveToWord(idx,matchedWordCount=0,matchConfidence=0){
  const total=tokenize(els.script.value).length;
  if(!total || !els.viewport || !els.cueText)return;

  const nextIndex=Math.max(0,Math.min(total-1,idx));
  highlightedWord=nextIndex;
  render();

  const target=getWordElement(nextIndex);
  if(!target)return;

  const viewportRect=els.viewport.getBoundingClientRect();
  const targetRect=target.getBoundingClientRect();
  const guideY=viewportRect.top+viewportRect.height*0.50;
  const targetY=targetRect.top+targetRect.height*0.50;
  let delta=guideY-targetY;

  // Once the next word drops below the guide, bring it back to the guide.
  // A tiny dead-zone prevents jitter while staying on the same text line.
  if(targetRect.top > viewportRect.top+viewportRect.height*0.60){
    delta=guideY-targetY;
  }else if(targetRect.bottom < viewportRect.top+viewportRect.height*0.34){
    delta=guideY-targetY;
  }else if(Math.abs(delta)<8){
    return;
  }

  const max=Math.max(0,els.cueText.offsetHeight-els.viewport.clientHeight+els.viewport.clientHeight*0.20);
  const desired=offset+delta;
  const targetOffset=Math.max(-max,Math.min(80,desired));

  if(Math.abs(targetOffset-offset)<2){
    offset=targetOffset;
    els.cueText.style.transform=`translate3d(0,${offset}px,0)`;
    return;
  }

  if(animationFrame)cancelAnimationFrame(animationFrame);
  const startOffset=offset;
  const distance=targetOffset-startOffset;
  const maxJump=Math.max(90,Math.min(360,viewportRect.height*0.65));
  const bounded=startOffset+Math.max(-maxJump,Math.min(maxJump,distance));
  const duration=Math.max(300,Math.min(750,280+Math.abs(bounded-startOffset)*1.15));
  const started=performance.now();
  const ease=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

  const animate=now=>{
    const p=Math.min(1,(now-started)/duration);
    offset=startOffset+(bounded-startOffset)*ease(p);
    els.cueText.style.transform=`translate3d(0,${offset}px,0)`;
    if(p<1)animationFrame=requestAnimationFrame(animate);
    else animationFrame=null;
  };
  animationFrame=requestAnimationFrame(animate);
}
function handleSpeechResult(event){
  let display="";
  for(let i=0;i<event.results.length;i++){
    display+=(event.results[i][0]?.transcript||"")+" ";
  }
  els.transcript.textContent=display.trim()||"—";
  els.transcript.scrollTop=els.transcript.scrollHeight;

  if(speechMode!=="follow"||!event.results.length)return;

  // Process every recognition result that changed since the previous event.
  // Final results are kept by the browser; interim results are revised. The
  // signature filter lets us use both without double-counting identical text.
  const start=Math.max(0,Number.isInteger(event.resultIndex)?event.resultIndex:event.results.length-1);
  let latestMatch=null;
  let latestMatched=[];

  for(let i=start;i<event.results.length;i++){
    const result=event.results[i];
    const phrase=(result[0]?.transcript||"").trim();
    if(!phrase)continue;

    const signature=`${i}|${result.isFinal?1:0}|${phrase}`;
    if(result.isFinal){
      if(speechFinalSignatures.has(signature))continue;
      speechFinalSignatures.add(signature);
    }else{
      if(speechResultCursor===signature)continue;
      speechResultCursor=signature;
    }

    const match=findMatch(phrase);
    if(match.index>speechProgressWord){
      speechProgressWord=match.index;
      lastMatchedWord=match.index;
      lastMatchTime=Date.now();
      speechRecognizedCount+=match.count;
      latestMatch=match;
      latestMatched=match.matches||[];
    }

    if(result.isFinal){
      // Keep only a short finalized history for diagnostics/context. Matching
      // itself intentionally uses the current changed segment so old speech
      // cannot interfere with the forward cursor.
      speechMatchedHistory=tokenize((speechMatchedHistory+" "+phrase)).slice(-14).join(" ");
    }
  }

  if(latestMatch && latestMatch.index>0){
    moveToWord(latestMatch.index,latestMatch.count,latestMatch.score);
    const trail=latestMatched.slice(-6).map(m=>`${m.spokenWord}→${m.scriptIndex+1}`).join(", ");
    log(`Следене: ${trail}; +${latestMatch.count} съвп.; ${(latestMatch.score*100).toFixed(0)}%; курсор ${latestMatch.index}/${tokenize(els.script.value).length}.`);
  }
}
function attachSpeech(r){
  r.onstart=()=>{
    speechRunning=true;
    els.speechStatus.textContent=speechMode==="follow"?"Следи…":"Слуша…";
    els.speechHint.textContent=speechMode==="follow"
      ?"Слушам български. Чети текста нормално; курсорът следва само напред."
      :"Кажи няколко думи на български.";
    updateSpeechButtons();
    log("Гласовото разпознаване започна.");
  };

  r.onaudiostart=()=>{
    els.speechStatus.textContent=speechMode==="follow"?"Слушам…":"Слушам…";
  };

  r.onspeechstart=()=>{
    els.speechStatus.textContent=speechMode==="follow"?"Следи…":"Слуша…";
  };

  r.onresult=handleSpeechResult;

  r.onerror=e=>{
    speechRunning=false;
    const err=e.error||"unknown";
    log(`Гласово разпознаване: ${err}.`);

    // These are normal interruptions; the onend handler will restart them.
    if(err==="no-speech" || err==="aborted"){
      els.speechStatus.textContent=speechMode==="follow"?"Пауза":"Готово";
      return;
    }

    els.speechStatus.textContent="Грешка";
    const fatal=["not-allowed","service-not-allowed","language-not-supported","audio-capture"];

    if(fatal.includes(err)){
      speechMode="off";
      clearTimeout(restartTimer);
      updateSpeechButtons();

      if(err==="not-allowed"){
        els.speechHint.textContent="Микрофонът е отказан. Разреши Microphone за този сайт и натисни отново.";
      }else if(err==="language-not-supported"){
        els.speechHint.textContent="Браузърът не предлага bg-BG за SpeechRecognition.";
      }else if(err==="audio-capture"){
        els.speechHint.textContent="Микрофонът е зает или недостъпен. Провери разрешенията и другите приложения, които използват микрофона.";
      }else{
        els.speechHint.textContent="Браузърът не предостави гласовата услуга.";
      }
    }else if(err==="network"){
      els.speechHint.textContent="Гласовата услуга не отговори. Провери интернет връзката и натисни отново.";
    }else{
      els.speechHint.textContent="Гласовото разпознаване прекъсна. Натисни отново.";
    }
  };

  r.onend=()=>{
    speechRunning=false;

    if(speechMode==="off"){
      updateSpeechButtons();
      return;
    }

    els.speechStatus.textContent=speechMode==="follow"?"Пауза":"Готово";
    clearTimeout(restartTimer);

    restartTimer=setTimeout(()=>{
      if(speechMode!=="off" && speech===r && !speechRunning){
        try{
          r.start();
        }catch(e){
          // A browser may still consider the previous recognition session active.
          // Recreate the object instead of leaving the user with a dead button.
          log("Повторен старт чрез нова SpeechRecognition сесия.");
          speechRunning=false;
          const mode=speechMode;
          const replacement=newSpeech();
          if(!replacement)return;
          speech=replacement;
          attachSpeech(replacement);
          try{
            replacement.start();
          }catch(err2){
            speechMode="off";
            speech=null;
            updateSpeechButtons();
            els.speechStatus.textContent="Грешка";
            els.speechHint.textContent="Не успях да стартирам гласовото следене. Провери разрешението за микрофона и опитай отново.";
            log("Неуспешен повторен старт: "+(err2.message||err2));
          }
        }
      }
    },350);
  };
}

function updateSpeechButtons(){
  const active=speechMode!=="off";
  els.speechTestBtn.disabled=active;
  els.followBtn.disabled=active;
  els.speechStopBtn.disabled=!active;
}

function startSpeech(mode){
  if(!speechSupported()){
    els.speechStatus.textContent="Няма поддръжка";
    els.speechHint.textContent="SpeechRecognition не е наличен в този браузър. Пробвай актуален Chrome или Edge.";
    log("SpeechRecognition не е наличен в този браузър.");
    return;
  }

  // Stop any previous session first. A fresh object avoids the common
  // InvalidStateError caused by trying to start an already-used recognition
  // instance while the browser is still closing the previous one.
  speechMode="off";
  clearTimeout(restartTimer);
  if(speech){try{speech.abort();}catch(_){} speech=null;}
  speechRunning=false;

  speechMode=mode;
  finalSpeech="";
  speechResultCursor=0;

  if(mode==="follow"){
    lastMatchedWord=0;
    speechProgressWord=0;
    speechMatchedHistory="";
    speechRecognizedCount=0;
    speechFinalProcessed=new Set();
    speechFinalSignatures=new Set();
    speechResultCursor="";
    offset=0;
    highlightedWord=-1;
    render();
  }

  const r=newSpeech();
  if(!r){
    speechMode="off";
    updateSpeechButtons();
    return;
  }

  speech=r;
  attachSpeech(r);
  updateSpeechButtons();
  els.speechStatus.textContent="Стартира…";
  els.speechHint.textContent=mode==="follow"
    ?"Стартирам гласовото следене…"
    :"Стартирам теста за български…";

  // This call must remain directly inside the button click path so browsers
  // that require a user gesture can open the microphone recognition service.
  try{
    r.start();
    log(mode==="follow"
      ?"Гласовото следене е стартирано. Започни от началото на текста."
      :"Тестът за български е стартиран. Кажи няколко думи.");
  }catch(e){
    speechMode="off";
    speechRunning=false;
    speech=null;
    updateSpeechButtons();
    els.speechStatus.textContent="Грешка";

    const msg=String(e?.message||e||"");
    if(msg.toLowerCase().includes("not allowed")){
      els.speechHint.textContent="Браузърът отказа достъп до микрофона. Разреши Microphone за този сайт и натисни отново.";
    }else{
      els.speechHint.textContent="Стартът на гласовото разпознаване беше отказан. Провери микрофона и натисни отново.";
    }
    log("Неуспешен старт на речта: "+msg);
  }
}

function stopSpeech(){
  speechMode="off";
  clearTimeout(restartTimer);
  if(speech){try{speech.abort();}catch(_){}}
  speech=null; speechRunning=false;
  updateSpeechButtons();
  els.speechStatus.textContent="Готово";
  els.speechHint.textContent="Гласовото разпознаване е спряно.";
}


function toggleFullscreen(){
  const active=!document.body.classList.contains("fullscreen-mode");
  document.body.classList.toggle("fullscreen-mode",active);
  els.fullscreenBtn.textContent=active?"⛶ Изход от цял екран":"⛶ Цял екран";
  if(active){
    if(document.documentElement.requestFullscreen){
      document.documentElement.requestFullscreen().catch(()=>log("Native fullscreen не е разрешен; използвам режим на цял екран в страницата."));
    }else log("Браузърът няма Native Fullscreen API; използвам режим на цял екран в страницата.");
  }else if(document.fullscreenElement && document.exitFullscreen){
    document.exitFullscreen().catch(()=>{});
  }
}

document.addEventListener("fullscreenchange",()=>{
  // CSS fullscreen remains active until the user presses our button again.
  // This prevents a browser fullscreen transition from destroying the layout.
  if(document.fullscreenElement){
    document.body.classList.add("fullscreen-mode");
    els.fullscreenBtn.textContent="⛶ Изход от цял екран";
  }
});

const bindMove=(button,amount)=>button.addEventListener("click",e=>{e.preventDefault();moveBy(amount);});
bindMove(els.upBtn,110);
bindMove(els.downBtn,-110);
els.resetBtn.addEventListener("click",resetCue);
els.autoBtn.addEventListener("click",()=>autoTimer?stopAuto():startAuto());
els.viewport.addEventListener("wheel",e=>{e.preventDefault();moveBy(-e.deltaY);},{passive:false});
let touchStartY=null;
els.viewport.addEventListener("touchstart",e=>{touchStartY=e.touches[0]?.clientY??null;},{passive:true});
els.viewport.addEventListener("touchmove",e=>{
  if(touchStartY===null)return;
  const y=e.touches[0]?.clientY??touchStartY;
  const dy=y-touchStartY;
  if(Math.abs(dy)>3){moveBy(dy>0?6:-6);touchStartY=y;}
  e.preventDefault();
},{passive:false});
els.viewport.addEventListener("touchend",()=>{touchStartY=null;},{passive:true});
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowDown"){e.preventDefault();moveBy(-70);}
  if(e.key==="ArrowUp"){e.preventDefault();moveBy(70);}
});

els.fontSizeDesk.addEventListener("input",()=>{els.fontSizeMobile.value=els.fontSizeDesk.value;render();});
els.fontSizeMobile.addEventListener("input",()=>syncSettings("mobile"));
els.opacityDesk.addEventListener("input",()=>{els.opacityMobile.value=els.opacityDesk.value;render();});
els.opacityMobile.addEventListener("input",()=>syncSettings("mobile"));
els.speedDesk.addEventListener("input",()=>{});
els.handDesk.addEventListener("change",()=>syncHand(els.handDesk.value));
els.handMobile.addEventListener("change",()=>syncHand(els.handMobile.value));

els.script.addEventListener("input",()=>resetCue());
els.sampleBtn.addEventListener("click",()=>{els.script.value=SAMPLE;resetCue();log("Дългият примерен текст е зареден.");});
els.cameraBtn.addEventListener("click",startCamera);
els.recordBtn.addEventListener("click",toggleRecording);
els.stopRecordBtn.addEventListener("click",stopRecording);
els.recordFloat.addEventListener("click",toggleRecording);
els.stopFloat.addEventListener("click",stopRecording);
els.speechTestBtn.addEventListener("click",e=>{e.stopPropagation();startSpeech("test");});
els.followBtn.addEventListener("click",e=>{e.stopPropagation();startSpeech("follow");});
els.speechStopBtn.addEventListener("click",e=>{e.stopPropagation();stopSpeech();});
els.fullscreenBtn.addEventListener("click",toggleFullscreen);

window.addEventListener("beforeunload",()=>{
  stopSpeech();stopAuto();
  if(stream)stream.getTracks().forEach(t=>t.stop());
});

els.fontSizeMobile.value=els.fontSizeDesk.value;
els.opacityMobile.value=els.opacityDesk.value;
els.handMobile.value=els.handDesk.value;
syncHand("right");
updateSpeechButtons();
setupCollapsibleSections();
render();
if(!speechSupported()){
  log("SpeechRecognition не е наличен. Пробвай актуален Chrome/Edge; останалите функции са независими.");
  if(els.speechHint) els.speechHint.textContent="Този браузър не предлага SpeechRecognition. Камерата и ръчният autocue работят независимо.";
}else{
  if(els.speechHint) els.speechHint.textContent="bg-BG е наличен. На телефон започвай от бутон „Тест на български“.";
}
})();
