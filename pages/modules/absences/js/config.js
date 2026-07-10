'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

var API_ABSENCES = {
    // Élèves
    getEleves: '../eleves/handlers/GetEleve.ashx',
    
    // Absences
    absences: {
        list: 'handlers/GetAbsences.ashx',
        add: 'handlers/AjouterAbsence.ashx',
        update: 'handlers/ModifierAbsence.ashx',
        delete: 'handlers/SupprimerAbsence.ashx',
        justify: 'handlers/JustifierAbsence.ashx'
    },
    
    // Retards
    retards: {
        list: 'handlers/GetRetards.ashx',
        add: 'handlers/AjouterRetard.ashx',
        update: 'handlers/ModifierRetard.ashx',
        delete: 'handlers/SupprimerRetard.ashx',
        justify: 'handlers/JustifierRetard.ashx'
    }
};