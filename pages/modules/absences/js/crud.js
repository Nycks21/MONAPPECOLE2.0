'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CRUD — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// CRUD ABSENCES
// ─────────────────────────────────────────────────────────────────────────────

function openAbsenceModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentMode = 'ajout';
    currentAbsenceId = null;
    
    document.getElementById('absenceMatricule').value = '';
    document.getElementById('absenceDateDebut').value = new Date().toISOString().split('T')[0];
    document.getElementById('absenceDateFin').value = new Date().toISOString().split('T')[0];
    document.getElementById('absenceMotif').value = '';
    document.getElementById('absenceJustifie').checked = false;
    document.getElementById('absenceJustification').value = '';
    document.getElementById('absenceJustificationGroup').style.display = 'none';
    
    var title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fas fa-plus"></i> Nouvelle absence';
    
    showModal('absenceModal');
    return false;
}

function editAbsence(id) {
    var item = absencesData.find(function (a) { return a.ID === id; });
    if (!item) {
        Swal.fire('Erreur', 'Absence non trouvée', 'error');
        return;
    }
    
    currentMode = 'modification';
    currentAbsenceId = id;
    
    document.getElementById('absenceMatricule').value = item.MATRICULE || '';
    document.getElementById('absenceDateDebut').value = item.DATE_DEBUT || '';
    document.getElementById('absenceDateFin').value = item.DATE_FIN || '';
    document.getElementById('absenceMotif').value = item.MOTIF || '';
    document.getElementById('absenceJustifie').checked = item.JUSTIFIE || false;
    document.getElementById('absenceJustification').value = item.JUSTIFICATION || '';
    document.getElementById('absenceJustificationGroup').style.display = item.JUSTIFIE ? 'block' : 'none';
    
    var title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier l\'absence';
    
    // Désactiver le champ élève
    var eleveField = document.getElementById('absenceMatricule');
    if (eleveField) {
        eleveField.disabled = true;
        eleveField.style.backgroundColor = '#e9ecef';
        eleveField.style.cursor = 'not-allowed';
    }
    
    showModal('absenceModal');
}

async function saveAbsence(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    
    var matricule = document.getElementById('absenceMatricule').value;
    var dateDebut = document.getElementById('absenceDateDebut').value;
    var dateFin = document.getElementById('absenceDateFin').value;
    var motif = document.getElementById('absenceMotif').value;
    var justifie = document.getElementById('absenceJustifie').checked;
    var justification = document.getElementById('absenceJustification').value;
    
    if (!matricule) {
        showToast('Veuillez sélectionner un élève.', 'warning');
        return;
    }
    if (!dateDebut || !dateFin) {
        showToast('Les dates sont requises.', 'warning');
        return;
    }
    if (new Date(dateFin) < new Date(dateDebut)) {
        showToast('La date de fin doit être postérieure à la date de début.', 'warning');
        return;
    }
    
    var eleveInfo = elevesLookup[matricule];
    if (!eleveInfo) {
        showToast('Élève non trouvé.', 'error');
        return;
    }
    
    showSpinner();
    try {
        var url = currentMode === 'ajout' ? API_ABSENCES.absences.add : API_ABSENCES.absences.update;
        var body = {
            id: currentAbsenceId,
            matricule: matricule,
            nom: eleveInfo.NOM,
            classe: eleveInfo.CLASSE_NOM,
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
        
        var result = await safeJson(res);
        
        if (result.success) {
            showToast(result.message || 'Absence enregistrée', 'success');
            setTimeout(function() {
                closeAbsenceModal();
                loadAbsences();
            }, 1500);
        } else {
            showToast(result.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('saveAbsence:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

async function deleteAbsence(id) {
    var result = await Swal.fire({
        title: 'Supprimer cette absence ?',
        html: 'Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    
    if (!result.isConfirmed) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.absences.delete, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        var data = await safeJson(res);
        if (data.success) {
            showToast(data.message || 'Absence supprimée', 'success');
            setTimeout(loadAbsences, 1000);
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('deleteAbsence:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

async function justifyAbsence(id) {
    var result = await Swal.fire({
        title: 'Justifier l\'absence',
        input: 'textarea',
        inputPlaceholder: 'Motif de justification...',
        showCancelButton: true,
        confirmButtonText: 'Justifier',
        cancelButtonText: 'Annuler',
        preConfirm: function(text) {
            if (!text || !text.trim()) {
                Swal.showValidationMessage('Veuillez saisir un motif');
                return false;
            }
            return text.trim();
        }
    });
    
    if (!result.value) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.absences.justify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, justification: result.value })
        });
        var data = await safeJson(res);
        if (data.success) {
            showToast(data.message || 'Absence justifiée', 'success');
            setTimeout(loadAbsences, 1000);
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('justifyAbsence:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD RETARDS
// ─────────────────────────────────────────────────────────────────────────────

function openRetardModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentMode = 'ajout';
    currentRetardId = null;
    
    document.getElementById('retardMatricule').value = '';
    document.getElementById('retardDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('retardHeurePrevue').value = '08:00';
    document.getElementById('retardHeureArrivee').value = '';
    document.getElementById('retardMotif').value = '';
    document.getElementById('retardJustifie').checked = false;
    document.getElementById('retardJustification').value = '';
    document.getElementById('retardJustificationGroup').style.display = 'none';
    
    var title = document.getElementById('retardModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-plus"></i> Nouveau retard';
    
    showModal('retardModal');
    return false;
}

function editRetard(id) {
    var item = retardsData.find(function (r) { return r.ID === id; });
    if (!item) {
        Swal.fire('Erreur', 'Retard non trouvé', 'error');
        return;
    }
    
    currentMode = 'modification';
    currentRetardId = id;
    
    document.getElementById('retardMatricule').value = item.MATRICULE || '';
    document.getElementById('retardDate').value = item.DATE_RETARD || '';
    document.getElementById('retardHeurePrevue').value = item.HEURE_PREVUE ? item.HEURE_PREVUE.substring(0, 5) : '';
    document.getElementById('retardHeureArrivee').value = item.HEURE_ARRIVEE ? item.HEURE_ARRIVEE.substring(0, 5) : '';
    document.getElementById('retardMotif').value = item.MOTIF || '';
    document.getElementById('retardJustifie').checked = item.JUSTIFIE || false;
    document.getElementById('retardJustification').value = item.JUSTIFICATION || '';
    document.getElementById('retardJustificationGroup').style.display = item.JUSTIFIE ? 'block' : 'none';
    
    var title = document.getElementById('retardModalTitle');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier le retard';
    
    // Désactiver le champ élève
    var eleveField = document.getElementById('retardMatricule');
    if (eleveField) {
        eleveField.disabled = true;
        eleveField.style.backgroundColor = '#e9ecef';
        eleveField.style.cursor = 'not-allowed';
    }
    
    showModal('retardModal');
}

async function saveRetard(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    
    var matricule = document.getElementById('retardMatricule').value;
    var date = document.getElementById('retardDate').value;
    var heurePrevue = document.getElementById('retardHeurePrevue').value;
    var heureArrivee = document.getElementById('retardHeureArrivee').value;
    var motif = document.getElementById('retardMotif').value;
    var justifie = document.getElementById('retardJustifie').checked;
    var justification = document.getElementById('retardJustification').value;
    
    if (!matricule) {
        showToast('Veuillez sélectionner un élève.', 'warning');
        return;
    }
    if (!date) {
        showToast('La date est requise.', 'warning');
        return;
    }
    if (!heurePrevue || !heureArrivee) {
        showToast('Les heures sont requises.', 'warning');
        return;
    }
    
    var hPrev = parseInt(heurePrevue.split(':')[0]);
    var mPrev = parseInt(heurePrevue.split(':')[1]);
    var hArr = parseInt(heureArrivee.split(':')[0]);
    var mArr = parseInt(heureArrivee.split(':')[1]);
    var minutesPrevue = hPrev * 60 + mPrev;
    var minutesArrivee = hArr * 60 + mArr;
    var duree = Math.max(0, minutesArrivee - minutesPrevue);
    
    if (duree === 0) {
        showToast('L\'heure d\'arrivée doit être postérieure à l\'heure prévue.', 'warning');
        return;
    }
    
    var eleveInfo = elevesLookup[matricule];
    if (!eleveInfo) {
        showToast('Élève non trouvé.', 'error');
        return;
    }
    
    showSpinner();
    try {
        var url = currentMode === 'ajout' ? API_ABSENCES.retards.add : API_ABSENCES.retards.update;
        var body = {
            id: currentRetardId,
            matricule: matricule,
            nom: eleveInfo.NOM,
            classe: eleveInfo.CLASSE_NOM,
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
        
        var result = await safeJson(res);
        
        if (result.success) {
            showToast(result.message || 'Retard enregistré', 'success');
            setTimeout(function() {
                closeRetardModal();
                loadRetards();
            }, 1500);
        } else {
            showToast(result.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('saveRetard:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

async function deleteRetard(id) {
    var result = await Swal.fire({
        title: 'Supprimer ce retard ?',
        html: 'Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    
    if (!result.isConfirmed) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.retards.delete, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        var data = await safeJson(res);
        if (data.success) {
            showToast(data.message || 'Retard supprimé', 'success');
            setTimeout(loadRetards, 1000);
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('deleteRetard:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

async function justifyRetard(id) {
    var result = await Swal.fire({
        title: 'Justifier le retard',
        input: 'textarea',
        inputPlaceholder: 'Motif de justification...',
        showCancelButton: true,
        confirmButtonText: 'Justifier',
        cancelButtonText: 'Annuler',
        preConfirm: function(text) {
            if (!text || !text.trim()) {
                Swal.showValidationMessage('Veuillez saisir un motif');
                return false;
            }
            return text.trim();
        }
    });
    
    if (!result.value) return;
    
    showSpinner();
    try {
        var res = await fetch(API_ABSENCES.retards.justify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, justification: result.value })
        });
        var data = await safeJson(res);
        if (data.success) {
            showToast(data.message || 'Retard justifié', 'success');
            setTimeout(loadRetards, 1000);
        } else {
            showToast(data.message || 'Erreur', 'error');
        }
    } catch (err) {
        console.error('justifyRetard:', err);
        showToast('Erreur réseau', 'error');
    } finally {
        hideSpinner();
    }
}

// Exposition globale
window.openAbsenceModal = openAbsenceModal;
window.editAbsence = editAbsence;
window.saveAbsence = saveAbsence;
window.deleteAbsence = deleteAbsence;
window.justifyAbsence = justifyAbsence;

window.openRetardModal = openRetardModal;
window.editRetard = editRetard;
window.saveRetard = saveRetard;
window.deleteRetard = deleteRetard;
window.justifyRetard = justifyRetard;