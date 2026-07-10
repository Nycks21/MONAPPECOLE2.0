'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS — chemins relatifs depuis la page eleves.aspx
// ─────────────────────────────────────────────────────────────────────────────
var API_ELEVES = {
    getEleves: 'handlers/GetEleve.ashx',
    getClasses: '../../parametres/classes/handlers/GetClasse.ashx',
    getAnnees: '../../administrations/annee/handlers/GetAnnee.ashx',
    ajouter: 'handlers/AjouterEleve.ashx',
    modifier: 'handlers/ModifierEleve.ashx',
    supprimer: 'handlers/SupprimerEleve.ashx'
};