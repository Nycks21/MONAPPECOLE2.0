'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// API URLs
// ─────────────────────────────────────────────────────────────────────────────
var API_ABS = {
    getAbsences: 'handlers/GetAbsence.ashx',
    getEleves: '../eleves/handlers/GetEleve.ashx',
    ajouter: 'handlers/AjouterAbsence.ashx',
    modifier: 'handlers/ModifierAbsence.ashx',
    supprimer: 'handlers/SupprimerAbsence.ashx'
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var absencesData = [];
var filteredAbs = [];
var elevesLookup = {};
var currentAbsId = null;
var currentAbsMode = 'add';
var absPage = 1;
var absRowsPerPage = 10;
var absSortCol = 'DATE_DEBUT';
var absSortDir = -1;

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr.includes('/')) {
        var parts = dateStr.split(' ')[0].split('/');
        if (parts.length === 3) {
            return parts[0] + '/' + parts[1] + '/' + parts[2];
        }
    }
    try {
        var date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            var day = String(date.getDate()).padStart(2, '0');
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
        }
    } catch(e) {}
    return dateStr;
}

function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split(' ')[0].split('/');
    if (parts.length === 3) {
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }
    return dateStr.split('T')[0];
}

function formatDuree(duree) {
    if (!duree) return '-';
    var dureeValue = duree;
    if (typeof dureeValue === 'string') {
        dureeValue = dureeValue.replace(',', '.');
    }
    var num = parseFloat(dureeValue);
    if (isNaN(num)) return duree.toString();
    num = Math.round(num * 10) / 10;
    if (num === Math.floor(num)) {
        return num + 'h';
    } else {
        return num.toString().replace('.', ',') + 'h';
    }
}

function truncateText(text, max) {
    if (!text) return '-';
    return text.length > max ? text.substring(0, max) + '...' : text;
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────────────────────
function getNomBadge(nom) {
    return '<span style="font-weight:700;">' + escapeHtml(nom || '-') + '</span>';
}

function getMatriculeBadge(mat) {
    return '<span style="background:#f1f3f5;color:#212529;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid #dee2e6;">' + escapeHtml(mat || '-') + '</span>';
}

function getClasseBadge(cls) {
    return '<span style="background:#fff;color:#007bff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;">' +
        '<i class="fas fa-folder" style="margin-right:4px;"></i>' + escapeHtml(cls) + '</span>';
}

function getTypeBadge(type) {
    var t = (type || '').toLowerCase();
    var bg = t === 'retard' ? '#ffc107' : '#6c757d';
    var txt = t === 'retard' ? '#212529' : '#fff';
    return '<span style="background:' + bg + ';color:' + txt + ';padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">' + escapeHtml(type || '-') + '</span>';
}

function getJustifiedBadge(justif) {
    var ok = (justif === true || justif === 1 || justif === 'True' || justif === 'true');
    var bg = ok ? '#28a745' : '#dc3545';
    var lbl = ok ? 'Oui' : 'Non';
    return '<span style="background:' + bg + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">' + lbl + '</span>';
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'flex'; s.style.visibility = 'visible'; s.style.opacity = '1'; }
}

function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'none'; s.style.visibility = 'hidden'; s.style.opacity = '0'; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES CHAMPS SELON LE TYPE
// ─────────────────────────────────────────────────────────────────────────────
function setFieldsStateByType(isRetard) {
    var timeGroup = document.getElementById('timeGroup');
    var dureeGroup = document.getElementById('dureeGroup');
    var dateFinGroup = document.getElementById('dateFinGroup');
    
    if (!isRetard) {
        // Type 'absence' : CACHER les groupes
        if (timeGroup) timeGroup.style.display = 'none';
        if (dureeGroup) dureeGroup.style.display = 'none';
        if (dateFinGroup) dateFinGroup.style.display = 'block';
    } else {
        // Type 'retard' : AFFICHER les groupes
        if (timeGroup) timeGroup.style.display = 'block';
        if (dureeGroup) dureeGroup.style.display = 'block';
        if (dateFinGroup) dateFinGroup.style.display = 'none';
    }
}

function setJustifiedFieldsState(isJustified) {
    var motifGroup = document.getElementById('motifGroup');
    if (motifGroup) {
        motifGroup.style.display = (isJustified === true || isJustified === 'oui') ? 'block' : 'none';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
async function loadAbsences() {
    showSpinner();
    try {
        var res = await fetch(API_ABS.getAbsences);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var result = await res.json();
        if (result.success) {
            absencesData = result.data || [];
            filteredAbs = [...absencesData];
            applySort();
            updateStats();
            renderTable();
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Erreur', result.message || 'Erreur de chargement', 'error');
            }
        }
    } catch (err) {
        console.error('loadAbsences:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur réseau', 'Impossible de charger les absences.', 'error');
        }
    } finally {
        hideSpinner();
    }
}

async function loadElevesSelect() {
    try {
        var res = await fetch(API_ABS.getEleves);
        if (!res.ok) return;
        var result = await res.json();
        if (!result.success) return;
        
        var eleves = result.Eleves || [];
        var sel = document.getElementById('absenceMatricule');
        if (!sel) return;
        
        sel.innerHTML = '<option value="">Sélectionner un élève...</option>';
        for (var i = 0; i < eleves.length; i++) {
            var e = eleves[i];
            var opt = document.createElement('option');
            opt.value = e.MATRICULE;
            opt.textContent = e.MATRICULE + ' — ' + (e.NOM || '');
            opt.dataset.nom = e.NOM || '';
            opt.dataset.classe = e.CLASSE_NOM || '';
            sel.appendChild(opt);
            elevesLookup[e.MATRICULE] = { NOM: e.NOM || '', CLASSE_NOM: e.CLASSE_NOM || '' };
        }
    } catch (err) {
        console.warn('loadElevesSelect:', err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES CHAMPS DYNAMIQUES
// ─────────────────────────────────────────────────────────────────────────────
function onMatriculeChange() {
    var sel = document.getElementById('absenceMatricule');
    if (!sel) return;
    var mat = sel.value;
    var info = elevesLookup[mat] || {};
    var fNom = document.getElementById('absenceStudent');
    var fClasse = document.getElementById('absenceClasse');
    if (fNom) fNom.value = info.NOM || '';
    if (fClasse) fClasse.value = info.CLASSE_NOM || '';
}

function onTypeChange() {
    var type = document.getElementById('absenceType')?.value;
    var isRetard = (type === 'retard');
    
    // Gérer l'affichage des champs
    setFieldsStateByType(isRetard);
    
    // Pour les absences, la date fin est la même que la date de début
    var dateEl = document.getElementById('absenceDate');
    var dateFinEl = document.getElementById('absenceDateF');
    
    if (!isRetard && dateEl && dateFinEl) {
        dateFinEl.value = dateEl.value;
    }
    
    onJustifiedChange();
}

function onDateChange() {
    var type = document.getElementById('absenceType')?.value;
    var dateEl = document.getElementById('absenceDate');
    var dateFinEl = document.getElementById('absenceDateF');
    
    // Pour les absences, synchroniser la date fin avec la date de début
    if (type !== 'retard' && dateEl && dateFinEl) {
        dateFinEl.value = dateEl.value;
    }
}

function onJustifiedChange() {
    var justified = document.getElementById('absenceJustified')?.value;
    setJustifiedFieldsState(justified === 'oui');
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────
function updateStats() {
    var totalAbsences = 0, totalRetards = 0, totalNonJust = 0;
    for (var i = 0; i < absencesData.length; i++) {
        var type = (absencesData[i].TYPE || '').toLowerCase();
        if (type === 'absence') totalAbsences++;
        if (type === 'retard') totalRetards++;
        if (!absencesData[i].JUSTIF) totalNonJust++;
    }
    
    var elAbs = document.getElementById('totalAbsencesVal');
    var elRet = document.getElementById('totalRetardsVal');
    var elCri = document.getElementById('totalCritiquesVal');
    if (elAbs) elAbs.textContent = totalAbsences;
    if (elRet) elRet.textContent = totalRetards;
    if (elCri) elCri.textContent = totalNonJust;
}

function updateCounter(count) {
    var el = document.getElementById('abs-counter');
    if (el) {
        el.innerHTML = 'Affichage de <b>' + count + '</b> enregistrement(s)' +
            (count !== absencesData.length ? ' sur ' + absencesData.length : '');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRI ET FILTRES
// ─────────────────────────────────────────────────────────────────────────────
function applySort() {
    filteredAbs.sort(function(a, b) {
        var va = (a[absSortCol] || '').toString().toLowerCase();
        var vb = (b[absSortCol] || '').toString().toLowerCase();
        if (va < vb) return absSortDir;
        if (va > vb) return -absSortDir;
        return 0;
    });
}

function sortBy(column) {
    if (absSortCol === column) {
        absSortDir *= -1;
    } else {
        absSortCol = column;
        absSortDir = -1;
    }
    applySort();
    renderTable();
}

function filterAbsences() {
    var searchInput = document.getElementById('abs-search');
    var typeSelect = document.getElementById('abs-filter-type');
    var justifSelect = document.getElementById('abs-filter-justif');
    
    var search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var type = typeSelect ? typeSelect.value : '';
    var justif = justifSelect ? justifSelect.value : '';
    
    filteredAbs = absencesData.filter(function(a) {
        var matchSearch = !search || (a.NOM || '').toLowerCase().includes(search) ||
                          (a.MATRICULE || '').toLowerCase().includes(search);
        var matchType = !type || (a.TYPE || '').toLowerCase() === type;
        var matchJustif = !justif || (justif === 'oui' ? a.JUSTIF : !a.JUSTIF);
        return matchSearch && matchType && matchJustif;
    });
    
    applySort();
    absPage = 1;
    renderTable();
}

function resetFilters() {
    var search = document.getElementById('abs-search');
    var type = document.getElementById('abs-filter-type');
    var justif = document.getElementById('abs-filter-justif');
    var rows = document.getElementById('abs-rows-per-page');
    
    if (search) search.value = '';
    if (type) type.value = '';
    if (justif) justif.value = '';
    if (rows) rows.value = '10';
    
    absRowsPerPage = 10;
    filteredAbs = [...absencesData];
    applySort();
    absPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
function renderPagination() {
    var container = document.getElementById('abs-pagination');
    if (!container) return;
    
    var totalPages = Math.ceil(filteredAbs.length / absRowsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    var html = '';
    html += '<button type="button" class="btn btn-sm btn-light" onclick="window.absencesManager.goToPage(1)" ' + (absPage === 1 ? 'disabled' : '') + '>&laquo;</button>';
    html += '<button type="button" class="btn btn-sm btn-light" onclick="window.absencesManager.goToPage(' + (absPage - 1) + ')" ' + (absPage === 1 ? 'disabled' : '') + '>&lsaquo;</button>';
    
    var start = Math.max(1, absPage - 2);
    var end = Math.min(totalPages, absPage + 2);
    for (var i = start; i <= end; i++) {
        html += '<button type="button" class="btn btn-sm ' + (i === absPage ? 'btn-primary' : 'btn-light') + '" onclick="window.absencesManager.goToPage(' + i + ')">' + i + '</button>';
    }
    
    html += '<button type="button" class="btn btn-sm btn-light" onclick="window.absencesManager.goToPage(' + (absPage + 1) + ')" ' + (absPage === totalPages ? 'disabled' : '') + '>&rsaquo;</button>';
    html += '<button type="button" class="btn btn-sm btn-light" onclick="window.absencesManager.goToPage(' + totalPages + ')" ' + (absPage === totalPages ? 'disabled' : '') + '>&raquo;</button>';
    
    container.innerHTML = html;
}

function goToPage(page) {
    var totalPages = Math.ceil(filteredAbs.length / absRowsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    if (page === absPage) return;
    absPage = page;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────
function renderTable() {
    var tbody = document.getElementById('absencesTableBody');
    if (!tbody) return;
    
    if (!filteredAbs || filteredAbs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:50px;">Aucune absence trouvée通报</td>';
        updateCounter(0);
        return;
    }
    
    var start = (absPage - 1) * absRowsPerPage;
    var pageData = filteredAbs.slice(start, start + absRowsPerPage);
    
    tbody.innerHTML = '';
    for (var i = 0; i < pageData.length; i++) {
        var abs = pageData[i];
        var row = tbody.insertRow();
        
        var btnJustif = '';
        if (!abs.JUSTIF) {
            btnJustif = '<button type="button" class="btn btn-sm btn-success" onclick="window.absencesManager.openJustifyModal(\'' + escapeHtml(abs.ID) + '\')" title="Justifier"><i class="fas fa-check"></i></button>';
        }
        
        row.innerHTML =
            '<td class="text-center">' + escapeHtml(abs.ANNEE_TEXTE || '-') + '</td>' +
            '<td class="text-center">' + getMatriculeBadge(abs.MATRICULE) + '</td>' +
            '<td class="text-center">' + getNomBadge(abs.NOM) + '</td>' +
            '<td class="text-center">' + getClasseBadge(abs.CLASSE_NOM || '-') + '</td>' +
            '<td class="text-center">' + getTypeBadge(abs.TYPE) + '</td>' +
            '<td class="text-center">' + escapeHtml(formatDate(abs.DATE_DEBUT)) + '</td>' +
            '<td class="text-center">' + escapeHtml(formatDate(abs.DATE_FIN)) + '</td>' +
            '<td class="text-center"><strong>' + escapeHtml(formatDuree(abs.DUREE)) + '</strong></td>' +
            '<td class="text-center">' + getJustifiedBadge(abs.JUSTIF) + '</td>' +
            '<td title="' + escapeHtml(abs.COMMENTAIRES || '') + '">' + truncateText(abs.COMMENTAIRES, 25) + '</td>' +
            '<td class="text-center">' +
                '<div style="display:flex; gap:4px; justify-content:center;">' +
                    '<button type="button" class="btn btn-sm btn-primary" onclick="window.absencesManager.editAbsence(\'' + escapeHtml(abs.ID) + '\')" title="Modifier"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-sm btn-danger" onclick="window.absencesManager.deleteAbsence(\'' + escapeHtml(abs.ID) + '\')" title="Supprimer"><i class="fas fa-trash"></i></button>' +
                    btnJustif +
                '</div>' +
            '</td>';
    }
    
    updateCounter(filteredAbs.length);
    renderPagination();
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL SIGNALER (AJOUT)
// ─────────────────────────────────────────────────────────────────────────────
function openSignalModal() {
    currentAbsMode = 'add';
    currentAbsId = null;
    
    // Réinitialiser le formulaire
    var sel = document.getElementById('absenceMatricule');
    if (sel) sel.value = '';
    
    var fields = ['absenceStudent', 'absenceClasse', 'absenceReason', 'absenceHeureDebut', 'absenceHeureFin'];
    for (var i = 0; i < fields.length; i++) {
        var el = document.getElementById(fields[i]);
        if (el) el.value = '';
    }
    
    var today = new Date().toISOString().split('T')[0];
    var dateEl = document.getElementById('absenceDate');
    if (dateEl) dateEl.value = today;
    
    var dateFinEl = document.getElementById('absenceDateF');
    if (dateFinEl) dateFinEl.value = today;
    
    var duree = document.getElementById('absenceDuration');
    if (duree) duree.value = '1';
    
    var fJustif = document.getElementById('absenceJustified');
    if (fJustif) {
        fJustif.value = 'non';
        fJustif.disabled = false;
        fJustif.style.backgroundColor = '#fff';
        fJustif.style.cursor = 'pointer';
    }
    
    // Cacher initialement les groupes
    var timeGroup = document.getElementById('timeGroup');
    var dureeGroup = document.getElementById('dureeGroup');
    var dateFinGroup = document.getElementById('dateFinGroup');
    if (timeGroup) timeGroup.style.display = 'none';
    if (dureeGroup) dureeGroup.style.display = 'none';
    if (dateFinGroup) dateFinGroup.style.display = 'block';
    
    var motifGroup = document.getElementById('motifGroup');
    if (motifGroup) motifGroup.style.display = 'none';
    
    // Initialiser le type à 'absence' par défaut
    var typeSelect = document.getElementById('absenceType');
    if (typeSelect) {
        typeSelect.value = 'absence';
    }
    
    var title = document.getElementById('signalModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-plus-circle"></i> Signaler absence / retard';
    
    openModal('signalAbsenceModal');
}

function closeSignalModal() {
    closeModal('signalAbsenceModal');
}

// ─────────────────────────────────────────────────────────────────────────────
// SAUVEGARDE
// ─────────────────────────────────────────────────────────────────────────────
async function saveAbsence() {
    var matricule = document.getElementById('absenceMatricule')?.value || '';
    var type = document.getElementById('absenceType')?.value || 'absence';
    var date = document.getElementById('absenceDate')?.value || '';
    var dateFin = document.getElementById('absenceDateF')?.value || '';
    var duree = document.getElementById('absenceDuration')?.value || '1';
    var motif = document.getElementById('absenceReason')?.value || '';
    var justified = document.getElementById('absenceJustified')?.value === 'oui';
    var heureDebut = document.getElementById('absenceHeureDebut')?.value || '';
    var heureFin = document.getElementById('absenceHeureFin')?.value || '';
    
    if (!matricule) {
        if (typeof Swal !== 'undefined') Swal.fire('Erreur', 'Veuillez sélectionner un élève.', 'warning');
        return;
    }
    if (!date) {
        if (typeof Swal !== 'undefined') Swal.fire('Erreur', 'La date est obligatoire.', 'warning');
        return;
    }
    
    // Pour le type 'absence', on ignore les heures et la date fin = date
    var dureeNumber = 1;
    var finalDateFin = date;
    
    if (type === 'retard') {
        dureeNumber = parseFloat(String(duree).replace(',', '.'));
        if (isNaN(dureeNumber)) dureeNumber = 1;
        finalDateFin = dateFin || date;
    }
    
    var body = {
        matricule: matricule,
        type: type,
        dateDebut: date,
        dateFin: finalDateFin,
        duree: dureeNumber,
        motif: motif,
        justifie: justified,
        heureDebut: (type === 'retard') ? heureDebut : '',
        heureFin: (type === 'retard') ? heureFin : ''
    };
    
    if (currentAbsMode === 'edit' && currentAbsId) {
        body.id = currentAbsId;
    }
    
    var url = (currentAbsMode === 'edit') ? API_ABS.modifier : API_ABS.ajouter;
    
    showSpinner();
    try {
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var result = await res.json();
        if (result.success) {
            closeSignalModal();
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: result.message || 'Opération réussie', timer: 1500, showConfirmButton: false });
            }
            setTimeout(loadAbsences, 1500);
        } else {
            if (typeof Swal !== 'undefined') Swal.fire('Erreur', result.message || 'Erreur inconnue.', 'error');
        }
    } catch (err) {
        console.error('Erreur:', err);
        if (typeof Swal !== 'undefined') Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function editAbsence(id) {
    var abs = null;
    for (var i = 0; i < absencesData.length; i++) {
        if (absencesData[i].ID === id) {
            abs = absencesData[i];
            break;
        }
    }
    if (!abs) {
        console.error('Absence non trouvée:', id);
        return;
    }
    
    currentAbsMode = 'edit';
    currentAbsId = id;
    
    var sel = document.getElementById('absenceMatricule');
    if (sel) {
        sel.value = abs.MATRICULE || '';
        if (sel.value !== abs.MATRICULE && abs.MATRICULE) {
            var opt = document.createElement('option');
            opt.value = abs.MATRICULE;
            opt.textContent = abs.MATRICULE + ' — ' + (abs.NOM || '');
            sel.appendChild(opt);
            sel.value = abs.MATRICULE;
        }
        onMatriculeChange();
    }
    
    var fNom = document.getElementById('absenceStudent');
    var fClasse = document.getElementById('absenceClasse');
    var fType = document.getElementById('absenceType');
    var fDate = document.getElementById('absenceDate');
    var fDateFin = document.getElementById('absenceDateF');
    var fHeureD = document.getElementById('absenceHeureDebut');
    var fHeureF = document.getElementById('absenceHeureFin');
    var fDuree = document.getElementById('absenceDuration');
    var fReason = document.getElementById('absenceReason');
    
    if (fNom) fNom.value = abs.NOM || '';
    if (fClasse) fClasse.value = abs.CLASSE_NOM || '';
    if (fType) fType.value = (abs.TYPE || 'absence').toLowerCase();
    if (fDate) fDate.value = formatDateForInput(abs.DATE_DEBUT);
    if (fDateFin) fDateFin.value = formatDateForInput(abs.DATE_FIN);
    
    // Remplir les heures uniquement si c'est un retard
    var isRetard = (fType && fType.value === 'retard');
    
    if (fHeureD && abs.HEURE_DEBUT && isRetard) {
        var heureDebutVal = abs.HEURE_DEBUT;
        if (typeof heureDebutVal === 'string' && heureDebutVal.includes(':')) {
            fHeureD.value = heureDebutVal.substring(0, 5);
        } else if (heureDebutVal) {
            fHeureD.value = heureDebutVal;
        }
    } else if (fHeureD) {
        fHeureD.value = '';
    }
    
    if (fHeureF && abs.HEURE_FIN && isRetard) {
        var heureFinVal = abs.HEURE_FIN;
        if (typeof heureFinVal === 'string' && heureFinVal.includes(':')) {
            fHeureF.value = heureFinVal.substring(0, 5);
        } else if (heureFinVal) {
            fHeureF.value = heureFinVal;
        }
    } else if (fHeureF) {
        fHeureF.value = '';
    }
    
    if (fDuree) {
        var dureeValue = abs.DUREE || (isRetard ? '1' : '');
        if (typeof dureeValue === 'string' && dureeValue.indexOf(',') !== -1) {
            dureeValue = dureeValue.replace(',', '.');
        }
        fDuree.value = isRetard ? (parseFloat(dureeValue) || 1) : '';
    }
    if (fReason) fReason.value = abs.COMMENTAIRES || '';
    
    // Gestion du champ JUSTIFIE en mode édition
    var fJustif = document.getElementById('absenceJustified');
    if (fJustif) {
        var isJustified = (abs.JUSTIF === true || abs.JUSTIF === 1 || abs.JUSTIF === 'True' || abs.JUSTIF === 'true');
        fJustif.value = isJustified ? 'oui' : 'non';
        fJustif.disabled = true;
        fJustif.style.backgroundColor = '#e9ecef';
        fJustif.style.cursor = 'not-allowed';
    }
    
    // Gérer l'affichage des champs selon le type
    setFieldsStateByType(isRetard);
    setJustifiedFieldsState(fJustif && fJustif.value === 'oui');
    
    var title = document.getElementById('signalModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier absence / retard';
    
    openModal('signalAbsenceModal');
}

// ─────────────────────────────────────────────────────────────────────────────
// JUSTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function openJustifyModal(id) {
    currentAbsId = id;
    var abs = null;
    for (var i = 0; i < absencesData.length; i++) {
        if (absencesData[i].ID === id) {
            abs = absencesData[i];
            break;
        }
    }
    if (abs) {
        var nameEl = document.getElementById('justifyStudentName');
        if (nameEl) nameEl.textContent = abs.NOM || '';
    }
    
    var dateEl = document.getElementById('justifyDate');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    
    var reasonEl = document.getElementById('justifyReason');
    if (reasonEl) reasonEl.value = '';
    
    openModal('justifyModal');
}

function closeJustifyModal() {
    closeModal('justifyModal');
    currentAbsId = null;
}

async function confirmJustify() {
    if (!currentAbsId) return;
    var reason = document.getElementById('justifyReason')?.value || '';
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.modifier, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentAbsId, justifie: true, motif: reason })
        });
        var result = await res.json();
        if (result.success) {
            closeJustifyModal();
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Absence justifiée', timer: 1500, showConfirmButton: false });
            }
            setTimeout(loadAbsences, 1500);
        } else {
            if (typeof Swal !== 'undefined') Swal.fire('Erreur', result.message || 'Erreur.', 'error');
        }
    } catch (err) {
        console.error(err);
        if (typeof Swal !== 'undefined') Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPRESSION
// ─────────────────────────────────────────────────────────────────────────────
async function deleteAbsence(id) {
    if (typeof Swal !== 'undefined') {
        var result = await Swal.fire({
            title: 'Supprimer cette absence ?',
            text: 'Cette action est irréversible.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });
        if (!result.isConfirmed) return;
    } else {
        if (!confirm('Supprimer cette absence ?')) return;
    }
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.supprimer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        var del = await res.json();
        if (del.success) {
            var newAbsences = [];
            for (var i = 0; i < absencesData.length; i++) {
                if (absencesData[i].ID !== id) newAbsences.push(absencesData[i]);
            }
            absencesData = newAbsences;
            
            var newFiltered = [];
            for (var j = 0; j < filteredAbs.length; j++) {
                if (filteredAbs[j].ID !== id) newFiltered.push(filteredAbs[j]);
            }
            filteredAbs = newFiltered;
            
            updateStats();
            renderTable();
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: del.message || 'Supprimé', timer: 1000, showConfirmButton: false });
            }
        } else {
            if (typeof Swal !== 'undefined') Swal.fire('Erreur', del.message || 'Erreur.', 'error');
        }
    } catch (err) {
        console.error(err);
        if (typeof Swal !== 'undefined') Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CSV
// ─────────────────────────────────────────────────────────────────────────────
function exportToCsv() {
    if (!filteredAbs.length) {
        if (typeof Swal !== 'undefined') Swal.fire('Info', 'Aucune donnée à exporter', 'info');
        return;
    }
    var header = 'Année;Matricule;Élève;Classe;Type;Date;Date fin;Durée;Justifiée;Motif\n';
    var rows = '';
    for (var i = 0; i < filteredAbs.length; i++) {
        var a = filteredAbs[i];
        rows += [
            a.ANNEE_TEXTE || '',
            a.MATRICULE || '',
            a.NOM || '',
            a.CLASSE_NOM || '',
            a.TYPE || '',
            a.DATE_DEBUT || '',
            a.DATE_FIN || '',
            a.DUREE || '',
            a.JUSTIF ? 'Oui' : 'Non',
            (a.COMMENTAIRES || '').replace(/;/g, ',')
        ].join(';') + '\n';
    }
    var blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Absences_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    console.log('[Absences] Initialisation...');
    
    // Attacher les événements
    var typeSelect = document.getElementById('absenceType');
    if (typeSelect) typeSelect.addEventListener('change', onTypeChange);
    
    var dateSelect = document.getElementById('absenceDate');
    if (dateSelect) dateSelect.addEventListener('change', onDateChange);
    
    var justifiedSelect = document.getElementById('absenceJustified');
    if (justifiedSelect) justifiedSelect.addEventListener('change', onJustifiedChange);
    
    var matriculeSelect = document.getElementById('absenceMatricule');
    if (matriculeSelect) matriculeSelect.addEventListener('change', onMatriculeChange);
    
    var searchInput = document.getElementById('abs-search');
    if (searchInput) searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') filterAbsences();
    });
    
    var filterType = document.getElementById('abs-filter-type');
    if (filterType) filterType.addEventListener('change', filterAbsences);
    
    var filterJustif = document.getElementById('abs-filter-justif');
    if (filterJustif) filterJustif.addEventListener('change', filterAbsences);
    
    var rowsPerPage = document.getElementById('abs-rows-per-page');
    if (rowsPerPage) rowsPerPage.addEventListener('change', function() {
        absRowsPerPage = parseInt(this.value);
        absPage = 1;
        renderTable();
    });
    
    // Charger les données
    loadAbsences();
    loadElevesSelect();
    
    // Fermer modals sur Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('signalAbsenceModal');
            closeModal('justifyModal');
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE (pour les onclick HTML)
// ─────────────────────────────────────────────────────────────────────────────
window.absencesManager = {
    init: init,
    openSignalModal: openSignalModal,
    closeSignalModal: closeSignalModal,
    saveAbsence: saveAbsence,
    editAbsence: editAbsence,
    openJustifyModal: openJustifyModal,
    closeJustifyModal: closeJustifyModal,
    confirmJustify: confirmJustify,
    deleteAbsence: deleteAbsence,
    filterAbsences: filterAbsences,
    resetFilters: resetFilters,
    sortBy: sortBy,
    goToPage: goToPage,
    exportToCsv: exportToCsv,
    onMatriculeChange: onMatriculeChange,
    onTypeChange: onTypeChange,
    onDateChange: onDateChange,
    onJustifiedChange: onJustifiedChange
};

// Démarrer automatiquement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}