'use strict';
var Emploi = Emploi || {};

Emploi.loaders = {
    loadClasses: function() {
        Emploi.utils.showSpinner();
        fetch(API_EMPLOI.getClasses, { credentials: 'include' })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    Emploi.state.classes = data.data || [];
                    Emploi.ui.populateSelects();
                    // Mettre à jour l'état des boutons après le chargement
                    if (typeof window.updateButtons === 'function') {
                        window.updateButtons();
                    }
                } else {
                    Emploi.utils.showToast('Impossible de charger les classes.', 'danger');
                }
            })
            .catch(function(err) {
                console.error('loadClasses', err);
                Emploi.utils.showToast('Erreur réseau lors du chargement des classes.', 'danger');
            })
            .finally(function() {
                Emploi.utils.hideSpinner();
            });
    },

    loadMatieresForClasse: function(classeId) {
        if (!classeId) {
            var sel = document.getElementById('editMatiere');
            if (sel) {
                sel.innerHTML = '<option value="">-- Sélectionner d\'abord une classe --</option>';
            }
            Emploi.state.matieres = [];
            Emploi.state.matieresDict = {};
            return Promise.resolve([]);
        }

        return new Promise(function(resolve, reject) {
            var url = API_EMPLOI.getMatieres + '?classe=' + encodeURIComponent(classeId);
            fetch(url, { credentials: 'include' })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.success) {
                        var matieres = data.data || [];
                        var sel = document.getElementById('editMatiere');
                        if (sel) {
                            var currentVal = sel.value;
                            sel.innerHTML = '<option value="">-- Sélectionner --</option>';
                            matieres.forEach(function(m) {
                                var opt = document.createElement('option');
                                opt.value = m.ID;
                                opt.textContent = m.NOM;
                                sel.appendChild(opt);
                            });
                            // Restaurer la valeur sélectionnée
                            if (currentVal && matieres.some(function(m) { return m.ID == currentVal; })) {
                                sel.value = currentVal;
                                // Mettre à jour l'enseignant
                                if (typeof Emploi.events.setEnseignantFromMatiere === 'function') {
                                    Emploi.events.setEnseignantFromMatiere(currentVal);
                                }
                            }
                        }
                        // Stocker les matières
                        Emploi.state.matieres = matieres;
                        Emploi.state.matieresDict = {};
                        matieres.forEach(function(m) {
                            Emploi.state.matieresDict[m.ID] = m;
                        });
                        resolve(matieres);
                    } else {
                        Emploi.utils.showToast(data.message || 'Impossible de charger les matières.', 'danger');
                        reject(data.message);
                    }
                })
                .catch(function(err) {
                    console.error('loadMatieresForClasse', err);
                    Emploi.utils.showToast('Erreur réseau lors du chargement des matières.', 'danger');
                    reject(err);
                });
        });
    },

    loadEmploi: function() {
        var classe = document.getElementById('classeFilter').value;
        if (!classe) {
            Emploi.utils.showToast('Veuillez sélectionner une classe.', 'info');
            return;
        }
        Emploi.state.currentClasse = classe;
        Emploi.utils.showSpinner();

        var editClasseSel = document.getElementById('editClasse');
        if (editClasseSel) {
            editClasseSel.value = classe;
        }

        var url = API_EMPLOI.getEmploi + '?classe=' + encodeURIComponent(classe);
        fetch(url, { credentials: 'include' })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.success) {
                    Emploi.state.emploiData = data.data || {};
                    Emploi.ui.renderTable();
                } else {
                    Emploi.utils.showToast(data.message || 'Impossible de charger l\'emploi.', 'danger');
                }
            })
            .catch(function(err) {
                console.error('loadEmploi', err);
                Emploi.state.emploiData = {};
                Emploi.ui.renderTable();
                Emploi.utils.showToast('Erreur réseau lors du chargement de l\'emploi.', 'danger');
            })
            .finally(function() {
                Emploi.utils.hideSpinner();
            });
    }
};

// Fonction utilitaire globale pour le onchange du select (appelée depuis le HTML)
window.loadMatieresForSelectedClasse = function() {
    var classeId = document.getElementById('editClasse').value;
    if (classeId) {
        Emploi.loaders.loadMatieresForClasse(classeId);
    } else {
        var sel = document.getElementById('editMatiere');
        if (sel) {
            sel.innerHTML = '<option value="">-- Sélectionner d\'abord une classe --</option>';
        }
        var enseignantInput = document.getElementById('editEnseignant');
        if (enseignantInput) {
            enseignantInput.value = '';
            enseignantInput.disabled = true;
        }
    }
};