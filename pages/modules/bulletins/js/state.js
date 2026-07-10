'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL — Module Bulletins
// ─────────────────────────────────────────────────────────────────────────────

var currentUser = {
    role: null,
    userName: null,
    professeurId: null,
    classesAutorisees: [],
    matieresAutorisees: []
};

var allMatieres = [];
var currentEleves = [];
var currentCoefficients = {
    coeff1: 1,
    coeff2: 2,
    coeffProjet: 1
};

var currentMatiereId = null;
var currentClasseId = null;
var currentPeriode = null;
var hasUnsavedChanges = false;
var isLoading = false;
var pendingSave = false;
var toastTimeout = null;