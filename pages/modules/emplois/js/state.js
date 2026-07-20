'use strict';
var Emploi = Emploi || {};
Emploi.state = {
    classes: [],
    matieres: [],
    matieresDict: {},   // indexé par ID
    emploiData: {},
    currentClasse: '',
    editKey: null,
    dragSource: null,
    isDragging: false
};