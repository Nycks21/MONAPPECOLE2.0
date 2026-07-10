'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION — Module Bulletins
// ─────────────────────────────────────────────────────────────────────────────

function init() {
    getUserContext();
    chargerMatieres();
    createActionButtons();

    var classeSelect = document.getElementById('ddlClasse');
    if (classeSelect) {
        classeSelect.disabled = true;
        classeSelect.innerHTML = '<option value="">-- Choisissez une matière d\'abord --</option>';
    }

    var btn = document.getElementById('btnAfficherListe');
    if (btn) {
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            afficherListe();
        });
    }

    var matiereSelect = document.getElementById('ddlMatiere');
    if (matiereSelect) {
        matiereSelect.addEventListener('change', onMatiereChange);
    }

    var coeffBtn = document.getElementById('btnAppliquerCoeffs');
    if (coeffBtn) {
        coeffBtn.addEventListener('click', appliquerCoefficients);
    }

    // Menu toggle
    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Fullscreen
    var fullscreenToggle = document.getElementById('fullscreenToggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    // Notifications
    var notifToggle = document.getElementById('notifToggle');
    var notifDropdown = document.getElementById('notifDropdown');
    if (notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });
        document.addEventListener('click', function() {
            notifDropdown.classList.remove('show');
        });
    }

    // Ctrl+S
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            if (typeof window.sauvegarder === 'function' && currentEleves.length > 0) {
                window.sauvegarder();
            }
        }
    });

    // Before unload
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

Object.assign(window, {
    // Configuration
    API_BULLETINS: API_BULLETINS,

    // État
    currentUser: currentUser,
    allMatieres: allMatieres,
    currentEleves: currentEleves,
    currentCoefficients: currentCoefficients,
    currentMatiereId: currentMatiereId,
    currentClasseId: currentClasseId,
    currentPeriode: currentPeriode,
    hasUnsavedChanges: hasUnsavedChanges,
    isLoading: isLoading,
    pendingSave: pendingSave,

    // Utilitaires
    escapeHtml: escapeHtml,
    showToast: showToast,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showSpinner: showSpinner,
    hideSpinner: hideSpinner,
    fetchWithErrorHandling: fetchWithErrorHandling,

    // UI
    showConfirmDialog: showConfirmDialog,
    createActionButtons: createActionButtons,
    updateButtonsState: updateButtonsState,
    resetButtons: resetButtons,
    showActionButtons: showActionButtons,
    setUnsavedChanges: setUnsavedChanges,

    // Calculs
    calculerTotalNote: calculerTotalNote,
    calculerMoyenne: calculerMoyenne,
    validateAndFormatNote: validateAndFormatNote,
    updateTotalsFromRow: updateTotalsFromRow,
    marquerModification: marquerModification,

    // Loaders
    getUserContext: getUserContext,
    chargerMatieres: chargerMatieres,
    afficherListe: afficherListe,
    resetDisplay: resetDisplay,

    // CRUD
    sauvegarder: window.sauvegarder,
    validerDefinitivement: window.validerDefinitivement,
    exporter: window.exporter,

    // Événements
    attachEventListeners: attachEventListeners,
    onMatiereChange: onMatiereChange,

    // Initialisation
    init: init
});

// ─────────────────────────────────────────────────────────────────────────────
// DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}