'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

// Mode et IDs
var currentMode = null;              // "ajout" | "modification"
var currentAbsenceId = null;
var currentRetardId = null;
var currentTab = 'absences';

// Données
var absencesData = [];
var retardsData = [];
var baseAbsencesData = [];
var baseRetardsData = [];
var filteredAbsences = [];
var filteredRetards = [];
var elevesLookup = {};

// Pagination
var absPage = 1, retPage = 1;
var absRows = 10, retRows = 10;