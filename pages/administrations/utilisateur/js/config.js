'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — Module Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

var API_USERS = {
    list: 'api/ListUser.aspx',
    create: 'api/users.aspx',
    update: 'api/updateUser.aspx',
    delete: 'api/DeleteUser.aspx',
    checkLicence: 'api/CheckLicence.aspx',
    backup: 'api/BackupDatabase.aspx',
    restore: 'api/RestoreDatabase.aspx',
    restoreUpload: 'api/RestoreDatabaseForm.aspx',
    checkFile: 'api/CheckFile.aspx',
    deleteFile: 'api/DeleteFile.aspx',
    getBackupList: 'api/GetBackupList.aspx',
    notifyMaintenance: 'api/NotifyMaintenance.aspx',
    checkUpdates: 'api/CheckUpdates.aspx'
};

var PERMISSIONS_LIST = [
    'dashboard', 'eleves', 'absences', 'bulletins', 'agenda', 'emplois', 'frais',
    'niveaux', 'salles', 'classes', 'matieres', 'importation',
    'annees', 'utilisateurs', 'requetes'
];

var CHECKBOX_ID_MAP = {
    'dashboard': 'permDashboard',
    'eleves': 'permEleves',
    'absences': 'permAbsences',
    'bulletins': 'permBulletins',
    'agenda': 'permAgenda',
    'emplois': 'permEmplois',
    'frais': 'permFrais',
    'niveaux': 'permNiveaux',
    'salles': 'permSalles',
    'classes': 'permClasses',
    'matieres': 'permMatieres',
    'importation': 'permImportation',
    'annees': 'permAnnees',
    'utilisateurs': 'permUtilisateurs',
    'requetes': 'permRequetes'
};

var DEFAULT_ROLE_PERMISSIONS = {
    'Administrateur': ['dashboard', 'eleves', 'absences', 'bulletins', 'agenda', 'emplois', 'frais', 'niveaux', 'salles', 'classes', 'matieres', 'importation', 'annees', 'utilisateurs'],
    'SuperAdmin': ['dashboard', 'eleves', 'absences', 'bulletins', 'agenda', 'emplois', 'frais', 'niveaux', 'salles', 'classes', 'matieres', 'importation', 'annees', 'utilisateurs', 'requetes'],
    'Professeur': ['dashboard', 'eleves', 'bulletins', 'emplois'],
    'Secrétaire': ['dashboard', 'eleves', 'absences', 'agenda', 'emplois'],
    'Comptable': ['dashboard', 'frais'],
    'CPE': ['dashboard', 'eleves', 'absences'],
    'Parent': ['dashboard', 'bulletins']
};

var CURRENT_VERSION = document.querySelector('[data-version]')?.getAttribute('data-version') || '2.1.17';

// Exposer globalement
window.API_USERS = API_USERS;
window.PERMISSIONS_LIST = PERMISSIONS_LIST;
window.CHECKBOX_ID_MAP = CHECKBOX_ID_MAP;
window.DEFAULT_ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;
window.CURRENT_VERSION = CURRENT_VERSION;