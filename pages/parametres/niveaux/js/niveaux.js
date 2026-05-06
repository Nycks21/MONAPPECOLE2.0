/**
 * niveaux.js — Gestion Scolaire
 * Table SQL Server : [MONAPPECOLE2].[dbo].[NIVEAUX]
 * Colonnes : ID, NOM, ORDRE, STATUT, CREATED_AT
 *
 * Architecture identique à matieres.js :
 *   - Appels AJAX (fetch) vers des handlers .ashx
 *   - Pas de données en mémoire persistante : la source de vérité est SQL Server
 */

'use strict';

// ─────────────────────────────────────────────
// URLS DES HANDLERS
// ─────────────────────────────────────────────
var API = {
    liste: 'handlers/GetNiveaux.ashx',
    ajouter: 'handlers/AjouterNiveau.ashx',
    modifier: 'handlers/ModifierNiveau.ashx',
    supprimer: 'handlers/SupprimerNiveau.ashx'
};

// ─────────────────────────────────────────────
// ÉTAT LOCAL
// ─────────────────────────────────────────────
var niveauxData = [];
var editId = null;

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    forceHideSpinner();
    initUIControls();
    chargerNiveaux();
});

// ─────────────────────────────────────────────
// AJAX — helper générique
// ─────────────────────────────────────────────
function ajax(url, payload) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    }).then(function (r) {
        if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
        return r.json();
    });
}

// ─────────────────────────────────────────────
// CHARGER LA LISTE
// ─────────────────────────────────────────────
function chargerNiveaux() {
    showSpinner();
    fetch(API.liste)
        .then(function (r) {
            if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            if (!data.success) throw new Error(data.message || 'Erreur serveur');
            niveauxData = data.niveaux || [];
            renderNiveauxStats();
            renderNiveauxTable();
        })
        .catch(function (err) {
            afficherErreurGlobale('Impossible de charger les niveaux : ' + err.message);
        })
        .finally(function () { hideSpinner(); });
}

// ─────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────
function renderNiveauxStats() {
    var container = document.getElementById('niveauxStatsContainer');
    if (!container) return;

    var total = niveauxData.length;
    var actifs = niveauxData.filter(function (n) { return n.STATUT === true || n.STATUT === 1; }).length;
    var inactifs = total - actifs;

    var stats = [
        { label: 'Total niveaux', value: total, icon: 'fas fa-layer-group', color: '#007bff' },
        { label: 'Actifs', value: actifs, icon: 'fas fa-check-circle', color: '#28a745' },
        { label: 'Inactifs', value: inactifs, icon: 'fas fa-times-circle', color: '#dc3545' }
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
function renderNiveauxTable() {
    var tbody = document.getElementById('niveauxTableBody');
    if (!tbody) return;

    if (niveauxData.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;color:#888;padding:24px;">' +
            '<i class="fas fa-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>' +
            'Aucun niveau enregistré.</td></tr>';
        return;
    }

    tbody.innerHTML = niveauxData.map(function (n, idx) {
        var date = n.CREATED_AT ? new Date(n.CREATED_AT).toLocaleDateString('fr-FR') : '—';
        var actif = n.STATUT === true || n.STATUT === 1 || n.STATUT === 'True';
        
        // Badge de statut avec largeur fixe pour l'alignement
        var badge = actif
            ? '<span style="background: #28a745; padding: 4px 10px; border-radius: 20px; color: white; font-size: 11px; font-weight: 600; display: inline-block; min-width: 80px;">✓ Actif</span>'
            : '<span style="background: #dc3545; padding: 4px 10px; border-radius: 20px; color: white; font-size: 11px; font-weight: 600; display: inline-block; min-width: 80px;">✗ Inactif</span>';

        // Styles réutilisables pour le centrage
        var centerStyle = 'style="text-align:center; vertical-align:middle;"';
        var lightTextStyle = 'style="text-align:center; vertical-align:middle; color:#888; font-size:12px;"';

        return '<tr>' +
            // Index
            '<td ' + lightTextStyle + '>' + (idx + 1) + '</td>' +
            
            // Nom du niveau
            '<td ' + centerStyle + '>' +
                '<span style="display: inline-block; min-width: 120px; padding: 3px 8px; border: 1px solid #f0f0f0; border-radius: 8px;">' +
                    '<strong>' + escHtml(n.NOM) + '</strong>' +
                '</span>' +
            '</td>' +
            
            // Ordre (Badge cercle)
            '<td ' + centerStyle + '>' +
                '<span class="badge-coeff" style="font-weight:700; background-color: #007bff; color: #ffffff; border-radius:50%;">' + 
                    escHtml(String(n.ORDRE)) + 
                '</span>' +
            '</td>' +
            
            // Statut
            '<td ' + centerStyle + '>' + badge + '</td>' +
            
            // Date
            '<td ' + lightTextStyle + '>' + date + '</td>' +
            
            // Actions
            '<td ' + centerStyle + ' style="white-space:nowrap; vertical-align:middle; text-align:center;">' +
                '<button type="button" class="btn btn-sm btn-primary" style="margin: 0 2px;" onclick="editNiveau(\'' + n.ID + '\')" title="Modifier">' +
                    '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button type="button" class="btn btn-sm btn-danger" style="margin: 0 2px;" onclick="deleteNiveau(\'' + n.ID + '\',\'' + escHtml(n.NOM).replace(/'/g, "\\'") + '\')" title="Supprimer">' +
                    '<i class="fas fa-trash"></i>' +
                '</button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

// ─────────────────────────────────────────────
// MODAL — OUVRIR / FERMER
// ─────────────────────────────────────────────
function openAddNiveauModal() {
    editId = null;
    resetNiveauForm();
    document.getElementById('niveauModalTitle').innerHTML =
        '<i class="fas fa-layer-group"></i> Ajouter un niveau';
    document.getElementById('addNiveauModal').classList.add('open');
    document.getElementById('niveauNom').focus();
}

function closeAddNiveauModal() {
    document.getElementById('addNiveauModal').classList.remove('open');
    resetNiveauForm();
    clearFormErrors();
}

function resetNiveauForm() {
    document.getElementById('niveauEditId').value = '';
    document.getElementById('niveauNom').value = '';
    document.getElementById('niveauOrdre').value = '0';
    document.getElementById('niveauStatut').value = '1';
    clearFormErrors();
}

// ─────────────────────────────────────────────
// ÉDITER
// ─────────────────────────────────────────────
function editNiveau(id) {
    // 1. Recherche du niveau dans les données locales
    // On utilise .find() pour plus de modernité (si votre navigateur le supporte)
    var n = niveauxData.find(function (item) {
        // Avec les GUID, on s'assure de comparer des chaînes en minuscules
        return String(item.ID).toLowerCase() === String(id).toLowerCase();
    });

    if (!n) {
        console.error("Niveau introuvable pour l'ID : " + id);
        return;
    }

    // 2. Mise à jour de l'état global d'édition
    editId = n.ID;

    // 3. Remplissage des champs du formulaire
    // On affiche l'ID dans le champ (readonly ou non selon votre choix)
    var inputId = document.getElementById('niveauEditId');
    if (inputId) {
        inputId.value = n.ID;
        // Optionnel : on empêche la modification de l'ID en mode édition
        inputId.readOnly = true;
    }

    document.getElementById('niveauNom').value = n.NOM;
    document.getElementById('niveauOrdre').value = n.ORDRE;

    // Gestion propre du statut (conversion booléen/nombre vers string '1' ou '0')
    var statutSelect = document.getElementById('niveauStatut');
    if (statutSelect) {
        statutSelect.value = (n.STATUT === true || n.STATUT === 1 || n.STATUT === "1") ? '1' : '0';
    }

    // 4. Mise à jour de l'interface du Modal
    var modalTitle = document.getElementById('niveauModalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Modifier le niveau';
    }

    // 5. Affichage du Modal
    var modal = document.getElementById('addNiveauModal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('niveauNom').focus();
    }
}

// ─────────────────────────────────────────────
// SAUVEGARDER (Ajouter ou Modifier)
// ─────────────────────────────────────────────
function saveNiveau() {
    if (!validateNiveauForm()) return;

    var payload = {
        nom: document.getElementById('niveauNom').value.trim(),
        ordre: parseInt(document.getElementById('niveauOrdre').value, 10) || 0,
        statut: document.getElementById('niveauStatut').value === '1'
    };

    var isEdit = editId !== null;
    var url = isEdit ? API.modifier : API.ajouter;
    if (isEdit) payload.id = editId;

    showSpinner();
    ajax(url, payload)
        .then(function (data) {
            if (!data.success) throw new Error(data.message || 'Erreur serveur');
            closeAddNiveauModal();
            Swal.fire({
                title: isEdit ? 'Niveau modifié !' : 'Niveau ajouté !',
                text: isEdit
                    ? 'Le niveau a été modifié avec succès.'
                    : 'Le niveau a été ajouté avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            chargerNiveaux();
        })
        .catch(function (err) {
            Swal.fire({ title: 'Erreur', text: err.message, icon: 'error' });
            hideSpinner();
        });
}

// ─────────────────────────────────────────────
// SUPPRIMER
// ─────────────────────────────────────────────
function deleteNiveau(id, nom) {
    Swal.fire({
        title: 'Supprimer ce niveau ?',
        html: 'Le niveau <strong>' + escHtml(nom) + '</strong> sera supprimé définitivement.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then(function (result) {
        if (!result.isConfirmed) return;
        showSpinner();
        ajax(API.supprimer, { id: id })
            .then(function (data) {
                if (!data.success) throw new Error(data.message || 'Erreur serveur');
                Swal.fire({
                    title: 'Supprimé !',
                    text: 'Le niveau a été supprimé avec succès.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                chargerNiveaux();
            })
            .catch(function (err) {
                Swal.fire({ title: 'Erreur', text: 'Erreur lors de la suppression : ' + err.message, icon: 'error' });
                hideSpinner();
            });
    });
}

// ─────────────────────────────────────────────
// EXPORT CSV
// ─────────────────────────────────────────────
function exportNiveaux() {
    if (niveauxData.length === 0) { alert('Aucune donnée à exporter.'); return; }
    showSpinner();
    setTimeout(function () {
        try {
            var header = ['ID', 'Nom', 'Ordre', 'Statut', 'Créé le'];
            var rows = niveauxData.map(function (n) {
                var date = n.CREATED_AT ? new Date(n.CREATED_AT).toLocaleDateString('fr-FR') : '';
                var statut = (n.STATUT === true || n.STATUT === 1) ? 'Actif' : 'Inactif';
                return [n.ID, n.NOM, n.ORDRE, statut, date]
                    .map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; })
                    .join(',');
            });
            var csv = [header.join(',')].concat(rows).join('\r\n');
            var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'niveaux_export_' + dateDuJour() + '.csv';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) { alert('Erreur export : ' + err.message); }
        finally { hideSpinner(); }
    }, 400);
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────
function validateNiveauForm() {
    clearFormErrors();
    var ok = true;
    var nom = document.getElementById('niveauNom').value.trim();
    if (!nom) {
        showFieldError('niveauNom', 'Le nom du niveau est obligatoire.');
        ok = false;
    } else if (nom.length > 50) {
        showFieldError('niveauNom', 'Maximum 50 caractères.');
        ok = false;
    }
    var ordre = parseInt(document.getElementById('niveauOrdre').value, 10);
    if (isNaN(ordre) || ordre < 0 || ordre > 99) {
        showFieldError('niveauOrdre', "L'ordre doit être compris entre 0 et 99.");
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
    var invalids = document.querySelectorAll('#addNiveauModal .is-invalid');
    for (var i = 0; i < invalids.length; i++) invalids[i].classList.remove('is-invalid');
    var errors = document.querySelectorAll('#addNiveauModal .field-error');
    for (var j = 0; j < errors.length; j++) errors[j].parentNode.removeChild(errors[j]);
}

// ─────────────────────────────────────────────
// ERREUR GLOBALE
// ─────────────────────────────────────────────
function afficherErreurGlobale(msg) {
    var existing = document.getElementById('alertErreurGlobal');
    if (existing) existing.parentNode.removeChild(existing);
    var div = document.createElement('div');
    div.id = 'alertErreurGlobal';
    div.className = 'alert-erreur';
    div.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + escHtml(msg) +
        '<button onclick="this.parentNode.remove()" style="float:right;background:none;border:none;cursor:pointer;font-size:16px;color:inherit;">&times;</button>';
    var section = document.getElementById('section-niveaux');
    if (section) section.insertBefore(div, section.firstChild);
}

// ─────────────────────────────────────────────
// CONTRÔLES UI
// ─────────────────────────────────────────────
function initUIControls() {
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    var wrapper = document.getElementById('contentWrapper');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-collapsed');
            if (wrapper) wrapper.classList.toggle('sidebar-collapsed');
        });
    }

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
        if (e.key === 'Escape') closeAddNiveauModal();
    });

}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────
function escHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function dateDuJour() {
    var d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}
