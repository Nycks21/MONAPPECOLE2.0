'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var absencesData = [];
var retardsData = [];

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  loadAbsences();
});

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
async function loadAbsences() {
  if (typeof showSpinner === "function") showSpinner();

  try {
    var response = await fetch('handlers/GetAbsence.ashx');

    if (!response.ok) throw new Error('Erreur HTTP : ' + response.status);

    var result = await response.json();

    if (result.success) {
      absencesData = result.data;
      renderAbsencesTable(absencesData);
      updateAbsenceStats(absencesData);
    } else {
      console.error("Erreur serveur SQL :", result.message);
      if (typeof Swal !== "undefined") Swal.fire("Erreur SQL", result.message, "error");
    }
  } catch (error) {
    console.error("Erreur de connexion :", error);
  } finally {
    if (typeof hideSpinner === "function") hideSpinner();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────
function renderAbsencesTable(data) {
  var tbody = document.getElementById('absencesTableBody');
  if (!tbody) return;

  tbody.innerHTML = "";

  data.forEach(function (abs) {
    var row = tbody.insertRow();

    // 1. Préparation des badges et contenus
    var typeBadge = getGenericBadge(abs.TYPE || 'Absence', abs.TYPE === 'Retard' ? 'warning' : 'secondary');
    var justifieBadge = getJustifieBadge(abs.JUSTIF);
    var commentTronque = truncateCommentaires(abs.COMMENTAIRES);

    // 2. Logique conditionnelle pour le bouton Justifier (uniquement si non justifié)
    var btnJustifier = '';
    if (abs.JUSTIF === false || abs.JUSTIF === 0 || abs.JUSTIF === "False") {
      btnJustifier = '<button type="button" class="btn btn-sm btn-success" style="margin:0 2px" ' +
        'onclick="openJustifyModal(\'' + abs.ID + '\')" title="Justifier">' +
        '<i class="fas fa-check"></i>' +
        '</button>';
    }

    // 3. Construction de la ligne
    row.innerHTML =
      '<td class="text-center">' + escHtml(abs.ANNEE_TEXTE || '-') + '</td>' +
      '<td class="text-center">' + getMatriculeBadge(abs.MATRICULE) + '</td>' +
      '<td>' + getNomBadge(abs.NOM) + '</td>' +
      '<td class="text-center">' + getClasseBadge(abs.CLASSE_NOM || '-') + '</td>' +
      '<td class="text-center">' + typeBadge + '</td>' +
      '<td class="text-center">' + escHtml(abs.DATE_DEBUT) + '</td>' +
      '<td class="text-center">' + escHtml(abs.DATE_FIN) + '</td>' +
      '<td class="text-center"><strong style="color:#007bff;">' + escHtml(abs.DUREE || '-') + '</strong></td>' +
      '<td class="text-center">' + justifieBadge + '</td>' +
      '<td title="' + escHtml(abs.COMMENTAIRES || '') + '"><small>' + escHtml(commentTronque) + '</small></td>' +
      '<td>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-sm btn-primary" style="margin:0 2px" onclick="openJustifyModal(\'' + abs.ID + '\')" title="Modifier">' +
      '<i class="fas fa-edit"></i>' +
      '</button>' +
      '<button type="button" class="btn btn-sm btn-danger" style="margin:0 2px" onclick="supprimerAbsence(\'' + abs.ID + '\')" title="Supprimer">' +
      '<i class="fas fa-trash"></i>' +
      '</button>' +
      btnJustifier +
      '</div>' +
      '</td>';
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS DE BADGES (STYLE HARMONISÉ)
// ─────────────────────────────────────────────────────────────────────────────

function getNomBadge(nom) {
  return '<span style="color:#212529;font-weight:700;">' + escHtml(nom || '-') + '</span>';
}

function getMatriculeBadge(matricule) {
  return '<span style="background:#f1f3f5;color:#212529;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid #dee2e6;display:inline-block; text-align:center">' + escHtml(matricule || '-') + '</span>';
}

function getClasseBadge(classeNom) {
  return '<span style="background:#fff;color:#007bff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;white-space:nowrap;">' +
    '<i class="fas fa-folder" style="margin-right:5px;font-size:10px;"></i>' + escHtml(classeNom) +
    '</span>';
}

function getJustifieBadge(justif) {
  var isJustified = (justif === true || justif === 1 || justif === "True");
  var color = isJustified ? '#28a745' : '#dc3545';
  var text = isJustified ? 'Oui' : 'Non';
  
  // On enveloppe le span dans une div centrée
  return '<div style="text-align:center; width:100%;">' +
            '<span style="background:' + color + '; padding:4px 10px; border-radius:20px; color:white; font-size:11px; font-weight:700; display:inline-block; min-width:50px; vertical-align:middle">' + 
                text + 
            '</span>' +
         '</div>';
}

function getGenericBadge(text, type) {
  var bgColor = (type === 'warning') ? '#ffc107' : '#6c757d';
  var textColor = (type === 'warning') ? '#212529' : 'white';
  return '<span style="background:' + bgColor + ';color:' + textColor + ';padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:uppercase; vertical-align:middle">' + escHtml(text) + '</span>';
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

function truncateCommentaires(text) {
  if (!text) return '-';
  if (text.length > 19) return text.substring(0, 19) + '...';
  return text;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPTEURS DE STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Met à jour les compteurs statistiques dans l'interface
 * @param {Array} data - Liste des objets d'absence/retard chargés depuis le serveur
 */
function updateAbsenceStats(data) {
  if (!data || !Array.isArray(data)) return;

  // 1. Compteur pour le type 'Absence' (insensible à la casse)
  var totalAbsences = data.filter(function (a) {
    var type = (a.TYPE || '').toLowerCase();
    return type === 'absence';
  }).length;

  // 2. Compteur pour le type 'Retard' (insensible à la casse)
  var totalRetards = data.filter(function (a) {
    var type = (a.TYPE || '').toLowerCase();
    return type === 'retard';
  }).length;

  // 3. Compteur pour les élèves "Critiques" (Non justifiés)
  // On vérifie si JUSTIF est false, 0 ou la chaîne "False"
  var totalCritiques = data.filter(function (a) {
    return (a.JUSTIF === false || a.JUSTIF === 0 || a.JUSTIF === "False");
  }).length;

  // --- Mise à jour visuelle du DOM ---

  var elAbs = document.getElementById('totalAbsencesVal');
  var elRet = document.getElementById('totalRetardsVal');
  var elCri = document.getElementById('totalCritiquesVal');

  if (elAbs) elAbs.textContent = totalAbsences;
  if (elRet) elRet.textContent = totalRetards;
  if (elCri) elCri.textContent = totalCritiques;
}


// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
function openJustifyModal(id) {
  var abs = absencesData.find(function (a) { return a.ID === id; });
  if (!abs) return;

  var nameDisplay = document.getElementById('justifyStudentName');
  if (nameDisplay) nameDisplay.textContent = abs.NOM;

  var modal = document.getElementById('justifyModal');
  if (modal) modal.style.display = 'block';
}

function closeJustifyModal() {
  var modal = document.getElementById('justifyModal');
  if (modal) modal.style.display = 'none';
}

function supprimerAbsence(id) {
  if (confirm("Voulez-vous supprimer cette absence ?")) {
    console.log("ID à supprimer :", id);
  }
}