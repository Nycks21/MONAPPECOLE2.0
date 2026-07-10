'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CRUD — Module Bulletins (Sauvegarde, Validation, Export)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SAUVEGARDE
// ─────────────────────────────────────────────────────────────────────────────

window.sauvegarder = async function() {
    if (isLoading || pendingSave) {
        showToast(pendingSave ? 'Sauvegarde en cours...' : 'Opération en cours...', 'info');
        return;
    }

    var rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucune donnée à sauvegarder', 'warning');
        return;
    }

    if (currentEleves.every(function(e) { return e.Statut === 'Validé'; })) {
        showToast('Tous les bulletins sont déjà validés', 'info');
        return;
    }

    pendingSave = true;
    showLoading('Sauvegarde en cours...');

    try {
        var promises = [];

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var eleveId = row.dataset.eleveId;

            var note1Input = row.querySelector('[data-field="note1"]');
            var note2Input = row.querySelector('[data-field="note2"]');
            var projetInput = row.querySelector('[data-field="projet"]');
            var appreciationInput = row.querySelector('.appreciation-input');

            var note1 = note1Input ? note1Input.value : '';
            var note2 = note2Input ? note2Input.value : '';
            var projet = projetInput ? projetInput.value : '';
            var appreciation = appreciationInput ? appreciationInput.value || '' : '';

            var cleanNote1 = (note1 && note1 !== '') ? parseFloat(note1.trim().replace(',', '.')) : null;
            var cleanNote2 = (note2 && note2 !== '') ? parseFloat(note2.trim().replace(',', '.')) : null;
            var cleanProjet = (projet && projet !== '') ? parseFloat(projet.trim().replace(',', '.')) : null;

            var totalNote = 0;
            if (cleanNote1 !== null) totalNote += cleanNote1 * (currentCoefficients.coeff1 || 1);
            if (cleanNote2 !== null) totalNote += cleanNote2 * (currentCoefficients.coeff2 || 2);
            if (cleanProjet !== null) totalNote += cleanProjet * (currentCoefficients.coeffProjet || 1);

            (function(eleveId, cleanNote1, cleanNote2, cleanProjet, totalNote, appreciation) {
                promises.push(
                    fetch(API_BULLETINS.modifierBulletin, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ELEVE_MATRICULE: eleveId,
                            NOTE1: cleanNote1,
                            NOTE2: cleanNote2,
                            NOTE_PROJET: cleanProjet,
                            TOTAL_NOTE: totalNote,
                            APPRECIATION: appreciation,
                            MATIERE_ID: currentMatiereId,
                            PERIODE: currentPeriode
                        })
                    })
                    .then(function(r) { return r.json(); })
                    .then(function(result) {
                        return { matricule: eleveId, success: !!result.success, message: result.message };
                    })
                    .catch(function(err) {
                        return { matricule: eleveId, success: false, message: err.message };
                    })
                );
            })(eleveId, cleanNote1, cleanNote2, cleanProjet, totalNote, appreciation);
        }

        var results = await Promise.all(promises);
        var successCount = results.filter(function(r) { return r.success; }).length;
        var failed = results.filter(function(r) { return !r.success; });

        if (failed.length === 0) {
            showToast(successCount + ' élève(s) sauvegardé(s) avec succès', 'success');
            setUnsavedChanges(false);
            for (var j = 0; j < currentEleves.length; j++) {
                if (currentEleves[j].Statut !== 'Validé') {
                    currentEleves[j].Statut = 'Enregistré';
                }
            }
            await afficherListe();
            updateButtonsState();
        } else {
            var errors = [];
            for (var k = 0; k < failed.length; k++) {
                errors.push(failed[k].message || 'Erreur inconnue');
            }
            showToast(successCount + ' sauvegardé(s), ' + failed.length + ' échec(s): ' + errors.join(', '), 'warning');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
        pendingSave = false;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION DÉFINITIVE
// ─────────────────────────────────────────────────────────────────────────────

window.validerDefinitivement = async function() {
    if (isLoading) {
        showToast('Opération en cours...', 'info');
        return;
    }

    var rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucun bulletin à valider', 'warning');
        return;
    }

    if (currentEleves.every(function(e) { return e.Statut === 'Validé'; })) {
        showToast('Tous les bulletins sont déjà validés', 'info');
        return;
    }

    if (!currentClasseId || !currentMatiereId || !currentPeriode) {
        showToast('Contexte incomplet. Veuillez recharger.', 'error');
        return;
    }

    await new Promise(function(resolve) { setTimeout(resolve, 50); });

    var confirmed = await showConfirmDialog(
        '⚠️ Validation définitive',
        'Cette action est irréversible.\nUne fois validées, les notes ne pourront plus être modifiées.\n\nVoulez-vous continuer ?',
        'Confirmer',
        'Annuler',
        true
    );

    if (!confirmed) return;

    showLoading('Validation en cours...');
    isLoading = true;

    try {
        var data = await fetchWithErrorHandling(API_BULLETINS.validerDefinitivement, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                classeId: currentClasseId,
                matiereId: currentMatiereId,
                periodeId: currentPeriode
            })
        });

        if (data.success && data.updated > 0) {
            for (var i = 0; i < currentEleves.length; i++) {
                if (currentEleves[i].Statut !== 'Validé' &&
                    (currentEleves[i].Note1 !== null || currentEleves[i].Note2 !== null || currentEleves[i].NoteProjet !== null)) {
                    currentEleves[i].Statut = 'Validé';
                }
            }

            renderTable();
            updateButtonsState();
            setUnsavedChanges(false);
            showToast(data.updated + ' élève(s) validé(s) définitivement', 'success');
        } else {
            showToast(data.message || 'Aucune note à valider', 'warning');
        }
    } catch (e) {
        showToast('Erreur: ' + e.message, 'error');
    } finally {
        hideLoading();
        isLoading = false;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

window.exporter = function() {
    var rows = document.querySelectorAll('#notesTableBody tr');
    if (rows.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }

    var matiere = document.getElementById('ddlMatiere');
    var nomMatiere = matiere && matiere.options[matiere.selectedIndex] ? matiere.options[matiere.selectedIndex].textContent || '' : '';
    var classeSelect = document.getElementById('ddlClasse');
    var nomClasse = classeSelect && classeSelect.options[classeSelect.selectedIndex] ? classeSelect.options[classeSelect.selectedIndex].text || '' : '';
    var periodeSelect = document.getElementById('ddlPeriode');
    var nomPeriode = periodeSelect && periodeSelect.options[periodeSelect.selectedIndex] ? periodeSelect.options[periodeSelect.selectedIndex].text || '' : '';

    var csv = 'Matière;' + nomMatiere + '\n';
    csv += 'Classe;' + nomClasse + '\n';
    csv += 'Période;' + nomPeriode + '\n';
    csv += 'Coefficients;Note1:×' + currentCoefficients.coeff1 + ';Note2:×' + currentCoefficients.coeff2 + ';Examen:×' + currentCoefficients.coeffProjet + '\n\n';
    csv += 'N°;Élève;Note1;Note2;Examen;Total;Moyenne;Appréciation;Statut\n';

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var idx = row.dataset.idx;
        var nom = row.querySelector('.eleve-nom') ? row.querySelector('.eleve-nom').textContent || '' : '';
        var note1 = row.querySelector('[data-field="note1"]') ? row.querySelector('[data-field="note1"]').value || 'Ab' : 'Ab';
        var note2 = row.querySelector('[data-field="note2"]') ? row.querySelector('[data-field="note2"]').value || 'Ab' : 'Ab';
        var projet = row.querySelector('[data-field="projet"]') ? row.querySelector('[data-field="projet"]').value || 'Ab' : 'Ab';
        var total = row.querySelector('.totalnote-value') ? row.querySelector('.totalnote-value').textContent || '0.00' : '0.00';
        var moyenne = row.querySelector('.moyenne-value') ? row.querySelector('.moyenne-value').textContent || '-' : '-';
        var appreciation = row.querySelector('.appreciation-input') ? row.querySelector('.appreciation-input').value || '' : '';
        var statut = row.querySelector('.statut-badge') ? row.querySelector('.statut-badge').textContent.trim() || 'Non saisi' : 'Non saisi';

        csv += (parseInt(idx) + 1) + ';"' + nom + '";' + note1 + ';' + note2 + ';' + projet + ';' + total + ';' + moyenne + ';"' + appreciation.replace(/"/g, '""') + '";' + statut + '\n';
    }

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Bulletin_' + nomMatiere + '_' + nomClasse + '_' + nomPeriode + '.csv'.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);

    showToast('Export terminé', 'success');
};