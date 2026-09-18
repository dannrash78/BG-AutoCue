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
