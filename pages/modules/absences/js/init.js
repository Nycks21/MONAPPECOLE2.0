'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

function init() {
    hideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    initUIControls();
    loadEleves();
    loadAbsences();
    loadRetards();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

Object.assign(window, {
    // Onglets
    switchTab: switchTab,
    
    // Absences
    openAbsenceModal: openAbsenceModal,
    closeAbsenceModal: closeAbsenceModal,
    saveAbsence: saveAbsence,
    editAbsence: editAbsence,
    deleteAbsence: deleteAbsence,
    justifyAbsence: justifyAbsence,
    goToAbsencePage: goToAbsencePage,
    exportAbsences: exportAbsences,
    
    // Retards
    openRetardModal: openRetardModal,
    closeRetardModal: closeRetardModal,
    saveRetard: saveRetard,
    editRetard: editRetard,
    deleteRetard: deleteRetard,
    justifyRetard: justifyRetard,
    goToRetardPage: goToRetardPage,
    exportRetards: exportRetards,
    
    // UI
    showModal: showModal,
    showSpinner: showSpinner,
    hideSpinner: hideSpinner,
    showToast: showToast
});

// ─────────────────────────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}