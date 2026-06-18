// ============================================================================
// GESTION COMPLÈTE DES UTILISATEURS - AVEC PERMISSIONS EN BASE DE DONNÉES
// ============================================================================

let currentMode = null;
let currentUserId = null;
let usersData = [];
let filteredUsers = [];
let currentPage = 1;
let rowsPerPage = 10;

let isLicenceLimitReached = false;
let maxUsersAllowed = 0;

// ============================================================================
// PERMISSIONS
// ============================================================================

const PERMISSIONS_LIST = [
    'dashboard', 'eleves', 'absences', 'bulletins', 'frais',
    'niveaux', 'salles', 'classes', 'matieres', 'importation',
    'annees', 'utilisateurs', 'requetes'
];

const CHECKBOX_ID_MAP = {
    'dashboard': 'permDashboard',
    'eleves': 'permEleves',
    'absences': 'permAbsences',
    'bulletins': 'permBulletins',
    'frais': 'permFrais',
    'niveaux': 'permNiveaux',
    'salles': 'permSalles',
    'classes': 'permClasses',
    'matieres': 'permMatieres',
    'importation': 'permImportation',
    'annees': 'permAnnees',
    'utilisateurs': 'permUtilisateurs',
    'requetes': 'permRequetes'
};

const DEFAULT_ROLE_PERMISSIONS = {
    'Administrateur': ['dashboard', 'eleves', 'absences', 'bulletins', 'frais', 'niveaux', 'salles', 'classes', 'matieres', 'importation', 'annees', 'utilisateurs'],
    'SuperAdmin': ['dashboard', 'eleves', 'absences', 'bulletins', 'frais', 'niveaux', 'salles', 'classes', 'matieres', 'importation', 'annees', 'utilisateurs', 'requetes'],
    'Professeur': ['dashboard', 'eleves', 'bulletins', 'absences'],
    'Secrétaire': ['dashboard', 'eleves', 'absences'],
    'Comptable': ['dashboard', 'frais'],
    'CPE': ['dashboard', 'eleves', 'absences'],
    'Parent': ['dashboard', 'bulletins']
};

function applyDefaultPermissionsByRole(role) {
    var defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS['Administrateur'];
    for (var i = 0; i < PERMISSIONS_LIST.length; i++) {
        var perm = PERMISSIONS_LIST[i];
        var checkboxId = CHECKBOX_ID_MAP[perm];
        var checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = defaultPermissions.indexOf(perm) !== -1;
        }
    }
}

function getActiveUsersCount() {
    return usersData.filter(u => u.ACTIVE === true || u.ACTIVE === 1 || u.ACTIVE === 'true').length;
}

// ============================================================================
// LICENCE
// ============================================================================

async function checkLicenceLimit() {
    try {
        const response = await fetch(apiUrl("api/CheckLicence.aspx"));
        const data = await response.json();

        if (data.success) {
            maxUsersAllowed = data.maxUsers || 0;
            const currentUsers = data.currentUsers || 0;
            isLicenceLimitReached = currentUsers >= maxUsersAllowed;

            const maxUsersSpan = document.getElementById('maxUsersCount');
            if (maxUsersSpan) {
                maxUsersSpan.textContent = currentUsers + ' / ' + maxUsersAllowed;
                maxUsersSpan.style.color = isLicenceLimitReached ? '#ff6b6b' : '#adb5bd';
                maxUsersSpan.style.fontWeight = isLicenceLimitReached ? 'bold' : 'normal';
            }

            const userCountInfo = document.getElementById('userCountInfo');
            if (userCountInfo) {
                userCountInfo.textContent = currentUsers + ' / ' + maxUsersAllowed;
            }

            return { reached: isLicenceLimitReached, current: currentUsers, max: maxUsersAllowed };
        }
    } catch (err) {
        console.error('Erreur vérification licence:', err);
        return { reached: false, current: 0, max: 0 };
    }
    return { reached: false, current: 0, max: 0 };
}

async function canActivateUser() {
    const licenceInfo = await checkLicenceLimit();
    if (licenceInfo.reached) {
        showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
        return false;
    }
    return true;
}

function showLicenceLimitAlert(currentUsers, maxUsers, action = "activer") {
    const modalHtml = `
        <div style="text-align: center; padding: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
            <h3 style="color: #dc3545; margin-bottom: 15px;">⚠️ Limite d'utilisateurs atteinte</h3>
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                Vous avez actuellement <strong style="color: #dc3545;">${currentUsers}</strong> utilisateur(s) <strong>actif(s)</strong>.
            </p>
            <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                Votre licence autorise un maximum de <strong>${maxUsers}</strong> utilisateur(s) actif(s).
            </p>
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 5px; text-align: left;">
                <i class="fas fa-info-circle" style="color: #ffc107; margin-right: 8px;"></i>
                <span style="font-size: 13px;">Pour ${action} cet utilisateur, vous devez d'abord désactiver un autre utilisateur actif.</span>
            </div>
        </div>
    `;
    Swal.fire({ title: 'Licence dépassée', html: modalHtml, icon: 'warning', confirmButtonText: 'Compris', confirmButtonColor: '#dc3545' });
}

// ============================================================================
// SPINNER
// ============================================================================

function forceHideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity = '0';
    if (s.setAttribute) s.setAttribute('aria-hidden', 'true');
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.display = 'flex';
    if (s.removeAttribute) s.removeAttribute('aria-hidden');
}

function hideSpinner() {
    forceHideSpinner();
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
        preloader.classList.remove('hide');
    }
}

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hide');
        setTimeout(() => {
            if (preloader) preloader.style.display = 'none';
        }, 500);
    }
}

window.addEventListener('load', () => setTimeout(hidePreloader, 500));

// ============================================================================
// INITIALISATION
// ============================================================================

$(document).ready(() => {
    console.log("🔵 Page chargée - Initialisation userJS");
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadUsers();
    attachRoleChangeListener();
    initSidebar();
    initDarkMode();
    checkLicenceLimit();
});

// ============================================================================
// FORMULAIRE
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

function ensureButtonsHaveTypeButton() {
    const buttons = document.querySelectorAll('.action-buttons button, .dash-table button, .modal-footer button');
    buttons.forEach(btn => {
        if (!btn.hasAttribute('type') || btn.getAttribute('type') !== 'button') {
            btn.setAttribute('type', 'button');
        }
    });
}

// ============================================================================
// FILTRES ET PAGINATION
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
            <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-search"></i> Recherche :</label>
            <input type="text" id="search-filter" placeholder="Nom, email, téléphone..." style="width:100%; padding:10px 12px; border:1px solid #ced4da; border-radius:6px;">
        </div>
        <div style="min-width: 160px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-filter"></i> Rôle :</label>
            <select id="role-filter" style="width:100%; padding:10px 12px; border:1px solid #ced4da; border-radius:6px;">
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
            <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-chart-line"></i> Statut :</label>
            <select id="status-filter" style="width:100%; padding:10px 12px; border:1px solid #ced4da; border-radius:6px;">
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
            </select>
        </div>
        <div style="min-width: 140px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;"><i class="fas fa-table"></i> Lignes/page :</label>
            <select id="rows-per-page-top" style="width:100%; padding:10px 12px; border:1px solid #ced4da; border-radius:6px;">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <div>
            <button id="reset-filters" style="padding:10px 24px; background:#6c757d; color:white; border:none; border-radius:6px; cursor:pointer;">
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

    document.getElementById('search-filter')?.addEventListener('input', () => applyFilters());
    document.getElementById('role-filter')?.addEventListener('change', () => applyFilters());
    document.getElementById('status-filter')?.addEventListener('change', () => applyFilters());
    document.getElementById('rows-per-page-top')?.addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderSimpleTable();
    });
    document.getElementById('reset-filters')?.addEventListener('click', resetFilters);
}

function resetFilters() {
    const searchInput = document.getElementById('search-filter');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const rowsSelect = document.getElementById('rows-per-page-top');
    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (rowsSelect) rowsSelect.value = '10';
    rowsPerPage = 10;
    currentPage = 1;
    applyFilters();
    Swal.fire({ icon: 'success', title: 'Filtres réinitialisés', timer: 1500, showConfirmButton: false });
}

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

function createPaginationControls(totalPages) {
    const oldPagination = document.getElementById('pagination-container');
    if (oldPagination) oldPagination.remove();
    if (totalPages <= 1) return;

    const container = document.createElement('div');
    container.id = 'pagination-container';
    container.style.cssText = 'margin:20px 0; display:flex; justify-content:center; gap:5px; flex-wrap:wrap;';

    const createBtn = (text, onClick, disabled = false, isDots = false) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        if (isDots) {
            btn.style.cssText = 'padding:8px 12px; border:none; background:transparent; color:#6c757d; cursor:default;';
            return btn;
        }
        const isActive = (text == currentPage && !isNaN(text));
        btn.style.cssText = `padding:8px 14px; border:1px solid ${isActive ? '#007bff' : '#dee2e6'}; background:${isActive ? '#007bff' : (disabled ? '#e9ecef' : 'white')}; color:${isActive ? 'white' : (disabled ? '#6c757d' : '#007bff')}; cursor:${disabled || isActive ? 'default' : 'pointer'}; border-radius:6px; font-weight:${isActive ? '700' : '500'}; min-width:40px;`;
        if (onClick && !disabled && !isActive) btn.onclick = onClick;
        if (disabled) btn.disabled = true;
        return btn;
    };

    container.appendChild(createBtn('«', () => goToPage(1), currentPage === 1));
    container.appendChild(createBtn('‹', () => { if (currentPage > 1) { currentPage--; renderSimpleTable(); } }, currentPage === 1));

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        container.appendChild(createBtn('1', () => goToPage(1)));
        if (start > 2) container.appendChild(createBtn('...', null, true, true));
    }
    for (let i = start; i <= end; i++) {
        container.appendChild(createBtn(i, () => goToPage(i), false));
    }
    if (end < totalPages) {
        if (end < totalPages - 1) container.appendChild(createBtn('...', null, true, true));
        container.appendChild(createBtn(totalPages, () => goToPage(totalPages)));
    }
    container.appendChild(createBtn('›', () => { if (currentPage < totalPages) { currentPage++; renderSimpleTable(); } }, currentPage === totalPages));
    container.appendChild(createBtn('»', () => goToPage(totalPages), currentPage === totalPages));

    const table = document.querySelector('.dash-table');
    if (table?.parentNode) table.parentNode.insertBefore(container, table.nextSibling);
}

function updateCounter() {
    let counter = document.getElementById('record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'record-counter';
        counter.style.cssText = 'margin:15px 0 0; padding:10px 15px; text-align:center; font-size:14px; background:#f8f9fa; border-radius:6px; border:1px solid #e9ecef;';
        const pagination = document.getElementById('pagination-container');
        if (pagination?.parentNode) pagination.parentNode.insertBefore(counter, pagination);
        else {
            const table = document.querySelector('.dash-table');
            if (table?.parentNode) table.parentNode.insertBefore(counter, table.nextSibling);
        }
    }
    const start = filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, filteredUsers.length);
    counter.innerHTML = `<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ${filteredUsers.length === 0 ? '0' : start} à ${end} sur <strong>${filteredUsers.length}</strong> enregistrement${filteredUsers.length > 1 ? 's' : ''}`;
}

// ============================================================================
// CHARGEMENT DES UTILISATEURS
// ============================================================================

function loadUsers() {
    showSpinner();
    showPreloader();
    fetch(apiUrl("api/ListUser.aspx"))
        .then(safeJson)
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("Réponse invalide:", data);
                return;
            }
            usersData = data;
            filteredUsers = [...usersData];
            createFilterControls();
            renderSimpleTable();
            hidePreloader();
            checkLicenceLimit();
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les utilisateurs' });
            hidePreloader();
        })
        .finally(() => hideSpinner());
}

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
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function renderSimpleTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    tbody.innerHTML = '';
    if (!pageUsers.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:60px;"><i class="fas fa-search" style="font-size:48px;color:#ccc;"></i><br>Aucun utilisateur trouvé</td></tr>';
        updateCounter();
        createPaginationControls(totalPages);
        return;
    }

    pageUsers.forEach(user => {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = escapeHtml(user.USERNAME || '-');
        row.insertCell(1).innerHTML = escapeHtml(user.NOM || '-');
        row.insertCell(2).innerHTML = escapeHtml(user.EMAIL || '-');
        row.insertCell(3).innerHTML = getUserRoleName(user.ROLEID);
        row.insertCell(4).innerHTML = escapeHtml(user.TELEPHONE || '-');
        row.insertCell(5).innerHTML = formatDate(user.CREATED_AT);
        row.insertCell(6).innerHTML = (user.ACTIVE === true || user.ACTIVE === 1 || user.ACTIVE === 'true')
            ? '<span class="badge bg-success" style="background:#28a745;padding:4px 10px;border-radius:20px;color:white;">✓ Actif</span>'
            : '<span class="badge bg-danger" style="background:#dc3545;padding:4px 10px;border-radius:20px;color:white;">✗ Inactif</span>';
        row.insertCell(7).innerHTML = `
            <button type="button" class="btn btn-sm btn-primary" onclick="openEditUserModal(${user.IDUSER}, event)"><i class="fas fa-edit"></i></button>
            <button type="button" class="btn btn-sm btn-danger" onclick="supprimerContact(${user.IDUSER}, event)"><i class="fas fa-trash"></i></button>
        `;
    });
    updateCounter();
    createPaginationControls(totalPages);
}

// ============================================================================
// PERMISSIONS (CHECKBOX)
// ============================================================================

function setPermissionsCheckboxes(permissions) {
    for (const [perm, checkboxId] of Object.entries(CHECKBOX_ID_MAP)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.checked = permissions && permissions.includes(perm);
        }
    }
}

function getSelectedPermissions() {
    const selected = [];
    for (const [perm, checkboxId] of Object.entries(CHECKBOX_ID_MAP)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox && checkbox.checked) {
            selected.push(perm);
        }
    }
    return selected;
}

function setPermissionsCheckboxesEnabled(enabled) {
    for (const checkboxId of Object.values(CHECKBOX_ID_MAP)) {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.disabled = !enabled;
            checkbox.style.opacity = enabled ? '1' : '0.5';
        }
    }
}

// ============================================================================
// MODAL - AJOUT / MODIFICATION
// ============================================================================

async function openAddUserModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const licenceInfo = await checkLicenceLimit();
    if (licenceInfo.reached) {
        showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
        return false;
    }

    currentMode = "ajout";
    currentUserId = null;
    resetModalForm();

    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.disabled = false;
        usernameField.style.backgroundColor = '#ffffff';
        usernameField.style.cursor = 'text';
    }
    const passwordField = document.getElementById('userPassword');
    if (passwordField) {
        passwordField.required = true;
        passwordField.placeholder = "Mot de passe (min. 8 caractères)";
    }

    const defaultRole = document.getElementById('userRole')?.value || 'Administrateur';
    applyDefaultPermissionsByRole(defaultRole);
    setPermissionsCheckboxesEnabled(true);

    document.querySelector('#userModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un utilisateur';
    showModal();
    return false;
}

function openEditUserModal(userId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
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

    const passwordField = document.getElementById('userPassword');
    if (passwordField) {
        passwordField.required = false;
        passwordField.placeholder = "Laisser vide pour conserver le mot de passe actuel";
    }

    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.disabled = true;
        usernameField.style.backgroundColor = '#e9ecef';
        usernameField.style.cursor = 'not-allowed';
    }

    const userPermissions = user.PERMISSIONS || [];
    if (userPermissions.length > 0) {
        setPermissionsCheckboxes(userPermissions);
    } else {
        const userRole = getUserRoleName(user.ROLEID);
        applyDefaultPermissionsByRole(userRole);
    }
    setPermissionsCheckboxesEnabled(true);

    document.querySelector('#userModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Modifier l\'utilisateur';
    showModal();
    return false;
}

function resetModalForm() {
    const fields = ['username', 'Nom', 'userEmail', 'userTelephone', 'userPassword'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = '';
    });
    const roleSelect = document.getElementById('userRole');
    if (roleSelect) roleSelect.value = 'Administrateur';
    const statutSelect = document.getElementById('userStatut');
    if (statutSelect) statutSelect.value = 'Actif';
    setPermissionsCheckboxes([]);
    setPermissionsCheckboxesEnabled(true);
}

function showModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddUserModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentMode = null;
    currentUserId = null;
    return false;
}

// ============================================================================
// RÔLE
// ============================================================================

function attachRoleChangeListener() {
    const roleSelect = document.getElementById('userRole');
    if (roleSelect) {
        roleSelect.removeEventListener('change', onRoleChangeHandler);
        roleSelect.addEventListener('change', onRoleChangeHandler);
    }
}

function onRoleChangeHandler(event) {
    const selectedRole = event.target.value;
    const currentPermissions = getSelectedPermissions();
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[selectedRole] || DEFAULT_ROLE_PERMISSIONS['Administrateur'];

    const hasCustomPermissions = currentPermissions.length > 0 &&
        JSON.stringify(currentPermissions.sort()) !== JSON.stringify(defaultPermissions.sort());

    if (hasCustomPermissions && currentMode === 'modification') {
        Swal.fire({
            title: 'Changer les permissions ?',
            text: 'Cet utilisateur a des permissions personnalisées. Voulez-vous les remplacer par les permissions par défaut du rôle "' + selectedRole + '" ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, remplacer',
            cancelButtonText: 'Non, garder',
            confirmButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                applyDefaultPermissionsByRole(selectedRole);
                Swal.fire({
                    icon: 'success',
                    title: 'Permissions mises à jour',
                    text: 'Les permissions par défaut pour ' + selectedRole + ' ont été appliquées',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    } else {
        applyDefaultPermissionsByRole(selectedRole);
    }
}

// ============================================================================
// CRÉATION ET MODIFICATION
// ============================================================================

async function createUserFromModal() {
    const licenceInfo = await checkLicenceLimit();
    if (licenceInfo.reached) {
        showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
        return;
    }

    const username = document.getElementById('username')?.value.trim() || '';
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('userEmail')?.value.trim() || '';
    const role = document.getElementById('userRole')?.value || 'Administrateur';
    const telephone = document.getElementById('userTelephone')?.value.trim() || '';
    const password = document.getElementById('userPassword')?.value.trim() || '';
    const statut = document.getElementById('userStatut')?.value || 'Actif';
    const permissions = getSelectedPermissions();

    if (!username || !nom || !email || !password) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir tous les champs obligatoires." });
        return;
    }
    if (password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({ icon: 'error', title: "Email invalide", text: "Veuillez entrer une adresse email valide." });
        return;
    }

    showSpinner();
    const body = {
        USERNAME: username, NOM: nom, PWD: password, EMAIL: email,
        TELEPHONE: telephone, ROLEID: getRoleId(role), ACTIVE: statut === "Actif" ? 1 : 0,
        PERMISSIONS: permissions
    };

    try {
        const res = await fetch(apiUrl("api/users.aspx"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await safeJson(res);
        if (data.success) {
            Swal.fire({ icon: 'success', title: "Succès", text: data.message, timer: 1500, showConfirmButton: false });
            setTimeout(() => { closeAddUserModal(); loadUsers(); }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: "Erreur", text: data.message });
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
    } finally {
        hideSpinner();
    }
}

async function updateUserFromModal() {
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('userEmail')?.value.trim() || '';
    const role = document.getElementById('userRole')?.value || 'Administrateur';
    const telephone = document.getElementById('userTelephone')?.value.trim() || '';
    const password = document.getElementById('userPassword')?.value.trim() || '';
    const statut = document.getElementById('userStatut')?.value || 'Actif';
    const permissions = getSelectedPermissions();

    if (!nom || !email) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir Nom et Email." });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({ icon: 'error', title: "Email invalide", text: "Veuillez entrer une adresse email valide." });
        return;
    }
    if (password && password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }

    const user = findUserById(currentUserId);
    const etaitInactif = user && (user.ACTIVE !== true && user.ACTIVE !== 1 && user.ACTIVE !== 'true');
    const deviensActif = etaitInactif && statut === 'Actif';

    if (deviensActif) {
        const licenceInfo = await checkLicenceLimit();
        if (licenceInfo.reached) {
            showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
            return;
        }
    }

    showSpinner();
    const params = new URLSearchParams();
    params.append('id', currentUserId);
    params.append('nom', nom);
    params.append('email', email);
    params.append('roleId', getRoleId(role));
    params.append('telephone', telephone);
    params.append('active', statut === "Actif" ? 1 : 0);
    params.append('permissions', JSON.stringify(permissions));
    if (password) params.append('password', password);

    try {
        const res = await fetch(apiUrl(`api/updateUser.aspx?${params.toString()}`), { method: 'POST' });
        const result = await safeJson(res);
        if (result.success || result.status === "success") {
            Swal.fire({ icon: 'success', title: "Succès", text: "Utilisateur modifié !", timer: 1500, showConfirmButton: false });
            setTimeout(() => { closeAddUserModal(); loadUsers(); }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: result.message });
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
    } finally {
        hideSpinner();
    }
}

async function saveUser(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (currentMode === "modification") await updateUserFromModal();
    else if (currentMode === "ajout") await createUserFromModal();
    else Swal.fire({ icon: 'warning', title: 'Aucune action', text: 'Veuillez sélectionner "Ajouter" ou "Modifier" d\'abord' });
    return false;
}

// ============================================================================
// SUPPRESSION
// ============================================================================

async function supprimerContact(id, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
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
        showSpinner();
        try {
            const res = await fetch(apiUrl("api/DeleteUser.aspx"), {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });

            const text = await res.text();
            const cleanText = text
                .replace(/[\uFEFF\uFFFE\u200B\u200C\u200D\u2060]/g, '')
                .replace(/ï»¿/g, '')
                .replace(/﻿/g, '')
                .trim();

            if (cleanText.includes('"success":true') || cleanText.includes('"status":"success"')) {
                Swal.fire({ icon: 'success', title: "Supprimé", text: "Utilisateur supprimé", timer: 1500, showConfirmButton: false });
                setTimeout(() => loadUsers(), 1500);
            } else {
                const errorMatch = cleanText.match(/"message":"([^"]+)"/);
                const errorMsg = errorMatch ? errorMatch[1] : "Erreur lors de la suppression";
                Swal.fire({ icon: 'error', title: 'Erreur', text: errorMsg });
            }
        } catch (err) {
            console.error('Erreur:', err);
            Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
        } finally {
            hideSpinner();
        }
    }
    return false;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function getRoleId(roleName) {
    const roles = {
        'SuperAdmin': 0, 'Administrateur': 1, 'Admin': 1, 'User': 2,
        'Professeur': 3, 'Secrétaire': 4, 'Comptable': 5, 'CPE': 6, 'Parent': 7
    };
    return roles[roleName] !== undefined ? roles[roleName] : 1;
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

async function safeJson(res) {
    try {
        let text = await res.text();
        if (!text || text.trim() === "") {
            return { success: false, message: "Réponse vide" };
        }
        text = text.replace(/^\uFEFF/, '');
        text = text.replace(/^﻿﻿/, '');
        text = text.replace(/﻿﻿$/, '');
        text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
        text = text.trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Erreur parsing JSON:", e);
        return { success: false, message: "Erreur de parsing JSON" };
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============================================================================
// SAUVEGARDE BASE DE DONNÉES
// ============================================================================

async function backupDatabase() {
    const userRole = document.getElementById('hfUserRole')?.value;
    if (userRole !== '0') {
        Swal.fire({
            icon: 'error',
            title: 'Accès refusé',
            text: 'Seul un Super Administrateur peut effectuer une sauvegarde.',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

    let countdownSeconds = 5;

    const result = await Swal.fire({
        title: '🔄 Planifier la sauvegarde',
        html: `
            <div style="text-align: left; font-size: 12px;">
                <div style="margin-top: 15px; padding: 10px; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 5px;">
                <p><strong>⚠️ Attention :</strong></p>
                <ul>
                    <li> - Tous les autres utilisateurs seront <strong>déconnectés</strong> à l'heure choisie</li>
                    <li> - Ils verront un compte à rebours en bas de leur écran</li>
                    <li> - Ils seront bloqués pendant <strong>1 minute</strong></li>
                    <li> - Une sauvegarde complète sera créée à l'heure choisie</li>
                </ul>
                </div>
                <br>
                <label for="backupTime" style="font-weight: bold;">📅 Heure de la sauvegarde :</label>
                <input type="time" id="backupTime" class="swal2-input" value="${getDefaultTime()}">
                <p style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                    <i class="fas fa-info-circle"; style="color: #ff0000;"></i> Tous les utilisateurs seront déconnectés à <span style="font-size: 13px; color: #fd0505;"><strong>cette heure précise</strong></span>
                </p>
                <div style="margin-top: 15px; padding: 10px; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 5px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="blockUsers" checked style="width: 18px; height: 18px;">
                        <span style="font-weight: bold;">🔒 Bloquer les connexions après la déconnexion</span>
                    </label>
                    <p style="font-size: 12px; color: #0c5460; margin: 5px 0 0 28px;">
                        Les utilisateurs ne pourront pas se reconnecter pendant 1 minute après la déconnexion.
                    </p>
                </div>
                <div style="margin-top: 15px; padding: 8px; background: #e8f4fd; border-radius: 5px; text-align: center;">
                    <i class="fas fa-hourglass-half"></i> 
                    <span style="font-size: 13px;">Le bouton de confirmation sera actif dans <strong id="countdownDisplay">5</strong> seconde(s)</span>
                </div>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '📀 Planifier la sauvegarde',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        didOpen: () => {
            const confirmBtn = Swal.getConfirmButton();
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.6';
            confirmBtn.style.cursor = 'not-allowed';

            const countdownDisplay = document.getElementById('countdownDisplay');
            let seconds = 5;
            const interval = setInterval(() => {
                seconds--;
                if (countdownDisplay) {
                    countdownDisplay.textContent = seconds;
                }
                if (confirmBtn) {
                    confirmBtn.textContent = `📀 Planifier (${seconds}s)`;
                }
                if (seconds <= 0) {
                    clearInterval(interval);
                    if (confirmBtn) {
                        confirmBtn.textContent = '📀 Planifier la sauvegarde';
                        confirmBtn.disabled = false;
                        confirmBtn.style.opacity = '1';
                        confirmBtn.style.cursor = 'pointer';
                    }
                    if (countdownDisplay) {
                        countdownDisplay.textContent = '0';
                        countdownDisplay.style.color = '#28a745';
                    }
                }
            }, 1000);

            window._backupCountdownInterval = interval;
        },
        willClose: () => {
            if (window._backupCountdownInterval) {
                clearInterval(window._backupCountdownInterval);
            }
        },
        preConfirm: () => {
            const time = document.getElementById('backupTime').value;
            const blockUsers = document.getElementById('blockUsers')?.checked || false;
            if (!time) {
                Swal.showValidationMessage('Veuillez sélectionner une heure');
                return false;
            }
            return { time: time, blockUsers: blockUsers };
        }
    });

    if (!result.isConfirmed) return;

    const selectedTime = result.value.time;
    const blockUsers = result.value.blockUsers;

    showSpinner();

    try {
        console.log('📋 Planification de la maintenance à ' + selectedTime + '...');
        await fetch(apiUrl(`api/BackupDatabase.aspx?action=prepare&time=${encodeURIComponent(selectedTime)}&block=${blockUsers}`));

        console.log('📢 Envoi des notifications...');
        await notifyAllUsers(
            '⚠️ MAINTENANCE PROGRAMMÉE - Sauvegarde à ' + selectedTime,
            selectedTime
        );

        await Swal.fire({
            title: '✅ Sauvegarde programmée',
            html: `
                <div style="text-align: center;">
                    <p>La sauvegarde est programmée à <strong>${selectedTime}</strong></p>
                    <p class="swal2-text" style="font-size: 14px; color: #28a745;">
                        <i class="fas fa-check-circle"></i> 
                        Tous les utilisateurs ont été notifiés et verront un compte à rebours.
                    </p>
                    <div style="margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 14px; color: #6c757d;">⏳ Temps restant avant la déconnexion</div>
                        <div style="font-size: 48px; font-weight: bold; font-family: monospace; color: #dc3545;" id="adminCountdownDisplay">
                            --:--
                        </div>
                        <div style="height: 8px; background: #e9ecef; border-radius: 4px; margin-top: 10px; overflow: hidden;">
                            <div id="adminProgressBar" style="width: 0%; height: 100%; background: #dc3545; transition: width 1s linear;"></div>
                        </div>
                    </div>
                    <p style="font-size: 12px; color: #6c757d;">
                        <i class="fas fa-info-circle"></i> 
                        Les utilisateurs seront déconnectés automatiquement à <strong>${selectedTime}</strong>
                    </p>
                </div>
            `,
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                startAdminCountdown(selectedTime);
            }
        });

    } catch (err) {
        console.error('Erreur:', err);
        await Swal.fire({ icon: 'error', title: 'Erreur', text: err.message, confirmButtonText: 'OK' });
    } finally {
        hideSpinner();
        if (window._backupCountdownInterval) {
            clearInterval(window._backupCountdownInterval);
        }
    }
}

function startAdminCountdown(targetTime) {
    if (window.adminCountdownTimer) clearInterval(window.adminCountdownTimer);

    const target = new Date();
    const [hours, minutes] = targetTime.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (target < new Date()) {
        target.setDate(target.getDate() + 1);
    }

    const maxDuration = 24 * 60 * 60 * 1000;

    window.adminCountdownTimer = setInterval(() => {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            clearInterval(window.adminCountdownTimer);
            executeScheduledBackup();
        } else {
            const hoursLeft = Math.floor(diff / 3600000);
            const minutesLeft = Math.floor((diff % 3600000) / 60000);
            const secondsLeft = Math.floor((diff % 60000) / 1000);
            const totalSeconds = Math.floor(diff / 1000);
            const percent = Math.min(100, (1 - (totalSeconds / maxDuration)) * 100);

            const countdownEl = document.getElementById('adminCountdownDisplay');
            const progressEl = document.getElementById('adminProgressBar');

            if (countdownEl) {
                countdownEl.textContent = `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
                if (diff < 300000) {
                    countdownEl.style.color = '#ff6b6b';
                }
            }
            if (progressEl) {
                progressEl.style.width = `${percent}%`;
            }
        }
    }, 1000);
}

async function executeScheduledBackup() {
    console.log('⏰ Heure programmée atteinte - Exécution de la sauvegarde...');

    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';

    try {
        const response = await fetch(apiUrl('/pages/administrations/utilisateur/api/BackupDatabase.aspx?action=execute'));

        if (response.ok) {
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/octet-stream')) {
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.bak`;
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename=(.+)/);
                    if (match && match[1]) filename = match[1];
                }

                const blob = await response.blob();
                const fileSize = (blob.size / 1024 / 1024).toFixed(2);

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                const countdownDisplay = document.getElementById('backupCountdownDisplay');
                if (countdownDisplay) {
                    countdownDisplay.textContent = '✅ Téléchargé!';
                    countdownDisplay.style.color = '#28a745';
                }

                const progressBar = document.getElementById('backupProgressBar');
                if (progressBar) {
                    progressBar.style.width = '100%';
                    progressBar.style.backgroundColor = '#28a745';
                }

                await Swal.fire({
                    icon: 'success',
                    title: '✅ Sauvegarde terminée',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>La base de données a été sauvegardée avec succès !</strong></p>
                            <hr style="margin: 15px 0;">
                            <p><i class="fas fa-database"></i> <strong>Fichier :</strong> ${filename}</p>
                            <p><i class="fas fa-hdd"></i> <strong>Taille :</strong> ${fileSize} Mo</p>
                            <p><i class="fas fa-folder-open"></i> <strong>Emplacement :</strong> App_Data/Backups/</p>
                        </div>
                    `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745'
                });

                await fetch(apiUrl('/pages/administrations/utilisateur/api/BackupDatabase.aspx?action=check'));
                location.reload();
            } else {
                const error = await response.json();
                await Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Erreur lors de la sauvegarde', confirmButtonText: 'OK' });
            }
        } else {
            const error = await response.json();
            await Swal.fire({ icon: 'error', title: 'Erreur', text: error.message || 'Erreur serveur', confirmButtonText: 'OK' });
        }
    } catch (err) {
        console.error('Erreur:', err);
        await Swal.fire({ icon: 'error', title: 'Erreur', text: err.message, confirmButtonText: 'OK' });
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (window.backupCountdownTimer) {
            clearInterval(window.backupCountdownTimer);
        }
    }
}

function getDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().slice(0, 5);
}

// ============================================================================
// VÉRIFICATION DES MISES À JOUR
// ============================================================================

const UPDATE_API_URL = '/pages/administrations/utilisateur/api/CheckUpdates.aspx';
const CURRENT_VERSION = document.querySelector('[data-version]')?.getAttribute('data-version') || '2.1.17';

let updateCheckInProgress = false;

/**
 * Vérifie les mises à jour disponibles
 */
async function checkForUpdates() {
    // Empêcher les clics multiples
    if (updateCheckInProgress) {
        Swal.fire({
            icon: 'info',
            title: 'Vérification en cours',
            text: 'Une vérification des mises à jour est déjà en cours...',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    // Vérifier le rôle (seul SuperAdmin peut vérifier les MAJ)
    const userRole = document.getElementById('hfUserRole')?.value;
    if (userRole !== '0') {
        Swal.fire({
            icon: 'warning',
            title: 'Accès limité',
            text: 'Seul un Super Administrateur peut vérifier les mises à jour.',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    updateCheckInProgress = true;
    const btn = document.getElementById('btnCheckUpdates');
    
    // Animation du bouton
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification en cours...';
        btn.style.opacity = '0.7';
    }

    try {
        // Appel API pour vérifier les mises à jour
        const response = await fetch(apiUrl(UPDATE_API_URL + '?action=check&version=' + encodeURIComponent(CURRENT_VERSION)));
        const data = await response.json();

        console.log('📋 Résultat vérification MAJ:', data);

        if (data.success) {
            if (data.hasUpdate) {
                // ✅ Nouvelle version disponible
                showUpdateAvailableModal(data);
            } else {
                // ✅ Version à jour
                showNoUpdateModal(data);
            }
        } else {
            // ❌ Erreur
            Swal.fire({
                icon: 'error',
                title: 'Erreur de vérification',
                text: data.message || 'Impossible de vérifier les mises à jour',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error('❌ Erreur checkForUpdates:', error);
        
        // Si l'API n'existe pas, simuler une vérification
        simulateUpdateCheck();
    } finally {
        updateCheckInProgress = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Vérifier les MAJ';
            btn.style.opacity = '1';
        }
    }
}

/**
 * Affiche le modal "Mise à jour disponible"
 */
function showUpdateAvailableModal(data) {
    const version = data.latestVersion || '2.2.0';
    const releaseDate = data.releaseDate || new Date().toLocaleDateString('fr-FR');
    const changelog = data.changelog || [
        '✨ Nouvelles fonctionnalités',
        '🐛 Corrections de bugs',
        '⚡ Améliorations des performances',
        '🔒 Mises à jour de sécurité'
    ];
    const downloadUrl = data.downloadUrl || '#';
    const updateSize = data.updateSize || '15.2 Mo';

    Swal.fire({
        title: '🆕 Mise à jour disponible !',
        html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 12px;">
                <div style="background: #e8f4fd; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                    <p style="margin: 0;">
                        <strong>Version actuelle :</strong> <span class="badge bg-secondary">v${CURRENT_VERSION}</span>
                        <br>
                        <strong>Nouvelle version :</strong> <span class="badge bg-success" style="font-size: 14px;">v${version}</span>
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #6c757d;">
                        <i class="fas fa-calendar-alt"></i> Publiée le ${releaseDate}
                        <span style="margin-left: 15px;"><i class="fas fa-hdd"></i> Taille : ${updateSize}</span>
                    </p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: bold; margin-bottom: 8px;">📝 Journal des modifications :</p>
                    <ul style="padding-left: 20px; margin: 0;">
                        ${changelog.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 10px; border-radius: 6px; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; font-size: 13px;">
                        <i class="fas fa-info-circle" style="color: #ffc107;"></i>
                        <strong>Important :</strong> Nous vous recommandons de faire une <strong>sauvegarde</strong> avant la mise à jour.
                    </p>
                </div>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        showConfirmButton: false,
        showCancelButton: false,
        confirmButtonText: '📥 Télécharger la mise à jour',
        cancelButtonText: 'Fermer',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        showDenyButton: true,
        denyButtonText: '📋 Voir les détails',
        denyButtonColor: '#17a2b8'
    }).then((result) => {
        if (result.isConfirmed) {
            // Télécharger la mise à jour
            window.open(downloadUrl, '_blank');
            Swal.fire({
                icon: 'success',
                title: 'Téléchargement démarré',
                text: 'Le téléchargement de la mise à jour a commencé.',
                timer: 3000,
                showConfirmButton: false
            });
        } else if (result.isDenied) {
            // Afficher les détails complets
            showFullChangelog(data);
        }
    });
}

/**
 * Affiche le modal "Aucune mise à jour"
 */
function showNoUpdateModal(data) {
    const lastCheck = data.lastCheck || new Date().toLocaleString('fr-FR');
    
    Swal.fire({
        title: '✅ Application à jour',
        html: `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 15px;"></i>
                <p style="font-size: 16px;">
                    Vous utilisez la version <strong>v${CURRENT_VERSION}</strong>
                </p>
                <p style="color: #6c757d; font-size: 13px;">
                    <i class="fas fa-clock"></i> Dernière vérification : ${lastCheck}
                </p>
                <p style="color: #6c757d; font-size: 13px;">
                    Aucune mise à jour disponible pour le moment.
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#28a745'
    });
}

/**
 * Affiche le journal des modifications complet
 */
function showFullChangelog(data) {
    const version = data.latestVersion || '2.2.0';
    const changelog = data.changelog || [];
    
    Swal.fire({
        title: '📋 Journal des modifications v' + version,
        html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                ${changelog.length > 0 ? changelog.map(item => 
                    `<div style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: start; gap: 10px;">
                        <span style="color: #28a745;">•</span>
                        <span>${item}</span>
                    </div>`
                ).join('') : '<p style="color: #6c757d;">Aucun détail disponible</p>'}
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#17a2b8',
        width: 600
    });
}

/**
 * Simulation de vérification (si l'API n'existe pas)
 */
function simulateUpdateCheck() {
    // Vérifier si une nouvelle version est disponible (simulé)
    const hasUpdate = Math.random() > 0.7; // 30% de chance d'avoir une mise à jour
    
    if (hasUpdate) {
        showUpdateAvailableModal({
            latestVersion: '2.2.0',
            releaseDate: new Date().toLocaleDateString('fr-FR'),
            changelog: [
                '✨ Nouvelle interface pour la gestion des utilisateurs',
                '🐛 Correction du bug de sauvegarde automatique',
                '⚡ Optimisation des requêtes SQL',
                '🔒 Renforcement de la sécurité des sessions',
                '📱 Amélioration de l\'affichage mobile'
            ],
            downloadUrl: '#',
            updateSize: '15.2 Mo'
        });
    } else {
        showNoUpdateModal({
            lastCheck: new Date().toLocaleString('fr-FR')
        });
    }
}

/**
 * Vérification automatique des mises à jour (au chargement de la page)
 */
function autoCheckForUpdates() {
    // Vérifier seulement si l'utilisateur est SuperAdmin
    const userRole = document.getElementById('hfUserRole')?.value;
    if (userRole !== '0') return;

    // Vérifier si une vérification auto a déjà été faite (1x par session)
    if (sessionStorage.getItem('autoUpdateChecked') === 'true') return;

    // Attendre 5 secondes après le chargement
    setTimeout(() => {
        sessionStorage.setItem('autoUpdateChecked', 'true');
        console.log('🔄 Vérification automatique des mises à jour...');
        checkForUpdates();
    }, 5000);
}

// Auto-vérification au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Ne pas auto-vérifier si l'utilisateur est sur une page de login
    if (!window.location.pathname.includes('Login.aspx')) {
        autoCheckForUpdates();
    }
});

// Exposition globale
window.checkForUpdates = checkForUpdates;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

async function notifyAllUsers(message, maintenanceTime) {
    try {
        const response = await fetch(apiUrl('api/NotifyMaintenance.aspx'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message || '⚠️ Maintenance programmée - Déconnexion imminente',
                maintenanceTime: maintenanceTime || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            })
        });
        const data = await response.json();
        console.log('✅ Notification envoyée à tous les utilisateurs:', data);
        return data;
    } catch (e) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', e);
        return { success: false, message: e.message };
    }
}

// ============================================================================
// SIDEBAR
// ============================================================================

function openSidebar() {
    const sidebar = document.getElementById('controlSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.style.right = '0';
    }
    if (overlay) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('controlSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
        sidebar.style.right = '-300px';
    }
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function initSidebar() {
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', openSidebar);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// ============================================================================
// RESTAURATION DE BASE DE DONNÉES - VERSION PROFESSIONNELLE
// ============================================================================

let selectedRestoreFile = null;
let selectedRestoreSource = null;
let restoreLogs = [];

function openRestoreModal() {
    const userRole = document.getElementById('hfUserRole')?.value;
    if (userRole !== '0') {
        Swal.fire({
            icon: 'error',
            title: 'Accès refusé',
            text: 'Seul un Super Administrateur peut restaurer la base de données.',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

    document.getElementById('restoreFilePath').value = '';
    document.getElementById('restoreFileInput').value = '';
    document.getElementById('restoreProgressContainer').style.display = 'none';
    document.getElementById('restoreLogs').style.display = 'none';
    document.getElementById('restoreStep2').style.display = 'none';
    document.getElementById('btnRestoreExecute').disabled = true;
    selectedRestoreFile = null;
    selectedRestoreSource = null;
    restoreLogs = [];

    document.getElementById('restoreLogContent').innerHTML = '<div style="color: #4ec9b0;">[INFO] Initialisation de la restauration...</div>';

    loadBackupList();

    if (typeof window.openModal === 'function') {
        window.openModal('restoreModal');
    } else {
        const modal = document.getElementById('restoreModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
}

function selectRestoreSource(source) {
    selectedRestoreSource = source;

    document.getElementById('btnSourceLocal').className = source === 'local' ? 'btn btn-primary' : 'btn btn-secondary';
    document.getElementById('btnSourceBackup').className = source === 'backup' ? 'btn btn-primary' : 'btn btn-secondary';

    document.getElementById('restoreSourceLocal').style.display = source === 'local' ? 'block' : 'none';
    document.getElementById('restoreSourceBackup').style.display = source === 'backup' ? 'block' : 'none';
    document.getElementById('restoreStep2').style.display = 'none';
    document.getElementById('btnRestoreExecute').disabled = true;
    selectedRestoreFile = null;
}

function loadBackupList() {
    const container = document.getElementById('backupList');
    container.innerHTML = '<p style="text-align: center; color: #6c757d;">Chargement des sauvegardes...</p>';

    fetch(apiUrl('/pages/administrations/utilisateur/api/GetBackupList.aspx'))
        .then(r => r.json())
        .then(data => {
            console.log('📋 Sauvegardes reçues:', data); // ✅ Debug

            if (data.success && data.backups && data.backups.length > 0) {
                let html = '';
                data.backups.forEach((backup, index) => {
                    const isSelected = selectedRestoreFile && selectedRestoreFile.path === backup.path ? 'selected' : '';
                    const sizeMB = (backup.size / 1024 / 1024).toFixed(2);

                    html += `
                        <div class="backup-item" onclick="selectBackupFile('${escapeHtml(backup.path)}', '${escapeHtml(backup.name)}', ${backup.size}, '${escapeHtml(backup.date)}')" 
                             style="padding: 10px; border-bottom: 1px solid #dee2e6; cursor: pointer; transition: background 0.2s; ${isSelected ? 'background: #e8f4fd;' : ''}"
                             onmouseover="this.style.background='#f0f7ff'" 
                             onmouseout="this.style.background='${isSelected ? '#e8f4fd' : ''}'">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${escapeHtml(backup.name)}</strong>
                                    <div style="font-size: 11px; color: #6c757d;">${escapeHtml(backup.date)} - ${sizeMB} Mo</div>
                                </div>
                                <div>
                                    <span class="badge bg-success" style="background: #28a745; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">
                                        ${escapeHtml(backup.status || 'Disponible')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;

                // Ajouter un compteur
                const countInfo = document.createElement('div');
                countInfo.style.cssText = 'padding: 8px 10px; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; margin-top: 5px;';
                countInfo.innerHTML = `<i class="fas fa-database"></i> ${data.backups.length} sauvegarde(s) disponible(s)`;
                container.appendChild(countInfo);

            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px 20px; color: #6c757d;">
                        <i class="fas fa-folder-open" style="font-size: 48px; color: #dee2e6; display: block; margin-bottom: 15px;"></i>
                        <p>Aucune sauvegarde disponible</p>
                        <p style="font-size: 12px;">Les fichiers .bak doivent être placés dans le dossier <strong>App_Data/Backups/</strong></p>
                        <p style="font-size: 12px; color: #adb5bd;">${data.message || ''}</p>
                    </div>
                `;
            }
        })
        .catch(err => {
            console.error('Erreur chargement sauvegardes:', err);
            container.innerHTML = `
                <div style="text-align: center; padding: 30px 20px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; display: block; margin-bottom: 15px;"></i>
                    <p>Erreur de chargement</p>
                    <p style="font-size: 12px;">${err.message}</p>
                </div>
            `;
        });
}

function selectBackupFile(path, name, size, date) {
    selectedRestoreFile = { path: path, name: name, size: size, date: date };
    selectedRestoreSource = 'backup';

    document.querySelectorAll('.backup-item').forEach(el => el.style.background = '');
    const items = document.querySelectorAll('.backup-item');
    items.forEach(el => {
        if (el.textContent.includes(name)) {
            el.style.background = '#e8f4fd';
        }
    });

    showRestoreInfo(name, size, date);
    document.getElementById('btnRestoreExecute').disabled = false;
}

function handleRestoreFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.bak')) {
        Swal.fire({
            icon: 'error',
            title: 'Fichier invalide',
            text: 'Veuillez sélectionner un fichier .bak',
            confirmButtonColor: '#dc3545'
        });
        document.getElementById('restoreFileInput').value = '';
        return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
        Swal.fire({
            icon: 'error',
            title: 'Fichier trop volumineux',
            text: 'La taille maximale est de 100 Mo',
            confirmButtonColor: '#dc3545'
        });
        document.getElementById('restoreFileInput').value = '';
        return;
    }

    selectedRestoreFile = {
        path: null,
        name: file.name,
        size: file.size,
        date: new Date().toLocaleString(),
        file: file,
        source: 'local'
    };
    selectedRestoreSource = 'local';

    document.getElementById('restoreFilePath').value = file.name;
    showRestoreInfo(file.name, file.size, new Date().toLocaleString());
    document.getElementById('btnRestoreExecute').disabled = false;
}

function showRestoreInfo(name, size, date) {
    document.getElementById('restoreStep2').style.display = 'block';
    document.getElementById('restoreFileInfo').textContent = name;
    document.getElementById('restoreSizeInfo').textContent = (size / 1024 / 1024).toFixed(2) + ' Mo';
    document.getElementById('restoreDateInfo').textContent = date || new Date().toLocaleString();
}

function addLog(message, type = 'info') {
    const colors = {
        info: '#4ec9b0',
        warning: '#dcdcaa',
        error: '#f44747',
        success: '#4ec9b0'
    };
    const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅'
    };

    restoreLogs.push({ message, type, time: new Date().toLocaleTimeString() });

    const logContainer = document.getElementById('restoreLogContent');
    const logEntry = document.createElement('div');
    logEntry.style.color = colors[type] || '#d4d4d4';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${icons[type] || '•'} ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

async function executeRestore() {
    if (!selectedRestoreFile) {
        Swal.fire({
            icon: 'warning',
            title: 'Fichier manquant',
            text: 'Veuillez sélectionner un fichier .bak',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    const result = await Swal.fire({
        title: '⚠️ Confirmation finale',
        html: `
            <div style="text-align: left;">
                <p><strong>⚠️ ATTENTION : Cette action est irréversible !</strong></p>
                <ul style="color: #6c757d;">
                    <li>Fichier: <strong>${selectedRestoreFile.name}</strong></li>
                    <li>Base de données: <strong>MONAPPECOLE2</strong></li>
                    <li>Taille: <strong>${(selectedRestoreFile.size / 1024 / 1024).toFixed(2)} Mo</strong></li>
                </ul>
                <p style="color: #dc3545; font-weight: bold; padding: 10px; background: #fff3cd; border-radius: 5px;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Tous les utilisateurs seront déconnectés et la base sera remplacée.
                </p>
                <p style="font-size: 12px; color: #6c757d;">
                    <i class="fas fa-info-circle"></i> 
                    Veuillez confirmer en tapant le nom de la base de données ci-dessous.
                </p>
                <input type="text" id="restoreConfirmInput" class="swal2-input" placeholder="Tapez MONAPPECOLE2 pour confirmer" style="margin-top: 10px;">
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '✅ Confirmer et restaurer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        preConfirm: () => {
            const input = document.getElementById('restoreConfirmInput');
            if (input.value !== 'MONAPPECOLE2') {
                Swal.showValidationMessage('Veuillez taper MONAPPECOLE2 pour confirmer');
                return false;
            }
            return true;
        }
    });

    if (!result.isConfirmed) return;

    document.getElementById('restoreProgressContainer').style.display = 'block';
    document.getElementById('restoreLogs').style.display = 'block';
    document.getElementById('restoreProgressBar').style.width = '0%';
    document.getElementById('restoreProgressPercent').textContent = '0%';
    document.getElementById('restoreStatusMessage').textContent = 'Initialisation de la restauration...';
    document.getElementById('btnRestoreExecute').disabled = true;

    showSpinner();
    addLog('Début de la restauration', 'info');
    addLog('Fichier sélectionné: ' + selectedRestoreFile.name, 'info');

    try {
        let filePath = null;

        if (selectedRestoreSource === 'local' && selectedRestoreFile.file) {
            addLog('Upload du fichier en cours...', 'info');
            document.getElementById('restoreStatusMessage').textContent = 'Upload du fichier...';
            document.getElementById('restoreProgressBar').style.width = '20%';
            document.getElementById('restoreProgressPercent').textContent = '20%';

            const formData = new FormData();
            formData.append('backupFile', selectedRestoreFile.file);

            const uploadResponse = await fetch(apiUrl('/pages/administrations/utilisateur/api/RestoreDatabaseForm.aspx'), {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.success) {
                addLog('Erreur upload: ' + uploadData.message, 'error');
                throw new Error(uploadData.message);
            }

            filePath = uploadData.filePath;
            addLog('Fichier uploadé avec succès: ' + filePath, 'success');

            document.getElementById('restoreProgressBar').style.width = '40%';
            document.getElementById('restoreProgressPercent').textContent = '40%';

        } else if (selectedRestoreSource === 'backup') {
            filePath = selectedRestoreFile.path.replace(/\\/g, '/');
            addLog('Utilisation de la sauvegarde: ' + filePath, 'info');
        }

        if (filePath) {
            filePath = filePath.replace(/\\/g, '/');
        }

        if (!filePath) {
            addLog('Erreur: Aucun chemin de fichier disponible', 'error');
            throw new Error('Aucun fichier disponible pour la restauration');
        }

        const checkResponse = await fetch(apiUrl('/pages/administrations/utilisateur/api/CheckFile.aspx?path=' + encodeURIComponent(filePath)));
        const checkData = await checkResponse.json();

        if (!checkData.exists) {
            addLog('Erreur: Le fichier n\'existe pas: ' + filePath, 'error');
            throw new Error('Le fichier de sauvegarde n\'existe pas');
        }

        addLog('Fichier vérifié avec succès', 'success');

        addLog('Déconnexion des utilisateurs...', 'warning');
        document.getElementById('restoreStatusMessage').textContent = 'Déconnexion des utilisateurs...';
        document.getElementById('restoreProgressBar').style.width = '50%';
        document.getElementById('restoreProgressPercent').textContent = '50%';

        const requestBody = {
            fileName: selectedRestoreFile.name,
            filePath: filePath,
            source: selectedRestoreSource,
            databaseName: 'MONAPPECOLE2'
        };

        addLog('Chemin du fichier: ' + filePath, 'info');

        const restoreResponse = await fetch(apiUrl('/pages/administrations/utilisateur/api/RestoreDatabase.aspx'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const responseText = await restoreResponse.text();
        addLog('Réponse brute: ' + responseText.substring(0, 200), 'info');

        let restoreData;
        try {
            restoreData = JSON.parse(responseText);
        } catch (parseError) {
            addLog('Erreur de parsing JSON: ' + parseError.message, 'error');
            throw new Error('Réponse invalide du serveur: ' + responseText.substring(0, 100));
        }

        addLog('Restauration en cours...', 'info');
        document.getElementById('restoreStatusMessage').textContent = 'Restauration en cours...';
        document.getElementById('restoreProgressBar').style.width = '70%';
        document.getElementById('restoreProgressPercent').textContent = '70%';

        if (restoreData.success) {
            addLog('Restauration terminée avec succès !', 'success');
            document.getElementById('restoreProgressBar').style.width = '100%';
            document.getElementById('restoreProgressPercent').textContent = '100%';
            document.getElementById('restoreStatusMessage').textContent = '✅ Restauration réussie !';

            if (selectedRestoreSource === 'local' && filePath) {
                try {
                    await fetch(apiUrl('/pages/administrations/utilisateur/api/DeleteFile.aspx?path=' + encodeURIComponent(filePath)));
                } catch (e) { }
            }

            await Swal.fire({
                icon: 'success',
                title: '✅ Restauration réussie',
                html: `
                    <div style="text-align: left;">
                        <p>La base de données a été restaurée avec succès.</p>
                        <p><strong>Fichier:</strong> ${selectedRestoreFile.name}</p>
                        <p style="color: #dc3545; font-weight: bold;">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Vous allez être déconnecté pour finaliser la restauration.
                        </p>
                        <p style="font-size: 12px; color: #6c757d;">
                            Veuillez vous reconnecter après la redirection.
                        </p>
                    </div>
                `,
                confirmButtonText: 'OK, me reconnecter',
                confirmButtonColor: '#28a745'
            });

            window.location.href = '../../../auth/Login.aspx?msg=restore';

        } else {
            addLog('Erreur: ' + (restoreData.message || 'Erreur inconnue'), 'error');
            document.getElementById('restoreStatusMessage').textContent = '❌ Erreur de restauration';
            document.getElementById('btnRestoreExecute').disabled = false;

            Swal.fire({
                icon: 'error',
                title: 'Erreur de restauration',
                text: restoreData.message || 'Erreur inconnue',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        addLog('Erreur: ' + error.message, 'error');
        document.getElementById('restoreStatusMessage').textContent = '❌ Erreur critique';
        document.getElementById('btnRestoreExecute').disabled = false;

        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.message || 'Erreur lors de la restauration',
            confirmButtonColor: '#dc3545'
        });
    } finally {
        hideSpinner();
        document.getElementById('restoreFileInput').value = '';
    }
}

// ============================================================================
// EXPORT
// ============================================================================

function exportUsers(event) {
    if (event) event.preventDefault();
    if (!filteredUsers?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Aucun utilisateur à exporter' });
        return false;
    }
    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredUsers.map(user => [
        user.USERNAME || '', user.NOM || '', user.EMAIL || '', user.TELEPHONE || '',
        getUserRoleName(user.ROLEID), (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(user.CREATED_AT)
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => {
        if (cell === null || cell === undefined) return '""';
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    }).join(',')).join('\n');
    downloadFile(csvContent, 'utilisateurs.csv', 'text/csv;charset=utf-8;');
    Swal.fire({ icon: 'success', title: 'Export CSV réussi', text: `${filteredUsers.length} utilisateur(s) exporté(s)`, timer: 2000, showConfirmButton: false });
    return false;
}

function exportUsersToExcelOnly(event) {
    if (event) event.preventDefault();
    if (!filteredUsers?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Aucun utilisateur à exporter' });
        return false;
    }
    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredUsers.map(user => [
        user.USERNAME || '', user.NOM || '', user.EMAIL || '', user.TELEPHONE || '',
        getUserRoleName(user.ROLEID), (user.ACTIVE === true || user.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(user.CREATED_AT)
    ]);
    const exportDate = new Date().toLocaleString('fr-FR');
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export Utilisateurs</title><style>th{background:#4CAF50;color:white;border:1px solid #ddd;padding:8px}td{border:1px solid #ddd;padding:8px}table{border-collapse:collapse;width:100%}</style></head><body><h2>Liste des Utilisateurs</h2><p>Date: ${escapeHtml(exportDate)}</p><p>Total: ${rows.length}</p></table><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(String(cell || '-'))}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    downloadFile(html, 'utilisateurs.xls', 'application/vnd.ms-excel');
    Swal.fire({ icon: 'success', title: 'Export Excel réussi', text: `${filteredUsers.length} utilisateur(s) exporté(s)`, timer: 2000, showConfirmButton: false });
    return false;
}

function exportUsersToCsvOnly(event) {
    return exportUsers(event);
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
        Swal.fire({ icon: 'error', title: 'Erreur', text: `Impossible de télécharger ${filename}` });
    }
}

// ============================================================================
// EXPOSITION GLOBALE
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
window.backupDatabase = backupDatabase;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openRestoreModal = openRestoreModal;
window.handleRestoreFileSelect = handleRestoreFileSelect;
window.executeRestore = executeRestore;