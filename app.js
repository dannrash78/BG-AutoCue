(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const scriptEl = $("script");
  const cueText = $("cueText");
  const cueViewport = $("cueViewport");
  const preview = $("preview");
  const cameraBtn = $("cameraBtn");
  const recordBtn = $("recordBtn");
  const stopRecordBtn = $("stopRecordBtn");
  const cameraStatus = $("cameraStatus");
  const recordStatus = $("recordStatus");
  const diagnostics = $("diagnostics");
  const speechStatus = $("speechStatus");
  const transcriptEl = $("transcript");
  const speechTestBtn = $("speechTestBtn");
  const followBtn = $("followBtn");
  const speechStopBtn = $("speechStopBtn");
  const upBtn = $("upBtn");
  const downBtn = $("downBtn");
  const resetBtn = $("resetBtn");
  const autoBtn = $("autoBtn");
  const fontSize = $("fontSize");
  const speed = $("speed");
  const cueOpacity = $("cueOpacity");
  const handSide = $("handSide");
  const fontSizeDesk = $("fontSizeDesk");
  const speedDesk = $("speedDesk");
  const cueOpacityDesk = $("cueOpacityDesk");
  const handSideDesk = $("handSideDesk");
  const mobileControls = $("mobileControls");
  const recordFloatBtn = $("recordFloatBtn");
  const stopRecordFloatBtn = $("stopRecordFloatBtn");
  const fullscreenBtn = $("fullscreenBtn");
  const sampleBtn = $("sampleBtn");

  let cameraStream = null;
  let recorder = null;
  let recordedChunks = [];
  let speech = null;
  let speechMode = "off"; // off | test | follow
  let autoTimer = null;
  let offset = 0;
  let lastSpeechRestart = 0;
  let lastMatchedWord = 0;
  let speechBusy = false;
  let speechRestartTimer = null;

  const sampleText = `Здравейте и благодаря за поканата.

Днес ще говорим за една важна тема и за начина, по който човек може да подреди информацията около себе си, когато има много въпроси и много различни мнения. За мен най-важното е разговорът да бъде спокоен, ясен и човешки.

Когато подготвям подобно интервю, се старая първо да разбера какво искам да кажа, а след това да го подредя в кратки и разбираеми изречения. Така по време на разговора мога да следвам основната идея, без да се притеснявам, че ще пропусна нещо важно.

Понякога една тема изглежда много сложна, защото съдържа много подробности. Ако обаче я разделим на няколко основни въпроса, става много по-лесно да се обясни. Първо казваме какъв е проблемът, след това какво знаем до момента, какви са възможните решения и накрая какво можем да направим на практика.

За мен е важно информацията да идва от надеждни източници и да бъде представена на разбираем език. Това не означава да пропускаме важните детайли. Означава да ги обясним така, че човекът отсреща да може да ги използва, когато взема собствено решение.

В ежедневието често се налага да променяме плановете си. Затова не трябва да очакваме всичко да бъде идеално. По-важно е да имаме посока, да правим малки стъпки и да продължаваме напред. Понякога именно малките промени дават най-добрия резултат, защото могат да се превърнат в устойчив навик.

Ако говорим за движение, например, не е необходимо всеки човек да започва с дълга тренировка. Може да се започне с кратка разходка, няколко упражнения вкъщи или с движение, съобразено с индивидуалните възможности. Важното е активността да бъде подходяща и да се превърне в част от ежедневието.

Същото важи и за почивката, съня, храненето и организацията на деня. Когато тези неща са подредени, човек по-лесно забелязва какво му помага и какво го натоварва. Това позволява постепенно да направи по-информирани промени.

В края на един такъв разговор бих казал следното: не е необходимо да знаем всички отговори още днес. Достатъчно е да имаме правилните въпроси, да проверяваме информацията и да търсим решения стъпка по стъпка.

Благодаря ви, че отделихте време за този разговор. Надявам се той да бъде полезен, разбираем и практичен. Нека продължим спокойно, с ясна информация и с увереността, че всяка малка крачка напред има значение.`;

  function log(msg) {
    const time = new Date().toLocaleTimeString("bg-BG");
    diagnostics.textContent = `[${time}] ${msg}`;
  }

  function normalize(s) {
    return (s || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(s) {
    return normalize(s).split(" ").filter(Boolean);
  }

  function renderCue() {
    const raw = scriptEl.value || "Постави текста си тук…";
    cueText.innerHTML = "";
    const parts = raw.split(/(\s+)/);
    let wordNo = 0;
    for (const part of parts) {
      if (/\s+/.test(part)) {
        cueText.appendChild(document.createTextNode(part));
      } else if (part) {
        const span = document.createElement("span");
        span.className = "cue-word";
        span.dataset.word = String(wordNo++);
        span.textContent = part;
        cueText.appendChild(span);
      }
    }
    cueText.style.fontSize = `${fontSize.value}px`;
    cueText.style.opacity = Number(cueOpacity.value) / 100;
    cueText.style.transform = `translateY(${offset}px)`;
  }

  function syncHandSide(side) {
    const value = side || handSide.value || handSideDesk.value || "left";
    mobileControls.dataset.side = value;
    handSide.value = value;
    handSideDesk.value = value;
  }

  function moveBy(delta) {
    offset += delta;
    const max = Math.max(0, cueText.scrollHeight - cueViewport.clientHeight + 100);
    offset = Math.max(-max, Math.min(150, offset));
    renderCue();
  }

  function resetCue() {
    offset = 0;
    lastMatchedWord = 0;
    renderCue();
  }

  function startAuto() {
    stopAuto();
    const tick = () => {
      const amount = 0.35 + Number(speed.value) * 0.18;
      moveBy(-amount);
    };
    autoTimer = setInterval(tick, 35);
    autoBtn.textContent = "⏸ Пауза";
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
    autoBtn.textContent = "▶ Авто";
  }

  function toggleAuto() {
    if (autoTimer) stopAuto(); else startAuto();
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraStatus.textContent = "Няма API";
      log("Този браузър не поддържа камера достъп. Използвай HTTPS (GitHub Pages) и актуален Chrome/Safari.");
      return;
    }

    cameraBtn.disabled = true;
    cameraStatus.textContent = "Стартира…";
    log("Стартиране на камерата независимо от останалите модули…");

    try {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });
        log("Камера + микрофон са разрешени.");
      } catch (firstError) {
        log(`Камера+микрофон не стартираха (${firstError.name}). Пробвам камера без аудио…`);
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" } },
          audio: false
        });
        log("Камерата работи. Микрофонът не е достъпен; записът ще бъде без звук.");
      }

      preview.srcObject = cameraStream;
      preview.muted = true;
      preview.setAttribute("playsinline", "");
      await preview.play();

      cameraStatus.textContent = cameraStream.getAudioTracks().length ? "Камера + звук" : "Само камера";
      cameraBtn.textContent = "✓ Камерата работи";
      recordBtn.disabled = !window.MediaRecorder;
      log("Камерата е стартирана. Маркерът за лице е в отделния видео прозорец и не покрива текста.");
    } catch (error) {
      cameraBtn.disabled = false;
      cameraStatus.textContent = "Грешка";
      let msg = error.name || "UnknownError";
      if (error.name === "NotAllowedError") msg += " — разреши камерата/микрофона за този сайт.";
      else if (error.name === "NotFoundError") msg += " — не е намерена камера.";
      else if (error.name === "NotReadableError") msg += " — камерата вероятно се използва от друга програма.";
      else if (error.name === "SecurityError") msg += " — сайтът трябва да е HTTPS.";
      else if (error.name === "OverconstrainedError") msg += " — неподдържани настройки; пробвай отново.";
      log("Неуспешен старт на камерата: " + msg);
    }
  }

  function chooseMimeType() {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    ];
    return types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
  }

  function setRecordButtons(recording) {
    recordBtn.disabled = recording;
    recordFloatBtn.disabled = recording;
    stopRecordBtn.disabled = !recording;
    stopRecordFloatBtn.disabled = !recording;
    recordFloatBtn.textContent = recording ? "⏸ Пауза" : "⏺ Запис";
  }

  function startRecording() {
    if (!cameraStream || !window.MediaRecorder) {
      log("Няма активна камера или MediaRecorder.");
      return;
    }
    recordedChunks = [];
    const mimeType = chooseMimeType();
    try {
      recorder = new MediaRecorder(cameraStream, mimeType ? { mimeType } : undefined);
    } catch (e) {
      log("MediaRecorder не може да започне: " + e.message);
      return;
    }

    recorder.ondataavailable = e => {
      if (e.data && e.data.size) recordedChunks.push(e.data);
    };
    recorder.onstop = saveRecording;
    recorder.start(250);
    setRecordButtons(true);
    recordStatus.textContent = "● Записва…";
    log("Записът започна.");
  }

  function toggleRecording() {
    if (!recorder || recorder.state === "inactive") {
      startRecording();
      return;
    }
    if (recorder.state === "recording") {
      recorder.pause();
      recordStatus.textContent = "Ⅱ Пауза";
      recordFloatBtn.textContent = "▶ Продължи";
      log("Записът е на пауза.");
    } else if (recorder.state === "paused") {
      recorder.resume();
      recordStatus.textContent = "● Записва…";
      recordFloatBtn.textContent = "⏸ Пауза";
      log("Записът продължи.");
    }
  }

  function stopRecording() {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      recordStatus.textContent = "Обработва…";
    }
  }

  function saveRecording() {
    if (!recordedChunks.length) {
      recordStatus.textContent = "Няма данни";
      return;
    }
    const type = recorder.mimeType || "video/webm";
    const blob = new Blob(recordedChunks, { type });
    const ext = type.includes("mp4") ? "mp4" : "webm";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bg-autocue-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    recordStatus.textContent = "Записът е готов";
    setRecordButtons(false);
    log("Записът е записан локално като файл.");
  }

  function browserSpeechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function makeSpeech() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang = "bg-BG";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 3;
    return r;
  }

  function tokenSimilarity(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    if (a.startsWith(b) || b.startsWith(a)) return Math.min(a.length,b.length) / Math.max(a.length,b.length);
    return 0;
  }

  function phraseScore(scriptTokens, spokenTokens, pos) {
    const n = spokenTokens.length;
    let score = 0, hits = 0;
    for (let j = 0; j < n && pos + j < scriptTokens.length; j++) {
      const sim = tokenSimilarity(scriptTokens[pos+j], spokenTokens[j]);
      if (sim >= 0.72) { score += sim; hits++; }
    }
    return { score: hits ? score / n : 0, hits };
  }

  function findScriptMatch(spoken) {
    const sw = words(scriptEl.value);
    const tw = words(spoken);
    if (!sw.length || !tw.length) return -1;
    const recent = tw.slice(-8);
    const start = Math.max(0, lastMatchedWord - 8);
    const end = Math.min(sw.length, lastMatchedWord + 90);
    let best = { score: 0, index: -1, hits: 0 };

    for (let n = Math.min(8, recent.length); n >= 2; n--) {
      const phrase = recent.slice(-n);
      for (let i = start; i <= end - n; i++) {
        const s = phraseScore(sw, phrase, i);
        if (s.hits >= Math.max(2, Math.ceil(n * 0.6))) {
          const weighted = s.score + n * 0.045;
          if (weighted > best.score) best = { score: weighted, index: i + n, hits: s.hits };
        }
      }
    }

    // If a phrase is not available, use a distinctive recent word ahead of the cursor.
    if (best.index < 0) {
      for (let j = recent.length - 1; j >= 0; j--) {
        const w = recent[j];
        if (w.length < 4) continue;
        for (let i = start; i < end; i++) {
          if (sw[i] === w) return i + 1;
        }
      }
    }
    return best.index;
  }

  function moveCueToWord(wordIndex) {
    const target = cueText.querySelector(`.cue-word[data-word="${Math.max(0, wordIndex - 1)}"]`);
    if (target) {
      const targetTop = target.offsetTop;
      const guideY = cueViewport.clientHeight * 0.42;
      const max = Math.max(0, cueText.scrollHeight - cueViewport.clientHeight + 100);
      offset = Math.max(-max, Math.min(150, guideY - targetTop));
    } else {
      const total = words(scriptEl.value).length;
      const ratio = total ? wordIndex / total : 0;
      const max = Math.max(0, cueText.scrollHeight - cueViewport.clientHeight + 100);
      offset = -ratio * max;
    }
    renderCue();
  }

  function attachSpeechHandlers(r) {
    r.onstart = () => {
      speechBusy = true;
      speechStatus.textContent = speechMode === "follow" ? "Следи…" : "Слуша…";
      log("Българското гласово разпознаване е стартирано (bg-BG).");
    };

    r.onresult = event => {
      let display = "";
      let newSpeech = "";
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        display += text + " ";
        if (i >= event.resultIndex) newSpeech += text + " ";
      }
      transcriptEl.textContent = display.trim() || "—";

      if (speechMode === "follow") {
        const idx = findScriptMatch(newSpeech || display);
        if (idx > lastMatchedWord) {
          lastMatchedWord = idx;
          moveCueToWord(idx);
          log(`Гласово следене: намерено съвпадение около дума ${idx}.`);
        }
      }
    };

    r.onerror = event => {
      speechBusy = false;
      speechStatus.textContent = "Грешка";
      log(`Гласово разпознаване: ${event.error}.`);
      if (["not-allowed", "service-not-allowed", "language-not-supported"].includes(event.error)) {
        speechMode = "off";
      }
    };

    r.onend = () => {
      speechBusy = false;
      if (speechMode === "off") {
        speechStopBtn.disabled = true;
        followBtn.disabled = false;
        speechTestBtn.disabled = false;
        speechStatus.textContent = "Готово";
        return;
      }
      clearTimeout(speechRestartTimer);
      speechRestartTimer = setTimeout(() => {
        if (speechMode !== "off" && speech && !speechBusy) {
          try { speech.start(); } catch (_) {}
        }
      }, 450);
    };
  }

  function startSpeech(mode) {
    if (!browserSpeechSupported()) {
      speechStatus.textContent = "Няма поддръжка";
      log("Този браузър не предлага SpeechRecognition. Камерата и ръчният autocue остават независими.");
      return;
    }

    stopSpeech();
    speechMode = mode;
    speech = makeSpeech();
    if (!speech) return;
    attachSpeechHandlers(speech);
    speechTestBtn.disabled = true;
    followBtn.disabled = true;
    speechStopBtn.disabled = false;
    if (mode === "follow") {
      lastMatchedWord = 0;
      offset = 0;
      renderCue();
    }
    try {
      speech.start();
      log(mode === "follow" ? "Гласово следене е включено. Кажи първите думи от текста." : "Тестът за български глас е включен.");
    } catch (e) {
      log("Неуспешен старт на гласовото разпознаване: " + e.message);
    }
  }

  function stopSpeech() {
    speechMode = "off";
    clearTimeout(speechRestartTimer);
    if (speech) {
      try { speech.abort(); } catch (_) { try { speech.stop(); } catch (_) {} }
    }
    speech = null;
    speechBusy = false;
    speechStopBtn.disabled = true;
    speechTestBtn.disabled = false;
    followBtn.disabled = false;
    speechStatus.textContent = "Готово";
  }

  upBtn.addEventListener("click", () => moveBy(100));
  downBtn.addEventListener("click", () => moveBy(-100));
  resetBtn.addEventListener("click", resetCue);
  autoBtn.addEventListener("click", toggleAuto);
  fontSize.addEventListener("input", () => { fontSizeDesk.value = fontSize.value; renderCue(); });
  speed.addEventListener("input", () => { speedDesk.value = speed.value; });
  cueOpacity.addEventListener("input", () => { cueOpacityDesk.value = cueOpacity.value; renderCue(); });
  fontSizeDesk.addEventListener("input", () => { fontSize.value = fontSizeDesk.value; renderCue(); });
  speedDesk.addEventListener("input", () => { speed.value = speedDesk.value; });
  cueOpacityDesk.addEventListener("input", () => { cueOpacity.value = cueOpacityDesk.value; renderCue(); });
  scriptEl.addEventListener("input", () => { resetCue(); });
  cameraBtn.addEventListener("click", startCamera);
  recordBtn.addEventListener("click", startRecording);
  stopRecordBtn.addEventListener("click", stopRecording);
  recordFloatBtn.addEventListener("click", toggleRecording);
  stopRecordFloatBtn.addEventListener("click", stopRecording);
  handSide.addEventListener("change", () => syncHandSide(handSide.value));
  handSideDesk.addEventListener("change", () => syncHandSide(handSideDesk.value));
  speechTestBtn.addEventListener("click", () => startSpeech("test"));
  followBtn.addEventListener("click", () => startSpeech("follow"));
  speechStopBtn.addEventListener("click", stopSpeech);
  sampleBtn.addEventListener("click", () => { scriptEl.value = sampleText; resetCue(); });

  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.querySelector(".record-layout").requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) {
      log("Целият екран не е разрешен от браузъра.");
    }
  });

  window.addEventListener("beforeunload", () => {
    stopSpeech();
    stopAuto();
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
  });

  if (!browserSpeechSupported()) {
    speechStatus.textContent = "Провери браузъра";
    log("SpeechRecognition не е наличен в този браузър. За български гласов autocue пробвай Chrome на Android/desktop.");
  } else {
    log("Гласовият модул е наличен. Камерата не зависи от него.");
  }

  syncHandSide("left");
  fontSizeDesk.value = fontSize.value;
  speedDesk.value = speed.value;
  cueOpacityDesk.value = cueOpacity.value;
  renderCue();
})();
