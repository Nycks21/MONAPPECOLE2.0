'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var currentMode = null;        // "ajout" | "modification"
var currentEleveId = null;     // GUID string
var elevesData = [];           // toutes les données chargées
var baseFilteredData = [];     // périmètre validé par le filtre initial
var filteredEleves = [];       // données affichées (après filtre rapide)
var classesData = [];
var anneesData = [];
var currentPage = 1;
var rowsPerPage = 10;
var sortDirection = 1;         // 1 ASC, -1 DESC
var isInitialLoad = true;