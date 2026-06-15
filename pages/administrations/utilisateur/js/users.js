// ============================================================================
// GESTION COMPLÈTE DES UTILISATEURS - AVEC PERMISSIONS EN BASE DE DONNÉES
// ============================================================================

let currentMode = null; // "ajout" ou "modification"
let currentUserId = null;
let usersData = [];
let filteredUsers = [];
let currentPage = 1;
let rowsPerPage = 10;

// Indicateur de dépassement de licence
let isLicenceLimitReached = false;
let maxUsersAllowed = 0;

// Maintenance de la base de données
let maintenanceInterval = null;
let countdownInterval = null;

// Liste de toutes les permissions disponibles
const PERMISSIONS_LIST = [
    'dashboard', 'eleves', 'absences', 'bulletins', 'frais',
    'niveaux', 'salles', 'classes', 'matieres', 'importation',
    'annees', 'utilisateurs', 'requetes'
];

// Mapping des IDs de checkbox
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

// Fonction pour compter les utilisateurs actifs (utile pour le debug)
function getActiveUsersCount() {
    return usersData.filter(u => u.ACTIVE === true || u.ACTIVE === 1 || u.ACTIVE === 'true').length;
}

// ============================================================================
// VÉRIFICATION DE LA LICENCE (NOMBRE MAX D'UTILISATEURS)
// ============================================================================

async function checkLicenceLimit() {
    try {
        const response = await fetch("api/CheckLicence.aspx");
        const data = await response.json();
        
        if (data.success) {
            maxUsersAllowed = data.maxUsers || 0;
            const currentUsers = data.currentUsers || 0;
            
            isLicenceLimitReached = currentUsers >= maxUsersAllowed;
            
            // Mettre à jour l'affichage dans le sidebar
            const maxUsersSpan = document.getElementById('maxUsersCount');
            if (maxUsersSpan) {
                maxUsersSpan.textContent = currentUsers + ' / ' + maxUsersAllowed;
                if (isLicenceLimitReached) {
                    maxUsersSpan.style.color = '#ff6b6b';
                    maxUsersSpan.style.fontWeight = 'bold';
                } else {
                    maxUsersSpan.style.color = '#adb5bd';
                    maxUsersSpan.style.fontWeight = 'normal';
                }
            }
            
            // Mettre à jour le compteur dans l'en-tête
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

// Vérifier si on peut activer un utilisateur (changement de statut)
async function canActivateUser() {
    const licenceInfo = await checkLicenceLimit();
    if (licenceInfo.reached) {
        // Passer les bons paramètres à la fonction d'alerte
        showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
        return false;
    }
    return true;
}

// Afficher une alerte si la limite est atteinte
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
    
    Swal.fire({
        title: 'Licence dépassée',
        html: modalHtml,
        icon: 'warning',
        confirmButtonText: 'Compris',
        confirmButtonColor: '#dc3545'
    });
}

// ============================================================================
// PERMISSIONS PAR DÉFAUT SELON LE RÔLE
// ============================================================================

const DEFAULT_ROLE_PERMISSIONS = {
    'Administrateur': [
        'dashboard', 'eleves', 'absences', 'bulletins', 'frais',
        'niveaux', 'salles', 'classes', 'matieres', 'importation',
        'annees', 'utilisateurs'
    ],
    'SuperAdmin': [
        'dashboard', 'eleves', 'absences', 'bulletins', 'frais',
        'niveaux', 'salles', 'classes', 'matieres', 'importation',
        'annees', 'utilisateurs', 'requetes'
    ],
    'Professeur': [
        'dashboard', 'eleves', 'bulletins', 'absences'
    ],
    'Secrétaire': [
        'dashboard', 'eleves', 'absences'
    ],
    'Comptable': [
        'dashboard', 'frais'
    ],
    'CPE': [
        'dashboard', 'eleves', 'absences'
    ],
    'Parent': [
        'dashboard', 'bulletins'
    ]
};

// Appliquer les permissions par défaut selon le rôle
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

// ============================================================================
// INITIALISATION
// ============================================================================
$(document).ready(() => {
    console.log("🔵 Page chargée - Initialisation");
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadUsers();
    attachRoleChangeListener();
    initSidebar();
    initDarkMode();
    checkLicenceLimit(); // Vérifier la limite au chargement
});

// ============================================================================
// SPINNER
// ============================================================================
function forceHideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity = '0';
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.display = 'flex';
}

function hideSpinner() { forceHideSpinner(); }

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
// EMPÊCHER SOUMISSION AUTO
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
    fetch("api/ListUser.aspx")
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
            checkLicenceLimit(); // Vérifier la limite après chargement
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
// GESTION DES PERMISSIONS (CHECKBOX)
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
    
    // Vérifier la limite avant d'ouvrir le modal
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
// ÉCOUTEUR DE CHANGEMENT DE RÔLE
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
    // Vérifier à nouveau la limite avant création
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
        const res = await fetch("api/users.aspx", {
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

    // ============================================================
    // VÉRIFICATION : Si on active un utilisateur et que la limite est atteinte
    // ============================================================
    const user = findUserById(currentUserId);
    const etaitInactif = user && (user.ACTIVE !== true && user.ACTIVE !== 1 && user.ACTIVE !== 'true');
    const deviensActif = etaitInactif && statut === 'Actif';
    
    if (deviensActif) {
        // Vérifier la limite avant activation
        const licenceInfo = await checkLicenceLimit();
        if (licenceInfo.reached) {
            showLicenceLimitAlert(licenceInfo.current, licenceInfo.max);
            return; // Bloquer la modification
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
        const res = await fetch(`api/updateUser.aspx?${params.toString()}`, { method: 'POST' });
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
            const res = await fetch("api/DeleteUser.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });
            
            const text = await res.text();
            
            // Nettoyage agressif du texte
            const cleanText = text
                .replace(/[\uFEFF\uFFFE\u200B\u200C\u200D\u2060]/g, '')
                .replace(/ï»¿/g, '')
                .replace(/﻿/g, '')
                .trim();
            
            // Vérifier si la réponse contient "success"
            if (cleanText.includes('"success":true') || cleanText.includes('"status":"success"')) {
                Swal.fire({ 
                    icon: 'success', 
                    title: "Supprimé", 
                    text: "Utilisateur supprimé", 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                setTimeout(() => loadUsers(), 1500);
            } else {
                // Extraire le message d'erreur
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
// FONCTIONS UTILITAIRES
// ============================================================================
function getRoleId(roleName) {
    const roles = { 'SuperAdmin': 0, 'Administrateur': 1, 'Admin': 1, 'User': 2,
        'Professeur': 3, 'Secrétaire': 4, 'Comptable': 5, 'CPE': 6, 'Parent': 7 };
    return roles[roleName] !== undefined ? roles[roleName] : 1;
}

function getUserRoleName(roleId) {
    const roles = { 0: 'SuperAdmin', 1: 'Administrateur', 2: 'User', 3: 'Professeur',
        4: 'Secrétaire', 5: 'Comptable', 6: 'CPE', 7: 'Parent' };
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
        
        // Supprimer les caractères BOM (début et fin)
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
// MODE SOMBRE (DARK MODE)
// ============================================================================

function initDarkMode() {
    const toggle = document.getElementById('toggleDarkMode');
    if (!toggle) return;
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }
    
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// ============================================================================
// CONTROL SIDEBAR (BARRE LATÉRALE DROITE)
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
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// ============================================================================
// SAUVEGARDE BASE DE DONNÉES
// ============================================================================

async function backupDatabase() {
    // Vérifier d'abord si l'utilisateur est SuperAdmin
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
    
    // Demander confirmation avec horaire
    const { value: selectedTime } = await Swal.fire({
        title: '🔄 Sauvegarde de la base de données',
        html: `
            <div style="text-align: left;">
                <p><strong>⚠️ Attention :</strong></p>
                <ul>
                    <li>Tous les utilisateurs (sauf vous) seront déconnectés</li>
                    <li>La base sera en mode maintenance pendant quelques minutes</li>
                    <li>Une sauvegarde complète sera créée</li>
                </ul>
                <br>
                <label for="backupTime" style="font-weight: bold;">📅 Heure de la sauvegarde :</label>
                <input type="time" id="backupTime" class="swal2-input" value="${getDefaultTime()}">
                <p style="font-size: 12px; color: #6c757d; margin-top: 5px;">
                    <i class="fas fa-info-circle"></i> La sauvegarde s'effectuera dans 5 minutes si aucune heure n'est spécifiée
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '📀 Démarrer la sauvegarde',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#28a745',
        preConfirm: () => {
            const time = document.getElementById('backupTime').value;
            return time;
        }
    });
    
    if (!selectedTime) return;
    
    showSpinner();
    
    try {
        // Phase 1 : Préparer la sauvegarde et avertir les utilisateurs
        const prepareResponse = await fetch(`api/BackupDatabase.aspx?action=prepare&time=${encodeURIComponent(selectedTime)}`);
        const prepareData = await prepareResponse.json();
        
        if (!prepareData.success) {
            Swal.fire({ icon: 'error', title: 'Erreur', text: prepareData.message });
            return;
        }
        
        // Afficher la confirmation
        await Swal.fire({
            title: '✅ Sauvegarde programmée',
            html: `
                <p>La sauvegarde est programmée à <strong>${selectedTime}</strong></p>
                <p>Un message sera envoyé à tous les utilisateurs.</p>
                <div class="progress" style="height: 20px; margin-top: 15px;">
                    <div id="countdownProgress" class="progress-bar" style="width: 0%; background-color: #28a745;"></div>
                </div>
                <p id="countdownMessage" style="margin-top: 10px; font-size: 12px;">Attente...</p>
            `,
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                startCountdownToBackup(selectedTime);
            }
        });
        
    } catch (err) {
        console.error('Erreur:', err);
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message });
    } finally {
        hideSpinner();
    }
}

function getDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().slice(0, 5);
}

function startCountdownToBackup(targetTime) {
    const target = new Date();
    const [hours, minutes] = targetTime.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0);
    
    countdownInterval = setInterval(() => {
        const now = new Date();
        const diff = target - now;
        
        if (diff <= 0) {
            clearInterval(countdownInterval);
            executeBackupNow();
        } else {
            const minutesLeft = Math.floor(diff / 60000);
            const secondsLeft = Math.floor((diff % 60000) / 1000);
            const totalSeconds = Math.floor(diff / 1000);
            const maxSeconds = 5 * 60; // 5 minutes max
            const percent = Math.min(100, (1 - (totalSeconds / maxSeconds)) * 100);
            
            const progressBar = document.getElementById('countdownProgress');
            const messageEl = document.getElementById('countdownMessage');
            
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (messageEl) messageEl.textContent = `⏳ Sauvegarde dans ${minutesLeft} min ${secondsLeft} sec...`;
        }
    }, 1000);
}

async function executeBackupNow() {
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) spinner.style.display = 'flex';
    
    try {
        const response = await fetch('api/BackupDatabase.aspx?action=execute');
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/octet-stream')) {
                // Récupérer le nom du fichier depuis l'en-tête Content-Disposition
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `backup_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.bak`;
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
                
                // Afficher la confirmation avec taille du fichier
                const result = await Swal.fire({
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
                
                if (result.isConfirmed) {
                    location.reload();
                }
            } else {
                const error = await response.json();
                await Swal.fire({ 
                    icon: 'error', 
                    title: 'Erreur', 
                    text: error.message || 'Erreur lors de la sauvegarde',
                    confirmButtonText: 'OK'
                });
            }
        } else {
            const error = await response.json();
            await Swal.fire({ 
                icon: 'error', 
                title: 'Erreur', 
                text: error.message || 'Erreur serveur',
                confirmButtonText: 'OK'
            });
        }
    } catch (err) {
        console.error('Erreur:', err);
        await Swal.fire({ 
            icon: 'error', 
            title: 'Erreur', 
            text: err.message,
            confirmButtonText: 'OK'
        });
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (backupCountdownTimer) clearInterval(backupCountdownTimer);
    }
}

async function notifyAllUsers() {
    // Fonction désactivée car le fichier NotifyMaintenance.aspx n'existe pas
    console.log('Notification ignorée');
    return;
    
    // Code original commenté
    // try {
    //     await fetch('api/NotifyMaintenance.aspx', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ message: 'Sauvegarde en cours - Déconnexion imminente' })
    //     });
    // } catch (e) {
    //     console.log('Notification non envoyée');
    // }
}

// Fonction pour vérifier périodiquement si une maintenance est programmée
function startMaintenanceChecker() {
    setInterval(async () => {
        try {
            const response = await fetch('api/BackupDatabase.aspx?action=check');
            const data = await response.json();
            
            if (data.isMaintenance && data.maintenanceTime) {
                // Afficher un message d'avertissement pour les non-SuperAdmin
                const userRole = document.getElementById('hfUserRole')?.value;
                if (userRole !== '0') {
                    showMaintenanceWarning(data.maintenanceTime);
                }
            }
        } catch (e) {
            // Ignorer
        }
    }, 30000); // Vérifier toutes les 30 secondes
}

function showMaintenanceWarning(maintenanceTime) {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'maintenanceWarning';
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.5s ease;
        max-width: 350px;
    `;
    warningDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i>
            <div>
                <strong>⚠️ Maintenance programmée</strong><br>
                Sauvegarde à <strong>${maintenanceTime}</strong><br>
                <small>Veuillez sauvegarder votre travail</small>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div style="margin-top: 10px;">
            <div id="maintenanceCountdown" style="height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;">
                <div id="maintenanceProgress" style="width: 0%; height: 100%; background: white; border-radius: 2px;"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Animation de countdown
    const target = new Date();
    const [hours, minutes] = maintenanceTime.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const interval = setInterval(() => {
        const now = new Date();
        const diff = target - now;
        
        if (diff <= 0) {
            clearInterval(interval);
            warningDiv.style.background = '#28a745';
            warningDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-sync-alt fa-spin" style="font-size: 24px;"></i>
                    <div>
                        <strong>🔄 Maintenance en cours</strong><br>
                        Vous allez être redirigé...
                    </div>
                </div>
            `;
            setTimeout(() => {
                window.location.href = '../../../auth/Login.aspx?msg=maintenance';
            }, 5000);
        } else {
            const minutesLeft = Math.floor(diff / 60000);
            const secondsLeft = Math.floor((diff % 60000) / 1000);
            const totalSeconds = Math.floor(diff / 1000);
            const maxSeconds = 5 * 60;
            const percent = (1 - (totalSeconds / maxSeconds)) * 100;
            
            const progress = document.getElementById('maintenanceProgress');
            if (progress) progress.style.width = `${percent}%`;
            
            const countdownText = warningDiv.querySelector('small');
            if (countdownText) countdownText.textContent = `Déconnexion dans ${minutesLeft} min ${secondsLeft} sec`;
        }
    }, 1000);
}

// Lancer le vérificateur de maintenance au chargement
document.addEventListener('DOMContentLoaded', function() {
    startMaintenanceChecker();
});

// Ajouter les styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

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
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export Utilisateurs</title><style>th{background:#4CAF50;color:white;border:1px solid #ddd;padding:8px}td{border:1px solid #ddd;padding:8px}table{border-collapse:collapse;width:100%}</style></head><body><h2>Liste des Utilisateurs</h2><p>Date: ${escapeHtml(exportDate)}</p><p>Total: ${rows.length}</p></table><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(String(cell || '-'))}<td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
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