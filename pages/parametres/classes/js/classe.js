/**
 * Classes.js — Gestion Scolaire
 * Adapté à la table SQL Server : [MONAPPECOLE2].[dbo].[ClasseS]
 * Colonnes : ID, NOM, NIVEAU, EFFECTIF, TITULAIRE, SALLE, STATUT
 *
 * Architecture :
 *   Toutes les opérations CRUD passent par des appels AJAX (fetch)
 *   vers les handlers ASP.NET (.ashx) côté serveur.
 *   Le JS ne stocke plus de données en mémoire — la source de vérité est SQL Server.
 */

'use strict';

// ─────────────────────────────────────────────
// URLS DES HANDLERS (relatifs à la page courante)
// ─────────────────────────────────────────────
var API = {
    liste    : 'handlers/GetClasse.ashx',
    ajouter  : 'handlers/AjouterClasse.ashx',
    modifier : 'handlers/ModifierClasse.ashx',
    supprimer: 'handlers/SupprimerClasse.ashx'
};

// ─────────────────────────────────────────────
// ÉTAT LOCAL (sert uniquement à l'affichage)
// ─────────────────────────────────────────────
var ClassesData = [];   // tableau d'objets rempli depuis le serveur
var editId       = null; // ID SQL Server de la ligne en cours d'édition

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    forceHideSpinner();
    hidePreloader();
    initUIControls();
    chargerClasses(); // premier chargement depuis SQL Server
});

// ─────────────────────────────────────────────
// PRELOADER
// ─────────────────────────────────────────────
function hidePreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    setTimeout(function () {
        pre.style.opacity = '0';
        setTimeout(function () {
            pre.style.display = 'none';
            forceHideSpinner();
        }, 400);
    }, 600);
}

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
function forceHideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display    = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity    = '0';
    s.setAttribute('aria-hidden', 'true');
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.opacity    = '1';
    s.style.visibility = 'visible';
    s.style.display    = 'flex';
    s.removeAttribute('aria-hidden');
}

function hideSpinner() { forceHideSpinner(); }

// ─────────────────────────────────────────────
// AJAX — helper générique
// ─────────────────────────────────────────────
/**
 * Envoie une requête POST JSON vers un handler .ashx
 * @param {string} url
 * @param {object} payload  — sera sérialisé en JSON
 * @returns {Promise<object>}  — réponse JSON du serveur
 */
function ajax(url, payload) {
    return fetch(url, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body   : JSON.stringify(payload)
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
        return r.json();
    });
}

// ─────────────────────────────────────────────
// CHARGER LA LISTE DEPUIS SQL SERVER
// ─────────────────────────────────────────────
function chargerClasses() {
    showSpinner();

    fetch(API.liste)
        .then(function (r) {
            if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            // data = { success: true, Classes: [ {ID, NOM, ENSEIGNANT, ...}, ... ] }
            if (!data.success) throw new Error(data.message || 'Erreur serveur');
            ClassesData = data.Classes || [];
            renderClasseStats();
            renderClassesTable();
        })
        .catch(function (err) {
            afficherErreurGlobale('Impossible de charger les Classes : ' + err.message);
        })
        .finally(function () {
            hideSpinner();
        });
}

// ─────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────
function renderClasseStats() {
    var container = document.getElementById('ClassesStatsContainer');
    if (!container) return;

    var total      = ClassesData.length;
    var totalCoeff = 0;
    var totalH     = 0;
    var niveauxVus = {};

    for (var i = 0; i < ClassesData.length; i++) {
        totalCoeff += parseFloat(ClassesData[i].COEFFICIENT) || 0;
        totalH     += parseInt(ClassesData[i].HEURES_SEMAINE, 10) || 0;
        niveauxVus[ClassesData[i].NIVEAU] = true;
    }
    var niveaux = Object.keys(niveauxVus).length;

    var stats = [
        { label: 'Classes',         value: total,                    icon: 'fas fa-book',          color: '#007bff' },
        { label: 'Coeff. total',     value: totalCoeff.toFixed(1),    icon: 'fas fa-balance-scale',  color: '#28a745' },
        { label: 'Heures / sem.',    value: totalH + 'h',             icon: 'fas fa-clock',          color: '#ffc107' },
        { label: 'Niveaux couverts', value: niveaux,                  icon: 'fas fa-layer-group',    color: '#17a2b8' }
    ];

    container.innerHTML = stats.map(function (s) {
        return '<div class="absence-stat-card" style="border-left:4px solid ' + s.color + ';">' +
               '  <div class="stat-icon" style="color:' + s.color + ';"><i class="' + s.icon + '"></i></div>' +
               '  <div class="stat-info">' +
               '    <span class="stat-value">' + s.value + '</span>' +
               '    <span class="stat-label">' + escHtml(s.label) + '</span>' +
               '  </div>' +
               '</div>';
    }).join('');
}

// ============================================================================
// RENDU DU TABLEAU
// ============================================================================
function renderClassesTable() {
    var tbody = document.getElementById('ClassesTableBody');
    if (!tbody) return;

    tbody.innerHTML = ClassesData.map(function (m) {
        return '<tr>' +
               '<td><strong>' + escHtml(m.NOM) + '</strong></td>' +
               '<td>' + escHtml(m.NIVEAU) + '</td>' +
               '<td>' + escHtml(m.EFFECTIF) + '</td>' +
               '<td>' + escHtml(m.TITULAIRE) + '</td>' +
               '<td>' + escHtml(m.SALLE) + '</td>' +
               '<td><span class="badge ' + (m.STATUT === 'Actif' ? 'bg-success' : 'bg-danger') + '">' + escHtml(m.STATUT) + '</span></td>' +
               '<td>' +
               '  <button type="button" class="btn btn-sm btn-warning" onclick="editClasse(' + m.ID + ')"><i class="fas fa-edit"></i></button> ' +
               '  <button type="button" class="btn btn-sm btn-danger" onclick="deleteClasse(' + m.ID + ',\'' + escHtml(m.NOM) + '\')"><i class="fas fa-trash"></i></button>' +
               '</td>' +
               '</tr>';
    }).join('');
}
// ─────────────────────────────────────────────
// MODAL — OUVRIR / FERMER
// ─────────────────────────────────────────────
function openAddClasseModal() {
    editId = null;
    resetClasseForm();
    document.getElementById('ClasseModalTitle').innerHTML =
        '<i class="fas fa-book-medical"></i> Ajouter une Classe';
    showModal('addClasseModal');
}

function closeAddClasseModal() {
    hideModal('addClasseModal');
    resetClasseForm();
    editId = null;
}

function showModal(id) {
    var m = document.getElementById(id);
    if (m) { m.style.display = 'flex'; m.classList.add('open'); }
}

function hideModal(id) {
    var m = document.getElementById(id);
    if (m) { m.style.display = 'none'; m.classList.remove('open'); }
}

// ─────────────────────────────────────────────
// FORMULAIRE — RESET
// ─────────────────────────────────────────────
function resetClasseForm() {
    document.getElementById('ClasseNom').value        = '';
    document.getElementById('ClasseEnseignant').value = '';
    document.getElementById('ClasseSalle').value      = '';
    document.getElementById('ClasseHeures').value     = '3';
    document.getElementById('ClasseNiveau').value     = 'Tous niveaux';
    clearFormErrors();
}

// ─────────────────────────────────────────────
// SAUVEGARDER (ajout ou modification)
// ─────────────────────────────────────────────
function saveClasse() {
    if (!validateClasseForm()) return;

    var payload = {
        NOM      : document.getElementById('ClasseNom').value.trim(),
        NIVEAU   : document.getElementById('ClasseNiveau').value,
        TITULAIRE: document.getElementById('ClasseTitulaire').value.trim(),
        SALLE    : document.getElementById('ClasseSalle').value.trim(),
        EFFECTIF : parseInt(document.getElementById('ClasseEffectif').value, 10) || 0,
        STATUT   : document.getElementById('ClasseStatut').value
    };

    if (editId !== null) payload.ID = editId;

    var url = editId ? API.modifier : API.ajouter;

    showSpinner();
    ajax(url, payload)
        .then(function (data) {
            if (!data.success) throw new Error(data.message);
            closeAddClasseModal();
            Swal.fire('Succès', 'Opération réussie', 'success');
            chargerClasses(); 
        })
        .catch(function (err) {
            Swal.fire('Erreur', err.message, 'error');
        })
        .finally(hideSpinner);
}

// ─────────────────────────────────────────────
// MODIFIER — ouvre le modal pré-rempli
// @param {number} id — ID SQL Server
// ─────────────────────────────────────────────
function editClasse(id) {
    var m = ClassesData.find(x => x.ID === id);
    if (!m) return;

    editId = id;
    document.getElementById('ClasseNom').value = m.NOM;
    document.getElementById('ClasseNiveau').value = m.NIVEAU;
    document.getElementById('ClasseTitulaire').value = m.TITULAIRE;
    document.getElementById('ClasseSalle').value = m.SALLE;
    document.getElementById('ClasseEffectif').value = m.EFFECTIF;
    document.getElementById('ClasseStatut').value = m.STATUT;

    document.getElementById('ClasseModalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier la classe';
    showModal('addClasseModal');
}

// ─────────────────────────────────────────────
// SUPPRIMER
// @param {number} id  — ID SQL Server
// @param {string} nom — pour le message de confirmation
// ─────────────────────────────────────────────
function deleteClasse(id, nom) {
    // Utilisation de SweetAlert2 au lieu du confirm() natif
    Swal.fire({
        title: 'Confirmation',
        text: "Supprimer la Classe « " + nom + " » ? Cette action est irréversible.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        // Empêche l'affichage derrière la modal en ciblant le body ou la modal elle-même
        target: document.body 
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner();

            ajax(API.supprimer, { ID: id })
                .then(function (data) {
                    if (!data.success) throw new Error(data.message || 'Erreur serveur');
                    
                    // Alerte de succès
                    Swal.fire({
                        title: 'Supprimé !',
                        text: 'La Classe a été supprimée avec succès.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    chargerClasses(); // recharge la liste 
                })
                .catch(function (err) {
                    // Utilisation de SweetAlert pour l'erreur au lieu du bandeau global
                    Swal.fire({
                        title: 'Erreur',
                        text: 'Erreur lors de la suppression : ' + err.message,
                        icon: 'error'
                    });
                    hideSpinner();
                });
        }
    });
}

// ─────────────────────────────────────────────
// EXPORT CSV
// ─────────────────────────────────────────────
function exportClasses() {
    if (ClassesData.length === 0) {
        alert('Aucune donnée à exporter.');
        return;
    }

    showSpinner();

    setTimeout(function () {
        try {
            var header = ['ID', 'Classe', 'Enseignant', 'Coefficient', 'Heures/sem.', 'Niveau', 'Créé le'];
            var rows = ClassesData.map(function (m) {
                var date = m.CREATED_AT
                    ? new Date(m.CREATED_AT).toLocaleDateString('fr-FR')
                    : '';
                return [m.ID, m.NOM, m.ENSEIGNANT, m.COEFFICIENT, m.HEURES_SEMAINE, m.NIVEAU, date]
                    .map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; })
                    .join(',');
            });

            var csv  = [header.join(',')].concat(rows).join('\r\n');
            var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href     = url;
            a.download = 'Classes_export_' + dateDuJour() + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erreur export : ' + err.message);
        } finally {
            hideSpinner();
        }
    }, 400);
}

// ─────────────────────────────────────────────
// VALIDATION FORMULAIRE
// ─────────────────────────────────────────────
function validateClasseForm() {
    clearFormErrors();
    var ok = true;

    var nom = document.getElementById('ClasseNom').value.trim();
    if (!nom) {
        showFieldError('ClasseNom', 'Le nom est obligatoire.');
        ok = false;
    } else if (nom.length > 100) {
        showFieldError('ClasseNom', 'Maximum 100 caractères.');
        ok = false;
    }

    var enseignant = document.getElementById('ClasseEnseignant').value.trim();
    if (!enseignant) {
        showFieldError('ClasseEnseignant', "L'enseignant est obligatoire.");
        ok = false;
    } else if (enseignant.length > 100) {
        showFieldError('ClasseEnseignant', 'Maximum 100 caractères.');
        ok = false;
    }

    var coeff = parseFloat(document.getElementById('ClasseSalle').value);
    if (!salle) {
        showFieldError('ClasseSalle', 'La salle est obligatoire.');
        ok = false;
    }

    var heures = parseInt(document.getElementById('ClasseHeures').value, 10);
    if (isNaN(heures) || heures < 1 || heures > 40) {
        showFieldError('ClasseHeures', 'Heures entre 1 et 40.');
        ok = false;
    }

    return ok;
}

function showFieldError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('is-invalid');
    var err       = document.createElement('div');
    err.className = 'field-error';
    err.textContent = msg;
    field.parentNode.appendChild(err);
}

function clearFormErrors() {
    var invalids = document.querySelectorAll('#addClasseModal .is-invalid');
    for (var i = 0; i < invalids.length; i++) invalids[i].classList.remove('is-invalid');
    var errors = document.querySelectorAll('#addClasseModal .field-error');
    for (var j = 0; j < errors.length; j++) errors[j].parentNode.removeChild(errors[j]);
}

// ─────────────────────────────────────────────
// MESSAGE D'ERREUR GLOBAL (bandeau en haut du contenu)
// ─────────────────────────────────────────────
function afficherErreurGlobale(msg) {
    var existing = document.getElementById('alertErreurGlobal');
    if (existing) existing.parentNode.removeChild(existing);

    var div = document.createElement('div');
    div.id        = 'alertErreurGlobal';
    div.className = 'alert-erreur';
    div.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + escHtml(msg) +
                    '<button onclick="this.parentNode.remove()" style="float:right;background:none;border:none;' +
                    'cursor:pointer;font-size:16px;color:inherit;">&times;</button>';

    var section = document.getElementById('section-Classes');
    if (section) section.insertBefore(div, section.firstChild);
}

// ─────────────────────────────────────────────
// CONTRÔLES UI
// ─────────────────────────────────────────────
function initUIControls() {
    // Sidebar toggle
    var menuToggle = document.getElementById('menuToggle');
    var sidebar    = document.getElementById('sidebar');
    var wrapper    = document.getElementById('contentWrapper');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-collapsed');
            if (wrapper) wrapper.classList.toggle('sidebar-collapsed');
        });
    }

    // Notifications
    var notifToggle   = document.getElementById('notifToggle');
    var notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = notifDropdown.classList.toggle('show');
            notifToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }
    document.addEventListener('click', function (e) {
        if (!notifDropdown || !notifToggle) return;
        if (!notifDropdown.contains(e.target) && !notifToggle.contains(e.target)) {
            notifDropdown.classList.remove('show');
            notifToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Plein écran
    var fsToggle = document.getElementById('fullscreenToggle');
    if (fsToggle) {
        fsToggle.addEventListener('click', function () {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen &&
                    document.documentElement.requestFullscreen().catch(function () {});
            } else {
                document.exitFullscreen && document.exitFullscreen().catch(function () {});
            }
        });
    }

    // Fermer modal avec Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAddClasseModal();
    });

    // Fermer modal en cliquant l'overlay
    var modal = document.getElementById('addClasseModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeAddClasseModal();
        });
    }
}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────
function escHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;');
}

function dateDuJour() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
}
