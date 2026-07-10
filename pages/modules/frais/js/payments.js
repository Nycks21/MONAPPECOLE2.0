'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// PAIEMENTS — MODALES
// ─────────────────────────────────────────────────────────────────────────────

function showErrorToast(message, details) {
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;max-width:500px;width:100%;pointer-events:none;';
        document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.style.cssText = 'background:#f8d7da;color:#721c24;padding:15px 20px;border-radius:8px;border-left:4px solid #dc3545;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;animation:slideIn 0.3s ease;';
    toast.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;">'
        + '<i class="fas fa-exclamation-circle" style="font-size:20px;color:#dc3545;margin-top:2px;"></i>'
        + '<div style="flex:1;">'
        + '<strong style="display:block;margin-bottom:4px;">❌ Erreur</strong>'
        + '<div style="font-size:13px;">' + escapeHtml(message) + '</div>'
        + (details ? '<div style="font-size:11px;color:#6c757d;margin-top:4px;">' + escapeHtml(details) + '</div>' : '')
        + '</div>'
        + '<i class="fas fa-times" style="cursor:pointer;opacity:0.6;font-size:14px;flex-shrink:0;" onclick="this.parentElement.parentElement.remove()"></i>'
        + '</div>';
    
    if (!document.getElementById('toastStyles')) {
        var style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
        document.head.appendChild(style);
    }

    container.appendChild(toast);
    
    setTimeout(function() {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) toast.remove();
            }, 300);
        }
    }, 8000);

    toast.querySelector('.fa-times').addEventListener('click', function() {
        toast.remove();
    });
}

function _resetPaymentForm() {
    ['paymentAmount', 'paymentRef', 'paymentComment'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var dateEl = document.getElementById('paymentDate');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    var methodEl = document.getElementById('paymentMethod');
    if (methodEl) methodEl.value = '';
    var infoDiv = document.getElementById('paymentInfo');
    if (infoDiv) infoDiv.style.display = 'none';
    
    // ✅ Réactiver le champ élève lors de la réinitialisation
    var studentSelect = document.getElementById('paymentStudent');
    if (studentSelect) {
        studentSelect.disabled = false;
        studentSelect.style.backgroundColor = '';
        studentSelect.style.cursor = '';
        studentSelect.style.opacity = '';
        studentSelect.title = '';
    }
}

function openAddPaymentModal() {
    var sel = document.getElementById('paymentStudent');
    if (sel) {
        sel.value = '';
        // ✅ Champ actif pour l'ajout manuel
        sel.disabled = false;
        sel.style.backgroundColor = '';
        sel.style.cursor = '';
        sel.style.opacity = '';
        sel.title = '';
    }
    _resetPaymentForm();
    openModal('paymentModal');
}

function openPaymentModalForStudent(matricule, nom) {
    _resetPaymentForm();
    var sel = document.getElementById('paymentStudent');
    if (sel) {
        sel.value = matricule;
        
        // ✅ Griser et désactiver le champ élève
        sel.disabled = true;
        sel.style.backgroundColor = '#e9ecef';
        sel.style.cursor = 'not-allowed';
        sel.style.opacity = '0.8';
        sel.title = 'Élève verrouillé - Paiement en cours';
        
        // ✅ Afficher le nom de l'élève dans le champ
        // On cherche l'option correspondante pour afficher le nom complet
        var option = sel.querySelector('option[value="' + matricule + '"]');
        if (option) {
            sel.value = matricule;
        } else {
            // Si l'élève n'est pas dans la liste, on ajoute une option temporaire
            var newOption = document.createElement('option');
            newOption.value = matricule;
            newOption.textContent = matricule + ' — ' + nom;
            sel.appendChild(newOption);
            sel.value = matricule;
        }
        
        updatePaymentInfo();
    }
    openModal('paymentModal');
}

async function updatePaymentInfo() {
    var sel = document.getElementById('paymentStudent');
    var infoDiv = document.getElementById('paymentInfo');
    if (!sel || !sel.value) {
        if (infoDiv) infoDiv.style.display = 'none';
        return;
    }

    var matricule = sel.value;
    var fraisItem = fraisData.find(function (f) { return f.MATRICULE === matricule; });

    var set = function (id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    if (fraisItem) {
        set('infoTotal', formatMoney(fraisItem.TOTAL));
        set('infoPaye', formatMoney(fraisItem.PAYE));
        set('infoReste', formatMoney(fraisItem.RESTE));
    } else {
        var selectedOption = sel.options[sel.selectedIndex];
        var classe = selectedOption && selectedOption.dataset ? selectedOption.dataset.classe : '';
        var tarif = classe ? await _getTarifForClasse(classe) : 0;
        set('infoTotal', formatMoney(tarif));
        set('infoPaye', formatMoney(0));
        set('infoReste', formatMoney(tarif));
    }
    if (infoDiv) infoDiv.style.display = 'block';
}

async function _getTarifForClasse(className) {
    try {
        var anneeId = await _getCurrentAnneeId();
        var res = await fetch(API_FRAIS.getTarifByClasse + '?classeNom=' + encodeURIComponent(className) + '&anneeId=' + anneeId);
        var result = await res.json();
        return (result.success && result.montant) ? result.montant : 0;
    } catch (e) { return 0; }
}

async function _getCurrentAnneeId() {
    try {
        var res = await fetch(API_FRAIS.getAnnees);
        var r = await res.json();
        return (r.success && r.data && r.data.length) ? r.data[0].ID : 1;
    } catch (e) { return 1; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAUVEGARDER UN PAIEMENT
// ─────────────────────────────────────────────────────────────────────────────
async function savePayment() {
    var matricule = document.getElementById('paymentStudent') ? document.getElementById('paymentStudent').value : '';
    var montant = parseFloat(document.getElementById('paymentAmount') ? document.getElementById('paymentAmount').value : 0);
    var mois = document.getElementById('paymentMonth') ? document.getElementById('paymentMonth').value : '';
    var annee = document.getElementById('paymentYear') ? document.getElementById('paymentYear').value : '';
    var date = document.getElementById('paymentDate') ? document.getElementById('paymentDate').value : '';
    var mode = document.getElementById('paymentMethod') ? document.getElementById('paymentMethod').value : '';
    var reference = document.getElementById('paymentRef') ? document.getElementById('paymentRef').value : '';
    var commentaire = document.getElementById('paymentComment') ? document.getElementById('paymentComment').value : '';

    // Validations
    if (!matricule) { 
        showErrorToast('Veuillez sélectionner un élève.', 'Champ obligatoire');
        return; 
    }
    if (!montant || montant <= 0) { 
        showErrorToast('Le montant doit être supérieur à 0.', 'Valeur invalide');
        return; 
    }
    if (!mois) { 
        showErrorToast('Veuillez sélectionner le mois.', 'Champ obligatoire');
        return; 
    }
    if (!annee) { 
        showErrorToast('Veuillez saisir l\'année.', 'Champ obligatoire');
        return; 
    }
    if (!date) { 
        showErrorToast('La date est obligatoire.', 'Champ obligatoire');
        return; 
    }
    if (!mode) {
        showErrorToast('Veuillez choisir le mode de paiement', 'Le mode de paiement est obligatoire');
        document.getElementById('paymentMethod').focus();
        return;
    }

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.ajouterPaiement, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matricule: matricule,
                montant: montant,
                moisPaiement: mois,
                annee: annee,
                datePaiement: date,
                modePaiement: mode,
                reference: reference,
                commentaire: commentaire
            })
        });

        if (!res.ok) {
            var errorText = await res.text();
            console.error('Erreur serveur (HTTP ' + res.status + '):', errorText);
            
            var errorMessage = 'Erreur ' + res.status + ' - ' + res.statusText;
            var errorDetails = '';
            
            try {
                var errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
                if (errorJson.details) {
                    errorDetails = errorJson.details;
                }
            } catch (e) {
                if (errorText.includes('CHK_FRAIS_MODEPAIE')) {
                    errorMessage = 'Veuillez choisir le mode de paiement';
                    errorDetails = 'Le mode de paiement sélectionné n\'est pas valide. Choisissez parmi : Espèces, Chèque, Virement ou MobileMoney.';
                } else if (errorText.length < 200) {
                    errorDetails = errorText;
                } else {
                    errorDetails = 'Voir la console pour plus de détails';
                    console.error('Erreur détaillée:', errorText);
                }
            }
            
            showErrorToast(errorMessage, errorDetails);
            hideSpinner();
            return;
        }

        var result = await res.json();
        
        if (result.success) {
            closePaymentModal();
            // TOAST de succès
            var successContainer = document.getElementById('toastContainer');
            if (successContainer) {
                var toast = document.createElement('div');
                toast.style.cssText = 'background:#d4edda;color:#155724;padding:15px 20px;border-radius:8px;border-left:4px solid #28a745;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;animation:slideIn 0.3s ease;';
                toast.innerHTML = '<div style="display:flex;align-items:center;gap:12px;">'
                    + '<i class="fas fa-check-circle" style="font-size:20px;color:#28a745;"></i>'
                    + '<div style="flex:1;">'
                    + '<strong>✅ Succès</strong>'
                    + '<div style="font-size:13px;">Paiement enregistré avec succès</div>'
                    + '</div>'
                    + '<i class="fas fa-times" style="cursor:pointer;opacity:0.6;font-size:14px;" onclick="this.parentElement.parentElement.remove()"></i>'
                    + '</div>';
                successContainer.appendChild(toast);
                setTimeout(function() {
                    if (toast.parentNode) {
                        toast.style.opacity = '0';
                        toast.style.transition = 'opacity 0.3s ease';
                        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
                    }
                }, 4000);
            }
            setTimeout(loadFrais, 1500);
        } else {
            showErrorToast(result.message || 'Erreur lors de l\'enregistrement du paiement.', 'Vérifiez les données saisies');
        }
    } catch (err) {
        console.error('Erreur réseau:', err);
        showErrorToast('Erreur de connexion au serveur.', err.message);
    } finally {
        hideSpinner();
    }
}

// Exposer les fonctions globalement
window.showErrorToast = showErrorToast;
window.openPaymentModalForStudent = openPaymentModalForStudent;
window.openAddPaymentModal = openAddPaymentModal;
window.savePayment = savePayment;
window.updatePaymentInfo = updatePaymentInfo;