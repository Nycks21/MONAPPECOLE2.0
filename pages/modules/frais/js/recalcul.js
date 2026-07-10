'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// MISE À JOUR DES FRAIS (Ajoute TOUS les élèves actifs)
// ─────────────────────────────────────────────────────────────────────────────
async function updateAllFrais() {
    var confirm = await Swal.fire({
        title: 'Mettre à jour les frais',
        html: 'Cette action va :<ul style="text-align:left;margin-top:10px;">' +
            '<li>✅ Récupérer <strong>TOUS les élèves actifs</strong></li>' +
            '<li>✅ Ajouter les nouveaux élèves dans la table des frais</li>' +
            '<li>✅ Mettre à jour les noms et classes des élèves</li>' +
            '<li>✅ Éviter les doublons</li></ul>' +
            '<strong>Les paiements déjà effectués sont conservés.</strong><br><br>Continuer ?',
        icon: 'info', showCancelButton: true,
        confirmButtonText: 'Oui, mettre à jour', cancelButtonText: 'Annuler',
        confirmButtonColor: '#17a2b8'
    });
    if (!confirm.isConfirmed) return;

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.updateAll, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        var data = await res.json();

        if (data.success) {
            await Swal.fire({
                icon: 'success',
                title: '✅ Mise à jour terminée',
                html: '<div style="text-align:left;">'
                    + '<p><strong>' + data.message + '</strong></p>'
                    + '<hr>'
                    + '<ul style="list-style:none;padding:0;">'
                    + '<li>📚 Année active : <strong>' + (data.anneeActiveId || 'N/A') + '</strong></li>'
                    + '<li>👨‍🎓 Élèves actifs : <strong>' + (data.elevesTraites || 0) + '</strong></li>'
                    + '<li>➕ Nouveaux élèves ajoutés : <strong>' + (data.nouveauxEleves || 0) + '</strong></li>'
                    + '<li>📝 Élèves mis à jour : <strong>' + (data.nomsMisAJour || 0) + '</strong></li>'
                    + '</ul></div>',
                timer: 4000,
                showConfirmButton: true
            });
            loadFrais();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RECALCULER LES FRAIS (Met à jour les classes + recalcule les montants)
// ─────────────────────────────────────────────────────────────────────────────
async function recalculerFrais() {
    var confirm = await Swal.fire({
        title: 'Recalculer les frais',
        html: 'Cette action va :<ul style="text-align:left;margin-top:10px;">' +
            '<li>✅ <strong>Synchroniser les classes des élèves</strong></li>' +
            '<li>✅ Ajouter les nouveaux élèves dans la table des frais</li>' +
            '<li>✅ Récupérer les tarifs par classe</li>' +
            '<li>✅ Recalculer le montant total pour chaque élève</li>' +
            '<li>✅ Mettre à jour automatiquement RESTE, PROGRESSION et STATUT</li></ul>' +
            '<strong>Les paiements déjà effectués sont conservés.</strong><br><br>Continuer ?',
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Oui, recalculer', cancelButtonText: 'Annuler',
        confirmButtonColor: '#ffc107'
    });
    if (!confirm.isConfirmed) return;

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.recalculer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        var data = await res.json();

        if (data.success) {
            await Swal.fire({
                icon: 'success',
                title: '✅ Recalcul terminé',
                html: '<div style="text-align:left;">'
                    + '<p><strong>' + data.message + '</strong></p>'
                    + '<hr>'
                    + '<ul style="list-style:none;padding:0;">'
                    + '<li>📚 Année active : <strong>' + (data.anneeActiveId || 'N/A') + '</strong></li>'
                    + '<li>📚 Classes mises à jour : <strong>' + (data.classesMisesAJour || 0) + '</strong></li>'
                    + '<li>➕ Nouveaux élèves ajoutés : <strong>' + (data.nouveauxEleves || 0) + '</strong></li>'
                    + '<li>💰 Montants recalculés : <strong>' + (data.montantsRecalculés || 0) + '</strong></li>'
                    + '</ul></div>',
                timer: 4000,
                showConfirmButton: true
            });
            loadFrais();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors du recalcul', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION SPÉCIFIQUE : Mettre à jour la classe d'un élève individuel
// ─────────────────────────────────────────────────────────────────────────────
async function updateEleveClasse(eleveId, nouvelleClasse) {
    showSpinner();
    try {
        var res = await fetch(API_FRAIS.updateEleveClasse, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eleveId: eleveId,
                classe: nouvelleClasse
            })
        });
        var data = await res.json();

        if (data.success) {
            await Swal.fire({
                icon: 'success',
                title: '✅ Classe mise à jour',
                text: data.message,
                timer: 2000,
                showConfirmButton: false
            });
            loadFrais();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}