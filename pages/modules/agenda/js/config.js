// js/config.js
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Module Agenda
// ─────────────────────────────────────────────────────────────────────────────

var API_AGENDA = {
    getEvents: 'handlers/GetEvents.ashx',
    addEvent: 'handlers/AddEvent.ashx',
    updateEvent: 'handlers/UpdateEvent.ashx',
    deleteEvent: 'handlers/DeleteEvent.ashx',
    getTemplates: 'handlers/GetTemplates.ashx',
    addEventFromTemplate: 'handlers/AddEventFromTemplate.ashx',
    getUpcomingEvents: 'handlers/GetUpcomingEvents.ashx',
    getEventDetail: 'handlers/GetEventDetail.ashx',
    getStatistics: 'handlers/GetStatistics.ashx'
};

// ✅ Exposer les constantes globalement
window.eventColors = {
    'cours': '#28a745',
    'examen': '#dc3545',
    'reunion': '#17a2b8',
    'reunion_parents': '#6f42c1',
    'vacances': '#ffc107',
    'ferie': '#fd7e14',
    'autre': '#6c757d'
};

window.typeLabels = {
    'cours': 'Cours',
    'examen': 'Examens',
    'reunion': 'Réunions',
    'reunion_parents': 'Réunion Parents',
    'vacances': 'Vacances',
    'ferie': 'Jours fériés',
    'autre': 'Autre'
};

// ✅ Définir eventColors et EVENT_COLORS
window.eventColors = {
    'cours': '#28a745',
    'examen': '#dc3545',
    'reunion': '#17a2b8',
    'reunion_parents': '#6f42c1',
    'vacances': '#ffc107',
    'ferie': '#fd7e14',
    'autre': '#6c757d'
};

// Pour compatibilité avec l'ancien nom
window.EVENT_COLORS = window.eventColors;

window.typeLabels = {
    'cours': 'Cours',
    'examen': 'Examens',
    'reunion': 'Réunions',
    'reunion_parents': 'Réunion Parents',
    'vacances': 'Vacances',
    'ferie': 'Jours fériés',
    'autre': 'Autre'
};