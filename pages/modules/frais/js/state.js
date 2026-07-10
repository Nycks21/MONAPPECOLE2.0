'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var fraisData = [];
var filteredFrais = [];
var elevesList = [];
var classesList = [];
var anneesList = [];
var tarifsData = [];
var filteredTarifs = [];
var currentPage = 1;
var rowsPerPage = 10;
var currentSortCol = 'NOM';
var currentSortDir = 'ASC';
var currentTarifPage = 1;
var tarifsPerPage = 10;
var currentTarifId = null;
var _editHistoryId = null;
var _editMatricule = null;
var _editNom = null;