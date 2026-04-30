/**
 * matieres.js — Gestion Scolaire
 * Adapté à la table SQL Server : [dbo].[MATIERES]
 * Colonnes : ID (GUID), NOM, ENSEIGNANT (int FK→USERS.IDUSER),
 *            COEFFICIENT, HEURES_SEMAINE, NIVEAU (GUID FK→NIVEAUX.ID), CREATED_AT
 */

'use strict';

// ─────────────────────────────────────────────
// URLS DES HANDLERS
// ─────────────────────────────────────────────
var API = {
    liste: '/pages/parametres/matieres/handlers/GetMatieres.ashx',
    ajouter: '/pages/parametres/matieres/handlers/AjouterMatiere.ashx',
    modifier: '/pages/parametres/matieres/handlers/ModifierMatiere.ashx',
    supprimer: '/pages/parametres/matieres/handlers/SupprimerMatiere.ashx',
    niveaux: '/pages/parametres/niveaux/handlers/GetNiveaux.ashx',
    users: '/pages/administrations/utilisateur/handlers/GetUsers.ashx'
};

// ─────────────────────────────────────────────
// ÉTAT LOCAL
// ─────────────────────────────────────────────
var matieresData = [];
var editId = null;
var currentPage = 1;
var rowsPerPage = 10;
var filteredMatieres = [];

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    forceHideSpinner();
    hidePreloader();
    initUIControls();

    chargerNiveaux();
    chargerUsers();
    chargerMatieres();
});

// ─────────────────────────────────────────────
// CHARGER LES NIVEAUX
// ─────────────────────────────────────────────
async function chargerNiveaux() {
    try {
        const response = await fetch(API.niveaux);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('matiereNiveau');
            if (!select) return;
            select.innerHTML = '<option value="">-- Sélectionner un niveau --</option>';

            data.niveaux.forEach(niv => {
                const opt = document.createElement('option');
                opt.value = niv.ID;       // GUID stocké comme valeur (clé étrangère)
                opt.textContent = niv.NOM;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Erreur lors du chargement des niveaux:", err);
    }
}

// ─────────────────────────────────────────────
// CHARGER LES UTILISATEURS (ENSEIGNANTS)
// ─────────────────────────────────────────────
async function chargerUsers() {
    try {
        const response = await fetch(API.users);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('matiereEnseignant');
            if (!select) return;
            select.innerHTML = '<option value="">-- Sélectionner un enseignant --</option>';

            const listeUsers = data.users || data.Users || [];
            listeUsers.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.ID;         // ID int stocké comme valeur (clé étrangère)
                opt.textContent = u.NOM;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Erreur lors du chargement des enseignants:", err);
    }
}

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
    s.style.display = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity = '0';
    s.setAttribute('aria-hidden', 'true');
}
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.display = 'flex';
    s.removeAttribute('aria-hidden');
}
function hideSpinner() { forceHideSpinner(); }

// ─────────────────────────────────────────────
// AJAX — helper générique POST JSON
// ─────────────────────────────────────────────
function ajax(url, payload) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    })
        .then(function (r) {
            if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
            return r.json();
        });
}

// ─────────────────────────────────────────────
// CHARGER LA LISTE
// ─────────────────────────────────────────────
function chargerMatieres() {
    showSpinner();
    fetch(API.liste)
        .then(function (r) {
            if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.message || 'Erreur serveur');
            matieresData = data.matieres || [];
            filteredMatieres = [...matieresData];
            currentPage = 1;
            renderMatiereStats();
            renderMatieresTable();
        })
        .catch(function (err) {
            afficherErreurGlobale('Impossible de charger les matières : ' + err.message);
        })
        .finally(function () { hideSpinner(); });
}

// ─────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────
function renderMatiereStats() {
    var container = document.getElementById('matieresStatsContainer');
    if (!container) return;

    var total = matieresData.length;
    var totalCoeff = 0;
    var totalH = 0;
    var niveauxVus = {};

    for (var i = 0; i < matieresData.length; i++) {
        totalCoeff += parseFloat(matieresData[i].COEFFICIENT) || 0;
        totalH += parseInt(matieresData[i].HEURES_SEMAINE, 10) || 0;
        if (matieresData[i].NIVEAU) niveauxVus[matieresData[i].NIVEAU] = true;
    }

    var stats = [
        { label: 'Matières', value: total, icon: 'fas fa-book', color: '#007bff' },
        { label: 'Coeff. total', value: totalCoeff.toFixed(1), icon: 'fas fa-balance-scale', color: '#28a745' },
        { label: 'Heures / sem.', value: totalH + 'h', icon: 'fas fa-clock', color: '#ffc107' },
        { label: 'Niveaux couverts', value: Object.keys(niveauxVus).length, icon: 'fas fa-layer-group', color: '#17a2b8' }
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

    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageMatieres = filteredMatieres.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(filteredMatieres.length / rowsPerPage);

    tbody.innerHTML = '';

    if (!pageMatieres.length) {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align:center;color:#888;padding:40px;">' +
            '<i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>' +
            'Aucune matière trouvée.</td></tr>';
        return;
    }

    pageMatieres.forEach(function (m) {
        var date = m.CREATED_AT
            ? new Date(m.CREATED_AT).toLocaleDateString('fr-FR')
            : '—';

        var row = tbody.insertRow();

        // Nom
        var cellNom = row.insertCell(0);
        cellNom.innerHTML = '<strong>' + escHtml(m.NOM) + '</strong>';

        // Enseignant — NOM lisible avec badge stylisé
        row.insertCell(1).innerHTML = `
        <span style="background-color: #fce4ec; color: #d32f2f; padding: 3px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; display: inline-block; border: 1px solid #ffcdd2;">
            <i class="fas fa-user-tie mr-1"></i> ${escHtml(m.ENSEIGNANT) || '—'}
        </span>`;

        // Coefficient
        row.insertCell(2).innerHTML =
            '<span class="badge-coeff">' + parseFloat(m.COEFFICIENT).toFixed(1) + '</span>';

        // Heures
        row.insertCell(3).textContent = (m.HEURES_SEMAINE || 0) + 'h';

        // Niveau — Affichage avec icône et badge stylisé
        row.insertCell(4).innerHTML = `
        <span style="background-color: #e1f5fe; color: #01579b; padding: 3px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; display: inline-block; border: 1px solid #b3e5fc;">
            <i class="fas fa-layer-group mr-1"></i> ${escHtml(m.NIVEAU) || '—'}
        </span>`;

        // Date
        var cellDate = row.insertCell(5);
        cellDate.textContent = date;
        cellDate.style.cssText = 'color:#888;font-size:12px;';

        // Actions — ID GUID entre guillemets simples comme dans classe.js
        row.insertCell(6).innerHTML =
            '<button type="button" class="btn btn-sm btn-primary"' +
            ' onclick="editMatiere(\'' + m.ID + '\')" title="Modifier">' +
            '  <i class="fas fa-edit"></i>' +
            '</button> ' +
            '<button type="button" class="btn btn-sm btn-danger"' +
            ' onclick="deleteMatiere(\'' + m.ID + '\',\'' + escHtml(m.NOM).replace(/'/g, "\\'") + '\')" title="Supprimer">' +
            '  <i class="fas fa-trash"></i>' +
            '</button>';
    });

    if (typeof createPaginationControls === "function") createPaginationControls(totalPages);
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
    document.getElementById('matiereNom').value = '';
    document.getElementById('matiereEnseignant').value = '';  // select → valeur vide
    document.getElementById('matiereCoeff').value = '1';
    document.getElementById('matiereHeures').value = '3';
    document.getElementById('matiereNiveau').value = '';  // select → valeur vide
    clearFormErrors();
}

// ─────────────────────────────────────────────
// SAUVEGARDER (ajout ou modification)
// ─────────────────────────────────────────────
function saveMatiere() {
    if (!validateMatiereForm()) return;

    var estUneModification = (editId !== null);

    var elNom = document.getElementById('matiereNom');
    var elEnseignant = document.getElementById('matiereEnseignant'); // select
    var elCoeff = document.getElementById('matiereCoeff');
    var elHeures = document.getElementById('matiereHeures');
    var elNiveau = document.getElementById('matiereNiveau');     // select

    // Validation GUID niveau
    if (!elNiveau.value || elNiveau.value.length < 10) {
        Swal.fire('Attention', 'Veuillez sélectionner un niveau valide dans la liste.', 'warning');
        return;
    }

    // Validation enseignant (int)
    if (!elEnseignant.value || parseInt(elEnseignant.value, 10) <= 0) {
        Swal.fire('Attention', 'Veuillez sélectionner un enseignant valide dans la liste.', 'warning');
        return;
    }

    var payload = {
        NOM: elNom.value.trim(),
        ENSEIGNANT_ID: parseInt(elEnseignant.value, 10),  // int FK → USERS.IDUSER
        COEFFICIENT: parseFloat(elCoeff.value),
        HEURES_SEMAINE: parseInt(elHeures.value, 10),
        NIVEAU_ID: elNiveau.value                     // GUID FK → NIVEAUX.ID
    };

    var url = API.ajouter;
    if (estUneModification) {
        payload.ID = editId;
        url = API.modifier;
    }

    var btnSave = document.querySelector('#addMatiereModal .btn-primary');
    if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    }
    showSpinner();

    ajax(url, payload)
        .then(function (data) {
            if (!data.success) throw new Error(data.message || 'Erreur serveur');

            closeAddMatiereModal();

            Swal.fire({
                icon: 'success',
                title: estUneModification ? 'Matière modifiée !' : 'Matière ajoutée !',
                text: estUneModification
                    ? 'Les modifications ont été enregistrées.'
                    : 'La nouvelle matière a été créée avec succès.',
                timer: 2500,
                showConfirmButton: false
            });

            chargerMatieres();
        })
        .catch(function (err) {
            Swal.fire({
                icon: 'error',
                title: "Erreur d'enregistrement",
                text: err.message,
                confirmButtonColor: '#d63030'
            });
        })
        .finally(function () {
            hideSpinner();
            if (btnSave) {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
            }
        });
}

// ─────────────────────────────────────────────
// MODIFIER — ouvre le modal pré-rempli
// ─────────────────────────────────────────────
function editMatiere(id) {
    var m = matieresData.find(function (x) { return x.ID === id; });
    if (!m) return;

    editId = id;

    document.getElementById('matiereNom').value = m.NOM;
    // On utilise les IDs pour sélectionner la bonne option dans chaque select
    document.getElementById('matiereEnseignant').value = m.ENSEIGNANT_ID;  // int
    document.getElementById('matiereCoeff').value = m.COEFFICIENT;
    document.getElementById('matiereHeures').value = m.HEURES_SEMAINE;
    document.getElementById('matiereNiveau').value = m.NIVEAU_ID;      // GUID

    document.getElementById('matiereModalTitle').innerHTML =
        '<i class="fas fa-edit"></i> Modifier : ' + escHtml(m.NOM);

    showModal('addMatiereModal');
}

// ─────────────────────────────────────────────
// SUPPRIMER
// ─────────────────────────────────────────────
function deleteMatiere(id, nom) {
    Swal.fire({
        title: 'Confirmation',
        text: 'Supprimer la matière « ' + nom + ' » ? Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        target: document.body
    }).then(function (result) {
        if (!result.isConfirmed) return;
        showSpinner();

        ajax(API.supprimer, { ID: id })
            .then(function (data) {
                if (!data.success) throw new Error(data.message || 'Erreur serveur');

                Swal.fire({
                    title: 'Supprimé !',
                    text: 'La matière a été supprimée avec succès.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                chargerMatieres();
            })
            .catch(function (err) {
                Swal.fire({ title: 'Erreur', text: err.message, icon: 'error' });
                hideSpinner();
            });
    });
}

// ─────────────────────────────────────────────
// EXPORT CSV
// ─────────────────────────────────────────────
function exportMatieres() {
    if (matieresData.length === 0) { alert('Aucune donnée à exporter.'); return; }
    showSpinner();
    setTimeout(function () {
        try {
            var header = ['ID', 'Matière', 'Enseignant', 'Coefficient', 'Heures/sem.', 'Niveau', 'Créé le'];
            var rows = matieresData.map(function (m) {
                var date = m.CREATED_AT
                    ? new Date(m.CREATED_AT).toLocaleDateString('fr-FR') : '';
                return [m.ID, m.NOM, m.ENSEIGNANT, m.COEFFICIENT, m.HEURES_SEMAINE, m.NIVEAU, date]
                    .map(function (v) {
                        return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
                    }).join(',');
            });
            var csv = [header.join(',')].concat(rows).join('\r\n');
            var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
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

    // Enseignant : select, valeur doit être un int > 0
    var ensEl = document.getElementById('matiereEnseignant');
    if (!ensEl || !ensEl.value) {
        showFieldError('matiereEnseignant', "L'enseignant est obligatoire.");
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

    // Niveau : select, valeur doit être un GUID non vide
    var niveauEl = document.getElementById('matiereNiveau');
    if (!niveauEl || !niveauEl.value) {
        showFieldError('matiereNiveau', 'Le niveau est obligatoire.');
        ok = false;
    }

    return ok;
}

function showFieldError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('is-invalid');
    var err = document.createElement('div');
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
// MESSAGE D'ERREUR GLOBAL
// ─────────────────────────────────────────────
function afficherErreurGlobale(msg) {
    var existing = document.getElementById('alertErreurGlobal');
    if (existing) existing.parentNode.removeChild(existing);

    var div = document.createElement('div');
    div.id = 'alertErreurGlobal';
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
    var sidebar = document.getElementById('sidebar');
    var wrapper = document.getElementById('contentWrapper');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-collapsed');
            if (wrapper) wrapper.classList.toggle('sidebar-collapsed');
        });
    }

    // Notifications
    var notifToggle = document.getElementById('notifToggle');
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
                    document.documentElement.requestFullscreen().catch(function () { });
            } else {
                document.exitFullscreen && document.exitFullscreen().catch(function () { });
            }
        });
    }

    // Fermer modal avec Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAddMatiereModal();
    });

}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────
function escHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function dateDuJour() {
    var d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}
