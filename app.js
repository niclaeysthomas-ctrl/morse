/* ============================================================
   Morse Phoque — logique de l'application
   ============================================================ */
'use strict';

/* ---------- État persistant -------------------------------- */
const STORE_KEY = 'morsePhoque.v1';
const DEFAULT_STATE = {
  lang: (navigator.language || 'fr').startsWith('en') ? 'en' : 'fr',
  lastLesson: 0,          // id de la dernière leçon réussie
  xp: 0,
  streak: 0,
  lastActive: null,       // 'YYYY-MM-DD'
  correct: 0,             // total bonnes réponses
  keyChars: 0,            // caractères envoyés à la clé
  badges: {},
  settings: { wpm: 12, tone: 600, sound: true, flash: true, vibrate: true },
};
let S = loadState();

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...raw,
             settings: { ...DEFAULT_STATE.settings, ...(raw.settings || {}) },
             badges: { ...(raw.badges || {}) } };
  } catch { return structuredClone(DEFAULT_STATE); }
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
const t = (k) => I18N[S.lang][k] ?? k;

/* ---------- Utilitaires ------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const todayStr = () => new Date().toISOString().slice(0, 10);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const level = () => Math.floor(S.xp / 100) + 1;
const levelProgress = () => (S.xp % 100);

function normalize(ch) {
  // pour la saisie : on tolère les minuscules / accents proches
  return (ch || '').toUpperCase();
}

/* ---------- Gamification ----------------------------------- */
function touchStreak() {
  const today = todayStr();
  if (S.lastActive === today) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  S.streak = (S.lastActive === y) ? S.streak + 1 : 1;
  S.lastActive = today;
}
function addXp(n) { S.xp += n; touchStreak(); checkBadges(); save(); renderStats(); }
function bumpCorrect(n = 1) { S.correct += n; touchStreak(); checkBadges(); save(); }

const BADGE_DEFS = [
  { id: 'first', icon: '🐾', test: () => S.lastLesson >= 1 },
  { id: 'alpha', icon: '🔤', test: () => S.lastLesson >= 13 },
  { id: 'streak3', icon: '🔥', test: () => S.streak >= 3 },
  { id: '100', icon: '💯', test: () => S.correct >= 100 },
  { id: 'key', icon: '📡', test: () => S.keyChars >= 20 },
];
function checkBadges() {
  for (const b of BADGE_DEFS) {
    if (!S.badges[b.id] && b.test()) {
      S.badges[b.id] = true;
      toast('🏅 ' + t('badge_' + b.id), 'good');
    }
  }
}

/* ---------- Moteur audio morse ----------------------------- */
class MorseAudio {
  constructor() { this.ctx = null; this.master = null; this._timers = []; this._osc = null; this._live = null; this.playing = false; }
  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  dit() { return 1200 / (S.settings.wpm || 12); } // ms d'un point
  vol() { return S.settings.sound ? 0.9 : 0.0001; }

  buildTimeline(text) {
    const dit = this.dit();
    const items = [];
    const words = normalize(text).trim().split(/\s+/).filter(Boolean);
    words.forEach((word, wi) => {
      const chars = [...word];
      chars.forEach((ch, ci) => {
        const code = MORSE[ch];
        if (!code) return;
        [...code].forEach((sym, si) => {
          items.push({ on: true, ms: (sym === '-' ? 3 : 1) * dit });
          if (si < code.length - 1) items.push({ on: false, ms: dit });
        });
        if (ci < chars.length - 1) items.push({ on: false, ms: 3 * dit });
      });
      if (wi < words.length - 1) items.push({ on: false, ms: 7 * dit });
    });
    return items;
  }

  playText(text, opts = {}) { return this.playTimeline(this.buildTimeline(text), opts); }
  playCode(code, opts = {}) {
    // code = suite de . et - pour UN caractère
    const dit = this.dit(); const items = [];
    [...code].forEach((sym, i) => {
      items.push({ on: true, ms: (sym === '-' ? 3 : 1) * dit });
      if (i < code.length - 1) items.push({ on: false, ms: dit });
    });
    return this.playTimeline(items, opts);
  }

  playTimeline(items, { onSym } = {}) {
    this.ensure(); this.stop();
    const ctx = this.ctx, vol = this.vol();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = S.settings.tone || 600;
    g.gain.value = 0.0001; osc.connect(g); g.connect(this.master);
    let t0 = ctx.currentTime + 0.06, tt = t0;
    const vib = []; let cursor = 0;
    for (const it of items) {
      if (it.on) {
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.linearRampToValueAtTime(vol, tt + 0.006);
        g.gain.setValueAtTime(vol, tt + it.ms / 1000 - 0.006);
        g.gain.linearRampToValueAtTime(0.0001, tt + it.ms / 1000);
        const delay = (tt - t0) * 1000;
        if (S.settings.flash) { this._timers.push(setTimeout(() => flash(true), delay)); this._timers.push(setTimeout(() => flash(false), delay + it.ms)); }
        if (onSym) this._timers.push(setTimeout(() => onSym(cursor), delay));
        vib.push(Math.round(it.ms));
      } else {
        vib.push(-Math.round(it.ms));
      }
      tt += it.ms / 1000; cursor++;
    }
    osc.start(t0 - 0.005); osc.stop(tt + 0.05); this._osc = osc; this.playing = true;
    if (S.settings.vibrate && navigator.vibrate) navigator.vibrate(vib.map(Math.abs));
    const totalMs = (tt - t0) * 1000;
    return new Promise((res) => { this._timers.push(setTimeout(() => { this.playing = false; res(); }, totalMs + 90)); });
  }

  stop() {
    this._timers.forEach(clearTimeout); this._timers = [];
    if (this._osc) { try { this._osc.stop(); } catch {} this._osc = null; }
    flash(false); this.playing = false;
    if (navigator.vibrate) navigator.vibrate(0);
  }

  /* clé morse : tonalité continue tant qu'on appuie */
  startTone() {
    this.ensure();
    if (this._live) return;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = S.settings.tone || 600;
    g.gain.value = 0.0001; osc.connect(g); g.connect(this.master);
    g.gain.linearRampToValueAtTime(this.vol(), this.ctx.currentTime + 0.006);
    osc.start(); this._live = { osc, g };
    if (S.settings.flash) flash(true);
    if (S.settings.vibrate && navigator.vibrate) navigator.vibrate(30);
  }
  stopTone() {
    if (!this._live) return;
    const { osc, g } = this._live; const now = this.ctx.currentTime;
    g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0.0001, now + 0.01);
    try { osc.stop(now + 0.03); } catch {}
    this._live = null; if (S.settings.flash) flash(false);
  }
}
const AUDIO = new MorseAudio();

/* ---------- Flash & toast ---------------------------------- */
let flashLayer;
function flash(on) { if (!flashLayer) flashLayer = $('#flashLayer'); flashLayer.classList.toggle('on', !!on); }
let toastTimer;
function toast(msg, kind = '') {
  const box = $('#toast'); box.textContent = msg; box.className = 'show ' + kind;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => box.className = kind, 1600);
}

/* ---------- Rendu du morse (points/traits) ----------------- */
function morseSpans(code, big = false) {
  const inner = [...code].map(s => `<span class="sym ${s === '-' ? 'dash' : 'dot'}"></span>`).join('');
  return `<span class="morse-str ${big ? 'lg' : ''}">${inner}</span>`;
}

/* ---------- En-tête / stats -------------------------------- */
function renderStats() {
  $('#statLevel').innerHTML = `${t('level')} <b>${level()}</b>`;
  $('#statXp').innerHTML = `${t('xp')} <b>${S.xp}</b>`;
  $('#statStreak').innerHTML = `${t('streak')} <b>${S.streak}${t('day')}</b>`;
  $('#appName').textContent = t('appName');
  $('#tagline').textContent = t('tagline');
}

/* ---------- Navigation ------------------------------------- */
const TABS = [
  { id: 'learn', ico: '🎓', view: viewLearn },
  { id: 'train', ico: '🎯', view: viewTrain },
  { id: 'key', ico: '📻', view: viewKey },
  { id: 'translate', ico: '🔁', view: viewTranslate },
  { id: 'ref', ico: '📖', view: viewRef },
];
let current = 'learn';
function renderTabs() {
  const nav = $('#tabs'); nav.innerHTML = '';
  TABS.forEach(tab => {
    const b = el(`<button class="${tab.id === current ? 'active' : ''}"><span class="ico">${tab.ico}</span><span>${t('nav_' + tab.id)}</span></button>`);
    b.onclick = () => { AUDIO.stop(); current = tab.id; render(); };
    nav.appendChild(b);
  });
}
function go(id) { AUDIO.stop(); current = id; render(); }
function teardown() {
  // retire le pilotage clavier de la clé morse quand on quitte la vue
  if (keyHandler) { window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler); keyHandler = null; }
}
function render() {
  teardown();
  renderStats(); renderTabs();
  const v = $('#view'); v.innerHTML = ''; v.classList.remove('pop'); void v.offsetWidth; v.classList.add('pop');
  (TABS.find(x => x.id === current)?.view || viewLearn)(v);
}

/* ============================================================
   VUE : APPRENDRE
   ============================================================ */
function viewLearn(root) {
  // bandeau mascottes
  root.appendChild(el(`
    <div class="card">
      <div class="hero-mascots">
        ${MASCOTS.seal({ size: 78 })}
        <div class="speech">${t('mascotHi')}<br>${t('mascotBin')}</div>
        ${MASCOTS.binturong({ size: 88 })}
      </div>
      <p class="sub center">${t('learnIntro')}</p>
      ${renderBadges()}
    </div>`));

  root.appendChild(el(`<div class="section-title">${t('lessons')}</div>`));
  const grid = el(`<div class="lesson-grid"></div>`);
  LESSONS.forEach(l => {
    const unlocked = l.id <= S.lastLesson + 1;
    const done = l.id <= S.lastLesson;
    const card = el(`
      <button class="lesson-card ${done ? 'done' : ''} ${unlocked ? '' : 'locked'}">
        <span class="num">${t('lesson')} ${l.id}</span>
        <span class="chars">${l.add.join(' · ')}</span>
        <span class="title">${S.lang === 'fr' ? l.fr : l.en}</span>
        <span class="flag">${done ? '✅' : unlocked ? '▶️' : '🔒'}</span>
      </button>`);
    if (unlocked) card.onclick = () => startLesson(l);
    else card.onclick = () => toast('🔒 ' + t('locked'));
    grid.appendChild(card);
  });
  root.appendChild(grid);
  root.appendChild(el(`<div class="center muted" style="margin-top:14px">${MASCOTS.stamp('binturong', { size: 34 })}</div>`));
}

function renderBadges() {
  const items = BADGE_DEFS.map(b => `
    <div class="badge ${S.badges[b.id] ? 'earned' : ''}">
      <span class="disc">${b.icon}</span><span>${t('badge_' + b.id)}</span>
    </div>`).join('');
  return `<div class="section-title" style="margin-top:6px">${t('badges')}</div><div class="badge-row">${items}</div>`;
}

/* ---- Session de leçon ------------------------------------- */
function startLesson(lesson) {
  const pool = unlockedThrough(lesson.id);
  const newer = lesson.add;
  const QN = 12;
  const questions = [];
  for (let i = 0; i < QN; i++) {
    // 60% de nouveaux caractères, 40% de révision
    const set = (Math.random() < 0.6 || pool.length < 3) ? newer : pool;
    questions.push(rand(set));
  }
  let idx = 0, right = 0;
  const root = $('#view'); root.innerHTML = '';

  // écran d'étude des nouveaux caractères
  const study = el(`
    <div class="card">
      <h2>${t('lesson')} ${lesson.id} — ${t('newChars')}</h2>
      <p class="sub">${t('learnIntro')}</p>
      <div class="row" id="studyRow" style="justify-content:center"></div>
      <div class="spacer"></div>
      <button class="btn primary block" id="toQuiz">${t('start')} ▶</button>
    </div>`);
  root.appendChild(study);
  const sr = $('#studyRow', study);
  newer.forEach(ch => {
    const c = el(`<button class="ref-cell" style="min-width:120px">
      <span class="ch">${ch}</span>${morseSpans(MORSE[ch])}<span class="muted" style="font-size:.7rem">${t('listen')} 🔊</span>
    </button>`);
    c.onclick = () => AUDIO.playCode(MORSE[ch]);
    sr.appendChild(c);
  });
  $('#toQuiz', study).onclick = () => AUDIO.playCode(MORSE[newer[0]]).then(quiz);

  function quiz() {
    if (idx >= questions.length) return finish();
    const answer = questions[idx];
    root.innerHTML = '';
    root.appendChild(el(`
      <div class="card center">
        <p class="muted">${t('question')} ${idx + 1} ${t('of')} ${questions.length}</p>
        <div class="bar" style="margin:8px 0 18px"><i style="width:${(idx / questions.length) * 100}%"></i></div>
        <p class="sub">${t('quizPrompt')}</p>
        <div style="margin:16px 0">${morseSpans(MORSE[answer], true)}</div>
        <div class="row">
          <button class="btn accent" id="qplay">🔊 ${t('replay')}</button>
        </div>
        <div class="spacer"></div>
        <input class="quiz-input" id="qin" maxlength="4" placeholder="?" autocomplete="off" autocapitalize="characters" inputmode="text">
        <div class="spacer"></div>
        <button class="btn primary block" id="qcheck">${t('check')}</button>
        <div class="watermark">${MASCOTS.stamp(idx % 2 ? 'seal' : 'binturong', { size: 90 })}</div>
      </div>`));
    const input = $('#qin'); input.focus();
    AUDIO.playCode(MORSE[answer]);
    $('#qplay').onclick = () => AUDIO.playCode(MORSE[answer]);
    const submit = () => {
      const val = normalize(input.value.trim());
      if (!val) return;
      if (val === answer) {
        right++; bumpCorrect(); toast(t('correct') + ' 🎉', 'good'); addXp(8);
      } else {
        toast(t('wrong') + ' → ' + answer, 'bad');
      }
      idx++; setTimeout(quiz, 550);
    };
    $('#qcheck').onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
  }

  function finish() {
    const passed = right >= Math.ceil(questions.length * 0.7);
    if (passed && lesson.id > S.lastLesson) { S.lastLesson = lesson.id; addXp(30); }
    checkBadges(); save();
    root.innerHTML = '';
    root.appendChild(el(`
      <div class="card center pop">
        ${MASCOTS.seal({ size: 120 })}
        <h2>${passed ? '🎉 ' + t('lessonDone') : t('keepGoing')}</h2>
        <p class="sub">${t('score')} : ${right}/${questions.length}</p>
        ${passed ? `<p class="pill" style="margin:auto">+${right * 8 + 30} ${t('xpEarned')}</p>` : ''}
        <div class="spacer"></div>
        <div class="row">
          <button class="btn primary block" id="again">${t('review')}</button>
          <button class="btn ghost block" id="back">← ${t('lessons')}</button>
        </div>
      </div>`));
    $('#again').onclick = () => startLesson(lesson);
    $('#back').onclick = () => go('learn');
  }
}

/* ============================================================
   VUE : ENTRAÎNEMENT
   ============================================================ */
let trainMode = 'listen';
function viewTrain(root) {
  root.appendChild(el(`
    <div class="card">
      <h2>${t('trainTitle')} 🎯</h2>
      <div class="row tight" id="trainTabs">
        ${[['listen', t('trainListen')], ['words', t('trainWords')], ['send', t('trainSend')]]
          .map(([k, lbl]) => `<button class="btn ${trainMode === k ? 'accent' : 'ghost'}" data-m="${k}">${lbl}</button>`).join('')}
      </div>
    </div>`));
  $('#trainTabs', root).querySelectorAll('button').forEach(b => b.onclick = () => { trainMode = b.dataset.m; render(); });
  const host = el(`<div id="trainHost"></div>`); root.appendChild(host);
  if (trainMode === 'listen') trainListen(host);
  else if (trainMode === 'words') trainWords(host);
  else trainSend(host);
  root.appendChild(el(`<div class="center">${MASCOTS.sealPeek({ size: 80 })}</div>`));
}

function trainListen(host) {
  const pool = poolChars();
  let answer = rand(pool), streakLocal = 0, tries = 0, hits = 0;
  const card = el(`
    <div class="card center">
      <p class="sub">${t('trainListenDesc')}</p>
      <div class="row" style="justify-content:center">
        <button class="btn accent" id="play">🔊 ${t('replay')}</button>
        <button class="btn ghost" id="reveal">👁 ${t('reveal')}</button>
      </div>
      <div class="spacer"></div>
      <input class="quiz-input" id="in" maxlength="4" placeholder="?" autocomplete="off" autocapitalize="characters">
      <div class="spacer"></div>
      <button class="btn primary block" id="check">${t('check')}</button>
      <p class="muted" id="sc" style="margin-top:12px"></p>
    </div>`);
  host.appendChild(card);
  const input = $('#in', card), sc = $('#sc', card);
  const scoreLine = () => sc.textContent = `${t('score')} : ${hits}/${tries} · ${t('accuracy')} : ${tries ? Math.round(hits / tries * 100) : 0}%`;
  scoreLine();
  const play = () => AUDIO.playCode(MORSE[answer]);
  const next = () => { answer = rand(pool); input.value = ''; input.focus(); play(); };
  play();
  $('#play', card).onclick = play;
  $('#reveal', card).onclick = () => toast(answer + '  ' + MORSE[answer]);
  const submit = () => {
    const v = normalize(input.value.trim()); if (!v) return;
    tries++;
    if (v === answer) { hits++; streakLocal++; bumpCorrect(); addXp(5); toast(t('correct') + ' 🎉', 'good'); }
    else { streakLocal = 0; toast(t('wrong') + ' → ' + answer, 'bad'); }
    scoreLine(); setTimeout(next, 500);
  };
  $('#check', card).onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
  input.focus();
}

function trainWords(host) {
  const words = WORDS[S.lang];
  let answer = rand(words), tries = 0, hits = 0;
  const card = el(`
    <div class="card center">
      <p class="sub">${t('trainWordsDesc')}</p>
      <div class="row" style="justify-content:center">
        <button class="btn accent" id="play">🔊 ${t('replay')}</button>
        <button class="btn ghost" id="reveal">👁 ${t('reveal')}</button>
      </div>
      <div class="spacer"></div>
      <input class="quiz-input" id="in" style="font-size:1.2rem" placeholder="${t('typeHere')}" autocomplete="off" autocapitalize="characters">
      <div class="spacer"></div>
      <button class="btn primary block" id="check">${t('check')}</button>
      <p class="muted" id="sc" style="margin-top:12px"></p>
    </div>`);
  host.appendChild(card);
  const input = $('#in', card), sc = $('#sc', card);
  const scoreLine = () => sc.textContent = `${t('score')} : ${hits}/${tries}`;
  scoreLine();
  const play = () => AUDIO.playText(answer);
  const next = () => { answer = rand(words); input.value = ''; input.focus(); play(); };
  play();
  $('#play', card).onclick = play;
  $('#reveal', card).onclick = () => toast(answer);
  const submit = () => {
    const v = normalize(input.value.trim()); if (!v) return;
    tries++;
    if (v === answer) { hits++; bumpCorrect(answer.length); addXp(12); toast(t('correct') + ' 🎉', 'good'); }
    else { toast(t('wrong') + ' → ' + answer, 'bad'); }
    scoreLine(); setTimeout(next, 700);
  };
  $('#check', card).onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
  input.focus();
}

function trainSend(host) {
  const pool = poolChars();
  let target = rand(pool), buf = '';
  const card = el(`
    <div class="card center">
      <p class="sub">${t('trainSendDesc')}</p>
      <div class="big-char" id="target">${target}</div>
      <div class="key-live" id="buf">&nbsp;</div>
      <div class="row" style="justify-content:center">
        <button class="btn" id="dot" style="font-size:1.5rem">•</button>
        <button class="btn" id="dash" style="font-size:1.5rem">—</button>
        <button class="btn ghost" id="del">⌫</button>
      </div>
      <div class="spacer"></div>
      <div class="row">
        <button class="btn primary block" id="send">${t('check')}</button>
        <button class="btn ghost" id="hint">👁</button>
      </div>
    </div>`);
  host.appendChild(card);
  const bufEl = $('#buf', card), tgt = $('#target', card);
  const show = () => bufEl.innerHTML = buf ? morseSpans(buf) : '&nbsp;';
  const add = (s) => { buf += s; show(); AUDIO.playCode(s); };
  $('#dot', card).onclick = () => add('.');
  $('#dash', card).onclick = () => add('-');
  $('#del', card).onclick = () => { buf = buf.slice(0, -1); show(); };
  $('#hint', card).onclick = () => toast(target + '  ' + MORSE[target]);
  $('#send', card).onclick = () => {
    if (!buf) return;
    if (buf === MORSE[target]) {
      bumpCorrect(); addXp(6); toast(t('correct') + ' 🎉', 'good');
      target = rand(pool); tgt.textContent = target; buf = ''; show();
    } else { toast(t('wrong') + ' → ' + MORSE[target], 'bad'); buf = ''; show(); }
  };
}

function poolChars() {
  const p = unlockedThrough(Math.max(1, S.lastLesson));
  return p.length ? p : ['K', 'M', 'U', 'R', 'E', 'S'];
}

/* ============================================================
   VUE : CLÉ MORSE
   ============================================================ */
function viewKey(root) {
  root.appendChild(el(`
    <div class="card">
      <h2>${t('keyTitle')} 📻</h2>
      <p class="sub">${t('keyDesc')}</p>
      <div class="key-pad" id="pad">${t('tapKey')} · ${t('hintSpace')}</div>
      <div class="key-live" id="live">&nbsp;</div>
      <div class="section-title">${t('decoded')}</div>
      <div class="key-out" id="out">&nbsp;</div>
      <div class="spacer"></div>
      <div class="row"><button class="btn ghost block" id="clear">🗑 ${t('clear')}</button></div>
    </div>`));
  root.appendChild(el(`<div class="center bob">${MASCOTS.binturong({ size: 76 })}</div>`));

  const pad = $('#pad', root), live = $('#live', root), out = $('#out', root);
  let buf = '', text = '', pressStart = 0, letterTimer = null, wordTimer = null, down = false;

  const showLive = () => live.innerHTML = buf ? morseSpans(buf) : '&nbsp;';
  const showOut = () => out.textContent = text || ' ';

  const commitLetter = () => {
    if (!buf) return;
    const ch = MORSE_REV[buf] || '¿';
    text += ch; buf = ''; showLive(); showOut();
    if (ch !== '¿') { S.keyChars++; checkBadges(); save(); renderStats(); }
  };
  const commitWord = () => { commitLetter(); if (text && !text.endsWith(' ')) { text += ' '; showOut(); } };

  const onDown = (e) => {
    if (down) return; e.preventDefault(); down = true;
    clearTimeout(letterTimer); clearTimeout(wordTimer);
    pad.classList.add('pressed'); pressStart = performance.now(); AUDIO.startTone();
  };
  const onUp = (e) => {
    if (!down) return; e && e.preventDefault(); down = false;
    pad.classList.remove('pressed'); AUDIO.stopTone();
    const dur = performance.now() - pressStart;
    buf += (dur <= AUDIO.dit() * 2) ? '.' : '-';
    showLive();
    letterTimer = setTimeout(commitLetter, AUDIO.dit() * 3.2);
    wordTimer = setTimeout(commitWord, AUDIO.dit() * 7.2);
  };

  pad.addEventListener('pointerdown', onDown);
  pad.addEventListener('pointerup', onUp);
  pad.addEventListener('pointerleave', onUp);
  pad.addEventListener('pointercancel', onUp);

  keyHandler = (e) => {
    if (e.code !== 'Space' || e.repeat) return;
    if (e.type === 'keydown') onDown(e); else onUp(e);
  };
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('keyup', keyHandler);

  $('#clear', root).onclick = () => { buf = ''; text = ''; showLive(); showOut(); };
}
let keyHandler = null;

/* ============================================================
   VUE : TRADUCTEUR
   ============================================================ */
function encodeText(txt) {
  return normalize(txt).split('\n').map(line =>
    line.trim().split(/\s+/).map(w =>
      [...w].map(c => MORSE[c] || (c === '' ? '' : '#')).filter(Boolean).join(' ')
    ).join('   ')
  ).join('\n');
}
function decodeMorse(code) {
  return code.split('\n').map(line =>
    line.trim().split(/\s{3,}|\s*\/\s*/).map(word =>
      word.trim().split(/\s+/).map(sym => MORSE_REV[sym] || '').join('')
    ).join(' ')
  ).join('\n');
}

let translateDir = 'text2morse';
function viewTranslate(root) {
  root.appendChild(el(`
    <div class="card">
      <h2>${t('translateTitle')} 🔁</h2>
      <label class="muted" id="lblA"></label>
      <textarea id="inA" placeholder="${t('typeHere')}"></textarea>
      <div class="row" style="justify-content:center;margin:10px 0">
        <button class="iconbtn" id="swap" title="${t('swap')}" style="width:auto;padding:0 14px">⇅ ${t('swap')}</button>
      </div>
      <label class="muted" id="lblB"></label>
      <textarea id="outB" placeholder="•−•" readonly></textarea>
      <div class="spacer"></div>
      <div class="row">
        <button class="btn accent" id="play">🔊 ${t('play')}</button>
        <button class="btn ghost" id="stop">⏹ ${t('stop')}</button>
        <button class="btn ghost" id="copy">⎘ ${t('copy')}</button>
      </div>
      <div class="watermark">${MASCOTS.stamp('seal', { size: 96 })}</div>
    </div>`));
  const inA = $('#inA', root), outB = $('#outB', root), lblA = $('#lblA', root), lblB = $('#lblB', root);
  const setLabels = () => {
    if (translateDir === 'text2morse') { lblA.textContent = t('textLabel'); lblB.textContent = t('morseLabel'); inA.placeholder = t('typeHere'); }
    else { lblA.textContent = t('morseLabel'); lblB.textContent = t('textLabel'); inA.placeholder = '•−• / −−−'; }
  };
  const update = () => {
    outB.value = translateDir === 'text2morse' ? encodeText(inA.value) : decodeMorse(inA.value);
  };
  setLabels();
  inA.oninput = update;
  $('#swap', root).onclick = () => { translateDir = translateDir === 'text2morse' ? 'morse2text' : 'text2morse'; const tmp = inA.value; inA.value = outB.value; outB.value = tmp; setLabels(); update(); };
  $('#play', root).onclick = () => {
    const src = translateDir === 'text2morse' ? inA.value : outB.value;
    if (src.trim()) AUDIO.playText(src);
  };
  $('#stop', root).onclick = () => AUDIO.stop();
  $('#copy', root).onclick = async () => { try { await navigator.clipboard.writeText(outB.value); toast(t('copied'), 'good'); } catch { toast(outB.value); } };
}

/* ============================================================
   VUE : RÉFÉRENCE
   ============================================================ */
function viewRef(root) {
  root.appendChild(el(`
    <div class="card">
      <h2>${t('refTitle')} 📖</h2>
      <input type="search" id="refSearch" placeholder="${t('search')}">
    </div>`));
  const container = el(`<div id="refBody"></div>`); root.appendChild(container);

  const draw = (filter = '') => {
    container.innerHTML = '';
    const f = filter.trim().toUpperCase();
    REF_GROUPS.forEach(group => {
      const chars = group.chars.filter(c => !f || c === f || (MORSE[c] || '').includes(f));
      if (!chars.length) return;
      container.appendChild(el(`<div class="section-title">${S.lang === 'fr' ? group.fr : group.en}</div>`));
      const grid = el(`<div class="ref-grid"></div>`);
      chars.forEach(c => {
        const cell = el(`<button class="ref-cell"><span class="ch">${c}</span>${morseSpans(MORSE[c])}</button>`);
        cell.onclick = () => AUDIO.playCode(MORSE[c]);
        grid.appendChild(cell);
      });
      container.appendChild(grid);
    });
    // prosigns
    container.appendChild(el(`<div class="section-title">${t('prosigns')}</div>`));
    const box = el(`<div class="card"></div>`);
    PROSIGNS.forEach(p => {
      const r = el(`<div class="prosign-row">
        <span class="sign">${p.sign}</span>${morseSpans(p.code.replace(/ /g, ''))}
        <span class="desc">${S.lang === 'fr' ? p.fr : p.en}</span></div>`);
      r.onclick = () => AUDIO.playText(p.sign);
      box.appendChild(r);
    });
    container.appendChild(box);
    container.appendChild(el(`<div class="center">${MASCOTS.binturong({ size: 84 })}<p class="muted" style="font-size:.75rem">${t('mascotBin')}</p></div>`));
  };
  draw();
  $('#refSearch', root).oninput = (e) => draw(e.target.value);
}

/* ============================================================
   RÉGLAGES (panneau)
   ============================================================ */
function openSettings() {
  const overlay = el(`
    <div class="card" style="position:fixed;inset:auto 12px 80px 12px;max-width:696px;margin:auto;z-index:80">
      <h2>${t('settings')} ⚙️</h2>
      <div class="setting"><label>${t('wpm')}</label><b id="wpmv">${S.settings.wpm}</b></div>
      <input type="range" min="5" max="30" value="${S.settings.wpm}" id="wpm">
      <div class="setting"><label>${t('tone')}</label><b id="tonev">${S.settings.tone}</b></div>
      <input type="range" min="300" max="1000" step="10" value="${S.settings.tone}" id="tone">
      ${toggle('sound', t('sound'))}
      ${toggle('flash', t('lightFlash'))}
      ${toggle('vibrate', t('vibrate'))}
      <div class="spacer"></div>
      <button class="btn ghost block" id="testBeep">🔊 SOS</button>
      <div class="spacer"></div>
      <button class="btn ghost block" id="resetBtn" style="color:var(--bad)">${t('reset')}</button>
      <div class="spacer"></div>
      <button class="btn primary block" id="closeSet">OK</button>
    </div>`);
  const back = el(`<div style="position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:75"></div>`);
  document.body.append(back, overlay);
  const close = () => { AUDIO.stop(); overlay.remove(); back.remove(); };
  back.onclick = close;
  $('#closeSet', overlay).onclick = close;
  const wpm = $('#wpm', overlay), tone = $('#tone', overlay);
  wpm.oninput = () => { S.settings.wpm = +wpm.value; $('#wpmv', overlay).textContent = wpm.value; save(); };
  tone.oninput = () => { S.settings.tone = +tone.value; $('#tonev', overlay).textContent = tone.value; save(); };
  overlay.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.onchange = () => { S.settings[cb.dataset.k] = cb.checked; save(); };
  });
  $('#testBeep', overlay).onclick = () => AUDIO.playText('SOS');
  $('#resetBtn', overlay).onclick = () => {
    if (confirm(t('resetConfirm'))) { S = structuredClone(DEFAULT_STATE); S.lang = I18N.fr ? S.lang : 'fr'; save(); close(); go('learn'); }
  };
}
function toggle(key, label) {
  return `<div class="setting"><label>${label}</label>
    <span class="switch"><input type="checkbox" data-k="${key}" ${S.settings[key] ? 'checked' : ''}><span class="track"></span></span></div>`;
}

/* ============================================================
   INITIALISATION
   ============================================================ */
function boot() {
  $('#brandLogo').innerHTML = MASCOTS.seal({ size: 42 });
  $('#langBtn').onclick = () => { S.lang = S.lang === 'fr' ? 'en' : 'fr'; document.documentElement.lang = S.lang; save(); render(); };
  $('#settingsBtn').onclick = openSettings;
  // débloque l'audio au premier contact
  const unlock = () => { AUDIO.ensure(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);
  document.documentElement.lang = S.lang;
  render();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
