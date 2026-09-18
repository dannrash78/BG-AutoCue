# BG AutoCue v4

Реално работеща GitHub Pages версия на български autocue.

## Основни поправки във v4

- Камерата стартира независимо от гласовия модул.
- Записът е отделен от SpeechRecognition.
- Голям autocue текст с реално работещи ▲/▼ контроли.
- Размер, прозрачност и скорост работят.
- Изборът Ляво/Дясно реално мести плаващите бутони.
- Повторно натискане на Запис = пауза; следващо = продължаване.
- Стоп запис е над ▲/▼.
- Цял екран работи с native Fullscreen API, а при неподдържани устройства има CSS fullscreen режим.
- В цял екран камерата и плаващите контроли остават достъпни.
- Дълъг примерен сценарий е вграден и се зарежда с един бутон.
- Гласовото следене е преработено с приблизително съвпадение на думи, а не само с абсолютно съвпадение.
- Показва се какво реално разпознава браузърът.
- Няма външни библиотеки, които да са критични за камерата.

## Препоръчан тест

1. Натисни **Зареди дълъг пример**.
2. Натисни **Стартирай камера**.
3. Провери картината.
4. Натисни **Тест на български** и кажи: „Здравейте и благодаря за поканата.“
5. Увери се, че тази фраза се появява в „Разпознат текст“.
6. Спри теста.
7. Натисни **Гласово следене**.
8. Започни да четеш от началото на примерния текст.
9. Текстът трябва да се премества напред при намерено съвпадение.
10. Провери ▲/▼, Ляво/Дясно, Цял екран и Запис/Пауза/Стоп.

## GitHub Pages

Качи:
- index.html
- style.css
- app.js
- README.md

След това GitHub → Settings → Pages → Deploy from branch → `main` → `/root`.

Камерата и микрофонът работят през HTTPS на GitHub Pages.

## Ограничение на браузъра

Българското SpeechRecognition зависи от браузъра и неговата услуга за разпознаване. Ако браузърът върне `network`, `not-allowed` или `service-not-allowed`, това е ограничение на услугата, а не причина камерата или ръчният autocue да спрат.


## v4.1
- Fullscreen keeps camera, voice controls and settings visible.
- Right-hand scrolling controls stay beside the text, outside the right sidebar.
- Floating Record stays enabled while recording and toggles Pause/Resume.
- Mobile page has explicit vertical scrolling.
- Bulgarian matching accepts shortened/prefix forms such as „здравей“ / „здравейте“.
- Mouse wheel and keyboard arrows can also move the autocue.


## v4.2

- Запис и Стоп са един до друг над ▲/▼.
- Пауза/Продължи остава на бутона за запис.
- Гласовото следене използва rolling buffer от финални + междинни резултати и по-толерантно съвпадение.
- Позицията на autocue се променя видимо при намерено съвпадение.
- На мобилен телефон страницата е реално скролируема.
- Мобилните контроли вече не са `position: fixed`, за да не блокират достъпа до редактора и настройките.
- В мобилен fullscreen текстът има собствена широка зона, а камерата/гласът са в отделна тясна колона.
- Плаващите контроли не покриват основната текстова зона в мобилен fullscreen.


## v4.3

- Speech follow no longer searches far ahead in the script; this prevents a first sentence from jumping near the end.
- Interim speech is displayed but does not move the cue; final speech is required for movement.
- Matching is sequential and limited to a short forward window.
- Cue movement is measured against the actual text layout so the next words approach the green guide line.
- Recording buttons are explicitly grouped as Record / Stop.
- SpeechRecognition starts directly from the button gesture, improving mobile-browser compatibility.
- Mobile page scrolling is explicitly preserved outside fullscreen.


## v4.4 — плаващи бутони за запис

Плаващият контролен блок е променен само по отношение на бутоните за запис:

- най-отгоре: два бутона един до друг — `●` Запис и `■` Стоп;
- `●` става `Ⅱ` при активен запис;
- натискане на `Ⅱ` поставя записа на пауза и бутонът става `▶`;
- натискане на `▶` продължава същия запис и бутонът отново става `Ⅱ`;
- `■` спира окончателно записа;
- под тях остават големите ▲/▼ за ръчно движение;
- бутоните са само с иконки, без текст;
- плаващият блок продължава да се премества отляво/отдясно според избраната ръка.

Камерата, гласовото следене, настройките и останалата подредба не са променяни.


## v4.5 — визуални промени

- На нормален browser screen бутоните **Запис / Стоп** под камерата са на един ред.
- Добавено е свиване/разгъване на секциите чрез клик върху заглавието:
  - Гласово следене
  - Контроли
  - Текст за autocue
  - Диагностика
- Камерата **не се свива**.
- Плаващите контроли за ▲/▼ и запис/стоп **не се свиват** и винаги остават видими.
- По подразбиране бутоните за превъртане са **отдясно**.
- Функционалността на камерата, записа, гласовото следене и autocue не е променяна.


## v4.6 — speech positioning + controls initialization

- Fixed the default hand side: **right**.
- Fixed collapsible sections: the collapse handler is now actually initialized, so clicking the section heading/arrow expands and collapses it.
- Camera remains non-collapsible.
- Floating text/recording controls remain always visible.
- Speech-following now positions the actual matched/next word against the green reading line using the rendered word element, rather than estimating the position from total document height.
- A single recognition result is capped to a small movement to prevent large jumps.
- Interim speech does not move the cue; final recognition results do.
- The newest final speech segment is preferred so old recognized text cannot repeatedly keep the cue stuck.


## v4.7 — synchronized recording controls and speech movement

- Camera-card Record and floating Record now use the **same toggle behavior**:
  `⏺ Запис` → `⏸ Пауза` → `▶ Продължи`.
- Stop buttons stop the same recording from either location.
- The pause icon uses the standard media-control `⏸` symbol.
- Fixed the rendered-word indexing used by speech-following; whitespace is now correctly split into indexed word spans.
- Speech-following moves the next word toward the green reading line.
- When a recognition result contains at least two matched words with confidence above 50%, the cue is advanced by at least approximately two rendered text lines (subject to the remaining text).


## v4.8 — recording button visuals + smooth speech cue

- Camera-card recording controls are fixed-size icon-only buttons.
- Camera-card recording button uses the same record/pause/continue toggle as the floating control.
- Stop remains a separate icon-only button.
- The speech-matched word is highlighted in green.
- Speech-driven movement is animated smoothly over about half a second.
- Large jumps are capped per recognition event to reduce loss of reading position.


## v4.9 — sequential speech matching

- Speech recognition now processes only newly finalized recognition results.
- The cue follows the speech strictly forward from the current position.
- Matching searches a bounded forward window and prefers the longest strong phrase.
- Old recognized text cannot repeatedly reset the matcher or cause it to stall.
- Movement is incremental and smoothly animated; a single recognition result is limited to about 1.25 text lines.
- The currently matched word remains highlighted in green.


## v5.0 — continuous speech fix + 10-line recognition console

- Continuous SpeechRecognition now processes only NEW final results using `event.resultIndex`.
- Previous final results are no longer fed repeatedly into the matcher, preventing the cue from stalling after a phrase such as "лечение".
- Matching window is slightly wider for fast speech while remaining strictly forward from the current cue position.
- The recognized-text console shows only about 10 lines and automatically keeps the newest lines visible.
- Existing camera, recording, controls, fullscreen and collapsible-section behavior is preserved.


## v5.1 — critical cue movement fix

- Fixed the speech-following movement bug caused by measuring a word element after `render()` had already replaced that DOM element.
- The matched word is now measured first, then highlighted/rendered, and the cue is smoothly animated to the green reading line.
- Added a diagnostic message if a speech match has no corresponding visual word marker.


## v5.2 — movement travel fix + visible version

- Fixed the travel-limit calculation for the absolutely positioned cue text.
- The maximum movement distance is now based on the actual rendered cue height.
- Added a small forward movement fallback when speech has advanced but browser geometry reports an almost-zero delta.
- The deployed page visibly identifies itself as **BG AutoCue v5.2**.
- CSS and JavaScript references include `?v=5.2` cache-busting parameters.


## v5.3 — speech cursor + centered smooth scrolling

- Speech following now advances a persistent forward cursor instead of relying on one exact recognized word.
- The spoken word is highlighted, while the next word becomes the visual reading cursor.
- The next word is smoothly positioned around the center / green guide line.
- Longer movements are animated more slowly to avoid large jumps.
- Matching tolerates missing, merged and slightly misrecognized Bulgarian words.
- The recognition transcript is visually limited to approximately 10 wrapped lines and scrolls internally.
- Visible build number and cache-busting remain enabled.


## v5.4 — speech button reliability

- Explicit speech state variables.
- Speech button clicks cannot be swallowed by collapsible-section handlers.
- Hardened start/error/end lifecycle and automatic restart after normal recognition pauses.
- Clear microphone and permission diagnostics.
- Visible version/cache-busting updated to v5.4.


## v5.5 — bounded speech cursor

- Speech matching is strictly forward-only.
- Recognition can search only the next 10 script words.
- Earliest valid phrase match wins; the algorithm no longer jumps to a later occurrence because it has a higher score.
- Single-word fallback ignores common Bulgarian stop words and also searches only the next 10 words.
- The existing smooth centering/highlighting behavior is preserved.
- Visible build number and cache-busting updated to v5.5.


## v5.6 — forward 10-word speech cursor

- Speech progress is now driven by a persistent count of recognized words.
- Every newly finalized recognized word searches only the next **10 script words**.
- The search is strictly forward and can never move the cursor backwards.
- Short words (up to 3 letters) require exact matching.
- Four-letter words require very high similarity.
- Longer words allow controlled fuzzy matching for Bulgarian SpeechRecognition errors.
- The earliest valid match is used; a more distant "better" match cannot cause a jump.
- Multiple recognized words from one recognition result are processed sequentially.
- The cue is moved only once after the whole result is processed, making movement smoother.
- The spoken word remains highlighted while the next word becomes the reading position.
- Recognition result indexes are tracked per recognition session to prevent the buffer from being processed repeatedly.
- Visible version and cache-busting updated to v5.6.


## v5.7 — word-count fallback

- The persistent cue now advances by the number of newly recognized words.
- Recognition matching is only a local correction within the next 10 script words.
- The search never goes backwards and never searches farther than 10 words ahead.
- Short words (1–3 letters) require exact matching.
- Four-letter words use a strict threshold.
- Longer words use controlled fuzzy matching.
- If a spoken word cannot be matched, the cue advances by one word instead of freezing.
- The green marker represents the next word to read.
- The cue moves that next word toward the center/green guide line.


## v5.8 — fixed speech-following cursor

- Fixed the critical v5.7 error: `scrollWordToGuide()` called a missing `getWordElement()` function.
- The exact script word span is now resolved from the indexed `.cue-word` element before positioning.
- Speech result deduplication now uses transcript signatures, so Chrome can revise a result without an old result index permanently blocking it.
- Added a safety boundary around visual cue movement so a rendering exception cannot silently stop speech processing.
- Kept the v5.7 word-count fallback and local 10-word forward matching.
- Version/cache-busting updated to v5.8.


## v5.9 — follow interim recognition instead of waiting for final results

- Fixed the main speech-following issue where the transcript visibly changed but the cue did not move because the browser had not marked results as final.
- The cue now processes the newly added portion of the current recognized transcript, including interim recognition.
- Interim revisions are protected with a common-token-prefix calculation so the same words are not repeatedly counted.
- The cue remains strictly forward-only.
- Each newly recognized word is matched only within the next 10 script words.
- If no local match exists, word-count fallback advances by one script word instead of freezing.
- Restarted SpeechRecognition sessions reset only the transcript-delta baseline, not the cue position.
- The green marker remains the next word to read and the cue moves it toward the center guide.
- Version/cache-busting updated to v5.9.


## v5.14 — restored proven speech-following engine

Compared with the earlier versions, the speech-following core was aligned with the v4.8 implementation that successfully moved and highlighted the cue:

- Uses `SpeechRecognition.resultIndex`/result list and processes **final** recognition chunks for cursor movement.
- Interim recognition remains visible but cannot repeatedly rewrite the cursor.
- Phrase matching is local and sequential.
- Search window is strictly **10 script words ahead**.
- Earliest valid alignment wins; a later higher-scoring match cannot cause a jump.
- Long words tolerate recognition errors; short 1–3 letter words require exact matching.
- Two-word and useful single-word fallbacks prevent the cue from freezing.
- Movement is performed by the proven direct DOM word lookup and smooth `moveToWord()` path.
- The next word is highlighted after the recognized position.
- Camera, recording, layout, collapse controls and mobile layout are inherited unchanged from v5.9.
- Visible version/cache-busting updated to v5.14.


## v5.12
- Fixed the speech-following scroll calculation.
- The target word is re-queried after `render()` rebuilds the word spans, so its real screen position is measured.
- The visual guide line is aligned with the 50% center used by the movement calculation.
- Speech recognition, matching and highlighting logic otherwise remains unchanged from v5.11.


## v5.14
- Restored the complete speech matching functions from v5.12.
- Restored all camera/recording functions and complete startup bindings.
- Fixed the v5.13 fatal initialization issue caused by missing function definitions.
- Bumped the app cache-buster to v5.14.
- Speech-following highlight is applied with one render, then scrolling animates by direct transform only.
- Manual and automatic cue movement also update the transform directly.


## v5.14 — detailed repair
- Restored the complete v5.12 speech matcher: `wordMatchScore()` and `findMatch()`.
- Restored the complete camera/recording startup functions required by page initialization.
- Fixed the v5.13 initialization-breaking `ReferenceError: startCamera is not defined`; because initialization stopped there, later speech-button event listeners were never registered.
- Updated the visible version and JavaScript cache-buster to v5.14.
- Speech-following scroll now renders once for highlighting, then animates only `translateY`, without rebuilding the cue on every animation frame.


## v5.15 — speech-following alignment repair
- Replaced rigid same-index phrase matching with monotonic local alignment inside a strict 10-word forward window.
- Processes the changed SpeechRecognition result instead of rebuilding matches from all old final results on every event.
- Uses interim results for responsive movement while preserving a one-way cursor.
- Keeps short grammatical words from causing standalone false jumps.
- Scroll animation changes only `translate3d` during animation; the cue DOM is not rebuilt frame-by-frame.
- Added compact diagnostics showing matched words, confidence and cursor position.

- Uses up to three SpeechRecognition alternatives when the browser provides them, choosing the strongest forward alignment.
- More tolerant long-word matching reduces misses from small Bulgarian word-form/recognition differences while the 10-word search window prevents large jumps.
