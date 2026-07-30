/* ============================================================
   Apprendre à dessiner un binturong, trait par trait.
   Le personnage se construit dans le même ordre qu'on le
   dessinerait au crayon. Trois niveaux de difficulté = plus
   ou moins d'étapes (plus de détails à gérer d'un coup).
   ============================================================ */

/* Chaque « trait » est un morceau de SVG. Ils s'empilent dans
   l'ordre du dessin (viewBox 220 x 200, comme la mascotte). */
const BINTURONG_STROKES = [
  // 0 — construction (crayon léger)
  `<g class="guide"><ellipse cx="98" cy="140" rx="58" ry="46"/><circle cx="86" cy="86" r="52"/><line x1="86" y1="40" x2="86" y2="132"/><line x1="40" y1="86" x2="132" y2="86"/></g>`,
  // 1 — queue préhensile
  `<path d="M150 150 C196 150 200 96 168 92 C150 90 150 112 162 116 C176 120 168 136 150 134 Z" fill="#2f2a33"/>`,
  // 2 — corps
  `<ellipse cx="98" cy="140" rx="58" ry="46" fill="#2f2a33"/>`,
  // 3 — pattes
  `<ellipse cx="74" cy="176" rx="15" ry="11" fill="#2f2a33"/><ellipse cx="120" cy="176" rx="15" ry="11" fill="#2f2a33"/>`,
  // 4 — tête
  `<circle cx="86" cy="86" r="52" fill="#2f2a33"/>`,
  // 5 — oreilles
  `<path d="M50 48 C40 24 54 22 60 40 Z" fill="#2f2a33"/><path d="M122 48 C132 24 118 22 112 40 Z" fill="#2f2a33"/>`,
  // 6 — museau clair
  `<ellipse cx="86" cy="104" rx="30" ry="24" fill="#7d6f86"/>`,
  // 7 — yeux
  `<circle cx="68" cy="82" r="8" fill="#f4e9c9"/><circle cx="104" cy="82" r="8" fill="#f4e9c9"/><circle cx="69" cy="83" r="4.5" fill="#1a1520"/><circle cx="105" cy="83" r="4.5" fill="#1a1520"/><circle cx="70.5" cy="81" r="1.5" fill="#fff"/><circle cx="106.5" cy="81" r="1.5" fill="#fff"/>`,
  // 8 — nez + bouche
  `<path d="M80 100 L92 100 L86 108 Z" fill="#1a1520"/><path d="M86 108 Q78 116 72 110 M86 108 Q94 116 100 110" stroke="#1a1520" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  // 9 — pinceaux d'oreilles + moustaches (finitions)
  `<path d="M50 48 C45 34 53 32 57 42" stroke="#7d6f86" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M122 48 C127 34 119 32 115 42" stroke="#7d6f86" stroke-width="3" fill="none" stroke-linecap="round"/><g stroke="#7d6f86" stroke-width="1.6" stroke-linecap="round" opacity=".85"><line x1="70" y1="104" x2="40" y2="100"/><line x1="70" y1="108" x2="42" y2="112"/><line x1="102" y1="104" x2="132" y2="100"/><line x1="102" y1="108" x2="130" y2="112"/></g>`,
];

/* Niveaux : chaque étape révèle les traits jusqu'à l'indice `to`. */
const DRAW_LEVELS = {
  facile: {
    fr: 'Facile', en: 'Easy',
    steps: [
      { to: 0, fr: 'Trace deux formes au crayon léger : un grand ovale pour le corps et un rond pour la tête, avec une croix pour placer le visage.', en: 'Lightly sketch two shapes: a big oval for the body and a circle for the head, with a cross to place the face.' },
      { to: 3, fr: 'Dessine le corps tout rond et poilu, la longue queue derrière et deux petites pattes en bas.', en: 'Draw the round, fluffy body, the long tail behind and two little paws at the bottom.' },
      { to: 5, fr: 'Pose la grosse tête ronde sur le corps et ajoute deux petites oreilles arrondies.', en: 'Add the big round head on the body and two small rounded ears.' },
      { to: 8, fr: 'Le visage : un museau clair, deux grands yeux dorés, un petit nez triangulaire et un sourire.', en: 'The face: a light muzzle, two big golden eyes, a small triangular nose and a smile.' },
      { to: 9, fr: 'Finitions : les petits pinceaux au bout des oreilles et les longues moustaches. Bravo, ton binturong est prêt ! 🎉', en: 'Finishing touches: little ear tufts and long whiskers. Well done, your binturong is ready! 🎉' },
    ],
  },
  moyen: {
    fr: 'Moyen', en: 'Medium',
    steps: [
      { to: 0, fr: 'Construction : un grand ovale (corps) et un rond (tête). La croix aide à centrer les yeux et le nez.', en: 'Construction: a big oval (body) and a circle (head). The cross helps center eyes and nose.' },
      { to: 1, fr: 'Commence par la longue queue préhensile qui s’enroule derrière le corps — c’est la signature du binturong.', en: 'Start with the long prehensile tail curling behind the body — the binturong’s signature.' },
      { to: 2, fr: 'Épaissis le corps tout rond par-dessus l’ovale de construction.', en: 'Fill out the round body over the construction oval.' },
      { to: 4, fr: 'Ajoute deux petites pattes en bas, puis pose la grosse tête ronde.', en: 'Add two little paws at the bottom, then place the big round head.' },
      { to: 6, fr: 'Deux oreilles arrondies sur le haut de la tête, et un museau plus clair au centre.', en: 'Two rounded ears on top of the head, and a lighter muzzle in the middle.' },
      { to: 8, fr: 'Deux grands yeux dorés, un petit nez triangulaire et un sourire tout doux.', en: 'Two big golden eyes, a small triangular nose and a gentle smile.' },
      { to: 9, fr: 'Finitions : pinceaux d’oreilles et moustaches. Et voilà ! 🎉', en: 'Finishing touches: ear tufts and whiskers. There you go! 🎉' },
    ],
  },
  expert: {
    fr: 'Expert', en: 'Expert',
    steps: [
      { to: 0, fr: 'Construction fine : ovale du corps, cercle de la tête, et la croix du visage pour bien répartir les traits.', en: 'Careful construction: body oval, head circle, and the face cross to balance the features.' },
      { to: 1, fr: 'La queue préhensile : une longue courbe qui s’enroule. Soigne la spirale, elle donne le mouvement.', en: 'The prehensile tail: one long curling curve. Mind the spiral — it gives the pose its motion.' },
      { to: 2, fr: 'Le corps : une masse ronde et poilue. Garde des bords un peu irréguliers pour la fourrure.', en: 'The body: a round, fluffy mass. Keep the edges slightly ragged for fur.' },
      { to: 3, fr: 'Les pattes : deux petits ovales en bas, à peine visibles sous le corps.', en: 'The paws: two small ovals at the bottom, barely peeking under the body.' },
      { to: 4, fr: 'La tête : un grand cercle qui déborde un peu sur le corps.', en: 'The head: a large circle overlapping the body a little.' },
      { to: 5, fr: 'Les oreilles : deux petites pointes arrondies, écartées sur le haut du crâne.', en: 'The ears: two small rounded points, set wide on top of the skull.' },
      { to: 6, fr: 'Le museau : un ovale plus clair au centre du visage, sous la croix.', en: 'The muzzle: a lighter oval at the center of the face, under the cross.' },
      { to: 7, fr: 'Les yeux : deux grands ronds dorés avec une pupille sombre et un petit reflet blanc.', en: 'The eyes: two big golden rounds with a dark pupil and a tiny white glint.' },
      { to: 8, fr: 'Le nez et la bouche : un triangle noir et deux petites courbes pour le sourire.', en: 'Nose and mouth: a black triangle and two little curves for the smile.' },
      { to: 9, fr: 'Détails finaux : les pinceaux au bout des oreilles et les longues moustaches claires. Chef-d’œuvre ! 🎉', en: 'Final details: the ear tufts and the long pale whiskers. Masterpiece! 🎉' },
    ],
  },
};
