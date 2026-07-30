/* ============================================================
   Données : table morse (international + accents FR),
   contenu des leçons (méthode Koch) et traductions FR / EN.
   ============================================================ */

/* ---- Table morse internationale --------------------------- */
const MORSE = {
  A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',
  F: '..-.',  G: '--.',   H: '....',  I: '..',    J: '.---',
  K: '-.-',   L: '.-..',  M: '--',    N: '-.',    O: '---',
  P: '.--.',  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
  U: '..-',   V: '...-',  W: '.--',   X: '-..-',  Y: '-.--',
  Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
  // Lettres accentuées / spécifiques (français & voisins)
  'À': '.--.-', 'Â': '.--.-', 'Ä': '.-.-', 'É': '..-..',
  'È': '.-..-', 'Ê': '-..-.', 'Ç': '-.-..', 'Ù': '..--',
  'Ü': '..--', 'Ö': '---.', 'Ñ': '--.--',
};

/* Table inverse (morse -> caractère). Le premier gagne pour les doublons. */
const MORSE_REV = (() => {
  const r = {};
  for (const [ch, code] of Object.entries(MORSE)) if (!(code in r)) r[code] = ch;
  return r;
})();

/* ---- Groupes pour la référence ---------------------------- */
const REF_GROUPS = [
  { fr: 'Lettres', en: 'Letters', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') },
  { fr: 'Chiffres', en: 'Numbers', chars: '0123456789'.split('') },
  { fr: 'Ponctuation', en: 'Punctuation', chars: ['.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'] },
  { fr: 'Accents (français)', en: 'Accented (French)', chars: ['À', 'Â', 'Ä', 'É', 'È', 'Ê', 'Ç', 'Ù', 'Ü', 'Ö', 'Ñ'] },
];

/* ---- Signaux de service & abréviations utiles ------------- */
const PROSIGNS = [
  { sign: 'SOS', code: '...---...', fr: 'Détresse', en: 'Distress' },
  { sign: 'AR', code: '.-.-.', fr: 'Fin de message', en: 'End of message' },
  { sign: 'AS', code: '.-...', fr: 'Attendez', en: 'Wait' },
  { sign: 'K', code: '-.-', fr: 'À vous / invitez à transmettre', en: 'Go ahead / over' },
  { sign: 'SK', code: '...-.-', fr: 'Fin de contact', en: 'End of contact' },
  { sign: 'BT', code: '-...-', fr: 'Séparation / nouveau paragraphe', en: 'Break / new section' },
  { sign: 'CQ', code: '-.-. --.-', fr: 'Appel général', en: 'Calling any station' },
  { sign: '73', code: '--... ...--', fr: 'Cordiales salutations', en: 'Best regards' },
];

/* ---- Leçons (méthode Koch) --------------------------------
   On introduit peu de caractères à la fois, du plus contrastant
   au moins contrastant, comme le préconise la méthode Koch.    */
const LESSONS = [
  { id: 1,  add: ['K', 'M'],       fr: 'Les deux premiers',        en: 'Your first two' },
  { id: 2,  add: ['U', 'R'],       fr: 'On enchaîne',              en: 'Keep going' },
  { id: 3,  add: ['E', 'S'],       fr: 'Le point roi',             en: 'The mighty dot' },
  { id: 4,  add: ['N', 'A'],       fr: 'Courts et vifs',           en: 'Short and snappy' },
  { id: 5,  add: ['P', 'T'],       fr: 'Long et court',            en: 'Long and short' },
  { id: 6,  add: ['L', 'W'],       fr: 'Nouveaux rythmes',         en: 'New rhythms' },
  { id: 7,  add: ['I', '.'],       fr: 'Un signe de ponctuation',  en: 'A first punctuation' },
  { id: 8,  add: ['J', 'Z'],       fr: 'Les plus rares',           en: 'The rarer ones' },
  { id: 9,  add: ['F', 'O'],       fr: 'On progresse',             en: 'Progressing' },
  { id: 10, add: ['Y', 'V'],       fr: 'Presque tout l’alphabet',  en: 'Almost the whole alphabet' },
  { id: 11, add: ['G', 'H'],       fr: 'Encore deux',              en: 'Two more' },
  { id: 12, add: ['B', 'C'],       fr: 'La ligne d’arrivée',       en: 'The finish line' },
  { id: 13, add: ['D', 'X', 'Q'],  fr: 'Alphabet complet !',       en: 'Full alphabet!' },
  { id: 14, add: ['1', '2', '3', '4', '5'], fr: 'Les chiffres (1)', en: 'Numbers (1)' },
  { id: 15, add: ['6', '7', '8', '9', '0'], fr: 'Les chiffres (2)', en: 'Numbers (2)' },
  { id: 16, add: [',', '?', '/', '='],      fr: 'Ponctuation clé',  en: 'Key punctuation' },
];

/* Caractères cumulés débloqués après avoir terminé la leçon `n`. */
function unlockedThrough(lessonId) {
  const set = [];
  for (const l of LESSONS) { if (l.id <= lessonId) set.push(...l.add); }
  return set;
}

/* ---- Phrases d'entraînement (mots réels des 2 langues) ---- */
const WORDS = {
  fr: ['CHAT', 'SOLEIL', 'PHOQUE', 'MER', 'AMITIE', 'BONJOUR', 'MORSE', 'ETOILE', 'RADIO', 'VAGUE',
       'NEIGE', 'FORET', 'RIVIERE', 'MERCI', 'LUMIERE', 'SIGNAL', 'CODE', 'ONDE', 'PLAGE', 'VOILE'],
  en: ['CAT', 'SUN', 'SEAL', 'SEA', 'FRIEND', 'HELLO', 'MORSE', 'STAR', 'RADIO', 'WAVE',
       'SNOW', 'FOREST', 'RIVER', 'THANKS', 'LIGHT', 'SIGNAL', 'CODE', 'BEACON', 'BEACH', 'SAIL'],
};

/* ---- i18n : toute l'interface --------------------------- */
const I18N = {
  fr: {
    appName: 'Morse Phoque',
    tagline: 'Apprends le morse, un point à la fois',
    nav_learn: 'Apprendre', nav_train: 'Entraînement', nav_key: 'Clé', nav_translate: 'Traducteur', nav_ref: 'Référence',
    level: 'Niveau', xp: 'XP', streak: 'Série', day: 'j',
    lessons: 'Leçons', locked: 'Verrouillé', done: 'Réussi', start: 'Commencer', review: 'Revoir',
    lesson: 'Leçon', newChars: 'Nouveaux caractères', listen: 'Écouter', next: 'Suivant', finish: 'Terminer',
    learnIntro: 'Écoute chaque caractère, mémorise son rythme, puis passe au quiz.',
    quizPrompt: 'Quel est ce caractère ?', typeHere: 'Tape ici…', check: 'Vérifier', correct: 'Bravo !', wrong: 'Raté',
    trainTitle: 'Entraînement', trainListen: 'Écoute & décode', trainSend: 'Lis & envoie', trainWords: 'Mots',
    trainListenDesc: 'On joue du morse, tu tapes la lettre.', trainSendDesc: 'Une lettre s’affiche, tu envoies le morse à la clé.',
    trainWordsDesc: 'Décode un mot entier joué en morse.', replay: 'Rejouer', reveal: 'Révéler', newRound: 'Nouveau',
    score: 'Score', accuracy: 'Précision', keyTitle: 'Clé morse',
    keyDesc: 'Maintiens la barre espace (ou le gros bouton) : appui court = point, appui long = trait. Un blanc valide la lettre.',
    tapKey: 'Appuie ici', decoded: 'Décodé', clear: 'Effacer', wpm: 'Vitesse (MPM)',
    translateTitle: 'Traducteur', textLabel: 'Texte', morseLabel: 'Morse',
    play: 'Jouer', stop: 'Stop', flash: 'Flash', copy: 'Copier', copied: 'Copié !', swap: 'Inverser',
    refTitle: 'Référence complète', prosigns: 'Signaux & abréviations', search: 'Rechercher…',
    settings: 'Réglages', sound: 'Son', tone: 'Fréquence (Hz)', lightFlash: 'Flash lumineux', vibrate: 'Vibrer',
    install: 'Installer l’app', reset: 'Réinitialiser la progression', resetConfirm: 'Effacer toute ta progression ?',
    langName: 'Français', switchLang: 'English', badges: 'Badges',
    badge_first: 'Premier pas', badge_alpha: 'Alphabet !', badge_streak3: 'Série de 3', badge_100: '100 bonnes réponses', badge_key: 'Télégraphiste',
    empty: 'Rien pour l’instant', keepGoing: 'Continue comme ça !', lessonDone: 'Leçon terminée', xpEarned: 'XP gagnés',
    hintSpace: 'Espace = clé', mascotHi: 'Salut, moi c’est Pixel le phoque !', mascotBin: 'Et moi Bina la binturong.',
    of: 'sur', question: 'Question', playInput: 'Écouter ce que tu as tapé',
  },
  en: {
    appName: 'Morse Seal',
    tagline: 'Learn Morse, one dot at a time',
    nav_learn: 'Learn', nav_train: 'Practice', nav_key: 'Key', nav_translate: 'Translator', nav_ref: 'Reference',
    level: 'Level', xp: 'XP', streak: 'Streak', day: 'd',
    lessons: 'Lessons', locked: 'Locked', done: 'Done', start: 'Start', review: 'Review',
    lesson: 'Lesson', newChars: 'New characters', listen: 'Listen', next: 'Next', finish: 'Finish',
    learnIntro: 'Listen to each character, learn its rhythm, then take the quiz.',
    quizPrompt: 'Which character is this?', typeHere: 'Type here…', check: 'Check', correct: 'Nice!', wrong: 'Nope',
    trainTitle: 'Practice', trainListen: 'Listen & decode', trainSend: 'Read & send', trainWords: 'Words',
    trainListenDesc: 'We play Morse, you type the letter.', trainSendDesc: 'A letter shows up, you send it on the key.',
    trainWordsDesc: 'Decode a whole word played in Morse.', replay: 'Replay', reveal: 'Reveal', newRound: 'New',
    score: 'Score', accuracy: 'Accuracy', keyTitle: 'Morse key',
    keyDesc: 'Hold the space bar (or the big button): short press = dot, long press = dash. A pause commits the letter.',
    tapKey: 'Press here', decoded: 'Decoded', clear: 'Clear', wpm: 'Speed (WPM)',
    translateTitle: 'Translator', textLabel: 'Text', morseLabel: 'Morse',
    play: 'Play', stop: 'Stop', flash: 'Flash', copy: 'Copy', copied: 'Copied!', swap: 'Swap',
    refTitle: 'Full reference', prosigns: 'Prosigns & abbreviations', search: 'Search…',
    settings: 'Settings', sound: 'Sound', tone: 'Tone (Hz)', lightFlash: 'Light flash', vibrate: 'Vibrate',
    install: 'Install app', reset: 'Reset progress', resetConfirm: 'Erase all your progress?',
    langName: 'English', switchLang: 'Français', badges: 'Badges',
    badge_first: 'First steps', badge_alpha: 'Alphabet!', badge_streak3: '3-day streak', badge_100: '100 correct', badge_key: 'Telegrapher',
    empty: 'Nothing yet', keepGoing: 'Keep it up!', lessonDone: 'Lesson complete', xpEarned: 'XP earned',
    hintSpace: 'Space = key', mascotHi: 'Hi, I’m Pixel the seal!', mascotBin: 'And I’m Bina the binturong.',
    of: 'of', question: 'Question', playInput: 'Listen to what you typed',
  },
};
