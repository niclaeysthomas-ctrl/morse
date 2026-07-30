# 🦭 Morse Phoque — apprendre le code morse (FR / EN)

Une petite application web (PWA) **complète, gratuite et sans pub** pour apprendre le
**code morse**, en **français** comme en **anglais**. Installable sur téléphone,
elle fonctionne **hors-ligne**. Et oui : il y a des **phoques** et des **binturongs**
un peu partout. 🦭🐾

👉 **[Ouvrir l'application](https://niclaeysthomas-ctrl.github.io/morse/)**
_(lien actif une fois GitHub Pages activé — voir plus bas)_

---

## ✨ Ce qu'on peut faire

| | Fonction | Détail |
|---|---|---|
| 🎓 | **Apprendre** | 16 leçons progressives (méthode Koch), deux caractères à la fois, avec quiz d'écoute. |
| 🎯 | **Entraînement** | Écoute & décode, décodage de mots entiers, lecture & envoi à la clé. |
| 📻 | **Clé morse** | Une vraie clé : barre espace ou gros bouton — appui court = point, appui long = trait, décodage en temps réel. |
| 🔁 | **Traducteur** | Texte ↔ morse dans les deux sens, avec lecture sonore, **flash lumineux** et vibration. |
| 📖 | **Référence** | Alphabet, chiffres, ponctuation, **lettres accentuées françaises**, signaux de service (SOS, AR, CQ…). |
| ✏️ | **Dessin** | Apprendre à **dessiner un binturong** pas-à-pas, en 3 niveaux (facile / moyen / expert), avec calque « modèle ». |
| 😹 | **Blagues** | Un onglet de **blagues vraiment nulles** (sans aucun rapport avec le morse, c'est le but). |
| ⏱️ | **Chrono** | Mode contre-la-montre : 60 s pour décoder un max de lettres, avec record. |
| 🗓️ | **Défi du jour** | Un mot mystère quotidien à décoder pour un bonus d'XP. |
| 📊 | **Stats par lettre** | Carte thermique de tes lettres : plus c'est vert, mieux tu la reconnais. |
| 🏅 | **Progression** | XP, niveaux, série de jours, 9 badges. |

Et bien sûr : des **phoques**, des **éléphants de mer** 🦭 et des **binturongs** 🐾 dessinés à la main, un peu partout.

Réglages : vitesse (5–30 MPM), fréquence du son (300–1000 Hz), son / flash / vibration,
et bascule **🇫🇷 / 🇬🇧** à tout moment.

---

## 📱 Installer sur le téléphone

1. Ouvre le lien de l'app dans **Safari** (iPhone) ou **Chrome** (Android).
2. Menu **Partager / ⋮** → **« Sur l'écran d'accueil »** / **« Installer l'application »**.
3. L'icône phoque apparaît : ça marche ensuite **sans connexion**.

---

## 🛠️ Détails techniques

- **100 % front** : HTML, CSS et JavaScript purs, **aucune dépendance**, aucun tracker.
- **Son** généré à la volée via l'**API Web Audio** (pas de fichiers audio).
- **Mascottes** dessinées à la main en **SVG** → **aucun souci de copyright**.
- **PWA** avec service worker pour le mode hors-ligne.
- Progression sauvegardée en local (`localStorage`) — rien n'est envoyé nulle part.

### Lancer en local
```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

### Activer GitHub Pages
Dans **Settings → Pages** du dépôt : source = branche `main`, dossier `/root`.
L'app sera en ligne à `https://<utilisateur>.github.io/morse/`.

---

## 📁 Structure

```
index.html            Ossature de la page
styles.css            Thème « télégraphe au bord de mer »
app.js                Logique : audio, leçons, clé, traducteur, gamification
data.js               Table morse (+ accents FR), leçons, traductions FR/EN
mascots.js            Phoques & binturongs en SVG
sw.js                 Service worker (hors-ligne)
manifest.webmanifest  Métadonnées PWA
icon.svg              Icône de l'app
```

---

## 📜 Licence

[MIT](LICENSE) — libre d'utilisation, de copie et de modification.
Fait avec ❤️ (et beaucoup de points et de traits).

> `.-- .-. -.-- / --. --- --- -.. / -.-. --- -.. .` &nbsp;·&nbsp; _à toi de décoder !_
