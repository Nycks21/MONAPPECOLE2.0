// ============================================================================
// GESTION DES ANNÉES SCOLAIRES — annee.js
// Aligné sur annee.aspx : champs #annee, #DateD, #DateF, #anneeStatut
// Handlers : handlers/GetAnnee.ashx | AjouterAnnee.ashx | ModifierAnnee.ashx | SupprimerAnnee.ashx
// ============================================================================

let currentMode      = null;   // "ajout" | "modification"
let currentAnneeId   = null;   // ID INT de la ligne en cours d'édition
let anneesData       = [];     // toutes les années chargées
let filteredAnnees   = [];     // sous-ensemble filtré
let currentPage      = 1;
let rowsPerPage      = 10;

// ============================================================================
// INITIALISATION
// ============================================================================
$(document).ready(() => {
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadAnnees();
});

// ============================================================================
// CHARGEMENT — GET
// ============================================================================
function loadAnnees() {
    fetch('handlers/GetAnnee.ashx')
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                anneesData     = res.Annees;
                filteredAnnees = [...anneesData];
                renderTable();
            } else {
                showToast('error', res.message || 'Erreur lors du chargement.');
            }
        })
        .catch(err => {
            console.error('loadAnnees:', err);
            showToast('error', 'Impossible de contacter le serveur.');
        });
}

// ============================================================================
// RENDU DU TABLEAU
// ============================================================================
function renderTable() {
    const tbody = document.getElementById('anneeTableBody');
    if (!tbody) return;

    const start    = (currentPage - 1) * rowsPerPage;
    const end      = start + rowsPerPage;
    const pageData = filteredAnnees.slice(start, end);

    tbody.innerHTML = '';

    if (!pageData.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:60px;">
            <i class="fas fa-search" style="font-size:48px;color:#ccc;display:block;margin-bottom:15px;"></i>
            Aucune année scolaire trouvée</td></tr>`;
        return;
    }

    pageData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${item.ANNEE || '-'}</td>
            <td class="text-center">${formatNetDate(item.DATE_DEBUT)}</td>
            <td class="text-center">${formatNetDate(item.DATE_FIN)}</td>
            <td class="text-center">${item.CLOTURE
                ? '<span style="background:#dc3545;padding:4px 10px;border-radius:20px;color:white;font-size:12px;font-weight:500;">✗ Clôturée</span>'
                : '<span style="background:#28a745;padding:4px 10px;border-radius:20px;color:white;font-size:12px;font-weight:500;">✓ Ouverte</span>'
            }</td>
            <td class="text-center">${item.DATE_CLOTURE ? formatNetDate(item.DATE_CLOTURE) : '-'}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-primary"
                    style="padding:5px 10px;margin:0 3px;border-radius:4px;"
                    onclick="openEditAnneeModal(${item.ID})">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger"
                    style="padding:5px 10px;margin:0 3px;border-radius:4px;"
                    onclick="supprimerAnnee(${item.ID})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ============================================================================
// FORMATAGE DES DATES .NET (/Date(...)/ ou ISO)
// ============================================================================
function formatNetDate(jsonDate) {
    if (!jsonDate) return '-';
    if (typeof jsonDate === 'string' && jsonDate.includes('/Date')) {
        const ms = parseInt(jsonDate.match(/\d+/)[0]);
        return new Date(ms).toLocaleDateString('fr-FR');
    }
    const d = new Date(jsonDate);
    return isNaN(d) ? '-' : d.toLocaleDateString('fr-FR');
}

// ============================================================================
// MODAL — OUVERTURE AJOUT
// ============================================================================
function openAddAnneeModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    currentMode    = 'ajout';
    currentAnneeId = null;
    resetModalForm();

    const title = document.getElementById('anneeModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter une année scolaire';

    showModal();
    return false;
}

// ============================================================================
// MODAL — OUVERTURE MODIFICATION
// ============================================================================
function openEditAnneeModal(anneeId, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const annee = findAnneeById(anneeId);
    if (!annee) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Année introuvable.' });
        return;
    }

    currentMode    = 'modification';
    currentAnneeId = anneeId;

    // Remplir les champs — IDs correspondant exactement au HTML de annee.aspx
    const fieldAnnee   = document.getElementById('annee');
    const fieldDateD   = document.getElementById('DateD');
    const fieldDateF   = document.getElementById('DateF');
    const fieldStatut  = document.getElementById('anneeStatut');

    if (fieldAnnee)  fieldAnnee.value  = annee.ANNEE || '';
    if (fieldDateD)  fieldDateD.value  = toInputDate(annee.DATE_DEBUT);
    if (fieldDateF)  fieldDateF.value  = toInputDate(annee.DATE_FIN);
    if (fieldStatut) fieldStatut.value = annee.CLOTURE ? 'Inactif' : 'Actif';

    const title = document.getElementById('anneeModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier l\'année scolaire';

    showModal();
    return false;
}

// ============================================================================
// RESET DU FORMULAIRE MODAL
// ============================================================================
function resetModalForm() {
    const ids = ['annee', 'DateD', 'DateF'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const statut = document.getElementById('anneeStatut');
    if (statut) statut.value = 'Actif';
}

// ============================================================================
// AFFICHER / CACHER LA MODAL
// ============================================================================
function showModal() {
    const modal = document.getElementById('addAnneeModal');
    if (modal) {
        modal.style.display    = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddAnneeModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const modal = document.getElementById('addAnneeModal');
    if (modal) {
        modal.style.display    = 'none';
        document.body.style.overflow = '';
    }

    currentMode    = null;
    currentAnneeId = null;
    return false;
}

// ============================================================================
// SAUVEGARDE (Ajouter ou Modifier selon currentMode)
// ============================================================================
async function saveAnnee(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    if (currentMode === 'ajout') {
        await createAnnee();
    } else if (currentMode === 'modification') {
        await updateAnnee();
    } else {
        Swal.fire({ icon: 'warning', title: 'Aucune action', text: 'Mode inconnu.' });
    }
    return false;
}

// ============================================================================
// CRÉATION — POST vers AjouterAnnee.ashx
// ============================================================================
async function createAnnee() {
    const annee  = document.getElementById('annee')?.value.trim()   || '';
    const dateD  = document.getElementById('DateD')?.value.trim()   || '';
    const dateF  = document.getElementById('DateF')?.value.trim()   || '';
    const statut = document.getElementById('anneeStatut')?.value    || 'Actif';

    if (!annee || !dateD || !dateF) {
        Swal.fire({ icon: 'error', title: 'Champs manquants', text: 'Veuillez remplir tous les champs obligatoires.' });
        return;
    }

    const body = {
        ANNEE:      annee,
        DATE_DEBUT: dateD,
        DATE_FIN:   dateF,
        CLOTURE:    statut   // "Actif" | "Inactif"
    };

    showSpinner();
    try {
        const res  = await fetch('handlers/AjouterAnnee.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await safeJson(res);

        if (data.success) {
            Swal.fire({ icon: 'success', title: data.message || 'Année ajoutée !', timer: 1500, showConfirmButton: false });
            setTimeout(() => { closeAddAnneeModal(); loadAnnees(); }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: data.message || 'Erreur inconnue.' });
        }
    } catch (err) {
        console.error('createAnnee:', err);
        Swal.fire({ icon: 'error', title: 'Erreur réseau', text: err.message });
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// MODIFICATION — POST vers ModifierAnnee.ashx
// ============================================================================
async function updateAnnee() {
    const annee  = document.getElementById('annee')?.value.trim()   || '';
    const dateD  = document.getElementById('DateD')?.value.trim()   || '';
    const dateF  = document.getElementById('DateF')?.value.trim()   || '';
    const statut = document.getElementById('anneeStatut')?.value    || 'Actif';
    const anneeData = findAnneeById(currentAnneeId);
    const nouveauStatut = document.getElementById('anneeStatut')?.value;

    if (anneeData && anneeData.CLOTURE && nouveauStatut === 'Actif') {
        const confirm = await Swal.fire({
            title: 'Réouverture ?',
            text: "Cette année est clôturée. Voulez-vous vraiment la réouvrir ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, réouvrir'
        });
        if (!confirm.isConfirmed) return;
    }

    if (!annee || !dateD || !dateF) {
        Swal.fire({ icon: 'error', title: 'Champs manquants', text: 'Veuillez remplir tous les champs obligatoires.' });
        return;
    }

    const body = {
        ID:         currentAnneeId,
        ANNEE:      annee,
        DATE_DEBUT: dateD,
        DATE_FIN:   dateF,
        CLOTURE:    statut
    };

    showSpinner();
    try {
        const res  = await fetch('handlers/ModifierAnnee.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await safeJson(res);

        if (data.success) {
            Swal.fire({ icon: 'success', title: data.message || 'Année modifiée !', timer: 1500, showConfirmButton: false });
            setTimeout(() => { closeAddAnneeModal(); loadAnnees(); }, 1500);
        } else {
            Swal.fire({ icon: 'error', title: 'Erreur', text: data.message || 'Erreur inconnue.' });
        }
    } catch (err) {
        console.error('updateAnnee:', err);
        Swal.fire({ icon: 'error', title: 'Erreur réseau', text: err.message });
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// SUPPRESSION — POST vers SupprimerAnnee.ashx
// ============================================================================
async function supprimerAnnee(id, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const annee = findAnneeById(id);
    // Simulation d'une vérification de dépendance (idéalement faite via le backend, mais sécurisée ici)
    if (annee && annee.CLOTURE) {
        Swal.fire({
            icon: 'error',
            title: 'Action impossible',
            text: 'Une année clôturée contient des archives et ne peut pas être supprimée.'
        });
        return false;
    }

    const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: 'Voulez-vous vraiment supprimer cette année scolaire ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return false;

    showSpinner();
    try {
        const res = await fetch('handlers/SupprimerAnnee.ashx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ID: id })
        });
        
        const data = await safeJson(res);

        if (data.success) {
            Swal.fire({ 
                icon: 'success', 
                title: data.message || 'Année supprimée !', 
                showConfirmButton: false, 
                timer: 1500 
            });
            setTimeout(() => loadAnnees(), 1500);
        } else {
            // 4. TRADUCTION DE L'ERREUR SQL POUR L'UTILISATEUR[cite: 9]
            let errorMessage = data.message || 'Erreur lors de la suppression.';
            
            // Si l'erreur contient la contrainte de référence SQL
            if (errorMessage.includes("FK_ELEVES_RANNEE") || errorMessage.includes("REFERENCE constraint")) {
                errorMessage = "Suppression impossible car des élèves sont rattachés à cette année.";
            }

            Swal.fire({ 
                icon: 'error', 
                title: 'Suppression impossible', 
                text: errorMessage 
            });
        }
    } catch (err) {
        console.error('supprimerAnnee:', err);
        Swal.fire({ icon: 'error', title: 'Erreur réseau', text: 'Connexion au serveur perdue.' });
    } finally {
        hideSpinner();
    }
    return false;
}

// ============================================================================
// SPINNER
// ============================================================================
function forceHideSpinner() {
    const s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display    = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity    = '0';
    s.setAttribute('aria-hidden', 'true');
}

function showSpinner() {
    const s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display    = 'flex';
    s.style.visibility = 'visible';
    s.style.opacity    = '1';
    s.removeAttribute('aria-hidden');
}

function hideSpinner() { forceHideSpinner(); }

// ============================================================================
// EMPÊCHER LA SOUMISSION AUTOMATIQUE DU FORMULAIRE ASP.NET
// ============================================================================
function preventFormAutoSubmit() {
    const form = document.getElementById('form1');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        return false;
    });
}

// ============================================================================
// TYPE="BUTTON" SUR TOUS LES BOUTONS D'ACTION
// ============================================================================
function ensureButtonsHaveTypeButton() {
    document.querySelectorAll('.action-buttons button, .dash-table button, .modal-footer button')
        .forEach(btn => {
            if (btn.getAttribute('type') !== 'button')
                btn.setAttribute('type', 'button');
        });
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/** Trouve une année par son ID INT dans le tableau en mémoire */
function findAnneeById(id) {
    return anneesData.find(a => a.ID == id) || null;
}

/** Convertit une date .NET ou ISO en format YYYY-MM-DD pour <input type="date"> */
function toInputDate(jsonDate) {
    if (!jsonDate) return '';
    let d;
    if (typeof jsonDate === 'string' && jsonDate.includes('/Date')) {
        d = new Date(parseInt(jsonDate.match(/\d+/)[0]));
    } else {
        d = new Date(jsonDate);
    }
    if (isNaN(d)) return '';
    return d.toISOString().split('T')[0];
}

/** Toast léger (si toastContainer présent, sinon console) */
function showToast(type, message) {
    console[type === 'error' ? 'error' : 'log'](message);
}

/** Parsing JSON sécurisé */
async function safeJson(res) {
    try {
        const text = await res.text();
        if (!text?.trim()) return { success: false, message: 'Réponse vide du serveur.' };
        return JSON.parse(text);
    } catch (e) {
        console.error('safeJson:', e);
        return { success: false, message: 'Erreur de parsing JSON.' };
    }
}

// ============================================================================
// EXPOSITION GLOBALE (onclick= dans le HTML)
// ============================================================================
window.openAddAnneeModal  = openAddAnneeModal;
window.openEditAnneeModal = openEditAnneeModal;
window.closeAddAnneeModal = closeAddAnneeModal;
window.saveAnnee          = saveAnnee;
window.supprimerAnnee     = supprimerAnnee;
window.loadAnnees         = loadAnnees;
