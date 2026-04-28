// ============================================================================
// GESTION COMPLÈTE DES ÉLÈVES
// ============================================================================

let currentMode = null; 
let currentEleveId = null;
let elevesData = [];
let baseFilteredData = [];  // Données après validation du MODAL (Le périmètre)
let filteredEleves = [];
let currentPage = 1;
let rowsPerPage = 10;
let isInitialLoad = true; // Pour savoir si on doit afficher le modal de démarrage

// ============================================================================
// INITIALISATION
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔵 Page Élèves chargée - Initialisation");
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadEleves(); 
    bindButtonEvents();
});

// ============================================================================
// GESTION DU PRELOADER & SPINNER
// ============================================================================
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hide');
        setTimeout(() => { preloader.style.display = 'none'; }, 500);
    }
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
        preloader.classList.remove('hide');
    }
}

function forceHideSpinner() {
    const s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'none';
    s.style.opacity = '0';
}

function showSpinner() {
    const s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'flex';
    s.style.opacity = '1';
}

function hideSpinner() { forceHideSpinner(); }

// ============================================================================
// SECURITÉ FORMULAIRE
// ============================================================================
function preventFormAutoSubmit() {
    const form = document.getElementById('eleveForm');
    if (form) {
        form.onsubmit = (e) => e.preventDefault();
        form.setAttribute('novalidate', 'novalidate');
    }
}

function ensureButtonsHaveTypeButton() {
    document.querySelectorAll('button').forEach(btn => {
        if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
    });
}

// ============================================================================
// FILTRE INITIAL
// ============================================================================
function showInitialFilterModal() {
    Swal.fire({
        title: '<i class="fas fa-filter"></i> Filtrer les élèves',
        html: `
            <div style="text-align: left;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Année Scolaire</label>
                <select id="init-annee" class="form-control mb-2">
                    <option value="">-- Toutes --</option>
                    <option value="2025-2026">2025-2026</option>
                </select>
                
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Matricule</label>
                <input type="text" id="init-matricule" class="form-control mb-2" placeholder="Ex: MAT-2024...">
                
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Nom de l'élève</label>
                <input type="text" id="init-nom" class="form-control mb-2" placeholder="Nom ou partie du nom...">
                
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">Statut</label>
                <select id="init-status" class="form-control">
                    <option value="">-- Tous --</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                </select>
            </div>
        `,
        confirmButtonColor: '#007bff',
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        preConfirm: () => {
            return {
                annee: document.getElementById('init-annee').value,
                matricule: document.getElementById('init-matricule').value.trim(),
                nom: document.getElementById('init-nom').value.trim(),
                status: document.getElementById('init-status').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            applyInitialFilters(result.value);
        }
    });
}

// ============================================================================
// FILTRES & RECHERCHE
// ============================================================================
function createFilterControls() {
    if (document.getElementById('filter-container')) return;

    const filterContainer = document.createElement('div');
    filterContainer.id = 'filter-container';
    filterContainer.style.cssText = `
        margin: 0 0 20px 0;
        padding: 15px 20px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        align-items: flex-end;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        border: 1px solid #dee2e6;
    `;

    filterContainer.innerHTML = `
        <div style="flex: 2; min-width: 200px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
                <i class="fas fa-search"></i> Recherche :
            </label>
            <input type="text" id="search-filter" placeholder="Nom, matricule..." 
                style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px;">
        </div>
        <div style="min-width: 160px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
                <i class="fas fa-filter"></i> Statut :</label>
            <select id="status-filter" class="form-control">
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
            </select>
        </div>
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
            <i class="fas fa-list"></i> Afficher :</label>
            <select id="rows-per-page-top" class="form-control">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
            </select>
        </div>
        <button id="btn-reset-filters" style="padding: 10px 24px; background: #6c757d; color: white; 
                    border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>
    `;

    const container = document.querySelector('.dash-card-body') || document.body;
    container.prepend(filterContainer);

    document.getElementById('search-filter').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('rows-per-page-top').addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderSimpleTable();
    });
    document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('search-filter')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';

    // On filtre UNIQUEMENT sur les résultats déjà validés par le modal
    filteredEleves = baseFilteredData.filter(eleve => {
        let matchSearch = true;
        if (searchTerm) {
            matchSearch = (eleve.NOM?.toLowerCase().includes(searchTerm)) ||
                          (eleve.MATRICULE?.toLowerCase().includes(searchTerm)) ||
                          (eleve.EMAIL?.toLowerCase().includes(searchTerm));
        }

        let matchStatus = true;
        if (statusFilter) {
            matchStatus = (eleve.STATUT?.toLowerCase() === statusFilter.toLowerCase());
        }

        return matchSearch && matchStatus;
    });

    currentPage = 1;
    renderSimpleTable();
}

function resetFilters() {
    document.getElementById('search-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('rows-per-page-top').value = '10';
    rowsPerPage = 10;
    applyFilters();
}

// ============================================================================
// CONTRÔLES DE PAGINATION (VERSION AMÉLIORÉE)
// ============================================================================
function createPaginationControls(totalPages) {
    const oldPagination = document.getElementById('pagination-container');
    if (oldPagination) oldPagination.remove();
    if (totalPages <= 1) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.style.cssText = `
        margin: 20px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
    `;

    paginationContainer.appendChild(createPaginationButton('«', () => goToPage(1), currentPage === 1));
    paginationContainer.appendChild(createPaginationButton('‹', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    }, currentPage === 1));

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationContainer.appendChild(createPaginationButton('1', () => goToPage(1)));
        if (startPage > 2) paginationContainer.appendChild(createPaginationButton('...', null, true, true));
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPaginationButton(i, () => goToPage(i), i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationContainer.appendChild(createPaginationButton('...', null, true, true));
        paginationContainer.appendChild(createPaginationButton(totalPages, () => goToPage(totalPages)));
    }

    paginationContainer.appendChild(createPaginationButton('›', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    }, currentPage === totalPages));
    paginationContainer.appendChild(createPaginationButton('»', () => goToPage(totalPages), currentPage === totalPages));

    const table = document.querySelector('.dash-table') || document.getElementById('elevesTableBody').closest('table');
    if (table) table.after(paginationContainer);
}

function createPaginationButton(text, onClick, isDisabled = false, isDots = false) {
    const button = document.createElement('button');
    button.textContent = text;

    // Détecter si c'est la page actuelle (active)
    const isActive = (text == currentPage && !isNaN(text));

    if (isDots) {
        button.style.cssText = `padding: 8px 12px; margin: 0 2px; border: none; background: transparent; color: #6c757d; cursor: default; font-size: 14px;`;
        return button;
    }

    // Style de base + condition pour le bleu si actif
    button.style.cssText = `
        padding: 8px 14px;
        border: 1px solid ${isActive || !isDisabled ? '#007bff' : '#dee2e6'};
        background: ${isActive ? '#007bff' : (isDisabled ? '#e9ecef' : 'white')};
        color: ${isActive ? 'white' : (isDisabled ? '#6c757d' : '#007bff')};
        cursor: ${isDisabled || isActive ? 'default' : 'pointer'};
        border-radius: 6px;
        font-weight: ${isActive ? '700' : '500'};
        transition: all 0.2s;
        min-width: 40px;
    `;

    if (onClick && !isDisabled && !isActive) {
        button.onclick = onClick;
        
        // Effets de survol uniquement pour les boutons cliquables
        button.onmouseover = () => {
            button.style.background = '#007bff';
            button.style.color = 'white';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 2px 5px rgba(0,123,255,0.3)';
        };
        button.onmouseout = () => {
            button.style.background = 'white';
            button.style.color = '#007bff';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        };
    } else if (isDisabled) {
        button.disabled = true;
        button.style.opacity = '0.6';
    }

    return button;
}

// ============================================================================
// CHARGEMENT & TABLEAU
// ============================================================================
async function loadEleves() {
    showSpinner();
    showPreloader();
    try {
        const res = await fetch("handlers/GetEleve.ashx");
        const data = await safeJson(res);
        if (data.success) {
            elevesData = data.Eleves || [];
            
            // Si c'est le premier chargement, on force le filtre modal
            if (isInitialLoad) {
                hideSpinner();
                hidePreloader();
                showInitialFilterModal(); 
            } else {
                // Sinon on rafraîchit simplement
                applyFilters();
            }
        }
    } catch (err) {
        console.error("Erreur chargement:", err);
    } finally {
        hideSpinner();
        hidePreloader();
    }
}

function applyInitialFilters(criteria) {
    isInitialLoad = false; 

    // On définit le périmètre de base (le "Master Set")
    baseFilteredData = elevesData.filter(eleve => {
        const matchAnnee = criteria.annee ? (eleve.ANNEE_TEXTE === criteria.annee) : true;
        const matchMatricule = criteria.matricule ? (eleve.MATRICULE?.toLowerCase().includes(criteria.matricule.toLowerCase())) : true;
        const matchNom = criteria.nom ? (eleve.NOM?.toLowerCase().includes(criteria.nom.toLowerCase())) : true;
        const matchStatus = criteria.status ? (eleve.STATUT?.toLowerCase() === criteria.status.toLowerCase()) : true;
        return matchAnnee && matchMatricule && matchNom && matchStatus;
    });

    // On synchronise filteredEleves pour l'affichage initial
    filteredEleves = [...baseFilteredData];

    createFilterControls(); // Crée la barre du haut si besoin
    
    // On vide la barre de recherche du haut pour ne pas créer de confusion
    if(document.getElementById('search-filter')) document.getElementById('search-filter').value = '';
    
    currentPage = 1;
    renderSimpleTable();

    // Notification optionnelle
        const count = filteredEleves.length;
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        Toast.fire({ icon: 'success', title: `${count} élève(s) trouvé(s)` });
}

function renderSimpleTable() {
    const tbody = document.getElementById('elevesTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filteredEleves.slice(start, start + rowsPerPage);
    const totalPages = Math.ceil(filteredEleves.length / rowsPerPage);

    tbody.innerHTML = pageData.length ? '' : '<tr><td colspan="8" class="text-center">Aucun résultat</td></tr>';

    pageData.forEach(eleve => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${getMatriculeBadge(eleve.MATRICULE)}</td>
            <td>${eleve.ANNEE_TEXTE || '-'}</td>
            <td>${getNomBadge(eleve.NOM)}</td>
            <td>${eleve.CLASSE_NOM || '-'}</td>
            <td>${eleve.EMAIL || '-'}</td>
            <td>${eleve.TELEPHONE || '-'}</td>
            <td>${getStatutBadge(eleve.STATUT)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openEditEleveModal('${eleve.ID}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="supprimerEleve('${eleve.ID}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });

    updateCounter();
    createPaginationControls(totalPages);
}

// ============================================================================
// BADGES & STYLES
// ============================================================================
function getNomBadge(nom) {
    return `<span style="color: #212529; font-weight: 700;">${nom || '-'}</span>`;
}

function getMatriculeBadge(matricule) {
    const style = "background: #f1f3f5; color: #212529; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; border: 1px solid #dee2e6; display: inline-block;";
    return `<span style="${style}">${matricule || '-'}</span>`;
}

function getStatutBadge(statut) {
    const s = String(statut || '').toLowerCase();
    let style = "padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;";
    if (s === 'actif') return `<span class="badge" style="background: #28a745; ${style}">✓ Actif</span>`;
    if (s === 'suspendu') return `<span class="badge" style="background: #ffc107; ${style}">⚠ Suspendu</span>`;
    return `<span class="badge" style="background: #dc3545; ${style}">✗ Inactif</span>`;
}

// ============================================================================
// MODAL ACTIONS
// ============================================================================
function openAddEleveModal() {
    currentMode = "ajout";
    currentEleveId = null;
    document.getElementById('eleveForm').reset();
    const title = document.getElementById('eleveModalTitle');
    if(title) title.innerHTML = '<i class="fas fa-plus"></i> Nouvel Élève';
    showModal();
}

function openEditEleveModal(id) {
    const eleve = elevesData.find(e => e.ID == id);
    if (!eleve) return;
    currentMode = "modification";
    currentEleveId = id;
    document.getElementById('eleveMatricule').value = eleve.MATRICULE || '';
    document.getElementById('eleveNom').value = eleve.NOM || '';
    document.getElementById('eleveClasse').value = eleve.ID_CLASSE || '';
    document.getElementById('eleveEmail').value = eleve.EMAIL || '';
    document.getElementById('eleveTelephone').value = eleve.TELEPHONE || '';
    document.getElementById('eleveStatut').value = eleve.STATUT?.toLowerCase() || 'actif';
    const title = document.getElementById('eleveModalTitle');
    if(title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier Élève';
    showModal();
}

async function saveEleve() {
    const body = {
        ID: currentEleveId,
        ANNEE_ID: document.getElementById('eleveAnnee')?.value || 1, 
        MATRICULE: document.getElementById('eleveMatricule').value.trim(),
        NOM: document.getElementById('eleveNom').value.trim(),
        CLASSE: document.getElementById('eleveClasse').value,
        EMAIL: document.getElementById('eleveEmail').value.trim(),
        TELEPHONE: document.getElementById('eleveTelephone').value.trim(),
        STATUT: document.getElementById('eleveStatut').value
    };
    if (!body.NOM || !body.MATRICULE || !body.CLASSE) {
        return Swal.fire('Attention', 'Veuillez remplir les champs obligatoires', 'warning');
    }
    const url = currentMode === "ajout" ? "handlers/AjouterEleve.ashx" : "handlers/ModifierEleve.ashx";
    showSpinner();
    try {
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await safeJson(res);
        if (data.success) {
            Swal.fire('Succès', 'Opération réussie', 'success');
            closeEleveModal();
            loadEleves();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', 'Lien serveur interrompu', 'error');
    } finally {
        hideSpinner();
    }
}

async function supprimerEleve(id) {
    const confirm = await Swal.fire({ title: 'Supprimer ?', text: "Action irréversible.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Oui, supprimer' });
    if (confirm.isConfirmed) {
        showSpinner();
        try {
            const res = await fetch("handlers/SupprimerEleve.ashx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ID: id }) });
            const data = await safeJson(res);
            if (data.success) {
                Swal.fire('Supprimé', '', 'success');
                loadEleves();
            }
        } catch (e) {
            Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
        } finally {
            hideSpinner();
        }
    }
}

// ============================================================================
// UTILITAIRES
// ============================================================================
function updateCounter() {
    let counter = document.getElementById('record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'record-counter';
        counter.className = 'text-muted small mt-2 text-center';
        const table = document.querySelector('.dash-table');
        if(table) table.after(counter);
    }
    const count = filteredEleves.length;
    if(counter) counter.innerHTML = `Affichage de <b>${count}</b> élève(s) ${count !== elevesData.length ? '(filtrés)' : ''}`;
}

function goToPage(page) {
    currentPage = page;
    renderSimpleTable();
}

function showModal() {
    const m = document.getElementById('eleveModal');
    if (m) m.style.display = 'flex';
}

function closeEleveModal() {
    const m = document.getElementById('eleveModal');
    if (m) m.style.display = 'none';
}

async function safeJson(res) {
    try {
        const text = await res.text();
        return text ? JSON.parse(text) : { success: false, message: "Réponse vide" };
    } catch (e) { return { success: false, message: "Erreur JSON" }; }
}

function bindButtonEvents() {
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEleveModal(); });
    const modal = document.getElementById('eleveModal');
    if (modal) { modal.onclick = (e) => { if (e.target === modal) closeEleveModal(); }; }
}

window.openAddEleveModal = openAddEleveModal;
window.saveEleve = saveEleve;
window.closeEleveModal = closeEleveModal;
window.goToPage = goToPage;