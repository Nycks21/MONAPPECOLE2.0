/**
 * eleves.js — Gestion Scolaire
 * Version Unifiée : Corrigée et Finalisée
 */

'use strict';

// ─────────────────────────────────────────────
// CONFIGURATION DES URLS
// ─────────────────────────────────────────────
const API = {
    liste: 'handlers/GetEleve.ashx',
    ajouter: 'handlers/AjouterEleve.ashx',
    modifier: 'handlers/ModifierEleve.ashx',
    supprimer: 'handlers/SupprimerEleve.ashx'
};

// ─────────────────────────────────────────────
// ÉTAT DE L'APPLICATION
// ─────────────────────────────────────────────
let allEleves = [];      // Source de vérité
let filteredEleves = []; // Données après filtrage
let editId = null;       
let currentPage = 1;
let rowsPerPage = 10;
let currentMode = null; 

// ─────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    forceHideSpinner();
    initApp();
});

function initApp() {
    // 1. Charger les données
    chargerEleves();

    // 2. Créer l'interface des filtres
    createFilterControls();

    // 3. Liaison de la recherche globale (si l'ID existe dans le HTML)
    const searchInput = document.getElementById('searchEleve');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            applyFilters();
        });
    }
}

// ─────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────
function chargerEleves() {
    showSpinner();
    fetch(API.liste)
        .then(r => r.json())
        .then(res => {
            if (res.success || Array.isArray(res)) {
                allEleves = res.Eleves || (Array.isArray(res) ? res : []);
                filteredEleves = [...allEleves];
                renderTable();
            } else {
                Swal.fire('Erreur', res.message || "Erreur de format", 'error');
            }
        })
        .catch(err => console.error("Erreur de chargement:", err))
        .finally(() => hideSpinner());
}

// ─────────────────────────────────────────────
// FILTRAGE DYNAMIQUE
// ─────────────────────────────────────────────
function applyFilters() {
    const searchQuery = (document.getElementById('search-filter')?.value || "").toLowerCase().trim();
    const statusQuery = (document.getElementById('status-filter')?.value || "").toLowerCase();
    
    filteredEleves = allEleves.filter(e => {
        const matchesSearch = 
            (e.NOM && e.NOM.toLowerCase().includes(searchQuery)) || 
            (e.MATRICULE && e.MATRICULE.toLowerCase().includes(searchQuery)) ||
            (e.EMAIL && e.EMAIL.toLowerCase().includes(searchQuery));

        const matchesStatus = statusQuery === "" || (e.STATUT && e.STATUT.toLowerCase() === statusQuery);

        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────
function renderTable() {
    const tbody = document.getElementById('elevesTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * rowsPerPage;
    const paged = filteredEleves.slice(start, start + rowsPerPage);
    
    tbody.innerHTML = '';
    
    if (paged.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;">Aucun élève trouvé</td></tr>';
    } else {
        paged.forEach(e => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${escHtml(e.MATRICULE)}</td>
                <td><span class="badge bg-info text-dark">${escHtml(e.ANNEE_TEXTE)}</span></td>
                <td><strong>${escHtml(e.NOM)}</strong></td>
                <td><span class="badge-classe">${escHtml(e.CLASSE_NOM)}</span></td>
                <td>${escHtml(e.EMAIL || '-')}</td>
                <td>${escHtml(e.TELEPHONE || '-')}</td>
                <td>${getStatutBadge(e.STATUT)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary" onclick="openEditEleveModal('${e.ID}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEleve('${e.ID}', '${escHtml(e.NOM).replace(/'/g, "\\'")}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    }
    updatePaginationUI();
}

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────
function changePage(delta) {
    const totalPages = Math.ceil(filteredEleves.length / rowsPerPage);
    if (currentPage + delta >= 1 && currentPage + delta <= totalPages) {
        currentPage += delta;
        renderTable();
    }
}

function updatePaginationUI() {
    const totalPages = Math.ceil(filteredEleves.length / rowsPerPage);
    const info = document.getElementById('elevesPaginationInfo');
    const prevBtn = document.getElementById('elevesPrevBtn');
    const nextBtn = document.getElementById('elevesNextBtn');

    if (info) info.textContent = `Page ${currentPage} sur ${totalPages || 1}`;
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPage >= totalPages || totalPages === 0);
}

// ============================================================================
// MODAL - AJOUT / MODIFICATION
// ============================================================================

/**
 * Ferme la modal si on clique à l'extérieur du contenu blanc
 */
function initModalCloseOnClickOutside() {
    const modal = document.getElementById('eleveModal'); // ID harmonisé
    if (modal) {
        modal.addEventListener('click', (event) => {
            const modalContent = modal.querySelector('.modal-content');
            // Si la cible du clic est le background (modal) et non le contenu (modalContent)
            if (event.target === modal) {
                closeEleveModal();
            }
        });
    }
}

/**
 * Ouvre la modal en mode Ajout
 */
function openAddEleveModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    editId = null; // Important pour saveEleve()
    currentMode = "ajout";
    
    const form = document.getElementById('eleveForm');
    if (form) form.reset();

    // Configuration visuelle du titre
    const titleElement = document.getElementById('modalTitle');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un élève';
    }

    // Gestion du champ matricule (activé en ajout)
    const matriculeField = document.getElementById('eleveMatricule');
    if (matriculeField) {
        matriculeField.disabled = false;
        matriculeField.style.backgroundColor = '#ffffff';
        matriculeField.style.cursor = 'text';
    }

    showModal('eleveModal');
}

/**
 * Ouvre la modal en mode Modification
 */
function openEditEleveModal(eleveId) {
    // On cherche l'élève dans la source de vérité
    const eleve = allEleves.find(x => x.ID == eleveId);
    if (!eleve) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Élève introuvable' });
        return;
    }

    editId = eleveId;
    currentMode = "modification";

    const title = document.getElementById('modalTitle');
    if (title) {
        title.innerHTML = '<i class="fas fa-edit"></i> Modifier l\'élève';
    }

    // Remplissage des champs avec les données SQL
    if(document.getElementById('eleveAnnee'))     document.getElementById('eleveAnnee').value = eleve.ANNEE_ID || '';
    if(document.getElementById('eleveNom'))       document.getElementById('eleveNom').value = eleve.NOM || '';
    if(document.getElementById('eleveClasse'))    document.getElementById('eleveClasse').value = eleve.CLASSE_ID || '';
    if(document.getElementById('eleveEmail'))     document.getElementById('eleveEmail').value = eleve.EMAIL || '';
    if(document.getElementById('eleveTel'))       document.getElementById('eleveTel').value = eleve.TELEPHONE || '';
    if(document.getElementById('eleveStatut'))    document.getElementById('eleveStatut').value = eleve.STATUT || '';
    
    // Cas particulier du Matricule : souvent figé en modification
    const m = document.getElementById('eleveMatricule');
    if (m) {
        m.value = eleve.MATRICULE || '';
        m.disabled = true; 
        m.style.backgroundColor = '#e9ecef'; // Aspect grisé
        m.style.cursor = 'not-allowed';
    }

    showModal('eleveModal');
}

/**
 * Enregistre les données (Ajout ou Modif)
 */
function saveEleve() {
    const data = {
        ID: editId, // null si ajout, GUID si modif
        ANNEE_ID:  document.getElementById('eleveAnnee').value,
        MATRICULE: document.getElementById('eleveMatricule').value,
        NOM:       document.getElementById('eleveNom').value,
        CLASSE:    document.getElementById('eleveClasse').value,
        EMAIL:     document.getElementById('eleveEmail').value,
        TELEPHONE: document.getElementById('eleveTel').value,
        STATUT:    document.getElementById('eleveStatut').value
    };

    // Validation simple
    if (!data.NOM || !data.MATRICULE || !data.CLASSE) {
        Swal.fire('Champs requis', 'Le nom, le matricule et la classe sont obligatoires', 'warning');
        return;
    }

    const url = editId ? API.modifier : API.ajouter;

    showSpinner();
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            Swal.fire('Succès', 'Données enregistrées avec succès', 'success');
            closeEleveModal();
            chargerEleves(); // Rafraîchir la liste
        } else {
            Swal.fire('Erreur', res.message || "Erreur lors de l'enregistrement", 'error');
        }
    })
    .catch(err => {
        console.error("Erreur Save:", err);
        Swal.fire('Erreur', "Impossible de contacter le serveur", 'error');
    })
    .finally(() => hideSpinner());
}

/**
 * Supprime un élève
 */
function deleteEleve(id, nom) {
    Swal.fire({
        title: 'Supprimer ?',
        text: `Confirmez-vous la suppression définitive de l'élève ${nom} ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner();
            fetch(API.supprimer + '?id=' + id)
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        Swal.fire('Supprimé', 'L\'élève a été retiré de la base.', 'success');
                        chargerEleves();
                    } else {
                        Swal.fire('Erreur', res.message, 'error');
                    }
                })
                .catch(err => console.error("Erreur Delete:", err))
                .finally(() => hideSpinner());
        }
    });
}

// ─────────────────────────────────────────────
// UTILITAIRES & FILTRES UI
// ─────────────────────────────────────────────
function createFilterControls() {
    if (document.getElementById('filter-container')) return;

    const dashCardBody = document.querySelector('.dash-card-body');
    if (!dashCardBody) return;

    const filterContainer = document.createElement('div');
    filterContainer.id = 'filter-container';
    filterContainer.style.cssText = `
        margin: 0 0 20px 0; padding: 15px 20px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px; display: flex; gap: 15px; flex-wrap: wrap;
        align-items: flex-end; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #dee2e6;
    `;

    filterContainer.innerHTML = `
        <div style="flex: 2; min-width: 200px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Recherche :</label>
            <input type="text" id="search-filter" class="form-control" placeholder="Nom, email, matricule...">
        </div>
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Statut :</label>
            <select id="status-filter" class="form-control">
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
            </select>
        </div>
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Lignes :</label>
            <select id="rows-per-page-top" class="form-control">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>
        <div>
            <button id="reset-filters" style="padding: 10px 24px; background: #6c757d; color: white; 
                    border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                <i class="fas fa-undo-alt"></i> Réinitialiser
            </button>
        </div>
    `;

    dashCardBody.insertBefore(filterContainer, dashCardBody.firstChild);

    document.getElementById('search-filter').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('rows-per-page-top').addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        renderTable();
    });
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

function resetFilters() {
    if (document.getElementById('search-filter')) document.getElementById('search-filter').value = '';
    if (document.getElementById('status-filter')) document.getElementById('status-filter').value = '';
    rowsPerPage = 10;
    currentPage = 1;
    applyFilters();
}

function getStatutBadge(statut) {
    const s = String(statut || '').toLowerCase().trim();
    const color = s === 'actif' ? 'bg-success' : (s === 'suspendu' ? 'bg-warning' : 'bg-danger');
    return `<span class="badge ${color}">${statut || 'Inactif'}</span>`;
}

function escHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeEleveModal() { document.getElementById('eleveModal').style.display = 'none'; }
function showSpinner() { const s = document.getElementById('spinnerOverlay'); if(s) s.style.display = 'flex'; }
function hideSpinner() { const s = document.getElementById('spinnerOverlay'); if(s) s.style.display = 'none'; }
function forceHideSpinner() { hideSpinner(); }

// Globalisation pour les appels onclick du HTML
window.openAddEleveModal = openAddEleveModal;
window.openEditEleveModal = openEditEleveModal;
window.saveEleve = saveEleve;
window.deleteEleve = deleteEleve;
window.changePage = changePage;
window.resetFilters = resetFilters;