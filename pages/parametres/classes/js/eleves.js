/**
 * ════════════════════════════════════════════════════════════
 *  DASHBOARD — dashboard.js
 *  Gestion scolaire · Thème Académie Prestige
 *  Dépendances : jQuery, Chart.js 4.x, AdminLTE
 * ════════════════════════════════════════════════════════════
 */

'use strict';

// ── PALETTE COULEURS (cohérence avec style.css) ──────────────
const C = {
  forest:      '#1e3a2f',
  forestMid:   '#2d5240',
  forestLight: '#3d6b54',
  terra:       '#b85c38',
  gold:        '#c9a84c',
  cream:       '#f5f0e8',
  creamborder: '#d9d0be',
  creamdeep:   '#ede7d9',
  ink:         '#1a1a1a',
  inkMid:      '#4a4a4a',
  inkMuted:    '#888070',
  danger:      '#b84040',
  success:     '#3a7d5a',
  warn:        '#b87a1e',
  paidLight:   '#f0d4c8',
};

// ── VARIABLES GLOBALES ───────────────────────────────────────
let chartPresence = null;
let chartDonut    = null;
let chartFrais    = null;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  masquerSpinner();
  chargerTout();
  genererCalendrier(new Date());
});

// ── CHARGEMENT GLOBAL ────────────────────────────────────────
function chargerTout() {
  afficherSpinner();

  Promise.all([
    chargerKpi(),
    chargerPresences(),
    chargerRepartition(),
    chargerReussite(),
    chargerFrais(),
    chargerAbsences(),
    chargerActivite(),
  ]).finally(() => masquerSpinner());
}

// ── SPINNER ──────────────────────────────────────────────────
function afficherSpinner() {
  const el = document.getElementById('spinnerOverlay');
  if (el) el.style.display = 'flex';
}
function masquerSpinner() {
  const el = document.getElementById('spinnerOverlay');
  if (el) el.style.display = 'none';
}

// ── FETCH HELPER ─────────────────────────────────────────────
function apiFetch(action) {
  return fetch('dashboard.aspx?action=' + action)
    .then(r => {
      if (!r.ok) throw new Error('Erreur réseau ' + r.status);
      return r.json();
    });
}

// ════════════════════════════════════════════════════════════
//  KPI
// ════════════════════════════════════════════════════════════
function chargerKpi() {
  return apiFetch('kpi').then(d => {
    setText('valEleves',  d.totalEleves);
    setText('valClasses', d.totalClasses);
    setText('valPresence', d.tauxPresence);
    setText('valImpayes', d.fraisImpayes);

    // Pill nouveaux élèves
    setPill('pillEleves', '+' + d.nouveauxRentree, 'up');

    // Pill classes
    setText('pillClasses', 'Moy. ' + d.moyEleves + ' élèves');

    // Pill présence
    const varPres = d.variationPresence;
    setPill('pillPresence',
      (varPres >= 0 ? '+' : '') + varPres + '%',
      varPres >= 0 ? 'up' : 'dn');

    // Pill impayés
    const varImp = d.variationImpayes - d.fraisImpayes;
    setPill('pillImpayes',
      (varImp >= 0 ? '+' : '') + varImp,
      varImp <= 0 ? 'up' : 'dn');

    // Garçons / Filles
    const total = (d.garcons || 0) + (d.filles || 0);
    if (total > 0) {
      const pG = Math.round(d.garcons / total * 100);
      const pF = 100 - pG;
      setText('pctGarcons', pG + '%');
      setText('pctFilles',  pF + '%');
      setBarWidth('fillGarcons', pG);
      setBarWidth('fillFilles',  pF);
    }

    // Gauges
    renderGauges([
      { label: 'Présence',  val: d.tauxPresence,  color: C.forest      },
      { label: 'Réussite',  val: 77,              color: C.gold        },
      { label: 'Paiements', val: Math.round((1 - d.fraisImpayes / Math.max(d.totalEleves, 1)) * 100), color: C.terra },
    ]);
  }).catch(e => console.warn('KPI:', e));
}

// ════════════════════════════════════════════════════════════
//  PRÉSENCES
// ════════════════════════════════════════════════════════════
function chargerPresences() {
  return apiFetch('presences').then(d => {
    const ctx = document.getElementById('chartPresence');
    if (!ctx) return;

    // Mois courant dans le label
    const now = new Date();
    setText('lblMoisPresence', now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }));

    if (chartPresence) chartPresence.destroy();

    chartPresence = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Présents',
            data: d.presents,
            backgroundColor: C.forest,
            borderRadius: 6,
            barPercentage: 0.65,
          },
          {
            label: 'Absents',
            data: d.absents,
            backgroundColor: C.terra,
            borderRadius: 6,
            barPercentage: 0.65,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: C.inkMuted, font: { size: 11 }, autoSkip: false },
          },
          y: {
            stacked: true,
            grid: { color: '#e8e0d0' },
            border: { display: false },
            ticks: { color: C.inkMuted, font: { size: 11 } },
          },
        },
      },
    });
  }).catch(e => console.warn('Présences:', e));
}

// ════════════════════════════════════════════════════════════
//  RÉPARTITION DONUT
// ════════════════════════════════════════════════════════════
function chargerRepartition() {
  return apiFetch('repartition').then(d => {
    const ctx = document.getElementById('chartDonut');
    if (!ctx) return;

    const couleurs = [C.forest, C.forestLight, C.terra, C.gold, C.creamborder, C.inkMuted];

    if (chartDonut) chartDonut.destroy();
    chartDonut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: d.niveaux,
        datasets: [{
          data: d.counts,
          backgroundColor: couleurs.slice(0, d.niveaux.length),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => c.label + ' : ' + c.parsed } },
        },
      },
    });

    // Légende custom
    const leg = document.getElementById('donutLegend');
    if (!leg) return;
    leg.innerHTML = d.niveaux.map((n, i) =>
      '<div class="leg-item">' +
      '<span class="leg-sq" style="background:' + couleurs[i] + '"></span>' +
      n + '<span class="leg-val">' + d.counts[i] + '</span>' +
      '</div>'
    ).join('');
  }).catch(e => console.warn('Répartition:', e));
}

// ════════════════════════════════════════════════════════════
//  TAUX DE RÉUSSITE
// ════════════════════════════════════════════════════════════
function chargerReussite() {
  return apiFetch('reussite').then(items => {
    const container = document.getElementById('reussiteContainer');
    if (!container) return;

    const couleurs = [C.forest, C.forestLight, C.gold, C.terra, C.danger, C.inkMuted];

    if (!items || items.length === 0) {
      container.innerHTML = '<p style="color:#888070;font-size:12px;text-align:center;padding:20px 0;">Aucune donnée disponible</p>';
      return;
    }

    container.innerHTML = items.map((item, i) => {
      const taux = Math.round(item.taux);
      const couleur = couleurs[Math.min(i, couleurs.length - 1)];
      return '<div class="prog-item">' +
        '<div class="prog-head">' +
        '<span class="prog-name">' + item.classe + '</span>' +
        '<span class="prog-pct">' + taux + '%</span>' +
        '</div>' +
        '<div class="prog-track">' +
        '<div class="prog-fill" style="width:' + taux + '%;background:' + couleur + '"></div>' +
        '</div>' +
        '</div>';
    }).join('');
  }).catch(e => {
    // Données de démo si pas de table NOTES
    const demo = [
      { classe: '6ème A', taux: 88 }, { classe: '5ème A', taux: 82 },
      { classe: '4ème A', taux: 75 }, { classe: '3ème A', taux: 69 },
      { classe: '3ème B', taux: 58 },
    ];
    const couleurs = [C.forest, C.forestLight, C.gold, C.terra, C.danger];
    const container = document.getElementById('reussiteContainer');
    if (container)
      container.innerHTML = demo.map((item, i) =>
        '<div class="prog-item">' +
        '<div class="prog-head"><span class="prog-name">' + item.classe + '</span>' +
        '<span class="prog-pct">' + item.taux + '%</span></div>' +
        '<div class="prog-track"><div class="prog-fill" style="width:' + item.taux +
        '%;background:' + couleurs[i] + '"></div></div></div>'
      ).join('');
    console.warn('Réussite (démo):', e);
  });
}

// ════════════════════════════════════════════════════════════
//  FRAIS SCOLAIRES
// ════════════════════════════════════════════════════════════
function chargerFrais() {
  return apiFetch('frais').then(d => {
    const ctx = document.getElementById('chartFrais');
    if (!ctx) return;

    if (chartFrais) chartFrais.destroy();
    chartFrais = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          { label: 'Payé',   data: d.payes,   backgroundColor: C.forestLight, borderRadius: 5, barPercentage: 0.7 },
          { label: 'Impayé', data: d.impayes, backgroundColor: C.paidLight,   borderRadius: 5, barPercentage: 0.7 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: C.inkMuted, font: { size: 10 }, autoSkip: false } },
          y: { grid: { color: '#e8e0d0' }, border: { display: false }, ticks: { color: C.inkMuted, font: { size: 10 } } },
        },
      },
    });
  }).catch(e => console.warn('Frais:', e));
}

// ════════════════════════════════════════════════════════════
//  ABSENCES
// ════════════════════════════════════════════════════════════
function chargerAbsences() {
  return apiFetch('absences').then(rows => {
    const tbody = document.getElementById('tbodyAbsences');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#888070;">Aucune absence ce mois</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(r => {
      let classeNb, classeBadge;
      if (r.statut === 'Critique') {
        classeNb = 'abs-nb-critique'; classeBadge = 'badge-critique';
      } else if (r.statut === 'Surveiller') {
        classeNb = 'abs-nb-surveiller'; classeBadge = 'badge-surveiller';
      } else {
        classeNb = 'abs-nb-normal'; classeBadge = 'badge-normal';
      }
      const libStatut = r.statut === 'Surveiller' ? 'À surveiller' : r.statut;
      return '<tr>' +
        '<td><strong>' + r.nom + '</strong></td>' +
        '<td>' + r.classe + '</td>' +
        '<td class="' + classeNb + '">' + r.nb + '</td>' +
        '<td><span class="badge-statut ' + classeBadge + '">' + libStatut + '</span></td>' +
        '</tr>';
    }).join('');
  }).catch(e => console.warn('Absences:', e));
}

// ════════════════════════════════════════════════════════════
//  ACTIVITÉ RÉCENTE
// ════════════════════════════════════════════════════════════
function chargerActivite() {
  return apiFetch('activite').then(items => {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const icones = {
      success: '✓',
      danger:  '!',
      warning: '₳',
      info:    '✎',
    };

    feed.innerHTML = items.map(it =>
      '<div class="act-item">' +
      '<div class="act-icon ' + it.type + '">' + (icones[it.type] || '•') + '</div>' +
      '<div>' +
      '<div class="act-main">' + it.texte + '</div>' +
      '<div class="act-detail">' + it.detail + '</div>' +
      '<div class="act-time">' + it.temps + '</div>' +
      '</div>' +
      '</div>'
    ).join('');
  }).catch(e => console.warn('Activité:', e));
}

// ════════════════════════════════════════════════════════════
//  CALENDRIER
// ════════════════════════════════════════════════════════════
const EVENEMENTS = [
  { jour: 5,  mois: 3, desc: 'Conseil de classe 6ème'    },
  { jour: 13, mois: 3, desc: 'Remise des bulletins'      },
  { jour: 26, mois: 3, desc: 'Réunion parents d\'élèves' },
];

function genererCalendrier(date) {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  const annee   = date.getFullYear();
  const mois    = date.getMonth(); // 0-based
  const today   = new Date();
  const premier = new Date(annee, mois, 1);
  const dernier = new Date(annee, mois + 1, 0).getDate();

  // Lundi = 0 ... Dimanche = 6
  let depart = premier.getDay() - 1;
  if (depart < 0) depart = 6;

  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  let html = jours.map(j => '<div class="cal-hd">' + j + '</div>').join('');

  // Cellules vides avant le 1er
  for (let i = 0; i < depart; i++) html += '<div class="cal-d empty"></div>';

  for (let j = 1; j <= dernier; j++) {
    const estAujourdhui = j === today.getDate() && mois === today.getMonth() && annee === today.getFullYear();
    const estEvenement  = EVENEMENTS.some(e => e.jour === j && (e.mois - 1) === mois);
    let cls = 'cal-d';
    if (estAujourdhui)  cls += ' today';
    else if (estEvenement) cls += ' event';
    html += '<div class="' + cls + '">' + j + '</div>';
  }

  grid.innerHTML = html;

  // Liste des événements du mois
  const evList = document.getElementById('eventList');
  if (!evList) return;
  const evMois = EVENEMENTS.filter(e => (e.mois - 1) === mois);
  evList.innerHTML = evMois.map(e =>
    '<div class="event-list-item">' +
    '<span class="event-date">' + e.jour + ' ' +
    date.toLocaleString('fr-FR', { month: 'long' }) + '</span> ' +
    '<span class="event-desc">— ' + e.desc + '</span>' +
    '</div>'
  ).join('');
}

// ════════════════════════════════════════════════════════════
//  JAUGES
// ════════════════════════════════════════════════════════════
function renderGauges(items) {
  const c = document.getElementById('gaugeContainer');
  if (!c) return;

  c.innerHTML = items.map(it => {
    const val = Math.round(it.val);
    return '<div class="gauge-item">' +
      '<div class="gauge-val">' + val + '<span style="font-size:14px">%</span></div>' +
      '<div class="gauge-bar"><div class="gauge-fill" style="width:' + val + '%;background:' + it.color + '"></div></div>' +
      '<div class="gauge-lbl">' + it.label + '</div>' +
      '</div>';
  }).join('');
}

// ════════════════════════════════════════════════════════════
//  UTILITAIRES
// ════════════════════════════════════════════════════════════
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val !== null && val !== undefined ? val : '—';
}

function setPill(id, texte, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texte;
  el.className   = 'pill pill-' + (type || 'neu');
}

function setBarWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) {
    // Déclenche l'animation CSS
    setTimeout(() => { el.style.width = Math.min(100, Math.max(0, pct)) + '%'; }, 100);
  }
}
