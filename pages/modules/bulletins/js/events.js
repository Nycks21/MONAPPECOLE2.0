'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉVÉNEMENTS — Module Bulletins
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ATTACHER LES ÉCOUTEURS
// ─────────────────────────────────────────────────────────────────────────────

function attachEventListeners() {
    var tbody = document.getElementById('notesTableBody');
    if (!tbody) return;

    tbody.removeEventListener('input', handleTableInput);
    tbody.removeEventListener('blur', handleTableBlur);
    tbody.removeEventListener('keydown', handleTableKeydown);

    tbody.addEventListener('input', handleTableInput);
    tbody.addEventListener('blur', handleTableBlur, true);
    tbody.addEventListener('keydown', handleTableKeydown);
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES ÉVÉNEMENTS
// ─────────────────────────────────────────────────────────────────────────────

function handleTableInput(e) {
    var target = e.target;
    if (target.classList && target.classList.contains('note-input-modern')) {
        handleNoteInput(e);
    } else if (target.classList && target.classList.contains('appreciation-input')) {
        handleAppreciationInput(e);
    }
}

function handleTableBlur(e) {
    var target = e.target;
    if (target.classList && target.classList.contains('note-input-modern')) {
        handleNoteBlur(e);
    }
}

function handleTableKeydown(e) {
    var target = e.target;
    if (target.classList && target.classList.contains('note-input-modern')) {
        handleNoteKeydown(e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES NOTES (Input, Blur, Keydown)
// ─────────────────────────────────────────────────────────────────────────────

function handleNoteInput(e) {
    var input = e.target;
    var row = input.closest('tr');
    if (!row) return;

    var idx = parseInt(row.dataset.idx);
    var field = input.getAttribute('data-field');
    var value = input.value.trim().replace(',', '.');

    if (input.readonly) {
        showToast('Ce bulletin est validé définitivement.', 'warning');
        input.value = input.dataset.original || '';
        return;
    }

    if (!currentEleves[idx]) return;

    if (value === '' || value === '-') {
        if (field === 'note1') currentEleves[idx].Note1 = null;
        else if (field === 'note2') currentEleves[idx].Note2 = null;
        else if (field === 'projet') currentEleves[idx].NoteProjet = null;

        updateTotalsFromRow(row, idx);
        marquerModification(input);
        return;
    }

    var num = parseFloat(value);
    if (!isNaN(num)) {
        if (num < 0 || num > 20) {
            input.style.borderColor = (num > 20) ? '#dc3545' : '';
        } else {
            input.style.borderColor = '#28a745';
            if (field === 'note1') currentEleves[idx].Note1 = num;
            else if (field === 'note2') currentEleves[idx].Note2 = num;
            else if (field === 'projet') currentEleves[idx].NoteProjet = num;

            updateTotalsFromRow(row, idx);
            marquerModification(input);
        }
    }
}

function handleNoteBlur(e) {
    var input = e.target;
    var row = input.closest('tr');
    if (!row) return;

    var idx = parseInt(row.dataset.idx);
    var field = input.getAttribute('data-field');

    if (input.readonly || isNaN(idx) || !currentEleves[idx]) return;

    var value = validateAndFormatNote(input);

    if (value !== null) {
        if (field === 'note1') currentEleves[idx].Note1 = value;
        else if (field === 'note2') currentEleves[idx].Note2 = value;
        else if (field === 'projet') currentEleves[idx].NoteProjet = value;

        updateTotalsFromRow(row, idx);
        marquerModification(input);
    }
}

function handleNoteKeydown(e) {
    var input = e.target;
    if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        input.value = input.dataset.original || '';
        input.blur();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// APPRÉCIATION
// ─────────────────────────────────────────────────────────────────────────────

function handleAppreciationInput(e) {
    var input = e.target;
    var row = input.closest('tr');
    if (!row) return;

    var idx = parseInt(row.dataset.idx);

    if (input.readonly) {
        showToast('Ce bulletin est validé définitivement.', 'warning');
        input.value = input.dataset.original || '';
        return;
    }

    if (currentEleves && currentEleves[idx]) {
        currentEleves[idx].Appreciation = input.value;
        marquerModification(input);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ON MATIERE CHANGE
// ─────────────────────────────────────────────────────────────────────────────

function onMatiereChange() {
    var select = document.getElementById('ddlMatiere');
    var opt = select && select.options[select.selectedIndex];
    var classeId = opt ? opt.getAttribute('data-classe-id') : null;
    var classeNom = opt ? opt.getAttribute('data-classe-nom') : null;
    currentMatiereId = select ? select.value : null;

    var classeSelect = document.getElementById('ddlClasse');
    if (classeSelect && classeId) {
        classeSelect.innerHTML = '';
        var o = document.createElement('option');
        o.value = classeId;
        o.textContent = classeNom || 'Classe';
        classeSelect.appendChild(o);
        classeSelect.disabled = true;
        currentClasseId = classeId;
    }

    var coeffPanel = document.getElementById('coeffGlobalPanel');
    if (coeffPanel) coeffPanel.style.display = 'none';
    resetButtons();
}

// Exposer les fonctions globalement
window.attachEventListeners = attachEventListeners;
window.onMatiereChange = onMatiereChange;