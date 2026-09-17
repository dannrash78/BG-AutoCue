const $=id=>document.getElementById(id);
const scriptEl=$('script'), cueText=$('cueText'), preview=$('preview'), stage=$('stage');
let stream=null, recorder=null, chunks=[], running=false, voice=false, recognition=null;
let words=[], wordIndex=0, manualOffset=0, lastFinal="", recording=false;

const example=`Диагностициран съм с множествена склероза през 2006 година, но първите ми симптоми започнаха още през 2001-ва.
Така че реално съм с болестта вече повече от 20 години.

Да, приемам терапия, която е по Здравната каса.

Да. През последните две години имам интензивна кинезитерапия със специалист всяка седмица.

Определено виждам подобрение. Балансът ми е по-добър, походката ми е по-стабилна, а имам и подобрение в силата.

По болнична епикриза имам пареза на крака. При последния профилактичен преглед обаче неврологът я определи като субективна.

Не. Всъщност при мен се е случвало и обратното — имал съм лекари, които са отричали необходимостта от рехабилитация и са ми казвали, че трябва повече да лежа и да почивам.`;

function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[„“"«».,!?;:()\\[\\]{}—–-]/g,' ').replace(/\s+/g,' ').trim();}
function rebuild(){words=normalize(scriptEl.value).split(' ').filter(Boolean); cueText.textContent=scriptEl.value||'Постави текста за autocue'; wordIndex=0; manualOffset=0; renderCue();}
function renderCue(){
  const fs=+$('fontSize').value, top=+$('topOffset').value;
  cueText.style.fontSize=fs+'px'; cueText.style.top=top+'%';
  if(!words.length){cueText.style.transform='translateY(0)';return}
  // Move text upward as recognized position advances; keep a generous amount visible.
  const lineStep=fs*1.28*2.1;
  cueText.style.transform=`translateY(-${Math.max(0,wordIndex+manualOffset)*lineStep/2}px)`;
}
function setStatus(t){$('status').textContent=t}
scriptEl.addEventListener('input',rebuild);
$('fontSize').addEventListener('input',()=>{$('fontOut').textContent=$('fontSize').value+' px';renderCue()});
$('topOffset').addEventListener('input',()=>{$('topOut').textContent=$('topOffset').value+'%';renderCue()});
$('speed').addEventListener('input',()=>{$('speedOut').textContent=$('speed').value+'%'});
$('loadExample').onclick=()=>{scriptEl.value=example;rebuild()};
$('clearScript').onclick=()=>{scriptEl.value='';rebuild()};

async function startCamera(){
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1920},height:{ideal:1080}},audio:true});
  preview.srcObject=stream; $('startBtn').disabled=false; $('recordBtn').disabled=false;
  setStatus('Камерата е готова');
 }catch(e){setStatus('Няма достъп до камера/микрофон: '+e.message)}
}
$('cameraBtn').onclick=startCamera;

function startRun(){
 if(!words.length){alert('Постави текст за autocue.');return}
 running=true;$('startBtn').disabled=true;$('pauseBtn').disabled=false;setStatus('Говори естествено — autocue-то следва гласа ти');
 if(voice) startRecognition(); else manualTick();
}
function pauseRun(){running=false;$('startBtn').disabled=false;$('pauseBtn').disabled=true;stopRecognition();setStatus('Пауза')}
$('startBtn').onclick=startRun;$('pauseBtn').onclick=pauseRun;
$('resetBtn').onclick=()=>{running=false;wordIndex=0;manualOffset=0;stopRecognition();$('startBtn').disabled=!stream; $('pauseBtn').disabled=true;setStatus(stream?'Камерата е готова':'Камерата не е стартирана');renderCue()};

function manualTick(){
 if(!running||voice)return;
 const delay=9000-(+$('speed').value*75);
 wordIndex=Math.min(words.length-1,wordIndex+1);renderCue();
 if(wordIndex>=words.length-1){running=false;setStatus('Край на текста')}
 else setTimeout(manualTick,Math.max(1500,delay));
}
$('manualUp').onclick=()=>{wordIndex=Math.max(0,wordIndex-2);renderCue()};
$('manualDown').onclick=()=>{wordIndex=Math.min(Math.max(0,words.length-1),wordIndex+2);renderCue()};

function initRecognition(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){$('voiceBtn').disabled=true;$('voiceBtn').textContent='🎙️ Гласово следене: неподдържано';return}
 recognition=new SR(); recognition.lang='bg-BG'; recognition.continuous=true; recognition.interimResults=true; recognition.maxAlternatives=1;
 recognition.onresult=e=>{
  let interim='';
  for(let i=e.resultIndex;i<e.results.length;i++){
   const text=e.results[i][0].transcript;
   if(e.results[i].isFinal) lastFinal+=' '+text; else interim+=' '+text;
  }
  const heard=normalize(lastFinal+' '+interim); $('transcript').textContent=heard||'—';
  if(!running)return;
  advanceByMatch(heard);
 };
 recognition.onerror=e=>{setStatus('Гласовото следене: '+e.error); if(running)setTimeout(startRecognition,700)};
 recognition.onend=()=>{if(running&&voice)setTimeout(startRecognition,250)};
}
function advanceByMatch(heard){
 if(!words.length)return;
 const hw=heard.split(' ').filter(Boolean), current=Math.min(wordIndex,words.length-1);
 // Search ahead for a short distinctive phrase, allowing recognition mistakes.
 let best=-1, bestScore=0;
 const start=Math.max(0,current-3), end=Math.min(words.length,current+45);
 for(let i=start;i<end;i++){
  let score=0;
  for(let j=0;j<Math.min(7,hw.length);j++){
   if(hw[hw.length-1-j]===words[i-j])score++;
  }
  if(score>bestScore){bestScore=score;best=i}
 }
 if(best>=current && bestScore>=2){wordIndex=Math.min(words.length-1,best+2);renderCue()}
}
function startRecognition(){if(!recognition)return;try{recognition.start()}catch(e){}}
function stopRecognition(){try{recognition&&recognition.stop()}catch(e){}}
$('voiceBtn').onclick=()=>{
 voice=!voice; $('voiceBtn').textContent='🎙️ Гласово следене: '+(voice?'ВКЛ.':'ИЗКЛ.');
 if(voice&&running)startRecognition(); else stopRecognition();
};

$('recordBtn').onclick=()=>{
 if(!stream)return;
 if(!recorder||recorder.state==='inactive'){
  chunks=[];
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')?'video/webm;codecs=vp9,opus':'video/webm';
  recorder=new MediaRecorder(stream,{mimeType:mime});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=()=>{
   const blob=new Blob(chunks,{type:recorder.mimeType});
   const url=URL.createObjectURL(blob); $('download').href=url;$('download').download='bg-autocue-video.webm';$('download').classList.remove('hidden');
  };
  recorder.start(); recording=true;stage.classList.add('recording');$('recordBtn').textContent='⏹ Спри записа';setStatus('Записва се видео');
 }else{
  recorder.stop();recording=false;stage.classList.remove('recording');$('recordBtn').textContent='⏺ Запис';setStatus('Видеото е готово за запазване');
 }
};

$('themeBtn').onclick=()=>document.body.classList.toggle('dark');
initRecognition();rebuild();
