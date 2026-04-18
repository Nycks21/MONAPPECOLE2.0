// ============================================================================
// GESTION COMPLÈTE DES UTILISATEURS - VERSION FINALE
// AVEC FILTRES EN HAUT, PAGINATION EN BAS, USERNAME FIGÉ EN MODIFICATION
// ============================================================================

let currentMode = null; // "ajout" ou "modification"
let currentUserId = null;
let usersData = []; // Stocker les données des utilisateurs
let filteredUsers = []; // Données après filtrage
let currentPage = 1;
let rowsPerPage = 10;

// ============================================================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================================================
$(document).ready(() => {
    console.log("🔵 Page chargée - Initialisation");

    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadUsers();
    bindButtonEvents();
    initModalCloseOnClickOutside();
});

// ============================================================================
// GESTION DU PRELOADER
// ============================================================================
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hide');
        setTimeout(() => {
            if (preloader) preloader.style.display = 'none';
        }, 500);
    }
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
        preloader.classList.remove('hide');
    }
}

// Cacher le préloader au chargement complet
window.addEventListener('load', () => {
    setTimeout(hidePreloader, 500);
});

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

// ============================================================================
// EMPÊCHER LA SOUMISSION AUTOMATIQUE DU FORMULAIRE ASP.NET
// ============================================================================
function preventFormAutoSubmit() {
    const form = document.getElementById('form1');
    if (form) {
        form.addEventListener('submit', (e) => {
            const submitter = e.submitter;
            if (submitter && submitter.classList &&
                (submitter.classList.contains('btn-success') ||
                    submitter.classList.contains('btn-primary') ||
                    submitter.classList.contains('btn-danger') ||
                    submitter.getAttribute('onclick')?.includes('openAddUserModal') ||
                    submitter.getAttribute('onclick')?.includes('exportUsers'))) {
                e.preventDefault();
                return false;
            }
            return true;
        });
    }
}

// ============================================================================
// S'ASSURER QUE TOUS LES BOUTONS ONT TYPE="BUTTON"
// ============================================================================
function ensureButtonsHaveTypeButton() {
    const actionButtons = document.querySelectorAll('.action-buttons button, .dash-table button, .modal-footer button');
    actionButtons.forEach(button => {
        if (!button.hasAttribute('type') || button.getAttribute('type') !== 'button') {
            button.setAttribute('type', 'button');
        }
    });
}

// ============================================================================
// CRÉER LES CONTRÔLES DE FILTRE EN HAUT
// ============================================================================
function createFilterControls() {
    const oldContainer = document.getElementById('filter-container');
    if (oldContainer) oldContainer.remove();

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
            <input type="text" id="search-filter" placeholder="Nom, email, téléphone..." 
                   style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div style="min-width: 160px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
                <i class="fas fa-filter"></i> Rôle :
            </label>
            <select id="role-filter" style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px;">
                <option value="">Tous les rôles</option>
                <option value="Administrateur">Administrateur</option>
                <option value="Professeur">Professeur</option>
                <option value="Secrétaire">Secrétaire</option>
                <option value="Comptable">Comptable</option>
                <option value="CPE">CPE</option>
                <option value="Parent">Parent</option>
            </select>
        </div>
        
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
                <i class="fas fa-chart-line"></i> Statut :
            </label>
            <select id="status-filter" style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px;">
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
            </select>
        </div>
        
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #495057;">
                <i class="fas fa-table"></i> Lignes/page :
            </label>
            <select id="rows-per-page-top" style="width: 100%; padding: 10px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px;">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
            </select>
        </div>
        
        <div>
            <button id="reset-filters" style="padding: 10px 24px; background: #6c757d; color: white; 
                    border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                <i class="fas fa-undo-alt"></i> Réinitialiser
            </button>
        </div>
    `;

    const dashCardBody = document.querySelector('.dash-card-body');
    if (dashCardBody) {
        dashCardBody.insertBefore(filterContainer, dashCardBody.firstChild);
    } else {
        const table = document.querySelector('.dash-table');
        if (table?.parentNode) table.parentNode.insertBefore(filterContainer, table);
    }

    // Événements
    const searchInput = document.getElementById('search-filter');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const rowsSelectTop = document.getElementById('rows-per-page-top');
    const resetBtn = document.getElementById('reset-filters');

    if (searchInput) searchInput.addEventListener('input', () => applyFilters());
    if (roleFilter) roleFilter.addEventListener('change', () => applyFilters());
    if (statusFilter) statusFilter.addEventListener('change', () => applyFilters());
    if (rowsSelectTop) {
        rowsSelectTop.addEventListener('change', (e) => {
            rowsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderSimpleTable();
        });
    }
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// ============================================================================
// CRÉER LES CONTRÔLES DE PAGINATION EN BAS
// ============================================================================
function createPaginationControls(totalPages) {
    const oldPagination = document.getElementById('pagination-container');
    if (oldPagination) oldPagination.remove();
    if (totalPages <= 1) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.style.cssText = `
        margin: 20px 0 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
    `;

    const firstBtn = createPaginationButton('« Première', () => goToPage(1), currentPage === 1);
    const prevBtn = createPaginationButton('‹ Précédent', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSimpleTable();
        }
    }, currentPage === 1);
    paginationContainer.appendChild(firstBtn);
    paginationContainer.appendChild(prevBtn);

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationContainer.appendChild(createPaginationButton('1', () => goToPage(1)));
        if (startPage > 2) {
            paginationContainer.appendChild(createPaginationButton('...', null, true, true));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPaginationButton(i, () => goToPage(i), i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.appendChild(createPaginationButton('...', null, true, true));
        }
        paginationContainer.appendChild(createPaginationButton(totalPages, () => goToPage(totalPages)));
    }

    const nextBtn = createPaginationButton('Suivant ›', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderSimpleTable();
        }
    }, currentPage === totalPages);
    const lastBtn = createPaginationButton('Dernière »', () => goToPage(totalPages), currentPage === totalPages);
    paginationContainer.appendChild(nextBtn);
    paginationContainer.appendChild(lastBtn);

    const table = document.querySelector('.dash-table');
    if (table?.parentNode) table.parentNode.insertBefore(paginationContainer, table.nextSibling);
}

function createPaginationButton(text, onClick, isDisabled = false, isDots = false) {
    const button = document.createElement('button');
    button.textContent = text;

    if (isDots) {
        button.style.cssText = `padding: 8px 12px; margin: 0 2px; border: none; background: transparent; color: #6c757d; cursor: default; font-size: 14px;`;
        return button;
    }

    button.style.cssText = `
        padding: 8px 16px;
        margin: 0 3px;
        border: 1px solid ${isDisabled ? '#dee2e6' : '#007bff'};
        background: ${isDisabled ? '#e9ecef' : 'white'};
        color: ${isDisabled ? '#6c757d' : '#007bff'};
        cursor: ${isDisabled ? 'default' : 'pointer'};
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        min-width: 40px;
    `;

    if (onClick && !isDisabled) {
        button.onclick = onClick;
        button.onmouseover = () => {
            button.style.background = '#007bff';
            button.style.color = 'white';
            button.style.transform = 'translateY(-1px)';
        };
        button.onmouseout = () => {
            button.style.background = 'white';
            button.style.color = '#007bff';
            button.style.transform = 'translateY(0)';
        };
    } else if (isDisabled) {
        button.disabled = true;
        button.style.opacity = '0.6';
    }

    return button;
}

// ============================================================================
// METTRE À JOUR LE COMPTEUR EN BAS
// ============================================================================
function updateCounter() {
    let counter = document.getElementById('record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'record-counter';
        counter.style.cssText = `
            margin: 15px 0 0 0;
            padding: 10px 15px;
            text-align: center;
            font-size: 14px;
            color: #495057;
            background: #f8f9fa;
            border-radius: 6px;
            font-weight: 500;
            border: 1px solid #e9ecef;
        `;

        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer?.parentNode) {
            paginationContainer.parentNode.insertBefore(counter, paginationContainer);
        } else {
            const table = document.querySelector('.dash-table');
            if (table?.parentNode) table.parentNode.insertBefore(counter, table.nextSibling);
        }
    }

    const start = filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, filteredUsers.length);
    const hasFilter = filteredUsers.length !== usersData.length;

    let counterHtml = `
        <i class="fas fa-chart-bar" style="margin-right: 8px;"></i>
        <strong>Affichage :</strong> ${filteredUsers.length === 0 ? '0' : start} à ${end} sur 
        <strong>${filteredUsers.length}</strong> enregistrement${filteredUsers.length > 1 ? 's' : ''}
    `;

    if (hasFilter) {
        counterHtml += `<span style="color: #007bff; margin-left: 10px;">
            <i class="fas fa-filter"></i> (Filtrés sur ${usersData.length} total)
        </span>`;
    }

    counter.innerHTML = counterHtml;
}

// ============================================================================
// RÉINITIALISER LES FILTRES
// ============================================================================
function resetFilters() {
    const searchInput = document.getElementById('search-filter');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const rowsSelectTop = document.getElementById('rows-per-page-top');

    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (rowsSelectTop) rowsSelectTop.value = '10';

    rowsPerPage = 10;
    currentPage = 1;
    applyFilters();

    Swal.fire({
        icon: 'success',
        title: 'Filtres réinitialisés',
        text: 'Tous les filtres ont été réinitialisés',
        timer: 1500,
        showConfirmButton: false
    });
}

// ============================================================================
// APPLIQUER LES FILTRES
// ============================================================================
function applyFilters() {
    const searchTerm = document.getElementById('search-filter')?.value.toLowerCase().trim() || '';
    const roleFilter = document.getElementById('role-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';

    filteredUsers = usersData.filter(user => {
        let matchSearch = true;
        if (searchTerm) {
            matchSearch = (user.NOM?.toLowerCase().includes(searchTerm)) ||
                (user.USERNAME?.toLowerCase().includes(searchTerm)) ||
                (user.EMAIL?.toLowerCase().includes(searchTerm)) ||
                (user.TELEPHONE?.toLowerCase().includes(searchTerm));
        }

        let matchRole = true;
        if (roleFilter) {
            matchRole = getUserRoleName(user.ROLEID) === roleFilter;
        }

        let matchStatus = true;
        if (statusFilter) {
            const isActive = (user.ACTIVE === true || user.ACTIVE === 1 || user.ACTIVE === 'true');
            matchStatus = (statusFilter === 'actif') ? isActive : !isActive;
        }

        return matchSearch && matchRole && matchStatus;
    });

    currentPage = 1;
    renderSimpleTable();
}

function goToPage(page) {
    currentPage = page;
    renderSimpleTable();
}

// ============================================================================
// CHARGER LES UTILISATEURS
// ============================================================================
function loadUsers() 
{
    showSpinner();
    console.log("📋 Chargement des utilisateurs...");
    showPreloader();

    fetch("api/ListUser.aspx")
        .then(safeJson)
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("❌ Réponse invalide :", data);
                return;
            }

            usersData = data;
            filteredUsers = [...usersData];
            console.log("✅ Utilisateurs chargés:", usersData.length);

            createFilterControls();
            renderSimpleTable();
            hidePreloader();
        })
        .catch(err => {
            console.error("❌ Erreur:", err);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de chargement',
                text: err.message
            });
            hidePreloader();
        })
        .finally(function () {
            hideSpinner();
        });
}

// ============================================================================
// FORMATER LA DATE
// ============================================================================
function formatDate(dateValue) {
    if (!dateValue) return '-';

    let timestamp;
    if (typeof dateValue === 'string' && dateValue.match(/\/Date\((\d+)\)\//)) {
        timestamp = parseInt(dateValue.match(/\/Date\((\d+)\)\//)[1]);
    } else if (typeof dateValue === 'number') {
        timestamp = dateValue;
    } else if (dateValue instanceof Date) {
        timestamp = dateValue.getTime();
    } else {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) timestamp = parsed.getTime();
        else return '-';
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// ============================================================================
// RENDU DU TABLEAU
// ============================================================================
function renderSimpleTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    tbody.innerHTML = '';

    if (!pageUsers.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 60px;"><i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>Aucun utilisateur trouvé</td></tr>';
        updateCounter();
        createPaginationControls(totalPages);
        return;
    }

    pageUsers.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = user.USERNAME || '-';
        row.insertCell(1).innerHTML = user.NOM || '-';
        row.insertCell(2).innerHTML = user.EMAIL || '-';
        row.insertCell(3).innerHTML = getUserRoleName(user.ROLEID);
        row.insertCell(4).innerHTML = user.TELEPHONE || '-';
        row.insertCell(5).innerHTML = formatDate(user.CREATED_AT);
        row.insertCell(6).innerHTML = (user.ACTIVE === true || user.ACTIVE === 1 || user.ACTIVE === 'true')
            ? '<span class="badge bg-success" style="background: #28a745; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✓ Actif</span>'
            : '<span class="badge bg-danger" style="background: #dc3545; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✗ Inactif</span>';
        row.insertCell(7).innerHTML = `
            <button type="button" class="btn btn-sm btn-primary" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="openEditUserModal(${user.IDUSER}, event)">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-danger" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="supprimerContact(${user.IDUSER}, event)">
                <i class="fas fa-trash"></i>
            </button>
        `;
    });

    updateCounter();
    createPaginationControls(totalPages);
}

// ============================================================================
// MODAL - AJOUT / MODIFICATION
// ============================================================================
function initModalCloseOnClickOutside() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            const modalContent = modal.querySelector('.modal-content');
            if (event.target === modal && !modalContent.contains(event.target)) {
                closeAddUserModal(event);
            }
        });
    }
}

function openAddUserModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    currentMode = "ajout";
    currentUserId = null;
    resetModalForm();

    // Activer le champ username en mode ajout
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.disabled = false;
        usernameField.style.backgroundColor = '#ffffff';
        usernameField.style.cursor = 'text';
        usernameField.placeholder = "Nom d'utilisateur";
    }

    const titleElement = document.querySelector('#userModalTitle');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un utilisateur';
    }

    showModal();
    return false;
}

function openEditUserModal(userId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const user = findUserById(userId);
    if (!user) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Utilisateur introuvable' });
        return;
    }

    currentMode = "modification";
    currentUserId = userId;

    document.getElementById('username').value = user.USERNAME || '';
    document.getElementById('Nom').value = user.NOM || '';
    document.getElementById('userEmail').value = user.EMAIL || '';
    document.getElementById('userRole').value = getUserRoleName(user.ROLEID);
    document.getElementById('userTelephone').value = user.TELEPHONE || '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userStatut').value = (user.ACTIVE === true || user.ACTIVE === 1 || user.ACTIVE === 'true') ? 'Actif' : 'Inactif';

    // FIGER LE CHAMP USERNAME EN MODIFICATION
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.disabled = true;
        usernameField.style.backgroundColor = '#e9ecef';
        usernameField.style.color = '#495057';
        usernameField.style.cursor = 'not-allowed';
        usernameField.title = "Le nom d'utilisateur ne peut pas être modifié";
    }

    const titleElement = document.querySelector('#userModalTitle');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-user-edit"></i> Modifier l\'utilisateur';
    }

    showModal();
    return false;
}

function resetModalForm() {
    const fields = ['username', 'Nom', 'userEmail', 'userTelephone', 'userPassword'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = '';
            if (field === 'username') {
                element.disabled = false;
                element.style.backgroundColor = '#ffffff';
                element.style.cursor = 'text';
                element.title = '';
            }
        }
    });

    const roleSelect = document.getElementById('userRole');
    if (roleSelect) roleSelect.value = 'Administrateur';

    const statutSelect = document.getElementById('userStatut');
    if (statutSelect) statutSelect.value = 'Actif';
}

function showModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddUserModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Réinitialiser l'état du champ username
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.disabled = false;
        usernameField.style.backgroundColor = '#ffffff';
        usernameField.style.cursor = 'text';
        usernameField.title = '';
    }

    currentMode = null;
    currentUserId = null;
    return false;
}

// ============================================================================
// CRÉER UN UTILISATEUR
// ============================================================================
async function createUserFromModal() {
    const username = document.getElementById('username')?.value.trim() || '';
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('userEmail')?.value.trim() || '';
    const role = document.getElementById('userRole')?.value || 'Administrateur';
    const telephone = document.getElementById('userTelephone')?.value.trim() || '';
    const password = document.getElementById('userPassword')?.value.trim() || '';
    const statut = document.getElementById('userStatut')?.value || 'Actif';

    if (!username || !nom || !email || !password) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir tous les champs obligatoires." });
        return;
    }

    if (password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }

    const body = {
        USERNAME: username,
        NOM: nom,
        PWD: password,
        EMAIL: email,
        TELEPHONE: telephone,
        ROLEID: getRoleId(role),
        ACTIVE: statut === "Actif" ? 1 : 0
    };

    try {
        const res = await fetch("api/users.aspx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await safeJson(res);

        if (data.success) {
            Swal.fire({ icon: 'success', title: data.message || "Utilisateur ajouté !", timer: 1500, showConfirmButton: false });
            setTimeout(() => {
                closeAddUserModal();
                loadUsers();
            }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: "Erreur", text: data.message || "Erreur inconnue" });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
    }
}

// ============================================================================
// METTRE À JOUR UN UTILISATEUR (SANS MODIFIER LE USERNAME)
// ============================================================================
async function updateUserFromModal() {
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('userEmail')?.value.trim() || '';
    const role = document.getElementById('userRole')?.value || 'Administrateur';
    const telephone = document.getElementById('userTelephone')?.value.trim() || '';
    const password = document.getElementById('userPassword')?.value.trim() || '';
    const statut = document.getElementById('userStatut')?.value || 'Actif';

    if (!nom || !email) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir Nom et Email." });
        return;
    }

    if (password && password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }

    const params = new URLSearchParams();
    params.append('id', currentUserId);
    params.append('nom', nom);
    params.append('email', email);
    params.append('roleId', getRoleId(role));
    params.append('telephone', telephone);
    params.append('active', statut === "Actif" ? 1 : 0);
    if (password) params.append('password', password);

    try {
        const res = await fetch(`api/updateUser.aspx?${params.toString()}`, { method: 'POST' });
        const result = await safeJson(res);

        if (result.success || result.status === "success") {
            Swal.fire({ icon: 'success', title: "Utilisateur modifié !", timer: 1500, showConfirmButton: false });
            setTimeout(() => {
                closeAddUserModal();
                loadUsers();
            }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: result.message || "Erreur lors de la modification" });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
    }
}

async function saveUser(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (currentMode === "modification") {
        await updateUserFromModal();
    } else if (currentMode === "ajout") {
        await createUserFromModal();
    } else {
        Swal.fire({ icon: 'warning', title: 'Aucune action', text: 'Veuillez sélectionner "Ajouter" ou "Modifier" d\'abord' });
    }
    return false;
}

// ============================================================================
// SUPPRIMER UN UTILISATEUR
// ============================================================================
async function supprimerContact(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: "Voulez-vous vraiment supprimer cet utilisateur ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch("api/DeleteUser.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });
            const data = await safeJson(res);

            if (data.status === "success" || data.success) {
                Swal.fire({ icon: 'success', title: "Utilisateur supprimé", showConfirmButton: false, timer: 1500 });
                setTimeout(() => loadUsers(), 1500);
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message || "Erreur lors de la suppression" });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
        }
    }
    return false;
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================
function getRoleId(roleName) {
    const roles = {
        'SuperAdmin': 0, 'Administrateur': 1, 'Admin': 1, 'User': 2,
        'Professeur': 3, 'Secrétaire': 4, 'Comptable': 5, 'CPE': 6, 'Parent': 7
    };
    return roles[roleName] || 1;
}

function getUserRoleName(roleId) {
    const roles = {
        0: 'SuperAdmin', 1: 'Administrateur', 2: 'User', 3: 'Professeur',
        4: 'Secrétaire', 5: 'Comptable', 6: 'CPE', 7: 'Parent'
    };
    return roles[roleId] || 'Utilisateur';
}

function findUserById(userId) {
    return usersData.find(u => u.IDUSER == userId);
}

// ============================================================================
// EXPORT DES UTILISATEURS
// ============================================================================
function exportUsers(event) {
    if (event) event.preventDefault();
    if (!filteredUsers?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredUsers.map(user => [
        user.USERNAME || '', user.NOM || '', user.EMAIL || '', user.TELEPHONE || '',
        getUserRoleName(user.ROLEID), (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(user.CREATED_AT)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => {
            if (cell === null || cell === undefined) return '""';
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(','))
        .join('\n');

    const excelHtml = generateExcelHtml(headers, rows);

    downloadFile(csvContent, 'utilisateurs.csv', 'text/csv;charset=utf-8;');
    setTimeout(() => downloadFile(excelHtml, 'utilisateurs.xls', 'application/vnd.ms-excel;charset=utf-8;'), 100);

    Swal.fire({ icon: 'success', title: 'Export réussi', text: `${filteredUsers.length} utilisateur(s) exporté(s)`, timer: 3000 });
    return false;
}

function exportUsersToExcelOnly(event) {
    if (event) event.preventDefault();
    if (!filteredUsers?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredUsers.map(user => [
        user.USERNAME || '', user.NOM || '', user.EMAIL || '', user.TELEPHONE || '',
        getUserRoleName(user.ROLEID), (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(user.CREATED_AT)
    ]);

    downloadFile(generateExcelHtml(headers, rows), 'utilisateurs.xls', 'application/vnd.ms-excel;charset=utf-8;');
    Swal.fire({ icon: 'success', title: 'Export Excel réussi', text: `${filteredUsers.length} utilisateur(s) exporté(s)`, timer: 2000 });
    return false;
}

function exportUsersToCsvOnly(event) {
    if (event) event.preventDefault();
    if (!filteredUsers?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredUsers.map(user => [
        user.USERNAME || '', user.NOM || '', user.EMAIL || '', user.TELEPHONE || '',
        getUserRoleName(user.ROLEID), (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(user.CREATED_AT)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => {
            if (cell === null || cell === undefined) return '""';
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(','))
        .join('\n');

    downloadFile(csvContent, 'utilisateurs.csv', 'text/csv;charset=utf-8;');
    Swal.fire({ icon: 'success', title: 'Export CSV réussi', text: `${filteredUsers.length} utilisateur(s) exporté(s)`, timer: 2000 });
    return false;
}

function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob(["\uFEFF" + content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error(`Erreur téléchargement ${filename}:`, error);
        throw error;
    }
}

function generateExcelHtml(headers, rows) {
    const exportDate = new Date().toLocaleString('fr-FR');
    let html = `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Export Utilisateurs</title>
    <style>th{background:#4CAF50;color:white;border:1px solid #ddd;padding:8px}td{border:1px solid #ddd;padding:8px}table{border-collapse:collapse;width:100%;margin-top:20px}</style>
    </head><body>
    <h2>Liste des Utilisateurs</h2>
    <p>Date d'export : ${exportDate}</p>
    <p>Nombre d'utilisateurs : ${rows.length}</p><hr>
    <table><thead><tr>`;
    headers.forEach(h => html += `<th>${escapeHtml(h)}</th>`);
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => html += `<td>${escapeHtml(String(cell || '-'))}</td>`);
        html += `</tr>`;
    });
    html += `</tbody></table></body></html>`;
    return html;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================================================
// BIND DES ÉVÉNEMENTS
// ============================================================================
function bindButtonEvents() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modal = document.getElementById('addUserModal');
            if (modal && modal.style.display === 'flex') closeAddUserModal(event);
        }
    });
}

// ============================================================================
// UTILITAIRE JSON SÉCURISÉ
// ============================================================================
async function safeJson(res) {
    try {
        const text = await res.text();
        if (!text?.trim()) return { success: false, message: "Réponse vide" };
        return JSON.parse(text);
    } catch (e) {
        console.error("Erreur parsing JSON:", e);
        return { success: false, message: "Erreur de parsing JSON" };
    }
}

// ============================================================================
// RENDRE LES FONCTIONS GLOBALES
// ============================================================================
window.openAddUserModal = openAddUserModal;
window.openEditUserModal = openEditUserModal;
window.closeAddUserModal = closeAddUserModal;
window.saveUser = saveUser;
window.supprimerContact = supprimerContact;
window.exportUsers = exportUsers;
window.exportUsersToExcelOnly = exportUsersToExcelOnly;
window.exportUsersToCsvOnly = exportUsersToCsvOnly;
window.loadUsers = loadUsers;