'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CALCULS — Module Bulletins
// ─────────────────────────────────────────────────────────────────────────────

function calculerTotalNote(note1, note2, noteProjet) {
    var coeff1 = currentCoefficients.coeff1 || 1;
    var coeff2 = currentCoefficients.coeff2 || 2;
    var coeffProjet = currentCoefficients.coeffProjet || 1;

    var total = 0;
    var n1 = parseFloat(note1);
    var n2 = parseFloat(note2);
    var np = parseFloat(noteProjet);

    if (!isNaN(n1) && n1 >= 0 && n1 <= 20) total += n1 * coeff1;
    if (!isNaN(n2) && n2 >= 0 && n2 <= 20) total += n2 * coeff2;
    if (!isNaN(np) && np >= 0 && np <= 20) total += np * coeffProjet;

    return total;
}

function calculerMoyenne(note1, note2, noteProjet) {
    var total = calculerTotalNote(note1, note2, noteProjet);
    var coeffTotal = currentCoefficients.coeff1 + currentCoefficients.coeff2 + currentCoefficients.coeffProjet;

    if (total > 0 && coeffTotal > 0) {
        return (total / coeffTotal).toFixed(2);
    }
    return '-';
}

function validateAndFormatNote(input) {
    var value = input.value.trim().replace(',', '.');
    var original = input.dataset.original || '';

    if (value === '') return null;

    var num = parseFloat(value);

    if (isNaN(num)) {
        showToast('Veuillez entrer un nombre valide', 'warning');
        input.value = original;
        return null;
    }

    if (num < 0 || num > 20) {
        showToast(num < 0 ? 'La note ne peut pas être négative' : '⚠️ Note maximum: 20.00', 'error');
        input.value = original;
        return null;
    }

    var formatted = num.toFixed(2);
    input.value = formatted;
    return num;
}

function updateTotalsFromRow(row, idx) {
    if (!currentEleves[idx]) return;

    var eleve = currentEleves[idx];
    var total = calculerTotalNote(eleve.Note1, eleve.Note2, eleve.NoteProjet);
    var moyenne = calculerMoyenne(eleve.Note1, eleve.Note2, eleve.NoteProjet);

    var totalSpan = row.querySelector('.totalnote-value');
    if (totalSpan) {
        totalSpan.textContent = total.toFixed(2);
        totalSpan.dataset.total = total.toFixed(2);
    }

    var moyenneValue = row.querySelector('.moyenne-value');
    if (moyenneValue) moyenneValue.textContent = moyenne;

    var circle = row.querySelector('.moyenne-circle');
    if (circle) {
        circle.className = 'moyenne-circle';
        if (moyenne !== '-') {
            var m = parseFloat(moyenne);
            if (m >= 16) circle.classList.add('moyenne-excellent');
            else if (m >= 14) circle.classList.add('moyenne-tres-bien');
            else if (m >= 12) circle.classList.add('moyenne-bien');
            else if (m >= 10) circle.classList.add('moyenne-passable');
            else circle.classList.add('moyenne-insuffisant');
        }
    }
}

function marquerModification(element) {
    var row = element.closest('tr');
    if (!row) return;

    var statut = row.querySelector('.statut-badge');
    if (statut && statut.textContent.indexOf('Validé') === -1) {
        statut.className = 'statut-badge statut-en-cours';
        statut.innerHTML = '<i class="statut-icon">⏳</i> En cours';
    }

    setUnsavedChanges(true);
}

// Dans calculations.js, ajouter cette fonction

// ─────────────────────────────────────────────────────────────────────────────
// COEFFICIENTS
// ─────────────────────────────────────────────────────────────────────────────

async function appliquerCoefficients() {
    var coeff1 = parseInt(document.getElementById('globalCoeff1').value);
    var coeff2 = parseInt(document.getElementById('globalCoeff2').value);
    var coeffProjet = parseInt(document.getElementById('globalCoeffProjet').value);

    if (isNaN(coeff1) || isNaN(coeff2) || isNaN(coeffProjet) || 
        coeff1 < 1 || coeff2 < 1 || coeffProjet < 1 || 
        coeff1 > 10 || coeff2 > 10 || coeffProjet > 10) {
        showToast('Coefficients invalides (1-10, entiers)', 'warning');
        return;
    }

    if (!currentMatiereId || !currentClasseId || !currentPeriode) {
        showToast('Veuillez charger une liste d\'élèves d\'abord', 'warning');
        return;
    }

    showLoading('Application des coefficients...');

    try {
        var data = await fetchWithErrorHandling(API_BULLETINS.saveCoeffs, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matiereId: currentMatiereId,
                classeId: currentClasseId,
                periode: currentPeriode,
                coeff1: coeff1,
                coeff2: coeff2,
                coeffProjet: coeffProjet
            })
        });

        if (data.success) {
            currentCoefficients.coeff1 = coeff1;
            currentCoefficients.coeff2 = coeff2;
            currentCoefficients.coeffProjet = coeffProjet;

            // Mettre à jour les affichages des coefficients
            var coeffDisplays = document.querySelectorAll('.coeff-display');
            for (var i = 0; i < coeffDisplays.length; i++) {
                var idx = i % 3;
                if (idx === 0) coeffDisplays[i].textContent = '×' + coeff1;
                else if (idx === 1) coeffDisplays[i].textContent = '×' + coeff2;
                else if (idx === 2) coeffDisplays[i].textContent = '×' + coeffProjet;
            }

            // Recalculer les totaux
            var rows = document.querySelectorAll('#notesTableBody tr');
            for (var j = 0; j < rows.length; j++) {
                updateTotalsFromRow(rows[j], j);
            }

            var msg = document.getElementById('coeffMessage');
            if (msg) {
                msg.innerHTML = 'Coefficients appliqués : Note1 (×' + coeff1 + ') | Note2 (×' + coeff2 + ') | Examen (×' + coeffProjet + ')';
            }

            showToast('Coefficients appliqués avec succès', 'success');
        } else {
            throw new Error(data.message || 'Erreur lors de la sauvegarde');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

// Exposer la fonction globalement
window.appliquerCoefficients = appliquerCoefficients;
window.calculerTotalNote = calculerTotalNote;
window.calculerMoyenne = calculerMoyenne;
window.validateAndFormatNote = validateAndFormatNote;
window.updateTotalsFromRow = updateTotalsFromRow;
window.marquerModification = marquerModification;