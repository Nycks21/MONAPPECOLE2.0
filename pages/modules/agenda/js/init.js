// js/init.js - Version corrigée
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION — Module Agenda
// ─────────────────────────────────────────────────────────────────────────────

function init() {
    // Vérifier que les fonctions existent avant de les appeler
    if (typeof initCalendar === 'function') initCalendar();
    if (typeof initControls === 'function') initControls();
    if (typeof loadEvents === 'function') loadEvents();
    if (typeof loadTemplates === 'function') loadTemplates();
    if (typeof loadUpcomingEvents === 'function') loadUpcomingEvents();
    if (typeof loadStatistics === 'function') loadStatistics();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

// Récupérer les constantes depuis window (définies dans config.js)
var _eventColors = window.eventColors || {};
var _typeLabels = window.typeLabels || {};

Object.assign(window, {
    // Configuration (les constantes sont déjà sur window, on les repasse)
    eventColors: _eventColors,
    EVENT_COLORS: _eventColors,    // alias pour compatibilité
    typeLabels: _typeLabels,
    TYPE_LABELS: _typeLabels,      // alias pour compatibilité
    API_AGENDA: window.API_AGENDA || {},
    
    // État
    calendar: calendar,
    currentEventId: currentEventId,
    isEditMode: isEditMode,
    _agendaEvents: _agendaEvents,
    
    // Utilitaires
    escapeHtml: escapeHtml,
    rgbToHex: rgbToHex,
    showLoading: showLoading,
    hideLoading: hideLoading,
    showToast: showToast,
    getEventColor: getEventColor,
    getTypeLabel: getTypeLabel,
    formatEventDate: formatEventDate,
    formatEventTime: formatEventTime,
    
    // UI
    openEventModal: openEventModal,
    resetEventForm: resetEventForm,
    closeEventModal: closeEventModal,
    closeDetailModal: closeDetailModal,
    showConfirmDialog: showConfirmDialog,
    closeConfirmDeleteModal: closeConfirmDeleteModal,
    applyFilters: applyFilters,
    initControls: initControls,
    
    // Calendrier
    initCalendar: initCalendar,
    navigateToDate: navigateToDate,
    
    // Loaders
    loadEvents: loadEvents,
    loadStatistics: loadStatistics,
    loadTemplates: loadTemplates,
    loadUpcomingEvents: loadUpcomingEvents,
    
    // CRUD
    saveEvent: saveEvent,
    deleteEvent: deleteEvent,
    saveEventFromDrop: saveEventFromDrop,
    updateEventDate: updateEventDate,
    
    // Templates
    addEventFromTemplate: addEventFromTemplate,
    addEventFromSidebar: addEventFromSidebar,
    showUpcomingEventDetail: showUpcomingEventDetail,
    showEventDetail: showEventDetail,
    editDetail: editDetail,
    
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