'use strict';
(function() {
    // Références aux boutons
    var btnAdd = document.getElementById('btnAddEmploi');
    var btnRefresh = document.getElementById('btnRefresh');
    var btnPrint = document.getElementById('btnPrint');

    // Fonction pour mettre à jour l'état des boutons (exposée globalement)
    window.updateButtons = function() {
        var filter = document.getElementById('classeFilter');
        var hasClass = filter && filter.value && filter.value !== '';
        if (btnAdd) btnAdd.disabled = !hasClass;
        if (btnRefresh) btnRefresh.disabled = !hasClass;
        if (btnPrint) btnPrint.disabled = !hasClass;
    };

    // Charger les classes (le callback dans loaders.js appellera updateButtons)
    Emploi.loaders.loadClasses();

    // Exposer les fonctions globales pour les onclick
    window.loadEmploi = function() { Emploi.loaders.loadEmploi(); };
    window.openEditModal = function() { Emploi.events.openEdit(null, null); };
    window.saveCell = function() { Emploi.crud.saveCell(); };
    window.deleteCell = function() { Emploi.crud.deleteCell(); };
    window.printEmploi = function() { Emploi.events.print(); };
    window.closeEditModal = function() { Emploi.utils.closeModal('editModal'); };
    window.loadMatieresForSelectedClasse = function() {
        // ... (inchangé)
    };

    // Écouteur pour le changement de matière (remplit l'enseignant)
    var matiereSelect = document.getElementById('editMatiere');
    if (matiereSelect) {
        matiereSelect.addEventListener('change', function() {
            Emploi.events.setEnseignantFromMatiere(this.value);
        });
    }

    // Bouton Rafraîchir
    if (btnRefresh) {
        btnRefresh.addEventListener('click', function() {
            Emploi.loaders.loadEmploi();
        });
    }

    // Bouton Paramétrer
    if (btnAdd) {
        btnAdd.addEventListener('click', function() {
            Emploi.events.openEdit(null, null);
        });
    }

    // Filtre classe
    var filter = document.getElementById('classeFilter');
    if (filter) {
        filter.addEventListener('change', function() {
            window.updateButtons();
            if (this.value) {
                Emploi.loaders.loadEmploi();
            } else {
                var tbody = document.getElementById('emploiBody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6c757d;font-size:16px;">Veuillez sélectionner une classe</td></tr>';
                }
                Emploi.state.emploiData = {};
            }
        });
        // Initialisation : l'état des boutons sera mis à jour par le callback de loadClasses
        // Mais on le fait aussi ici pour le cas où le filtre a déjà une valeur
        if (filter.value) {
            Emploi.loaders.loadEmploi();
        } else {
            var tbody = document.getElementById('emploiBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6c757d;font-size:16px;">Veuillez sélectionner une classe</td></tr>';
            }
        }
    }
})();