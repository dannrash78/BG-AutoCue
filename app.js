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

  const sampleText = `Здравейте. Благодаря за поканата.
Днес ще говорим за важна тема и ще споделя своя опит.
За мен е важно информацията да бъде ясна, разбираема и полезна.
Нека започнем.`;

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
    cueText.textContent = scriptEl.value || "Постави текста си тук…";
    cueText.style.fontSize = `${fontSize.value}px`;
    cueText.style.transform = `translateY(${offset}px)`;
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
    recordBtn.disabled = true;
    stopRecordBtn.disabled = false;
    recordStatus.textContent = "● Записва…";
    log("Записът започна.");
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
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
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

  function findScriptMatch(spoken) {
    const sw = words(scriptEl.value);
    const tw = words(spoken);
    if (!sw.length || !tw.length) return -1;

    const recent = tw.slice(-10);
    const start = Math.max(0, lastMatchedWord - 18);
    const end = Math.min(sw.length, lastMatchedWord + 55);

    // Prefer matching the longest recent spoken phrase against the script.
    for (let n = Math.min(7, recent.length); n >= 2; n--) {
      const phrase = recent.slice(-n).join(" ");
      for (let i = start; i <= end - n; i++) {
        if (sw.slice(i, i + n).join(" ") === phrase) return i + n;
      }
    }

    // Fallback: match the latest recognized word.
    const latest = recent[recent.length - 1];
    for (let i = start; i < end; i++) {
      if (sw[i] === latest) return i + 1;
    }
    return -1;
  }

  function moveCueToWord(wordIndex) {
    const text = normalize(scriptEl.value);
    const arr = text.split(" ");
    if (!arr.length) return;
    const clamped = Math.max(0, Math.min(arr.length, wordIndex));
    const ratio = clamped / arr.length;
    const max = Math.max(0, cueText.scrollHeight - cueViewport.clientHeight + 100);
    offset = -ratio * max;
    renderCue();
  }

  function attachSpeechHandlers(r) {
    r.onstart = () => {
      speechStatus.textContent = speechMode === "follow" ? "Следи…" : "Слуша…";
      log("Българското гласово разпознаване е стартирано (bg-BG).");
    };

    r.onresult = event => {
      let all = "";
      for (let i = 0; i < event.results.length; i++) {
        all += event.results[i][0].transcript + " ";
      }
      transcriptEl.textContent = all.trim() || "—";

      if (speechMode === "follow") {
        const idx = findScriptMatch(all);
        if (idx > lastMatchedWord) {
          lastMatchedWord = idx;
          moveCueToWord(idx);
        }
      }
    };

    r.onerror = event => {
      speechStatus.textContent = "Грешка";
      log(`Гласово разпознаване: ${event.error}. Ако е "network" или "not-allowed", браузърът/мрежата не предоставя услугата.`);
    };

    r.onend = () => {
      if (speechMode === "off") {
        speechStopBtn.disabled = true;
        followBtn.disabled = false;
        speechTestBtn.disabled = false;
        speechStatus.textContent = "Готово";
        return;
      }
      const now = Date.now();
      if (now - lastSpeechRestart < 900) return;
      lastSpeechRestart = now;
      // Chrome frequently ends a recognition session; restart without touching camera.
      try { speech.start(); } catch (_) {}
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
    if (mode === "follow") lastMatchedWord = 0;
    try {
      speech.start();
    } catch (e) {
      log("Неуспешен старт на гласовото разпознаване: " + e.message);
    }
  }

  function stopSpeech() {
    speechMode = "off";
    if (speech) {
      try { speech.stop(); } catch (_) {}
    }
    speech = null;
    speechStopBtn.disabled = true;
    speechTestBtn.disabled = false;
    followBtn.disabled = false;
    speechStatus.textContent = "Готово";
  }

  upBtn.addEventListener("click", () => moveBy(90));
  downBtn.addEventListener("click", () => moveBy(-90));
  resetBtn.addEventListener("click", resetCue);
  autoBtn.addEventListener("click", toggleAuto);
  fontSize.addEventListener("input", renderCue);
  speed.addEventListener("input", () => {});
  scriptEl.addEventListener("input", () => { resetCue(); });
  cameraBtn.addEventListener("click", startCamera);
  recordBtn.addEventListener("click", startRecording);
  stopRecordBtn.addEventListener("click", stopRecording);
  speechTestBtn.addEventListener("click", () => startSpeech("test"));
  followBtn.addEventListener("click", () => startSpeech("follow"));
  speechStopBtn.addEventListener("click", stopSpeech);
  sampleBtn.addEventListener("click", () => { scriptEl.value = sampleText; resetCue(); });

  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await $("teleprompterPanel").requestFullscreen();
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

  renderCue();
})();
