'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL — Module Agenda
// ─────────────────────────────────────────────────────────────────────────────

var calendar = null;
var currentEventId = null;
var isEditMode = false;
var _agendaEvents = [];