'use strict';

var classesList = [];
var matieresList = [];
var emploiData = {};
var currentEdit = { row: null, col: null, key: null };
var currentClasse = '';
var currentSemaine = '';

document.addEventListener('DOMContentLoaded', function() {
    loadClasses();
    initSemaine();
});

function initSemaine() {
    var now = new Date();
    var week = now.getFullYear() + '-W' + String(getWeekNumber(now)).padStart(2, '0');
    document.getElementById('semaineFilter').value = week;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function loadClasses() {
    try {
        var res = await fetch(API_EMPLOI.getClasses);
        var data = await res.json();
        if (data.success) {
            classesList = data.data || [];
            populateClasseSelects();
        }
    } catch (e) {
        console.error('loadClasses', e);
    }
}

function populateClasseSelects() {
    var selects = ['classeFilter', 'editClasse'];
    selects.forEach(function(id) {
        var sel = document.getElementById(id);
        if (!sel) return;
        var currentVal = sel.value;
        sel.innerHTML = id === 'classeFilter' 
            ? '<option value="">-- Choisir une classe --</option>'
            : '<option value="">-- Sélectionner --</option>';
        classesList.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.ID;
            opt.textContent = c.NOM;
            sel.appendChild(opt);
        });
        if (currentVal) sel.value = currentVal;
    });
}

async function loadMatieres() {
    try {
        var res = await fetch(API_EMPLOI.getMatieres);
        var data = await res.json();
        if (data.success) {
            matieresList = data.data || [];
        }
    } catch (e) {
        console.error('loadMatieres', e);
    }
    populateMatiereSelects();
}

function populateMatiereSelects() {
    var sel = document.getElementById('editMatiere');
    if (!sel) return;
    var currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Sélectionner --</option>';
    matieresList.forEach(function(m) {
        var opt = document.createElement('option');
        opt.value = m.ID;
        opt.textContent = m.NOM;
        sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
}

async function loadEmploi() {
    var classe = document.getElementById('classeFilter').value;
    var semaine = document.getElementById('semaineFilter').value;
    if (!classe) {
        Swal.fire('Info', 'Veuillez sélectionner une classe.', 'info');
        return;
    }
    currentClasse = classe;
    currentSemaine = semaine;
    showSpinner();
    try {
        var url = API_EMPLOI.getEmploi + '?classe=' + encodeURIComponent(classe) + '&semaine=' + encodeURIComponent(semaine);
        var res = await fetch(url);
        var data = await res.json();
        if (data.success) {
            emploiData = data.data || {};
            renderTable();
        } else {
            Swal.fire('Erreur', data.message || 'Impossible de charger l\'emploi.', 'error');
        }
    } catch (e) {
        console.error('loadEmploi', e);
        emploiData = {};
        renderTable();
    } finally {
        hideSpinner();
    }
}

function renderTable() {
    var tbody = document.getElementById('emploiBody');
    if (!tbody) return;
    var hours = generateHourSlots();
    var days = [1,2,3,4,5,6];
    var html = '';
    hours.forEach(function(h) {
        var timeLabel = h.label;
        html += '<tr>';
        html += '<td class="time-col">' + timeLabel + '</td>';
        days.forEach(function(d) {
            var key = d + '_' + h.value;
            var cell = emploiData[key] || null;
            var content = '';
            if (cell) {
                var matiere = matieresList.find(m => m.ID == cell.matiere);
                var matiereName = matiere ? matiere.NOM : cell.matiere;
                var colorClass = 'matiere-' + (matiere ? matiere.NOM.replace(/\s/g,'') : '');
                content = '<div class="cell-content ' + colorClass + '" style="padding:2px;">'
                    + '<span class="matiere">' + escapeHtml(matiereName) + '</span>'
                    + (cell.prof ? '<span class="prof">' + escapeHtml(cell.prof) + '</span>' : '')
                    + (cell.salle ? '<span class="salle">' + escapeHtml(cell.salle) + '</span>' : '')
                    + '</div>';
            } else {
                content = '<span class="empty-cell">-</span>';
            }
            html += '<td data-day="' + d + '" data-time="' + h.value + '" onclick="openEditModal(event, this)">'
                + content
                + '</td>';
        });
        html += '</tr>';
    });
    tbody.innerHTML = html;
}

function generateHourSlots() {
    var slots = [];
    for (var h = 7; h <= 18; h++) {
        var label = String(h).padStart(2,'0') + ':00';
        slots.push({ label: label, value: h + ':00' });
        if (h < 18) {
            var next = String(h).padStart(2,'0') + ':30';
            slots.push({ label: next, value: h + ':30' });
        }
    }
    return slots;
}

function openEditModal(event, td) {
    if (!td) {
        document.getElementById('editClasse').value = currentClasse;
        document.getElementById('editJour').value = '1';
        document.getElementById('editHeureDebut').value = '08:00';
        document.getElementById('editHeureFin').value = '09:00';
        document.getElementById('editMatiere').value = '';
        document.getElementById('editEnseignant').value = '';
        document.getElementById('editSalle').value = '';
        currentEdit = { row: null, col: null, key: null };
        openModal('editModal');
        return;
    }
    var day = td.dataset.day;
    var time = td.dataset.time;
    var key = day + '_' + time;
    var cell = emploiData[key] || {};
    document.getElementById('editClasse').value = currentClasse;
    document.getElementById('editJour').value = day;
    document.getElementById('editHeureDebut').value = time;
    document.getElementById('editHeureFin').value = time;
    document.getElementById('editMatiere').value = cell.matiere || '';
    document.getElementById('editEnseignant').value = cell.prof || '';
    document.getElementById('editSalle').value = cell.salle || '';
    currentEdit = { row: td.parentNode.rowIndex, col: td.cellIndex, key: key };
    openModal('editModal');
}

async function saveCell() {
    var classe = document.getElementById('editClasse').value;
    var jour = document.getElementById('editJour').value;
    var heureDebut = document.getElementById('editHeureDebut').value;
    var heureFin = document.getElementById('editHeureFin').value;
    var matiere = document.getElementById('editMatiere').value;
    var prof = document.getElementById('editEnseignant').value.trim();
    var salle = document.getElementById('editSalle').value.trim();
    var semaine = document.getElementById('semaineFilter').value;

    if (!classe) { Swal.fire('Erreur', 'Classe requise.', 'warning'); return; }
    if (!jour) { Swal.fire('Erreur', 'Jour requis.', 'warning'); return; }
    if (!heureDebut) { Swal.fire('Erreur', 'Heure début requise.', 'warning'); return; }
    if (!matiere) { Swal.fire('Erreur', 'Veuillez sélectionner une matière.', 'warning'); return; }

    var key = jour + '_' + heureDebut;
    var payload = {
        classe: classe,
        semaine: semaine,
        jour: jour,
        heureDebut: heureDebut,
        heureFin: heureFin || heureDebut,
        matiere: matiere,
        prof: prof,
        salle: salle
    };

    showSpinner();
    try {
        var res = await fetch(API_EMPLOI.saveEmploi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var data = await res.json();
        if (data.success) {
            emploiData[key] = { matiere: matiere, prof: prof, salle: salle };
            renderTable();
            closeEditModal();
            Swal.fire('Succès', 'Enregistré.', 'success', { timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire('Erreur', data.message || 'Échec de l\'enregistrement.', 'error');
        }
    } catch (e) {
        console.error('saveCell', e);
        Swal.fire('Erreur', 'Impossible de sauvegarder.', 'error');
    } finally {
        hideSpinner();
    }
}

async function deleteCell() {
    if (!currentEdit.key) {
        Swal.fire('Info', 'Aucune cellule sélectionnée.', 'info');
        return;
    }
    var confirm = await Swal.fire({
        title: 'Supprimer ?',
        text: 'Voulez-vous supprimer ce créneau ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    if (!confirm.isConfirmed) return;

    var parts = currentEdit.key.split('_');
    var payload = {
        classe: currentClasse,
        semaine: document.getElementById('semaineFilter').value,
        jour: parts[0],
        heureDebut: parts[1]
    };
    showSpinner();
    try {
        var res = await fetch(API_EMPLOI.deleteEmploi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var data = await res.json();
        if (data.success) {
            delete emploiData[currentEdit.key];
            renderTable();
            closeEditModal();
            Swal.fire('Supprimé', '', 'success', { timer: 1000, showConfirmButton: false });
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (e) {
        console.error('deleteCell', e);
        Swal.fire('Erreur', 'Impossible de supprimer.', 'error');
    } finally {
        hideSpinner();
    }
}

function saveAll() {
    Swal.fire('Info', 'Tous les créneaux sont sauvegardés individuellement.', 'info');
}

function printEmploi() {
    window.print();
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}
function showSpinner() {
    document.getElementById('spinnerOverlay').style.display = 'flex';
}
function hideSpinner() {
    document.getElementById('spinnerOverlay').style.display = 'none';
}
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadMatieres();