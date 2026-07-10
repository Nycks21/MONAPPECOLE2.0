'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// GESTION GLOBALE DES ERREURS
// ─────────────────────────────────────────────────────────────────────────────

// Capturer les erreurs non gérées
window.addEventListener('error', function(e) {
    var message = e.message || 'Erreur inconnue';
    var details = 'Fichier: ' + (e.filename || 'inconnu') + ' Ligne: ' + (e.lineno || '?');

    if (message.indexOf('Failed to load resource') !== -1) {
        // Ne pas afficher les erreurs de ressources manquantes
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
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    initUIControls();
    loadEleves();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE (onclick= dans le HTML)
// ─────────────────────────────────────────────────────────────────────────────
Object.assign(window, {
    // CRUD
    openAddEleveModal: openAddEleveModal,
    openEditEleveModal: openEditEleveModal,
    closeEleveModal: closeEleveModal,
    saveEleve: saveEleve,
    supprimerEleve: supprimerEleve,

    // Filtres
    applyFilters: applyFilters,
    resetFilters: resetFilters,
    sortData: sortData,
    goToPage: goToPage,

    // Export
    exportEleves: exportEleves,
    exportElevesToExcelOnly: exportElevesToExcelOnly,
    exportElevesToCsvOnly: exportElevesToCsvOnly,

    // UI
    showModal: showModal,
    showSpinner: showSpinner,
    hideSpinner: hideSpinner,
    updateFileName: updateFileName,
    showErrorToast: showErrorToast 
});

// ─────────────────────────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}