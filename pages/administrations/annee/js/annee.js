// ============================================================================
// GESTION COMPLÈTE DES UTILISATEURS - VERSION FINALE
// AVEC FILTRES EN HAUT, PAGINATION EN BAS, anneeNAME FIGÉ EN MODIFICATION
// ============================================================================

let currentMode = null; 
let currentAnneeId = null;
let anneesData = []; 
let filteredAnnees = []; 
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
    loadAnnees();
    bindButtonEvents();
    initModalCloseOnClickOutside();
});


function loadAnnees() {
    fetch('handlers/GetAnnee.ashx')
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                anneesData = res.Annees;
                filteredAnnees = [...anneesData];
                renderTable();
            }
        });
}

function renderTable() {
    const tbody = document.getElementById('anneeTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredAnnees.slice(start, end);

    pageData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.ANNEE}</td>
            <td>${formatNetDate(item.DATE_DEBUT)}</td>
            <td>${formatNetDate(item.DATE_FIN)}</td>
            <td>${item.CLOTURE ? 
                '<span class="badge bg-danger" style="background: #dc3545; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✗ Cloturée</span>' 
                :
                '<span class="badge bg-success" style="background: #28a745; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✓ Ouverte</span>'
            }</td>
            <td>${item.DATE_CLOTURE ? formatNetDate(item.DATE_CLOTURE) : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="openEditAnneeModal(${item.ID})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="supprimerAnnee(${item.ID})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Fonction utilitaire pour le formatage des dates (déjà présente dans votre projet)
function formatNetDate(jsonDate) {
    if (!jsonDate) return "-";
    if (typeof jsonDate === 'string' && jsonDate.includes('/Date')) {
        const ms = parseInt(jsonDate.match(/\d+/)[0]);
        const d = new Date(ms);
        return d.toLocaleDateString('fr-FR');
    }
    return new Date(jsonDate).toLocaleDateString('fr-FR');
}

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
                    submitter.getAttribute('onclick')?.includes('openAddAnneeModal') ||
                    submitter.getAttribute('onclick')?.includes('exportAnnees'))) {
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
// RENDU DU TABLEAU
// ============================================================================
function renderSimpleTable() {
    const tbody = document.getElementById('annees   TableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageannees = filteredAnnees.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredAnnees.length / rowsPerPage);

    tbody.innerHTML = '';

    if (!pageannees.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 60px;"><i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>Aucun utilisateur trouvé</td></tr>';
        updateCounter();
        createPaginationControls(totalPages);
        return;
    }

    pageannees.forEach(annee => {
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = annee.anneeNAME || '-';
        row.insertCell(1).innerHTML = annee.ANNEE || '-';
        row.insertCell(2).innerHTML = annee.DATE_DEBUT || '-';
        row.insertCell(4).innerHTML = annee.DATE_FIN || '-';
        row.insertCell(5).innerHTML = (annee.CLOTURE === true || annee.CLOTURE === 1 || annee.CLOTURE === 'true')
            ? '<span class="badge bg-success" style="background: #28a745; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✓ Actif</span>'
            : '<span class="badge bg-danger" style="background: #dc3545; padding: 4px 10px; border-radius: 20px; color: white; font-size: 12px; font-weight: 500;">✗ Inactif</span>';
        row.insertCell(6).innerHTML = formatDate(annee.CREATED_AT);
            row.insertCell(7).innerHTML = `
            <button type="button" class="btn btn-sm btn-primary" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="openEditanneeModal(${annee.ID}, event)">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-sm btn-danger" style="padding: 5px 10px; margin: 0 3px; border-radius: 4px;" onclick="supprimerContact(${annee.ID}, event)">
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
    const modal = document.getElementById('addanneeModal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            const modalContent = modal.querySelector('.modal-content');
            if (event.target === modal && !modalContent.contains(event.target)) {
                closeAddanneeModal(event);
            }
        });
    }
}

function openAddAnneeModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    currentMode = "ajout";
    currentanneeId = null;
    resetModalForm();

    // Activer le champ anneename en mode ajout
    const anneenameField = document.getElementById('anneename');
    if (anneenameField) {
        anneenameField.disabled = false;
        anneenameField.style.backgroundColor = '#ffffff';
        anneenameField.style.cursor = 'text';
        anneenameField.placeholder = "Nom d'utilisateur";
    }

    const titleElement = document.querySelector('#anneeModalTitle');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-annee-plus"></i> Ajouter un utilisateur';
    }

    showModal();
    return false;
}

function openEditAnneeModal(anneeId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const annee = findanneeById(anneeId);
    if (!annee) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Année introuvable' });
        return;
    }

    currentMode = "modification";
    currentanneeId = anneeId;

    document.getElementById('anneename').value = annee.anneeNAME || '';
    document.getElementById('annee').value = annee.ANNEE || '';
    document.getElementById('anneeDateDebut').value = annee.DATE_DEBUT || '-';
    document.getElementById('anneeDateFin').value = annee.DATE_FIN || '-';
    document.getElementById('anneeCloture').value = (annee.ACTIVE === true || annee.ACTIVE === 1 || annee.ACTIVE === 'true') ? 'Actif' : 'Inactif';

    const titleElement = document.querySelector('#anneeModalTitle');
    if (titleElement) {
        titleElement.innerHTML = '<i class="fas fa-annee-edit"></i> Modifier l\'utilisateur';
    }

    showModal();
    return false;
}

function resetModalForm() {
    const fields = ['anneename', 'Nom', 'anneeEmail', 'anneeTelephone', 'anneePassword'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.value = '';
            if (field === 'anneename') {
                element.disabled = false;
                element.style.backgroundColor = '#ffffff';
                element.style.cursor = 'text';
                element.title = '';
            }
        }
    });

    const roleSelect = document.getElementById('anneeRole');
    if (roleSelect) roleSelect.value = 'Administrateur';

    const statutSelect = document.getElementById('anneeStatut');
    if (statutSelect) statutSelect.value = 'Actif';
}

function showModal() {
    const modal = document.getElementById('addAnneeModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddAnneeModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const modal = document.getElementById('addAnneeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Réinitialiser l'état du champ anneename
    const anneenameField = document.getElementById('anneename');
    if (anneenameField) {
        anneenameField.disabled = false;
        anneenameField.style.backgroundColor = '#ffffff';
        anneenameField.style.cursor = 'text';
        anneenameField.title = '';
    }

    currentMode = null;
    currentanneeId = null;
    return false;
}

// ============================================================================
// CRÉER UN UTILISATEUR
// ============================================================================
async function createanneeFromModal() {
    const anneename = document.getElementById('anneename')?.value.trim() || '';
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('anneeEmail')?.value.trim() || '';
    const role = document.getElementById('anneeRole')?.value || 'Administrateur';
    const telephone = document.getElementById('anneeTelephone')?.value.trim() || '';
    const password = document.getElementById('anneePassword')?.value.trim() || '';
    const statut = document.getElementById('anneeStatut')?.value || 'Actif';

    if (!anneename || !nom || !email || !password) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir tous les champs obligatoires." });
        return;
    }

    if (password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }

    const body = {
        anneeNAME: anneename,
        NOM: nom,
        PWD: password,
        EMAIL: email,
        TELEPHONE: telephone,
        ROLEID: getRoleId(role),
        ACTIVE: statut === "Actif" ? 1 : 0
    };

    try {
        const res = await fetch("api/annee.aspx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await safeJson(res);

        if (data.success) {
            Swal.fire({ icon: 'success', title: data.message || "Utilisateur ajouté !", timer: 1500, showConfirmButton: false });
            setTimeout(() => {
                closeAddanneeModal();
                loadannees();
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
// METTRE À JOUR UN UTILISATEUR (SANS MODIFIER LE anneeNAME)
// ============================================================================
async function updateanneeFromModal() {
    const nom = document.getElementById('Nom')?.value.trim() || '';
    const email = document.getElementById('anneeEmail')?.value.trim() || '';
    const role = document.getElementById('anneeRole')?.value || 'Administrateur';
    const telephone = document.getElementById('anneeTelephone')?.value.trim() || '';
    const password = document.getElementById('anneePassword')?.value.trim() || '';
    const statut = document.getElementById('anneeStatut')?.value || 'Actif';

    if (!nom || !email) {
        Swal.fire({ icon: 'error', title: "Champs manquants", text: "Veuillez remplir Nom et Email." });
        return;
    }

    if (password && password.length < 8) {
        Swal.fire({ icon: 'error', title: "Mot de passe trop court", text: "Le mot de passe doit contenir au moins 8 caractères." });
        return;
    }

    const params = new URLSearchParams();
    params.append('id', currentanneeId);
    params.append('nom', nom);
    params.append('email', email);
    params.append('roleId', getRoleId(role));
    params.append('telephone', telephone);
    params.append('active', statut === "Actif" ? 1 : 0);
    if (password) params.append('password', password);

    try {
        const res = await fetch(`api/updateannee.aspx?${params.toString()}`, { method: 'POST' });
        const result = await safeJson(res);

        if (result.success || result.status === "success") {
            Swal.fire({ icon: 'success', title: "Utilisateur modifié !", timer: 1500, showConfirmButton: false });
            setTimeout(() => {
                closeAddanneeModal();
                loadannees();
            }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: result.message || "Erreur lors de la modification" });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: "Erreur", text: err.message });
    }
}

async function saveannee(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (currentMode === "modification") {
        await updateanneeFromModal();
    } else if (currentMode === "ajout") {
        await createanneeFromModal();
    } else {
        Swal.fire({ icon: 'warning', title: 'Aucune action', text: 'Veuillez sélectionner "Ajouter" ou "Modifier" d\'abord' });
    }
    return false;
}

// ============================================================================
// SUPPRIMER UN UTILISATEUR
// ============================================================================
async function supprimerAnnee(id, event) {
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
            const res = await fetch("api/Deleteannee.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });
            const data = await safeJson(res);

            if (data.status === "success" || data.success) {
                Swal.fire({ icon: 'success', title: "Utilisateur supprimé", showConfirmButton: false, timer: 1500 });
                setTimeout(() => loadannees(), 1500);
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
        'SuperAdmin': 0, 'Administrateur': 1, 'Admin': 1, 'annee': 2,
        'Professeur': 3, 'Secrétaire': 4, 'Comptable': 5, 'CPE': 6, 'Parent': 7
    };
    return roles[roleName] || 1;
}

function getanneeRoleName(roleId) {
    const roles = {
        0: 'SuperAdmin', 1: 'Administrateur', 2: 'annee', 3: 'Professeur',
        4: 'Secrétaire', 5: 'Comptable', 6: 'CPE', 7: 'Parent'
    };
    return roles[roleId] || 'Utilisateur';
}

function findanneeById(anneeId) {
    return anneesData.find(u => u.IDannee == anneeId);
}

// ============================================================================
// EXPORT DES UTILISATEURS
// ============================================================================
function exportannees(event) {
    if (event) event.preventDefault();
    if (!filteredAnnees?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredAnnees.map(annee => [
        annee.anneeNAME || '', annee.NOM || '', annee.EMAIL || '', annee.TELEPHONE || '',
        getanneeRoleName(annee.ROLEID), (annee.ACTIVE === true || annee.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(annee.CREATED_AT)
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

    Swal.fire({ icon: 'success', title: 'Export réussi', text: `${filteredAnnees.length} utilisateur(s) exporté(s)`, timer: 3000 });
    return false;
}

function exportanneesToExcelOnly(event) {
    if (event) event.preventDefault();
    if (!filteredAnnees?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredAnnees.map(annee => [
        annee.anneeNAME || '', annee.NOM || '', annee.EMAIL || '', annee.TELEPHONE || '',
        getanneeRoleName(annee.ROLEID), (annee.ACTIVE === true || annee.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(annee.CREATED_AT)
    ]);

    downloadFile(generateExcelHtml(headers, rows), 'utilisateurs.xls', 'application/vnd.ms-excel;charset=utf-8;');
    Swal.fire({ icon: 'success', title: 'Export Excel réussi', text: `${filteredAnnees.length} utilisateur(s) exporté(s)`, timer: 2000 });
    return false;
}

function exportanneesToCsvOnly(event) {
    if (event) event.preventDefault();
    if (!filteredAnnees?.length) {
        Swal.fire({ icon: 'warning', title: 'Aucune donnée', text: 'Il n\'y a pas d\'utilisateurs à exporter' });
        return false;
    }

    const headers = ['Nom d\'utilisateur', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Date de création'];
    const rows = filteredAnnees.map(annee => [
        annee.anneeNAME || '', annee.NOM || '', annee.EMAIL || '', annee.TELEPHONE || '',
        getanneeRoleName(annee.ROLEID), (annee.ACTIVE === true || annee.ACTIVE === 1) ? 'Actif' : 'Inactif',
        formatDate(annee.CREATED_AT)
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
    Swal.fire({ icon: 'success', title: 'Export CSV réussi', text: `${filteredAnnees.length} utilisateur(s) exporté(s)`, timer: 2000 });
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
            const modal = document.getElementById('addanneeModal');
            if (modal && modal.style.display === 'flex') closeAddanneeModal(event);
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
window.openAddAnneeModal = openAddAnneeModal;
window.openEditAnneeModal = openEditAnneeModal;
window.closeAddAnneeModal = closeAddAnneeModal;
window.saveannee = saveannee;
window.supprimerContact = supprimerContact;
window.exportannees = exportannees;
window.exportanneesToExcelOnly = exportanneesToExcelOnly;
window.exportanneesToCsvOnly = exportanneesToCsvOnly;
window.loadAnnees = loadAnnees;