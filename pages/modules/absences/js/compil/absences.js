// ============================================================================
// GESTION DES ABSENCES ET RETARDS - VERSION CORRIGÉE AVEC FILTRES
// ============================================================================

// API URLs
var API_ABS = {
    getEleves: '../eleves/handlers/GetEleve.ashx',
    absences: {
        list: 'handlers/GetAbsences.ashx',
        add: 'handlers/AjouterAbsence.ashx',
        update: 'handlers/ModifierAbsence.ashx',
        delete: 'handlers/SupprimerAbsence.ashx',
        justify: 'handlers/JustifierAbsence.ashx'
    },
    retards: {
        list: 'handlers/GetRetards.ashx',
        add: 'handlers/AjouterRetard.ashx',
        update: 'handlers/ModifierRetard.ashx',
        delete: 'handlers/SupprimerRetard.ashx',
        justify: 'handlers/JustifierRetard.ashx'
    }
};

// État global
var absencesData = [];
var retardsData = [];
var currentAbsenceId = null;
var currentRetardId = null;
var currentTab = 'absences';
var absPage = 1, retPage = 1;
var absRows = 10, retRows = 10;
var elevesLookup = {};
var baseAbsencesData = [];
var baseRetardsData = [];
var filteredAbsences = [];
var filteredRetards = [];

// ============================================================================
// UTILITAIRES
// ============================================================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
        }
    } catch(e) {}
    return dateStr.split('T')[0];
}

function formatHeure(timeStr) {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'flex'; s.style.visibility = 'visible'; }
}

function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'none'; s.style.visibility = 'hidden'; }
}

// ============================================================================
// SWITCH ENTRE ONGLETS
// ============================================================================
function switchTab(tab, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentTab = tab;
    var tabs = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    
    if (tab === 'absences') {
        tabs[0].classList.add('active');
        document.getElementById('tab-absences').classList.add('active');
        loadAbsences();
    } else {
        tabs[1].classList.add('active');
        document.getElementById('tab-retards').classList.add('active');
        loadRetards();
    }
    return false;
}

// ============================================================================
// CHARGEMENT DES ÉLÈVES
// ============================================================================
async function loadEleves() {
    try {
        var res = await fetch(API_ABS.getEleves);
        if (!res.ok) return;
        var result = await res.json();
        if (!result.success) return;
        
        var eleves = result.Eleves || [];
        
        var selAbs = document.getElementById('absenceMatricule');
        if (selAbs) {
            selAbs.innerHTML = '<option value="">-- Sélectionner un élève --</option>';
            for (var i = 0; i < eleves.length; i++) {
                var e = eleves[i];
                var opt = document.createElement('option');
                opt.value = e.MATRICULE;
                opt.textContent = e.MATRICULE + ' — ' + (e.NOM || '');
                opt.dataset.nom = e.NOM || '';
                opt.dataset.classe = e.CLASSE_NOM || '';
                selAbs.appendChild(opt);
                elevesLookup[e.MATRICULE] = { NOM: e.NOM || '', CLASSE_NOM: e.CLASSE_NOM || '' };
            }
        }
        
        var selRet = document.getElementById('retardMatricule');
        if (selRet) {
            selRet.innerHTML = '<option value="">-- Sélectionner un élève --</option>';
            for (var j = 0; j < eleves.length; j++) {
                var e2 = eleves[j];
                var opt2 = document.createElement('option');
                opt2.value = e2.MATRICULE;
                opt2.textContent = e2.MATRICULE + ' — ' + (e2.NOM || '');
                opt2.dataset.nom = e2.NOM || '';
                opt2.dataset.classe = e2.CLASSE_NOM || '';
                selRet.appendChild(opt2);
            }
        }
    } catch (err) {
        console.warn('loadEleves:', err);
    }
}

// ============================================================================
// SECTION ABSENCES
// ============================================================================
async function loadAbsences() {
    showSpinner();
    try {
        var res = await fetch(API_ABS.absences.list);
        var result = await res.json();
        if (result.success) {
            absencesData = result.data || [];
            baseAbsencesData = [...absencesData];
            filteredAbsences = [...absencesData];
            createAbsenceFilterControls();
            updateAbsenceStats();
            renderAbsencesTable();
        } else {
            console.error('Erreur chargement absences:', result.message);
        }
    } catch (err) {
        console.error('loadAbsences:', err);
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// BARRE DE FILTRES ABSENCES
// ============================================================================
function createAbsenceFilterControls() {
    var oldFilter = document.getElementById('abs-filter-container');
    if (oldFilter) oldFilter.remove();

    var fc = document.createElement('div');
    fc.id = 'abs-filter-container';
    fc.className = 'filter-container';
    fc.innerHTML = `
        <div class="filter-group">
            <label><i class="fas fa-search"></i> Recherche</label>
            <input type="text" id="abs-search-filter" placeholder="Nom...">
        </div>
        <div class="filter-select">
            <label><i class="fas fa-filter"></i> Statut</label>
            <select id="abs-status-filter">
                <option value="">Tous</option>
                <option value="justifie">Justifiée</option>
                <option value="non_justifie">Non justifiée</option>
            </select>
        </div>
        <div class="filter-rows">
            <label><i class="fas fa-list"></i> Afficher</label>
            <select id="abs-rows-per-page">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <button class="filter-btn" id="abs-reset-filters" type="button">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;

    var container = document.querySelector('#tab-absences .dash-card-body') || document.body;
    var statsContainer = document.getElementById('absenceStatsContainer');
    if (statsContainer && statsContainer.nextSibling) {
        container.insertBefore(fc, statsContainer.nextSibling);
    } else {
        container.prepend(fc);
    }

    document.getElementById('abs-search-filter').addEventListener('input', applyAbsenceFilters);
    document.getElementById('abs-status-filter').addEventListener('change', applyAbsenceFilters);
    document.getElementById('abs-rows-per-page').addEventListener('change', function(e) {
        absRows = parseInt(e.target.value);
        absPage = 1;
        renderAbsencesTable();
    });
    document.getElementById('abs-reset-filters').addEventListener('click', resetAbsenceFilters);
}

function applyAbsenceFilters() {
    var search = (document.getElementById('abs-search-filter')?.value || '').toLowerCase().trim();
    var status = document.getElementById('abs-status-filter')?.value || '';

    filteredAbsences = baseAbsencesData.filter(function(abs) {
        var matchSearch = !search || (
            abs.NOM?.toLowerCase().includes(search) ||
            abs.MATRICULE?.toLowerCase().includes(search)
        );
        var matchStatus = !status || (
            status === 'justifie' ? abs.JUSTIFIE === true : abs.JUSTIFIE === false
        );
        return matchSearch && matchStatus;
    });

    absPage = 1;
    renderAbsencesTable();
}

function resetAbsenceFilters() {
    var sf = document.getElementById('abs-search-filter');
    var stf = document.getElementById('abs-status-filter');
    var rp = document.getElementById('abs-rows-per-page');
    if (sf) sf.value = '';
    if (stf) stf.value = '';
    if (rp) rp.value = '10';
    absRows = 10;
    applyAbsenceFilters();
}

// ============================================================================
// Statistiques ABSENCES
// ============================================================================
function updateAbsenceStats() {
    var total = filteredAbsences.length;
    var nonJustifiees = 0;
    for (var i = 0; i < filteredAbsences.length; i++) {
        if (!filteredAbsences[i].JUSTIFIE) nonJustifiees++;
    }
    var justifiees = total - nonJustifiees;
    
    var totalEl = document.getElementById('totalAbsencesVal');
    var nonJustEl = document.getElementById('nonJustifieesVal');
    var justEl = document.getElementById('justifieesVal');
    if (totalEl) totalEl.textContent = total;
    if (nonJustEl) nonJustEl.textContent = nonJustifiees;
    if (justEl) justEl.textContent = justifiees;
}

// ============================================================================
// TABLEAU ABSENCES
// ============================================================================
function renderAbsencesTable() {
    var tbody = document.getElementById('absencesTableBody');
    if (!tbody) return;
    
    var start = (absPage - 1) * absRows;
    var end = start + absRows;
    var pageData = filteredAbsences.slice(start, end);
    var totalPages = Math.ceil(filteredAbsences.length / absRows);
    
    tbody.innerHTML = '';
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">Aucune absence trouvée</td></tr>';
        updateAbsencePagination(totalPages);
        return;
    }
    
    for (var i = 0; i < pageData.length; i++) {
        var a = pageData[i];
        var nameBadge = a.NOM ? '<span class="badge-name">' + escapeHtml(a.NOM) + '</span>' : '';
        var motifBadge = a.MOTIF ? '<span class="badge-motif">' + escapeHtml(a.MOTIF) + '</span>' : '-';
        var justifiedBadge = a.JUSTIFIE ? '<span class="badge-justified">✓ Justifiée</span>' : '<span class="badge-not-justified">✗ Non justifiée</span>';
        var justifyBtn = !a.JUSTIFIE ? '<button type="button" class="btn-action-justify" onclick="justifyAbsence(\'' + a.ID + '\')" title="Justifier"><i class="fas fa-check"></i></button>' : '';
        
        var motifText = a.MOTIF || '-';
        if (motifText.length > 50) motifText = motifText.substring(0, 47) + '...';
        
        var row = tbody.insertRow();
        row.insertCell(0).innerHTML = nameBadge;
        row.insertCell(1).innerHTML = escapeHtml(a.CLASSE_NOM);
        row.insertCell(2).innerHTML = formatDate(a.DATE_DEBUT);
        row.insertCell(3).innerHTML = formatDate(a.DATE_FIN);
        row.insertCell(4).innerHTML = a.DUREE + ' jour(s)';
        row.insertCell(5).innerHTML = justifiedBadge;
        row.insertCell(6).innerHTML = motifBadge;
        row.insertCell(7).innerHTML = 
            '<div class="action-buttons-group">' +
            '<button type="button" class="btn-action-edit" onclick="editAbsence(\'' + a.ID + '\')" title="Modifier"><i class="fas fa-edit"></i></button>' +
            '<button type="button" class="btn-action-delete" onclick="deleteAbsence(\'' + a.ID + '\')" title="Supprimer"><i class="fas fa-trash"></i></button>' +
            justifyBtn +
            '</div>';
    }
    
    updateAbsencePagination(totalPages);
    updateAbsenceCounter();
}

// ============================================================================
// COMPTEUR ABSENCES
// ============================================================================
function updateAbsenceCounter() {
    let counter = document.getElementById('abs-record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'abs-record-counter';
        counter.style.cssText = 'margin:15px 0 0; padding:10px 15px; text-align:center; font-size:14px; background:#f8f9fa; border-radius:6px; border:1px solid #e9ecef;';
        const pagination = document.getElementById('abs-pagination');
        if (pagination?.parentNode) {
            pagination.parentNode.insertBefore(counter, pagination);
        } else {
            const table = document.querySelector('#tab-absences .dash-table');
            if (table?.parentNode) {
                table.parentNode.insertBefore(counter, table.nextSibling);
            }
        }
    }
    
    const start = filteredAbsences.length === 0 ? 0 : (absPage - 1) * absRows + 1;
    const end = Math.min(absPage * absRows, filteredAbsences.length);
    counter.innerHTML = `<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ${filteredAbsences.length === 0 ? '0' : start} à ${end} sur <strong>${filteredAbsences.length}</strong> enregistrement${filteredAbsences.length > 1 ? 's' : ''}`;
}

// ============================================================================
// PAGINATION ABSENCES
// ============================================================================
function updateAbsencePagination(totalPages) {
    var container = document.getElementById('abs-pagination');
    if (!container) return;
    
    container.innerHTML = '';
    if (totalPages <= 1) return;

    var pc = document.createElement('div');
    pc.style.cssText = 'margin:20px 0; display:flex; justify-content:center; gap:5px; flex-wrap:wrap;';

    pc.appendChild(createAbsencePageBtn('«', function() { goToAbsencePage(1); }, absPage === 1));
    pc.appendChild(createAbsencePageBtn('‹', function() { if (absPage > 1) goToAbsencePage(absPage - 1); }, absPage === 1));

    var maxVisible = 5;
    var start = Math.max(1, absPage - Math.floor(maxVisible / 2));
    var end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        pc.appendChild(createAbsencePageBtn('1', function() { goToAbsencePage(1); }));
        if (start > 2) pc.appendChild(createAbsenceDots());
    }
    for (var i = start; i <= end; i++) {
        (function(page) {
            pc.appendChild(createAbsencePageBtn(page, function() { goToAbsencePage(page); }, page === absPage));
        })(i);
    }
    if (end < totalPages) {
        if (end < totalPages - 1) pc.appendChild(createAbsenceDots());
        (function(tp) {
            pc.appendChild(createAbsencePageBtn(tp, function() { goToAbsencePage(tp); }));
        })(totalPages);
    }

    pc.appendChild(createAbsencePageBtn('›', function() { if (absPage < totalPages) goToAbsencePage(absPage + 1); }, absPage === totalPages));
    pc.appendChild(createAbsencePageBtn('»', function() { goToAbsencePage(totalPages); }, absPage === totalPages));

    container.appendChild(pc);
}

function goToAbsencePage(page) {
    absPage = page;
    renderAbsencesTable();
}

function createAbsencePageBtn(text, onClick, isDisabled) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    var isActive = (text == absPage && !isNaN(text));
    btn.style.cssText = 'padding:7px 13px;border:1px solid ' + (isActive || !isDisabled ? '#007bff' : '#dee2e6') + ';' +
        'background:' + (isActive ? '#007bff' : isDisabled ? '#e9ecef' : 'white') + ';' +
        'color:' + (isActive ? 'white' : isDisabled ? '#6c757d' : '#007bff') + ';' +
        'cursor:' + (isDisabled || isActive ? 'default' : 'pointer') + ';border-radius:6px;font-weight:' + (isActive ? '700' : '500') + ';min-width:38px;transition:all .15s;';
    if (onClick && !isDisabled && !isActive) {
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseover', function() { btn.style.background = '#007bff'; btn.style.color = 'white'; });
        btn.addEventListener('mouseout', function() { btn.style.background = 'white'; btn.style.color = '#007bff'; });
    }
    if (isDisabled) btn.disabled = true;
    return btn;
}

function createAbsenceDots() {
    var s = document.createElement('span');
    s.textContent = '…';
    s.style.cssText = 'padding:7px 4px;color:#6c757d;';
    return s;
}

// ============================================================================
// MODAL — OUVRIR ABSENCES
// ============================================================================
function openAbsenceModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentAbsenceId = null;
    document.getElementById('absenceMatricule').value = '';
    document.getElementById('absenceDateDebut').value = new Date().toISOString().split('T')[0];
    document.getElementById('absenceDateFin').value = new Date().toISOString().split('T')[0];
    document.getElementById('absenceMotif').value = '';
    document.getElementById('absenceJustifie').checked = false;
    document.getElementById('absenceJustificationGroup').style.display = 'none';
    document.getElementById('absenceModal').style.display = 'flex';
    return false;
}

// ============================================================================
// MODAL — FERMER ABSENCES
// ============================================================================
function closeAbsenceModal() {
    document.getElementById('absenceModal').style.display = 'none';
}

async function saveAbsence() {
    var matricule = document.getElementById('absenceMatricule').value;
    var dateDebut = document.getElementById('absenceDateDebut').value;
    var dateFin = document.getElementById('absenceDateFin').value;
    var motif = document.getElementById('absenceMotif').value;
    var justifie = document.getElementById('absenceJustifie').checked;
    var justification = document.getElementById('absenceJustification').value;
    
    if (!matricule) {
        Swal.fire('Erreur', 'Veuillez sélectionner un élève', 'warning');
        return;
    }
    if (!dateDebut || !dateFin) {
        Swal.fire('Erreur', 'Les dates sont requises', 'warning');
        return;
    }
    
    var eleve = elevesLookup[matricule];
    if (!eleve) {
        Swal.fire('Erreur', 'Élève non trouvé', 'error');
        return;
    }
    
    showSpinner();
    try {
        var url = currentAbsenceId ? API_ABS.absences.update : API_ABS.absences.add;
        var body = {
            id: currentAbsenceId,
            matricule: matricule,
            nom: eleve.NOM,
            classe: eleve.CLASSE_NOM,
            dateDebut: dateDebut,
            dateFin: dateFin,
            motif: motif,
            justifie: justifie,
            justification: justification
        };
        
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var result = await res.json();
        
        if (result.success) {
            Swal.fire({ icon: 'success', title: 'Succès', text: result.message, timer: 1500, showConfirmButton: false });
            setTimeout(function() {
                closeAbsenceModal();
                loadAbsences();
            }, 1500);
        } else {
            Swal.fire('Erreur', result.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// MODAL — MODIFIER ABSENCES
// ============================================================================
function editAbsence(id) {
    var absence = null;
    for (var i = 0; i < absencesData.length; i++) {
        if (absencesData[i].ID === id) {
            absence = absencesData[i];
            break;
        }
    }
    if (!absence) return;
    
    currentAbsenceId = id;
    document.getElementById('absenceMatricule').value = absence.MATRICULE;
    document.getElementById('absenceDateDebut').value = absence.DATE_DEBUT;
    document.getElementById('absenceDateFin').value = absence.DATE_FIN || absence.DATE_DEBUT;
    document.getElementById('absenceMotif').value = absence.MOTIF || '';
    document.getElementById('absenceJustifie').checked = absence.JUSTIFIE;
    document.getElementById('absenceJustification').value = absence.JUSTIFICATION || '';
    document.getElementById('absenceModal').style.display = 'flex';
}

// ============================================================================
// SUPPRIMER ABSENCES
// ============================================================================
async function deleteAbsence(id) {
    var result = await Swal.fire({
        title: 'Confirmation',
        text: 'Voulez-vous vraiment supprimer cette absence ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    
    if (!result.isConfirmed) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.absences.delete, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false });
            loadAbsences();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// JUSTIFIER ABSENCES
// ============================================================================
async function justifyAbsence(id) {
    var result = await Swal.fire({
        title: 'Justifier l\'absence',
        input: 'textarea',
        inputPlaceholder: 'Motif de justification...',
        inputAttributes: {
            'aria-label': 'Motif de justification'
        },
        showCancelButton: true,
        confirmButtonText: 'Justifier',
        cancelButtonText: 'Annuler',
        preConfirm: function(text) {
            if (!text || !text.trim()) {
                Swal.showValidationMessage('Veuillez saisir un motif de justification');
                return false;
            }
            return text;
        }
    });
    
    if (!result.value) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.absences.justify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, justification: result.value })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ 
                icon: 'success', 
                title: 'Absence justifiée', 
                text: 'Le motif a été enregistré',
                timer: 1500, 
                showConfirmButton: false 
            });
            await loadAbsences();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        console.error('Erreur justification:', err);
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// SECTION RETARDS
// ============================================================================
async function loadRetards() {
    showSpinner();
    try {
        var res = await fetch(API_ABS.retards.list);
        var result = await res.json();
        if (result.success) {
            retardsData = result.data || [];
            baseRetardsData = [...retardsData];
            filteredRetards = [...retardsData];
            createRetardFilterControls();
            updateRetardStats();
            renderRetardsTable();
        } else {
            console.error('Erreur chargement retards:', result.message);
        }
    } catch (err) {
        console.error('loadRetards:', err);
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// BARRE DE FILTRES RETARDS
// ============================================================================
function createRetardFilterControls() {
    var oldFilter = document.getElementById('ret-filter-container');
    if (oldFilter) oldFilter.remove();

    var fc = document.createElement('div');
    fc.id = 'ret-filter-container';
    fc.className = 'filter-container';
    fc.innerHTML = `
        <div class="filter-group">
            <label><i class="fas fa-search"></i> Recherche</label>
            <input type="text" id="ret-search-filter" placeholder="Nom...">
        </div>
        <div class="filter-select">
            <label><i class="fas fa-filter"></i> Statut</label>
            <select id="ret-status-filter">
                <option value="">Tous</option>
                <option value="justifie">Justifié</option>
                <option value="non_justifie">Non justifié</option>
            </select>
        </div>
        <div class="filter-rows">
            <label><i class="fas fa-list"></i> Afficher</label>
            <select id="ret-rows-per-page">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <button class="filter-btn" id="ret-reset-filters" type="button">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;

    var container = document.querySelector('#tab-retards .dash-card-body') || document.body;
    var statsContainer = document.getElementById('retardStatsContainer');
    if (statsContainer && statsContainer.nextSibling) {
        container.insertBefore(fc, statsContainer.nextSibling);
    } else {
        container.prepend(fc);
    }

    document.getElementById('ret-search-filter').addEventListener('input', applyRetardFilters);
    document.getElementById('ret-status-filter').addEventListener('change', applyRetardFilters);
    document.getElementById('ret-rows-per-page').addEventListener('change', function(e) {
        retRows = parseInt(e.target.value);
        retPage = 1;
        renderRetardsTable();
    });
    document.getElementById('ret-reset-filters').addEventListener('click', resetRetardFilters);
}

function applyRetardFilters() {
    var search = (document.getElementById('ret-search-filter')?.value || '').toLowerCase().trim();
    var status = document.getElementById('ret-status-filter')?.value || '';

    filteredRetards = baseRetardsData.filter(function(ret) {
        var matchSearch = !search || (
            ret.NOM?.toLowerCase().includes(search) ||
            ret.MATRICULE?.toLowerCase().includes(search)
        );
        var matchStatus = !status || (
            status === 'justifie' ? ret.JUSTIFIE === true : ret.JUSTIFIE === false
        );
        return matchSearch && matchStatus;
    });

    retPage = 1;
    renderRetardsTable();
}

function resetRetardFilters() {
    var sf = document.getElementById('ret-search-filter');
    var stf = document.getElementById('ret-status-filter');
    var rp = document.getElementById('ret-rows-per-page');
    if (sf) sf.value = '';
    if (stf) stf.value = '';
    if (rp) rp.value = '10';
    retRows = 10;
    applyRetardFilters();
}

// ============================================================================
// Statistiques RETARDS
// ============================================================================
function updateRetardStats() {
    var total = filteredRetards.length;
    var justifies = 0;
    var totalDuree = 0;
    for (var i = 0; i < filteredRetards.length; i++) {
        if (filteredRetards[i].JUSTIFIE) justifies++;
        totalDuree += parseInt(filteredRetards[i].DUREE) || 0;
    }
    var moyenne = filteredRetards.length > 0 ? Math.round(totalDuree / filteredRetards.length) : 0;
    
    var totalEl = document.getElementById('totalRetardsVal');
    var justEl = document.getElementById('retardsJustifiesVal');
    var moyEl = document.getElementById('moyenneRetardsVal');
    if (totalEl) totalEl.textContent = total;
    if (justEl) justEl.textContent = justifies;
    if (moyEl) moyEl.textContent = moyenne;
}

// ============================================================================
// Tableau RETARDS
// ============================================================================
function renderRetardsTable() {
    var tbody = document.getElementById('retardsTableBody');
    if (!tbody) return;
    
    var start = (retPage - 1) * retRows;
    var end = start + retRows;
    var pageData = filteredRetards.slice(start, end);
    var totalPages = Math.ceil(filteredRetards.length / retRows);
    
    tbody.innerHTML = '';
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;">Aucun retard trouvé</td></tr>';
        updateRetardPagination(totalPages);
        return;
    }
    
    for (var i = 0; i < pageData.length; i++) {
        var r = pageData[i];
        var nameBadge = r.NOM ? '<span class="badge-name">' + escapeHtml(r.NOM) + '</span>' : '';
        var justifiedBadge = r.JUSTIFIE ? '<span class="badge-justified">✓ Justifié</span>' : '<span class="badge-not-justified">✗ Non justifié</span>';
        var justifyBtn = !r.JUSTIFIE ? '<button type="button" class="btn-action-justify" onclick="justifyRetard(\'' + r.ID + '\')" title="Justifier"><i class="fas fa-check"></i></button>' : '';
        
        var motifText = r.MOTIF || '-';
        if (motifText.length > 50) motifText = motifText.substring(0, 47) + '...';
        
        var row = tbody.insertRow();
        row.insertCell(0).innerHTML = nameBadge;
        row.insertCell(1).innerHTML = escapeHtml(r.CLASSE_NOM);
        row.insertCell(2).innerHTML = formatDate(r.DATE_RETARD);
        row.insertCell(3).innerHTML = formatHeure(r.HEURE_ARRIVEE);
        row.insertCell(4).innerHTML = formatHeure(r.HEURE_PREVUE);
        row.insertCell(5).innerHTML = r.DUREE + ' min';
        row.insertCell(6).innerHTML = justifiedBadge;
        row.insertCell(7).innerHTML = escapeHtml(motifText);
        row.insertCell(8).innerHTML = 
            '<div class="action-buttons-group">' +
            '<button type="button" class="btn-action-edit" onclick="editRetard(\'' + r.ID + '\')" title="Modifier"><i class="fas fa-edit"></i></button>' +
            '<button type="button" class="btn-action-delete" onclick="deleteRetard(\'' + r.ID + '\')" title="Supprimer"><i class="fas fa-trash"></i></button>' +
            justifyBtn +
            '</div>';
    }
    
    updateRetardPagination(totalPages);
    updateRetardCounter();
}

// ============================================================================
// COMPTEUR RETARDS
// ============================================================================
function updateRetardCounter() {
    let counter = document.getElementById('ret-record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'ret-record-counter';
        counter.style.cssText = 'margin:15px 0 0; padding:10px 15px; text-align:center; font-size:14px; background:#f8f9fa; border-radius:6px; border:1px solid #e9ecef;';
        const pagination = document.getElementById('retard-pagination');
        if (pagination?.parentNode) {
            pagination.parentNode.insertBefore(counter, pagination);
        } else {
            const table = document.querySelector('#tab-retards .dash-table');
            if (table?.parentNode) {
                table.parentNode.insertBefore(counter, table.nextSibling);
            }
        }
    }
    
    const start = filteredRetards.length === 0 ? 0 : (retPage - 1) * retRows + 1;
    const end = Math.min(retPage * retRows, filteredRetards.length);
    counter.innerHTML = `<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ${filteredRetards.length === 0 ? '0' : start} à ${end} sur <strong>${filteredRetards.length}</strong> enregistrement${filteredRetards.length > 1 ? 's' : ''}`;
}

// ============================================================================
// PAGINATION RETARDS
// ============================================================================
function updateRetardPagination(totalPages) {
    var container = document.getElementById('retard-pagination');
    if (!container) return;
    
    container.innerHTML = '';
    if (totalPages <= 1) return;

    var pc = document.createElement('div');
    pc.style.cssText = 'margin:20px 0; display:flex; justify-content:center; gap:5px; flex-wrap:wrap;';

    pc.appendChild(createRetardPageBtn('«', function() { goToRetardPage(1); }, retPage === 1));
    pc.appendChild(createRetardPageBtn('‹', function() { if (retPage > 1) goToRetardPage(retPage - 1); }, retPage === 1));

    var maxVisible = 5;
    var start = Math.max(1, retPage - Math.floor(maxVisible / 2));
    var end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        pc.appendChild(createRetardPageBtn('1', function() { goToRetardPage(1); }));
        if (start > 2) pc.appendChild(createRetardDots());
    }
    for (var i = start; i <= end; i++) {
        (function(page) {
            pc.appendChild(createRetardPageBtn(page, function() { goToRetardPage(page); }, page === retPage));
        })(i);
    }
    if (end < totalPages) {
        if (end < totalPages - 1) pc.appendChild(createRetardDots());
        (function(tp) {
            pc.appendChild(createRetardPageBtn(tp, function() { goToRetardPage(tp); }));
        })(totalPages);
    }

    pc.appendChild(createRetardPageBtn('›', function() { if (retPage < totalPages) goToRetardPage(retPage + 1); }, retPage === totalPages));
    pc.appendChild(createRetardPageBtn('»', function() { goToRetardPage(totalPages); }, retPage === totalPages));

    container.appendChild(pc);
}

function goToRetardPage(page) {
    retPage = page;
    renderRetardsTable();
}

function createRetardPageBtn(text, onClick, isDisabled) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    var isActive = (text == retPage && !isNaN(text));
    btn.style.cssText = 'padding:7px 13px;border:1px solid ' + (isActive || !isDisabled ? '#007bff' : '#dee2e6') + ';' +
        'background:' + (isActive ? '#007bff' : isDisabled ? '#e9ecef' : 'white') + ';' +
        'color:' + (isActive ? 'white' : isDisabled ? '#6c757d' : '#007bff') + ';' +
        'cursor:' + (isDisabled || isActive ? 'default' : 'pointer') + ';border-radius:6px;font-weight:' + (isActive ? '700' : '500') + ';min-width:38px;transition:all .15s;';
    if (onClick && !isDisabled && !isActive) {
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseover', function() { btn.style.background = '#007bff'; btn.style.color = 'white'; });
        btn.addEventListener('mouseout', function() { btn.style.background = 'white'; btn.style.color = '#007bff'; });
    }
    if (isDisabled) btn.disabled = true;
    return btn;
}

function createRetardDots() {
    var s = document.createElement('span');
    s.textContent = '…';
    s.style.cssText = 'padding:7px 4px;color:#6c757d;';
    return s;
}

// ============================================================================
// MODAL — OUVRIR RETARDS
// ============================================================================
function openRetardModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentRetardId = null;
    document.getElementById('retardMatricule').value = '';
    document.getElementById('retardDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('retardHeurePrevue').value = '08:00';
    document.getElementById('retardHeureArrivee').value = '';
    document.getElementById('retardMotif').value = '';
    document.getElementById('retardJustifie').checked = false;
    document.getElementById('retardJustificationGroup').style.display = 'none';
    document.getElementById('retardModal').style.display = 'flex';
    return false;
}

// ============================================================================
// MODAL - FERMER RETARDS
// ============================================================================
function closeRetardModal() {
    document.getElementById('retardModal').style.display = 'none';
}

async function saveRetard() {
    var matricule = document.getElementById('retardMatricule').value;
    var date = document.getElementById('retardDate').value;
    var heurePrevue = document.getElementById('retardHeurePrevue').value;
    var heureArrivee = document.getElementById('retardHeureArrivee').value;
    var motif = document.getElementById('retardMotif').value;
    var justifie = document.getElementById('retardJustifie').checked;
    var justification = document.getElementById('retardJustification').value;
    
    if (!matricule) {
        Swal.fire('Erreur', 'Veuillez sélectionner un élève', 'warning');
        return;
    }
    if (!date) {
        Swal.fire('Erreur', 'La date est requise', 'warning');
        return;
    }
    if (!heurePrevue || !heureArrivee) {
        Swal.fire('Erreur', 'Les heures sont requises', 'warning');
        return;
    }
    
    var hPrev = parseInt(heurePrevue.split(':')[0]);
    var mPrev = parseInt(heurePrevue.split(':')[1]);
    var hArr = parseInt(heureArrivee.split(':')[0]);
    var mArr = parseInt(heureArrivee.split(':')[1]);
    var minutesPrevue = hPrev * 60 + mPrev;
    var minutesArrivee = hArr * 60 + mArr;
    var duree = Math.max(0, minutesArrivee - minutesPrevue);
    
    var eleve = elevesLookup[matricule];
    if (!eleve) {
        Swal.fire('Erreur', 'Élève non trouvé', 'error');
        return;
    }
    
    showSpinner();
    try {
        var url = currentRetardId ? API_ABS.retards.update : API_ABS.retards.add;
        var body = {
            id: currentRetardId,
            matricule: matricule,
            nom: eleve.NOM,
            classe: eleve.CLASSE_NOM,
            date: date,
            heurePrevue: heurePrevue,
            heureArrivee: heureArrivee,
            duree: duree,
            motif: motif,
            justifie: justifie,
            justification: justification
        };
        
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        var result = await res.json();
        
        if (result.success) {
            Swal.fire({ icon: 'success', title: 'Succès', text: result.message, timer: 1500, showConfirmButton: false });
            setTimeout(function() {
                closeRetardModal();
                loadRetards();
            }, 1500);
        } else {
            Swal.fire('Erreur', result.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// MODAL — MODIFIER RETARDS
// ============================================================================
function editRetard(id) {
    var retard = null;
    for (var i = 0; i < retardsData.length; i++) {
        if (retardsData[i].ID === id) {
            retard = retardsData[i];
            break;
        }
    }
    if (!retard) return;
    
    currentRetardId = id;
    document.getElementById('retardMatricule').value = retard.MATRICULE;
    document.getElementById('retardDate').value = retard.DATE_RETARD;
    document.getElementById('retardHeurePrevue').value = retard.HEURE_PREVUE.substring(0, 5);
    document.getElementById('retardHeureArrivee').value = retard.HEURE_ARRIVEE.substring(0, 5);
    document.getElementById('retardMotif').value = retard.MOTIF || '';
    document.getElementById('retardJustifie').checked = retard.JUSTIFIE;
    document.getElementById('retardJustification').value = retard.JUSTIFICATION || '';
    document.getElementById('retardModal').style.display = 'flex';
}

// ============================================================================
// SUPPRIMER RETARDS
// ============================================================================
async function deleteRetard(id) {
    var result = await Swal.fire({
        title: 'Confirmation',
        text: 'Voulez-vous vraiment supprimer ce retard ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    
    if (!result.isConfirmed) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.retards.delete, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false });
            loadRetards();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// JUSTIFIER RETARDS
// ============================================================================
async function justifyRetard(id) {
    var result = await Swal.fire({
        title: 'Justifier le retard',
        input: 'textarea',
        inputPlaceholder: 'Motif de justification...',
        inputAttributes: {
            'aria-label': 'Motif de justification'
        },
        showCancelButton: true,
        confirmButtonText: 'Justifier',
        cancelButtonText: 'Annuler',
        preConfirm: function(text) {
            if (!text || !text.trim()) {
                Swal.showValidationMessage('Veuillez saisir un motif de justification');
                return false;
            }
            return text;
        }
    });
    
    if (!result.value) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABS.retards.justify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, justification: result.value })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ 
                icon: 'success', 
                title: 'Retard justifié', 
                text: 'Le motif a été enregistré',
                timer: 1500, 
                showConfirmButton: false 
            });
            await loadRetards();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        console.error('Erreur justification:', err);
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ============================================================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ============================================================================
var absenceJustifie = document.getElementById('absenceJustifie');
if (absenceJustifie) {
    absenceJustifie.addEventListener('change', function(e) {
        var group = document.getElementById('absenceJustificationGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
    });
}

var retardJustifie = document.getElementById('retardJustifie');
if (retardJustifie) {
    retardJustifie.addEventListener('change', function(e) {
        var group = document.getElementById('retardJustificationGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
    });
}

// ============================================================================
// INITIALISATION
// ============================================================================
async function init() {
    await loadEleves();
    loadAbsences();
    loadRetards();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================================
// EXPOSITIONS GLOBALES
// ============================================================================
window.switchTab = switchTab;
window.openAbsenceModal = openAbsenceModal;
window.closeAbsenceModal = closeAbsenceModal;
window.saveAbsence = saveAbsence;
window.editAbsence = editAbsence;
window.deleteAbsence = deleteAbsence;
window.justifyAbsence = justifyAbsence;
window.goToAbsencePage = goToAbsencePage;
window.openRetardModal = openRetardModal;
window.closeRetardModal = closeRetardModal;
window.saveRetard = saveRetard;
window.editRetard = editRetard;
window.deleteRetard = deleteRetard;
window.justifyRetard = justifyRetard;
window.goToRetardPage = goToRetardPage;