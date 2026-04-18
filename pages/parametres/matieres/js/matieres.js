/**
 * matieres.js — Gestion Scolaire
 * Adapté à la table SQL Server : [MONAPPECOLE2].[dbo].[MATIERES]
 * Colonnes : ID, NOM, ENSEIGNANT, COEFFICIENT, HEURES_SEMAINE, NIVEAU, CREATED_AT
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
    liste    : 'handlers/GetMatieres.ashx',
    ajouter  : 'handlers/AjouterMatiere.ashx',
    modifier : 'handlers/ModifierMatiere.ashx',
    supprimer: 'handlers/SupprimerMatiere.ashx'
};

// ─────────────────────────────────────────────
// ÉTAT LOCAL (sert uniquement à l'affichage)
// ─────────────────────────────────────────────
var matieresData = [];   // tableau d'objets rempli depuis le serveur
var editId       = null; // ID SQL Server de la ligne en cours d'édition

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    forceHideSpinner();
    hidePreloader();
    initUIControls();
    chargerMatieres(); // premier chargement depuis SQL Server
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
function chargerMatieres() {
    showSpinner();

    fetch(API.liste)
        .then(function (r) {
            if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            // data = { success: true, matieres: [ {ID, NOM, ENSEIGNANT, ...}, ... ] }
            if (!data.success) throw new Error(data.message || 'Erreur serveur');
            matieresData = data.matieres || [];
            renderMatiereStats();
            renderMatieresTable();
        })
        .catch(function (err) {
            afficherErreurGlobale('Impossible de charger les matières : ' + err.message);
        })
        .finally(function () {
            hideSpinner();
        });
}

// ─────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────
function renderMatiereStats() {
    var container = document.getElementById('matieresStatsContainer');
    if (!container) return;

    var total      = matieresData.length;
    var totalCoeff = 0;
    var totalH     = 0;
    var niveauxVus = {};

    for (var i = 0; i < matieresData.length; i++) {
        totalCoeff += parseFloat(matieresData[i].COEFFICIENT) || 0;
        totalH     += parseInt(matieresData[i].HEURES_SEMAINE, 10) || 0;
        niveauxVus[matieresData[i].NIVEAU] = true;
    }
    var niveaux = Object.keys(niveauxVus).length;

    var stats = [
        { label: 'Matières',         value: total,                    icon: 'fas fa-book',          color: '#007bff' },
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

// ─────────────────────────────────────────────
// TABLEAU
// ─────────────────────────────────────────────
function renderMatieresTable() {
    var tbody = document.getElementById('matieresTableBody');
    if (!tbody) return;

    if (matieresData.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;color:#888;padding:24px;">' +
            '<i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>' +
            'Aucune matière enregistrée.</td></tr>';
        return;
    }

    tbody.innerHTML = matieresData.map(function (m) {
        var date = m.CREATED_AT
            ? new Date(m.CREATED_AT).toLocaleDateString('fr-FR')
            : '—';

        return '<tr>' +
               '<td><strong>' + escHtml(m.NOM) + '</strong></td>' +
               '<td>' + escHtml(m.ENSEIGNANT) + '</td>' +
               '<td><span class="badge-coeff">' + (parseFloat(m.COEFFICIENT).toFixed(1)) + '</span></td>' +
               '<td>' + escHtml(String(m.HEURES_SEMAINE)) + 'h</td>' +
               '<td><span class="badge-niveau">' + escHtml(m.NIVEAU) + '</span></td>' +
               '<td style="color:#888;font-size:12px;">' + date + '</td>' +
               '<td class="action-cell">' +
               '  <button type="button" class="btn btn-warning btn-xs"' +
               '    onclick="editMatiere(' + m.ID + ')" title="Modifier">' +
               '    <i class="fas fa-edit"></i>' +
               '  </button>' +
               '  <button type="button" class="btn btn-danger btn-xs"' +
               '    onclick="deleteMatiere(' + m.ID + ',\'' + escHtml(m.NOM) + '\')" title="Supprimer">' +
               '    <i class="fas fa-trash"></i>' +
               '  </button>' +
               '</td>' +
               '</tr>';
    }).join('');
}

// ─────────────────────────────────────────────
// MODAL — OUVRIR / FERMER
// ─────────────────────────────────────────────
function openAddMatiereModal() {
    editId = null;
    resetMatiereForm();
    document.getElementById('matiereModalTitle').innerHTML =
        '<i class="fas fa-book-medical"></i> Ajouter une matière';
    showModal('addMatiereModal');
}

function closeAddMatiereModal() {
    hideModal('addMatiereModal');
    resetMatiereForm();
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
function resetMatiereForm() {
    document.getElementById('matiereNom').value        = '';
    document.getElementById('matiereEnseignant').value = '';
    document.getElementById('matiereCoeff').value      = '1';
    document.getElementById('matiereHeures').value     = '3';
    document.getElementById('matiereNiveau').value     = 'Tous niveaux';
    clearFormErrors();
}

// ─────────────────────────────────────────────
// SAUVEGARDER (ajout ou modification)
// ─────────────────────────────────────────────
function saveMatiere() {
    // 1. Validation du formulaire avant envoi
    if (!validateMatiereForm()) return;

    // --- CRUCIAL : On mémorise si c'est une édition AVANT l'appel AJAX ---
    var estUneModification = (editId !== null);

    // 2. Préparation des données (Payload)
    var payload = {
        NOM           : document.getElementById('matiereNom').value.trim(),
        ENSEIGNANT    : document.getElementById('matiereEnseignant').value.trim(),
        COEFFICIENT   : parseFloat(document.getElementById('matiereCoeff').value),
        HEURES_SEMAINE: parseInt(document.getElementById('matiereHeures').value, 10),
        NIVEAU        : document.getElementById('matiereNiveau').value
    };

    var url = API.ajouter;

    if (estUneModification) {
        payload.ID = editId;
        url = API.modifier;
    }

    // 3. UI : Désactiver le bouton
    var btnSave = document.querySelector('#addMatiereModal .btn-primary');
    if (btnSave) { 
        btnSave.disabled = true; 
        btnSave.textContent = 'Enregistrement...'; 
    }

    showSpinner();

    // 4. Appel AJAX
    ajax(url, payload)
        .then(function (data) {
            if (!data.success) throw new Error(data.message || 'Erreur serveur');

            // --- SUCCÈS ---
            closeAddMatiereModal();

            // Utilisation de la variable mémorisée pour le titre
            var titreSucces = estUneModification ? 'Matière modifiée !' : 'Matière ajoutée !';
            var texteSucces = estUneModification ? 
                'Les modifications ont été enregistrées avec succès.' : 
                'La nouvelle matière a été créée avec succès.';

            Swal.fire({
                icon: 'success',
                title: titreSucces,
                text: texteSucces,
                timer: 2500,
                showConfirmButton: false,
                target: document.body // Assure que l'alerte est au premier plan
            });

            chargerMatieres(); 
        })
        .catch(function (err) {
            // --- ERREUR ---
            Swal.fire({
                icon: 'error',
                title: 'Erreur d\'enregistrement',
                text: err.message,
                confirmButtonColor: '#3085d6'
            });
            hideSpinner();
        })
        .finally(function () {
            // 5. UI : Réactiver le bouton
            if (btnSave) {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
            }
        });
}

// ─────────────────────────────────────────────
// MODIFIER — ouvre le modal pré-rempli
// @param {number} id — ID SQL Server
// ─────────────────────────────────────────────
function editMatiere(id) {
    // Trouver la ligne dans le cache local
    var m = null;
    for (var i = 0; i < matieresData.length; i++) {
        if (matieresData[i].ID === id) { m = matieresData[i]; break; }
    }
    if (!m) return;

    editId = id;

    document.getElementById('matiereNom').value        = m.NOM;
    document.getElementById('matiereEnseignant').value = m.ENSEIGNANT;
    document.getElementById('matiereCoeff').value      = m.COEFFICIENT;
    document.getElementById('matiereHeures').value     = m.HEURES_SEMAINE;
    document.getElementById('matiereNiveau').value     = m.NIVEAU;

    document.getElementById('matiereModalTitle').innerHTML =
        '<i class="fas fa-edit"></i> Modifier : ' + escHtml(m.NOM);

    showModal('addMatiereModal');
    if (result.success || result.status === "success") {
            Swal.fire({ icon: 'success', title: "Utilisateur modifié !", timer: 1500, showConfirmButton: false });
            setTimeout(() => {
                closeAddUserModal();
                loadUsers();
            }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: result.message || "Erreur lors de la modification" });
        }
}

// ─────────────────────────────────────────────
// SUPPRIMER
// @param {number} id  — ID SQL Server
// @param {string} nom — pour le message de confirmation
// ─────────────────────────────────────────────
function deleteMatiere(id, nom) {
    // Utilisation de SweetAlert2 au lieu du confirm() natif
    Swal.fire({
        title: 'Confirmation',
        text: "Supprimer la matière « " + nom + " » ? Cette action est irréversible.",
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
                        text: 'La matière a été supprimée avec succès.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    chargerMatieres(); // recharge la liste 
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
function exportMatieres() {
    if (matieresData.length === 0) {
        alert('Aucune donnée à exporter.');
        return;
    }

    showSpinner();

    setTimeout(function () {
        try {
            var header = ['ID', 'Matière', 'Enseignant', 'Coefficient', 'Heures/sem.', 'Niveau', 'Créé le'];
            var rows = matieresData.map(function (m) {
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
            a.download = 'matieres_export_' + dateDuJour() + '.csv';
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
function validateMatiereForm() {
    clearFormErrors();
    var ok = true;

    var nom = document.getElementById('matiereNom').value.trim();
    if (!nom) {
        showFieldError('matiereNom', 'Le nom est obligatoire.');
        ok = false;
    } else if (nom.length > 100) {
        showFieldError('matiereNom', 'Maximum 100 caractères.');
        ok = false;
    }

    var enseignant = document.getElementById('matiereEnseignant').value.trim();
    if (!enseignant) {
        showFieldError('matiereEnseignant', "L'enseignant est obligatoire.");
        ok = false;
    } else if (enseignant.length > 100) {
        showFieldError('matiereEnseignant', 'Maximum 100 caractères.');
        ok = false;
    }

    var coeff = parseFloat(document.getElementById('matiereCoeff').value);
    if (isNaN(coeff) || coeff < 0.5 || coeff > 10) {
        showFieldError('matiereCoeff', 'Coefficient entre 0.5 et 10.');
        ok = false;
    }

    var heures = parseInt(document.getElementById('matiereHeures').value, 10);
    if (isNaN(heures) || heures < 1 || heures > 40) {
        showFieldError('matiereHeures', 'Heures entre 1 et 40.');
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
    var invalids = document.querySelectorAll('#addMatiereModal .is-invalid');
    for (var i = 0; i < invalids.length; i++) invalids[i].classList.remove('is-invalid');
    var errors = document.querySelectorAll('#addMatiereModal .field-error');
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

    var section = document.getElementById('section-matieres');
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
        if (e.key === 'Escape') closeAddMatiereModal();
    });

    // Fermer modal en cliquant l'overlay
    var modal = document.getElementById('addMatiereModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeAddMatiereModal();
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
