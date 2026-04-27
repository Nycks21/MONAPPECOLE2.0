/**
 * eleves.js — Gestion Scolaire
 * Version Finale : Corrigée, Filtrage et Pagination Inclus
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
let allEleves = [];      // Source de vérité (depuis le serveur)
let filteredEleves = []; // Données après recherche
let editId = null;       // Stocke l'ID de l'élève en cours de modif
let currentPage = 1;
const rowsPerPage = 10;

// ─────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    forceHideSpinner();
    chargerEleves();

    // Ecouteur pour la barre de recherche
    const searchInput = document.getElementById('searchEleve');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterEleves(e.target.value);
        });
    }
});

// ─────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────
function chargerEleves() {
    showSpinner();
    fetch(API.liste)
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                allEleves = res.Eleves || [];
                filteredEleves = [...allEleves];
                renderTable();
            } else {
                Swal.fire('Erreur', res.message, 'error');
            }
        })
        .catch(err => console.error("Erreur de chargement:", err))
        .finally(() => hideSpinner());
}

// ─────────────────────────────────────────────
// FILTRAGE / RECHERCHE
// ─────────────────────────────────────────────
function filterEleves(query) {
    const q = query.toLowerCase().trim();
    filteredEleves = allEleves.filter(e => 
        e.NOM.toLowerCase().includes(q) || 
        e.MATRICULE.toLowerCase().includes(q) ||
        e.CLASSE_NOM.toLowerCase().includes(q)
    );
    currentPage = 1; // Reset à la page 1
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
                    <button class="btn btn-sm btn-primary" onclick="editEleve('${e.ID}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEleve('${e.ID}', '${escHtml(e.NOM).replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }
    updatePaginationUI();
}

// ─────────────────────────────────────────────
// GESTION PAGINATION
// ─────────────────────────────────────────────
function changePage(delta) {
    currentPage += delta;
    renderTable();
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

// ─────────────────────────────────────────────
// CRUD (AJOUTER / MODIFIER / SUPPRIMER)
// ─────────────────────────────────────────────

function openAddEleveModal() {
    editId = null;
    document.getElementById('modalTitle').innerText = "Ajouter un élève";
    document.getElementById('eleveForm').reset();
    showModal('eleveModal');
}

function editEleve(id) {
    const eleve = allEleves.find(x => x.ID == id);
    if (!eleve) return;

    editId = id;
    document.getElementById('modalTitle').innerText = "Modifier l'élève";
    
    // Remplissage des champs avec les données SQL
    document.getElementById('eleveMatricule').value = eleve.MATRICULE;
    document.getElementById('eleveNom').value       = eleve.NOM;
    document.getElementById('eleveAnnee').value     = eleve.ANNEE_ID; // L'ID pour le select
    document.getElementById('eleveClasse').value    = eleve.CLASSE_ID; // Le GUID pour le select
    document.getElementById('eleveEmail').value     = eleve.EMAIL;
    document.getElementById('eleveTel').value       = eleve.TELEPHONE;
    document.getElementById('eleveStatut').value    = eleve.STATUT;
    
    showModal('eleveModal');
}

function saveEleve() {
    const data = {
        ID: editId,
        ANNEE_ID:  document.getElementById('eleveAnnee').value,
        MATRICULE: document.getElementById('eleveMatricule').value,
        NOM:       document.getElementById('eleveNom').value,
        CLASSE:    document.getElementById('eleveClasse').value,
        EMAIL:     document.getElementById('eleveEmail').value,
        TELEPHONE: document.getElementById('eleveTel').value,
        STATUT:    document.getElementById('eleveStatut').value
    };

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
            Swal.fire('Succès', 'Données enregistrées', 'success');
            closeEleveModal();
            chargerEleves();
        } else {
            Swal.fire('Erreur', res.message, 'error');
        }
    })
    .finally(() => hideSpinner());
}

function deleteEleve(id, nom) {
    Swal.fire({
        title: 'Supprimer ?',
        text: `Confirmez-vous la suppression de ${nom} ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Supprimer',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner();
            fetch(API.supprimer + '?id=' + id)
                .then(r => r.json())
                .then(res => {
                    if (res.success) {
                        Swal.fire('Supprimé', '', 'success');
                        chargerEleves();
                    } else {
                        Swal.fire('Erreur', res.message, 'error');
                    }
                })
                .finally(() => hideSpinner());
        }
    });
}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────
function getStatutBadge(statut) {
    const s = String(statut || '').toLowerCase().trim();
    if (s === 'actif') return '<span class="badge bg-success">Actif</span>';
    if (s === 'suspendu') return '<span class="badge bg-warning">Suspendu</span>';
    return '<span class="badge bg-danger">Inactif</span>';
}

function escHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeEleveModal() { document.getElementById('eleveModal').style.display = 'none'; }
function showSpinner() { document.getElementById('spinnerOverlay').style.display = 'flex'; }
function hideSpinner() { document.getElementById('spinnerOverlay').style.display = 'none'; }
function forceHideSpinner() { hideSpinner(); }