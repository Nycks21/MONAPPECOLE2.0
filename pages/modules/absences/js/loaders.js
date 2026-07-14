'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES ÉLÈVES
// ─────────────────────────────────────────────────────────────────────────────

async function loadEleves() {
    try {
        var res = await fetch(API_ABSENCES.getEleves);
        if (!res.ok) return;
        var result = await res.json();
        if (!result.success) return;
        
        var eleves = result.Eleves || [];
        buildElevesLookup(eleves);
        populateStudentSelects(eleves);
    } catch (err) {
        console.warn('loadEleves:', err);
    }
}

function buildElevesLookup(eleves) {
    elevesLookup = {};
    for (var i = 0; i < eleves.length; i++) {
        var e = eleves[i];
        elevesLookup[e.MATRICULE] = {
            NOM: e.NOM || '',
            CLASSE_NOM: e.CLASSE_NOM || '',
            CLASSE: e.CLASSE_NOM || ''
        };
    }
}

function populateStudentSelects(eleves) {
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
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES ABSENCES
// ─────────────────────────────────────────────────────────────────────────────

async function loadAbsences() {
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.absences.list);
        var result = await res.json();
        if (result.success) {
            absencesData = result.data || [];
            baseAbsencesData = absencesData.slice();
            filteredAbsences = absencesData.slice();
            createFilterControlsAbsences();
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

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES RETARDS
// ─────────────────────────────────────────────────────────────────────────────

async function loadRetards() {
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.retards.list);
        var result = await res.json();
        if (result.success) {
            retardsData = result.data || [];
            baseRetardsData = retardsData.slice();
            filteredRetards = retardsData.slice();
            createFilterControlsRetards();
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

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// RENDU TABLEAUX
// ─────────────────────────────────────────────────────────────────────────────

function renderAbsencesTable() {
    var tbody = document.getElementById('absencesTableBody');
    if (!tbody) return;
    
    var start = (absPage - 1) * absRows;
    var pageData = filteredAbsences.slice(start, start + absRows);
    var totalPages = Math.ceil(filteredAbsences.length / absRows);
    
    tbody.innerHTML = '';
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">Aucune absence trouvée</td></tr>';
    } else {
        for (var i = 0; i < pageData.length; i++) {
            var a = pageData[i];
            var row = tbody.insertRow();
            row.innerHTML =
                '<td>' + getNomBadge(a.NOM) + '</td>' +
                '<td>' + getClasseBadge(a.CLASSE_NOM) + '</td>' +
                '<td>' + formatDate(a.DATE_DEBUT) + '</td>' +
                '<td>' + formatDate(a.DATE_FIN) + '</td>' +
                '<td>' + (a.DUREE || '1') + ' jour(s)</td>' +
                '<td>' + getJustificationBadge(a.JUSTIFIE) + '</td>' +
                '<td>' + escapeHtml(a.MOTIF || '-') + '</td>' +
                '<td style="text-align:center;">' +
                '<button type="button" class="btn btn-sm btn-primary" style="margin:0 2px;" onclick="editAbsence(\'' + a.ID + '\')"><i class="fas fa-edit"></i></button>' +
                '<button type="button" class="btn btn-sm btn-danger" style="margin:0 2px;" onclick="deleteAbsence(\'' + a.ID + '\')"><i class="fas fa-trash"></i></button>' +
                (!a.JUSTIFIE ? '<button type="button" class="btn btn-sm btn-success" style="margin:0 2px;" onclick="justifyAbsence(\'' + a.ID + '\')" title="Justifier"><i class="fas fa-check"></i></button>' : '') +
                '</td>';
        }
    }
    
    createPaginationControls('abs-pagination', absPage, totalPages, goToAbsencePage);
    updateCounter('abs-record-counter', filteredAbsences, absPage, absRows);
}

function renderRetardsTable() {
    var tbody = document.getElementById('retardsTableBody');
    if (!tbody) return;
    
    var start = (retPage - 1) * retRows;
    var pageData = filteredRetards.slice(start, start + retRows);
    var totalPages = Math.ceil(filteredRetards.length / retRows);
    
    tbody.innerHTML = '';
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;">Aucun retard trouvé</td></tr>';
    } else {
        for (var i = 0; i < pageData.length; i++) {
            var r = pageData[i];
            var row = tbody.insertRow();
            row.innerHTML =
                '<td>' + getNomBadge(r.NOM) + '</td>' +
                '<td>' + getClasseBadge(r.CLASSE_NOM) + '</td>' +
                '<td>' + formatDate(r.DATE_RETARD) + '</td>' +
                '<td>' + formatHeure(r.HEURE_ARRIVEE) + '</td>' +
                '<td>' + formatHeure(r.HEURE_PREVUE) + '</td>' +
                '<td>' + (r.DUREE || '0') + ' min</td>' +
                '<td>' + getJustificationBadge(r.JUSTIFIE) + '</td>' +
                '<td>' + escapeHtml(r.MOTIF || '-') + '</td>' +
                '<td style="text-align:center;">' +
                '<button type="button" class="btn btn-sm btn-primary" style="margin:0 2px;" onclick="editRetard(\'' + r.ID + '\')"><i class="fas fa-edit"></i></button>' +
                '<button type="button" class="btn btn-sm btn-danger" style="margin:0 2px;" onclick="deleteRetard(\'' + r.ID + '\')"><i class="fas fa-trash"></i></button>' +
                (!r.JUSTIFIE ? '<button type="button" class="btn btn-sm btn-success" style="margin:0 2px;" onclick="justifyRetard(\'' + r.ID + '\')" title="Justifier"><i class="fas fa-check"></i></button>' : '') +
                '</td>';
        }
    }
    
    createPaginationControls('retard-pagination', retPage, totalPages, goToRetardPage);
    updateCounter('ret-record-counter', filteredRetards, retPage, retRows);
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION - NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

function goToAbsencePage(page) {
    absPage = page;
    renderAbsencesTable();
}

function goToRetardPage(page) {
    retPage = page;
    renderRetardsTable();
}

// Exposition globale
window.loadAbsences = loadAbsences;
window.loadRetards = loadRetards;
window.renderAbsencesTable = renderAbsencesTable;
window.renderRetardsTable = renderRetardsTable;
window.goToAbsencePage = goToAbsencePage;
window.goToRetardPage = goToRetardPage;