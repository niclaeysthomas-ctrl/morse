/* ============================================================
   Mascottes — phoques & binturongs dessinés à la main en SVG.
   100 % maison → aucun copyright. Réutilisables partout.
   ============================================================ */

/* ---- PHOQUE (seal) — assis, tout content ------------------- */
function seal(opts = {}) {
  const s = opts.size || 120;
  const body = opts.body || '#9aa7b4';
  const belly = opts.belly || '#cdd6de';
  return `
  <svg viewBox="0 0 200 200" width="${s}" height="${s}" class="mascot mascot-seal" role="img" aria-label="Phoque">
    <ellipse cx="100" cy="182" rx="62" ry="12" fill="rgba(0,0,0,.12)"/>
    <!-- corps -->
    <path d="M100 40 C60 40 44 78 46 118 C48 156 72 176 100 176 C128 176 152 156 154 118 C156 78 140 40 100 40 Z" fill="${body}"/>
    <ellipse cx="100" cy="130" rx="34" ry="44" fill="${belly}"/>
    <!-- nageoires -->
    <path d="M52 120 C34 128 30 148 42 158 C50 150 56 138 60 128 Z" fill="${body}"/>
    <path d="M148 120 C166 128 170 148 158 158 C150 150 144 138 140 128 Z" fill="${body}"/>
    <path d="M84 172 C80 186 90 190 96 184 Z M116 172 C120 186 110 190 104 184 Z" fill="${body}"/>
    <!-- moustaches -->
    <g stroke="#5c6672" stroke-width="1.6" stroke-linecap="round" opacity=".8">
      <line x1="88" y1="92" x2="60" y2="88"/><line x1="88" y1="97" x2="60" y2="100"/>
      <line x1="112" y1="92" x2="140" y2="88"/><line x1="112" y1="97" x2="140" y2="100"/>
    </g>
    <!-- visage -->
    <circle cx="84" cy="80" r="7" fill="#25303a"/>
    <circle cx="116" cy="80" r="7" fill="#25303a"/>
    <circle cx="86" cy="78" r="2.4" fill="#fff"/>
    <circle cx="118" cy="78" r="2.4" fill="#fff"/>
    <ellipse cx="100" cy="92" rx="7" ry="5" fill="#3a2b2b"/>
    <path d="M92 100 Q100 108 108 100" stroke="#3a2b2b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

/* ---- PHOQUE qui pointe le museau (déco de coin) ------------ */
function sealPeek(opts = {}) {
  const s = opts.size || 90;
  const body = opts.body || '#9aa7b4';
  return `
  <svg viewBox="0 0 200 140" width="${s}" height="${s * 0.7}" class="mascot mascot-peek" role="img" aria-label="Phoque curieux">
    <path d="M100 20 C64 20 44 52 46 92 C46 108 154 108 154 92 C156 52 136 20 100 20 Z" fill="${body}"/>
    <circle cx="84" cy="66" r="7" fill="#25303a"/><circle cx="116" cy="66" r="7" fill="#25303a"/>
    <circle cx="86" cy="64" r="2.3" fill="#fff"/><circle cx="118" cy="64" r="2.3" fill="#fff"/>
    <ellipse cx="100" cy="80" rx="7" ry="5" fill="#3a2b2b"/>
    <g stroke="#5c6672" stroke-width="1.5" stroke-linecap="round" opacity=".8">
      <line x1="88" y1="80" x2="62" y2="78"/><line x1="112" y1="80" x2="138" y2="78"/>
    </g>
  </svg>`;
}

/* ---- BINTURONG (bearcat) — tout en fourrure ---------------- */
function binturong(opts = {}) {
  const s = opts.size || 130;
  const fur = opts.fur || '#2f2a33';
  const light = opts.light || '#7d6f86';
  return `
  <svg viewBox="0 0 220 200" width="${s}" height="${s * 0.9}" class="mascot mascot-binturong" role="img" aria-label="Binturong">
    <ellipse cx="110" cy="186" rx="66" ry="11" fill="rgba(0,0,0,.12)"/>
    <!-- queue préhensile -->
    <path d="M150 150 C196 150 200 96 168 92 C150 90 150 112 162 116 C176 120 168 136 150 134 Z" fill="${fur}"/>
    <!-- corps -->
    <ellipse cx="98" cy="140" rx="58" ry="46" fill="${fur}"/>
    <!-- pattes -->
    <ellipse cx="74" cy="176" rx="15" ry="11" fill="${fur}"/>
    <ellipse cx="120" cy="176" rx="15" ry="11" fill="${fur}"/>
    <!-- tête -->
    <circle cx="86" cy="86" r="52" fill="${fur}"/>
    <!-- oreilles à pinceaux -->
    <path d="M50 48 C40 24 54 22 60 40 Z" fill="${fur}"/>
    <path d="M122 48 C132 24 118 22 112 40 Z" fill="${fur}"/>
    <path d="M50 48 C45 34 53 32 57 42" stroke="${light}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M122 48 C127 34 119 32 115 42" stroke="${light}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- museau clair -->
    <ellipse cx="86" cy="104" rx="30" ry="24" fill="${light}"/>
    <!-- yeux -->
    <circle cx="68" cy="82" r="8" fill="#f4e9c9"/><circle cx="104" cy="82" r="8" fill="#f4e9c9"/>
    <circle cx="69" cy="83" r="4.5" fill="#1a1520"/><circle cx="105" cy="83" r="4.5" fill="#1a1520"/>
    <circle cx="70.5" cy="81" r="1.5" fill="#fff"/><circle cx="106.5" cy="81" r="1.5" fill="#fff"/>
    <!-- truffe + bouche -->
    <path d="M80 100 L92 100 L86 108 Z" fill="#1a1520"/>
    <path d="M86 108 Q78 116 72 110 M86 108 Q94 116 100 110" stroke="#1a1520" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <!-- moustaches -->
    <g stroke="${light}" stroke-width="1.6" stroke-linecap="round" opacity=".85">
      <line x1="70" y1="104" x2="40" y2="100"/><line x1="70" y1="108" x2="42" y2="112"/>
      <line x1="102" y1="104" x2="132" y2="100"/><line x1="102" y1="108" x2="130" y2="112"/>
    </g>
  </svg>`;
}

/* ---- Petit tampon décoratif (silhouette) ------------------- */
function stamp(kind, opts = {}) {
  const s = opts.size || 40;
  const c = opts.color || 'currentColor';
  if (kind === 'seal') {
    return `<svg viewBox="0 0 200 200" width="${s}" height="${s}" class="mascot-stamp" aria-hidden="true">
      <path d="M100 40 C60 40 44 78 46 118 C48 156 72 176 100 176 C128 176 152 156 154 118 C156 78 140 40 100 40 Z M52 120 C34 128 30 148 42 158 C50 150 56 138 60 128 Z M148 120 C166 128 170 148 158 158 C150 150 144 138 140 128 Z" fill="${c}"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 220 200" width="${s}" height="${s}" class="mascot-stamp" aria-hidden="true">
    <path d="M150 150 C196 150 200 96 168 92 C150 90 150 112 162 116 C176 120 168 136 150 134 Z" fill="${c}"/>
    <ellipse cx="98" cy="140" rx="58" ry="46" fill="${c}"/>
    <circle cx="86" cy="86" r="52" fill="${c}"/>
    <path d="M50 48 C40 24 54 22 60 40 Z M122 48 C132 24 118 22 112 40 Z" fill="${c}"/>
  </svg>`;
}

const MASCOTS = { seal, sealPeek, binturong, stamp };
