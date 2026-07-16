'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIQUE DES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
async function viewPaymentHistory(matricule, nom) {
    showSpinner();
    try {
        var res = await fetch(API_FRAIS.getHistorique + '?matricule=' + encodeURIComponent(matricule));
        var result = await res.json();

        if (!result.success) {
            Swal.fire('Erreur', result.message || 'Impossible de charger l\'historique.', 'error');
            return;
        }

        var history = result.data || [];

        if (history.length === 0) {
            Swal.fire({
                title: 'Historique des paiements — ' + escapeHtml(nom),
                html: '<p style="padding:20px;text-align:center;color:#6c757d;">'
                    + '<i class="fas fa-history" style="font-size:40px;display:block;margin-bottom:12px;"></i>'
                    + 'Aucun paiement enregistré pour cet élève.</p>',
                icon: 'info', confirmButtonText: 'Fermer', confirmButtonColor: '#007bff'
            });
            return;
        }

        var totalPaiements = history.reduce(function (s, h) { return s + h.MONTANT; }, 0);

        var rows = history.map(function (h) {
            return '<tr style="border-bottom:1px solid #dee2e6;" id="history-row-' + h.ID + '">'
                + '<td data-label="Date" style="padding:8px; font-weight:bold; font-size:14px !important;">' + formatDate(h.DATE_PAIEMENT) + '</td>'
                + '<td data-label="Mois" style="padding:8px;">' + (h.MOIS || '-') + '</td>'
                + '<td data-label="Année" style="padding:8px;">' + (h.ANNEE || '-') + '</td>'
                + '<td data-label="Montant" style="padding:8px;color:#28a745;font-weight:bold;">' + formatMoney(h.MONTANT) + '</td>'
                + '<td data-label="Mode" style="padding:8px;">' + getModePaiementBadge(h.MODE_PAIEMENT) + '</td>'
                + '<td data-label="Enregistré par" style="padding:8px;">' + escapeHtml(h.USERNAME || '-') + '</td>'
                + '<td data-label="Actions" style="padding:8px;text-align:center;">'
                + '<button type="button" class="btn-history-edit" onclick="openEditHistoriqueModal(\''
                + h.ID + '\',\'' + escapeHtml(matricule) + '\',\'' + escapeHtml(nom) + '\','
                + h.MONTANT + ',\'' + h.DATE_PAIEMENT + '\',\'' + h.MODE_PAIEMENT
                + '\',\'' + escapeHtml(h.REFERENCE || '') + '\',\'' + escapeHtml(h.COMMENTAIRE || '')
                + '\',\'' + escapeHtml(h.MOIS || '') + '\',\'' + escapeHtml(h.ANNEE || '') + '\')">'
                + '<i class="fas fa-edit"></i></button> '
                + '<button type="button" class="btn-history-delete" onclick="deleteHistoriquePaiement(\''
                + h.ID + '\',\'' + escapeHtml(matricule) + '\',' + h.MONTANT + ')">'
                + '<i class="fas fa-trash-alt"></i></button> '
                + '<button type="button" class="btn-history-print" onclick="printSinglePaymentReceipt(\''
                + escapeHtml(matricule) + '\',\'' + escapeHtml(nom) + '\',\''
                + h.ID + '\',\''
                + h.MONTANT + '\',\''
                + h.DATE_PAIEMENT + '\',\''
                + h.MODE_PAIEMENT + '\',\''
                + escapeHtml(h.REFERENCE || '') + '\',\''
                + escapeHtml(h.COMMENTAIRE || '') + '\',\''
                + escapeHtml(h.MOIS || '') + '\',\''
                + escapeHtml(h.ANNEE || '') + '\')">'
                + '<i class="fas fa-print"></i></button>'
                + '</td>'
                + '</tr>'
                + '<tr style="background:#f8f9fa;"><td colspan="7" style="padding:5px 8px;font-size:11px;color:#6c757d;">'
                + '<i class="fas fa-info-circle"></i> Avant : '
                + formatMoney(h.ANCIEN_PAYE) + ' payé / ' + formatMoney(h.ANCIEN_RESTE) + ' restant → Après : '
                + formatMoney(h.NOUVEAU_PAYE) + ' payé / ' + formatMoney(h.NOUVEAU_RESTE) + ' restant'
                + '</td></tr>';
        }).join('');

        Swal.fire({
            title: 'Historique des paiements — ' + escapeHtml(nom),
            html: '<div style="max-height:500px;overflow-y:auto;">'
                + '<div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:15px;">'
                + '<p><strong>Élève :</strong> ' + escapeHtml(nom) + '</p>'
                + '<p><strong>Matricule :</strong> ' + escapeHtml(matricule) + '</p>'
                + '<p><strong>Total des paiements :</strong> ' + formatMoney(totalPaiements) + '</p>'
                + '</div>'
                + '<div class="table-responsive">'
                + '<table class="history-table" style="width:100%;border-collapse:collapse;">'
                + '<thead><tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">'
                + '<th style="padding:10px;">Date</th>'
                + '<th style="padding:10px;">Mois</th>'
                + '<th style="padding:10px;">Année</th>'
                + '<th style="padding:10px;width:200px;">Montant</th>'
                + '<th style="padding:10px;">Mode</th>'
                + '<th style="padding:10px; width:200px;">Enregistré par</th>'
                + '<th style="padding:10px;">Actions</th>'
                + '</tr></thead>'
                + '<tbody>' + rows + '</tbody>'
                + '</table>'
                + '</div>'
                + '</div>',
            icon: 'info', width: '1300px',
            confirmButtonText: 'Fermer', confirmButtonColor: '#007bff', showCloseButton: true
        });
    } catch (err) {
        console.error('viewPaymentHistory:', err);
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODIFIER UN PAIEMENT HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
function openEditHistoriqueModal(historyId, matricule, nom, ancienMontant, datePaiement, modePaiement, reference, commentaire, mois, annee) {
    _editHistoryId = historyId;
    _editMatricule = matricule;
    _editNom = nom;

    var nomField = document.getElementById('editStudentName');
    if (nomField) {
        nomField.value = nom;
        nomField.disabled = true;
        nomField.style.backgroundColor = '#e9ecef';
        nomField.style.cursor = 'not-allowed';
    }

    document.getElementById('editMontant').value = ancienMontant;
    document.getElementById('editPaymentMonth').value = mois || '';
    document.getElementById('editPaymentYear').value = annee || '';
    document.getElementById('editDatePaiement').value = (datePaiement || '').replace(' ', 'T').substring(0, 16);
    document.getElementById('editModePaiement').value = modePaiement;
    document.getElementById('editReference').value = reference || '';
    document.getElementById('editCommentaire').value = commentaire || '';

    if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) Swal.close();
    openModal('editHistoriqueModal');
}

async function confirmEditHistorique() {
    var montant = parseFloat(document.getElementById('editMontant').value);
    var mois = document.getElementById('editPaymentMonth').value;
    var annee = document.getElementById('editPaymentYear').value;
    var datePaiement = document.getElementById('editDatePaiement').value;
    var modePaiement = document.getElementById('editModePaiement').value;
    var reference = document.getElementById('editReference').value;
    var commentaire = document.getElementById('editCommentaire').value;

    if (!montant || montant <= 0) {
        Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'warning');
        return;
    }
    if (!datePaiement) {
        Swal.fire('Erreur', 'La date est obligatoire', 'warning');
        return;
    }

    var savedMatricule = _editMatricule;
    var savedNom = _editNom;
    var savedHistoryId = _editHistoryId;

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.modifierHistorique, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: savedHistoryId,
                matricule: savedMatricule,
                montant: montant,
                moisPaiement: mois,
                annee: annee,
                datePaiement: datePaiement,
                modePaiement: modePaiement,
                reference: reference,
                commentaire: commentaire
            })
        });
        var data = await res.json();

        if (data.success) {
            _editHistoryId = null;
            _editMatricule = null;
            _editNom = null;
            closeEditHistoriqueModal();
            Swal.fire({ icon: 'success', title: 'Modifié', text: 'Paiement modifié avec succès', timer: 1500, showConfirmButton: false });
            setTimeout(function () {
                loadFrais();
                viewPaymentHistory(savedMatricule, savedNom);
            }, 1600);
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la modification', 'error');
        }
    } catch (err) {
        console.error('Erreur:', err);
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPRIMER UN PAIEMENT HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
async function deleteHistoriquePaiement(historyId, matricule, montant, nom) {
    // Récupérer le nom si non fourni
    if (!nom) {
        var fraisItem = fraisData.find(function (f) { return f.MATRICULE === matricule; });
        nom = fraisItem ? fraisItem.NOM : '';
    }

    var result = await Swal.fire({
        title: 'Confirmation',
        html: 'Voulez-vous vraiment supprimer ce paiement de <strong>' + formatMoney(montant) + '</strong>' + (nom ? ' par <strong>' + escapeHtml(nom) + '</strong>' : '') + ' ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.supprimerHistorique, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: historyId, matricule: matricule })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Supprimé',
                text: 'Paiement supprimé avec succès',
                timer: 2000,
                showConfirmButton: false
            });
            setTimeout(function () {
                loadFrais();
                viewPaymentHistory(matricule, nom);
            }, 1600);
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}