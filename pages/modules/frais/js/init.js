'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// GESTION GLOBALE DES ERREURS
// ─────────────────────────────────────────────────────────────────────────────

// Capturer les erreurs non gérées
window.addEventListener('error', function(e) {
    var message = e.message || 'Erreur inconnue';
    var details = 'Fichier: ' + (e.filename || 'inconnu') + ' Ligne: ' + (e.lineno || '?');
    
    // Ne pas afficher les erreurs de ressources manquantes
    if (message.includes('Failed to load resource')) {
        return;
    }
    
    if (typeof showErrorToast === 'function') {
        showErrorToast('Une erreur est survenue', message + ' (' + details + ')');
    } else {
        console.error('Erreur non gérée:', e);
    }
});

// Capturer les erreurs de Promise
window.addEventListener('unhandledrejection', function(e) {
    var message = e.reason ? (e.reason.message || e.reason) : 'Erreur inconnue';
    
    if (typeof showErrorToast === 'function') {
        showErrorToast('Erreur asynchrone', message);
    } else {
        console.error('Promise rejetée:', e.reason);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    loadFrais();
    loadAnnees();
    createFilterControls();

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal('paymentModal');
            closeModal('editHistoriqueModal');
            closeModal('tarifModal');
            if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) Swal.close();
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────
Object.assign(window, {
    // Paiements
    openAddPaymentModal: openAddPaymentModal,
    openPaymentModalForStudent: openPaymentModalForStudent,
    closePaymentModal: closePaymentModal,
    updatePaymentInfo: updatePaymentInfo,
    savePayment: savePayment,
    showErrorToast: showErrorToast,
    
    // Export
    exportFraisToExcel: exportFraisToExcel,
    printFraisReport: printFraisReport,
    printStudentReceipt: printStudentReceipt,
    
    // Filtres
    filterFraisTable: filterFraisTable,
    resetFilters: resetFilters,
    sortBy: sortBy, 
    
    // Historique
    viewPaymentHistory: viewPaymentHistory,
    openEditHistoriqueModal: openEditHistoriqueModal,
    closeEditHistoriqueModal: closeEditHistoriqueModal,
    confirmEditHistorique: confirmEditHistorique,
    deleteHistoriquePaiement: deleteHistoriquePaiement,
    
    // Tarifs
    switchFraisTab: switchFraisTab,
    filterTarifs: filterTarifs,
    resetTarifFilters: resetTarifFilters,
    openTarifModal: openTarifModal,
    closeTarifModal: closeTarifModal,
    saveTarif: saveTarif,
    editTarif: editTarif,
    deleteTarif: deleteTarif,
    
    // Actions principales
    recalculerFrais: recalculerFrais,
    updateAllFrais: updateAllFrais,
    goToPage: goToPage
});

// ─────────────────────────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}