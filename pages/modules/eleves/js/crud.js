'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// MODAL FILTRE INITIAL
// ─────────────────────────────────────────────────────────────────────────────
function showInitialFilterModal() {
    var savedFilter = {};
    try { savedFilter = JSON.parse(localStorage.getItem('lastInitialFilter')) || {}; } catch (e) { }

    var anneeOptions = anneesData.map(function (a) {
        return '<option value="' + escapeHtml(a.ANNEE) + '">' + escapeHtml(a.ANNEE) + '</option>';
    }).join('');

    var classeOptions = classesData.map(function (c) {
        return '<option value="' + escapeHtml(String(c.ID)) + '">' + escapeHtml(c.NOM) + '</option>';
    }).join('');

    Swal.fire({
        title: '<i class="fas fa-filter"></i> Filtrer les élèves',
        html: `
            <div style="text-align:left;">
                <label style="display:block;margin-bottom:6px;font-weight:600;">Année Scolaire</label>
                <select id="init-annee" class="form-control" style="margin-bottom:12px;">
                    <option value="">-- Toutes --</option>
                    ${anneeOptions}
                </select>

                <label style="display:block;margin-bottom:6px;font-weight:600;">Classe</label>
                <select id="init-classe" class="form-control" style="margin-bottom:12px;">
                    <option value="">-- Toutes les classes --</option>
                    ${classeOptions}
                </select>

                <label style="display:block;margin-bottom:6px;font-weight:600;">Matricule</label>
                <input type="text" id="init-matricule" class="form-control" style="margin-bottom:12px;"
                    value="${escapeHtml(savedFilter.matricule || '')}" placeholder="Ex: MAT-2024...">

                <label style="display:block;margin-bottom:6px;font-weight:600;">Nom de l'élève</label>
                <input type="text" id="init-nom" class="form-control" style="margin-bottom:12px;"
                    value="${escapeHtml(savedFilter.nom || '')}" placeholder="Nom...">

                <label style="display:block;margin-bottom:6px;font-weight:600;">Statut</label>
                <select id="init-status" class="form-control">
                    <option value="">-- Tous --</option>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                </select>
            </div>`,
        confirmButtonText: '<i class="fas fa-check"></i> Appliquer',
        confirmButtonColor: '#007bff',
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        preConfirm: function () {
            return {
                annee: document.getElementById('init-annee').value,
                classe: document.getElementById('init-classe').value,
                matricule: document.getElementById('init-matricule').value.trim(),
                nom: document.getElementById('init-nom').value.trim(),
                status: document.getElementById('init-status').value
            };
        }
    }).then(function (result) {
        if (result.isConfirmed) {
            applyInitialFilters(result.value);
        }
    });
}

function applyInitialFilters(criteria) {
    try { localStorage.setItem('lastInitialFilter', JSON.stringify(criteria)); } catch (e) { }
    isInitialLoad = false;

    baseFilteredData = elevesData.filter(function (eleve) {
        var matchAnnee = criteria.annee ? (eleve.ANNEE_TEXTE === criteria.annee) : true;
        var matchClasse = criteria.classe ? (String(eleve.ID_CLASSE) === String(criteria.classe)) : true;
        var matchMatricule = criteria.matricule ? (eleve.MATRICULE?.toLowerCase().includes(criteria.matricule.toLowerCase())) : true;
        var matchNom = criteria.nom ? (eleve.NOM?.toLowerCase().includes(criteria.nom.toLowerCase())) : true;
        var matchStatus = criteria.status ? (eleve.STATUT?.toLowerCase() === criteria.status.toLowerCase()) : true;
        return matchAnnee && matchClasse && matchMatricule && matchNom && matchStatus;
    });

    filteredEleves = [...baseFilteredData];
    currentPage = 1;
    createFilterControls();
    renderTable();

    var count = filteredEleves.length;
    Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
        .fire({ icon: 'success', title: count + ' élève(s) trouvé(s)' });
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — OUVRIR AJOUT
// ─────────────────────────────────────────────────────────────────────────────
function openAddEleveModal(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    currentMode = 'ajout';
    currentEleveId = null;
    resetEleveForm();

    var inputAnnee = document.getElementById('eleveAnnee');
    var inputMatricule = document.getElementById('eleveMatricule');

    if (inputAnnee) {
        inputAnnee.disabled = false;
        inputAnnee.style.backgroundColor = '#fff';
    }
    if (inputMatricule) {
        inputMatricule.disabled = false;
        inputMatricule.style.backgroundColor = '#fff';
    }

    var title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fas fa-plus"></i> Nouvel élève';

    showModal('eleveModal');
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL — OUVRIR MODIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function openEditEleveModal(id) {
    var eleve = elevesData.find(e => e.ID == id);
    var anneeObj = anneesData.find(a => a.ID == eleve.ANNEE_ID || a.ANNEE === eleve.ANNEE_TEXTE);

    if (anneeObj && anneeObj.CLOTURE) {
        Swal.fire('Action impossible', 'Cette année est clôturée. Aucune modification n\'est autorisée.', 'warning');
        return;
    }

    currentMode = 'modification';
    currentEleveId = id;

    var selectAnnee = document.getElementById('eleveAnnee');
    if (selectAnnee) {
        var idAnnee = eleve.ANNEE_ID;
        if (!idAnnee && eleve.ANNEE_TEXTE) {
            var found = anneesData.find(function (a) { return a.ANNEE === eleve.ANNEE_TEXTE; });
            if (found) idAnnee = found.ID;
        }
        selectAnnee.value = idAnnee ? idAnnee.toString() : "";
        selectAnnee.disabled = true;
        selectAnnee.style.backgroundColor = '#e9ecef';
        selectAnnee.style.cursor = 'not-allowed';
    }

    var inputMatricule = document.getElementById('eleveMatricule');
    if (inputMatricule) {
        inputMatricule.value = eleve.MATRICULE || '';
        inputMatricule.disabled = true;
        inputMatricule.style.backgroundColor = '#e9ecef';
        inputMatricule.style.cursor = 'not-allowed';
    }

    setVal('eleveNom', eleve.NOM || '');
    setVal('EleveClasse', String(eleve.ID_CLASSE || ''));
    setVal('eleveEmail', eleve.EMAIL || '');
    setVal('eleveTelephone', eleve.TELEPHONE || '');
    setVal('eleveDateNaiss', eleve.DATE_NAISSANCE || '');
    setVal('eleveGenre', eleve.GENRE || 'M');
    setVal('eleveAdresse', eleve.ADRESSE || '');
    setVal('eleveParent', eleve.PARENT || '');
    setVal('eleveStatut', (eleve.STATUT || 'actif').toLowerCase());

    var title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> Modifier l\'élève';

    showModal('eleveModal');
}

function resetEleveForm() {
    ['eleveAnnee', 'eleveMatricule', 'eleveNom', 'EleveClasse', 'eleveEmail',
        'eleveTelephone', 'eleveDateNaiss', 'eleveAdresse', 'eleveParent'
    ].forEach(function (id) {
        setVal(id, '');
    });
    setVal('eleveGenre', 'M');
    setVal('eleveStatut', 'actif');
}

// ─────────────────────────────────────────────────────────────────────────────
// SAUVEGARDE (avec gestion d'erreurs améliorée)
// ─────────────────────────────────────────────────────────────────────────────
async function saveEleve(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    var body = {
        ID: currentEleveId,
        ANNEE_ID: getVal('eleveAnnee'),
        MATRICULE: getVal('eleveMatricule'),
        NOM: getVal('eleveNom'),
        CLASSE: getVal('EleveClasse'),
        EMAIL: getVal('eleveEmail'),
        TELEPHONE: getVal('eleveTelephone'),
        STATUT: getVal('eleveStatut'),
        GENRE: getVal('eleveGenre'),
        DATE_NAISSANCE: getVal('eleveDateNaiss'),
        ADRESSE: getVal('eleveAdresse'),
        PARENT: getVal('eleveParent')
    };

    // ✅ Validations avec showErrorToast
    if (!body.NOM.trim()) {
        showErrorToast('Le nom complet est obligatoire.', 'Vérifiez le champ Nom');
        return false;
    }
    if (!body.MATRICULE.trim()) {
        showErrorToast('Le matricule est obligatoire.', 'Vérifiez le champ Matricule');
        return false;
    }
    if (!body.CLASSE) {
        showErrorToast('Veuillez sélectionner une classe.', 'Champ obligatoire');
        return false;
    }
    if (!body.ANNEE_ID) {
        showErrorToast('Veuillez sélectionner une année scolaire.', 'Champ obligatoire');
        return false;
    }

    // Vérification année clôturée
    var anneeSelectionnee = anneesData.find(function(a) { return a.ID == body.ANNEE_ID; });
    if (anneeSelectionnee && anneeSelectionnee.CLOTURE) {
        showErrorToast('Action impossible', 'Vous ne pouvez pas ajouter ou modifier un élève dans une année clôturée.');
        return false;
    }

    var url = currentMode === 'ajout' ? API_ELEVES.ajouter : API_ELEVES.modifier;

    showSpinner();

    try {
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        // ✅ Vérification du statut HTTP
        if (!res.ok) {
            var errorText = await res.text();
            console.error('Erreur serveur (HTTP ' + res.status + '):', errorText);

            var errorMessage = 'Erreur ' + res.status + ' - ' + res.statusText;
            var errorDetails = '';

            try {
                var errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
                if (errorJson.details) {
                    errorDetails = errorJson.details;
                }
            } catch (e) {
                if (errorText.length < 200) {
                    errorDetails = errorText;
                } else {
                    errorDetails = 'Voir la console pour plus de détails';
                    console.error('Erreur détaillée:', errorText);
                }
            }

            showErrorToast(errorMessage, errorDetails);
            hideSpinner();
            return false;
        }

        var data = await res.json();

        if (data.success) {
            showToast(data.message || 'Opération réussie', 'success');
            setTimeout(function() {
                closeEleveModal();
                reloadElevesAfterModification();
            }, 1500);
        } else {
            var msg = data.message || 'Erreur inconnue.';
            if (msg.indexOf("PRIMARY KEY") !== -1 || msg.indexOf("UQ_") !== -1 || msg.indexOf("duplicate key") !== -1) {
                msg = "Ce matricule existe déjà. Veuillez attribuer un matricule unique à cet élève.";
            }
            showErrorToast(msg, 'Vérifiez les données saisies');
        }
    } catch (err) {
        console.error('saveEleve:', err);
        showErrorToast('Erreur réseau', err.message);
    } finally {
        hideSpinner();
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHARGEMENT APRÈS MODIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function reloadElevesAfterModification() {
    console.log('[RELOAD] Rechargement des données...');
    showSpinner();

    try {
        const [dataEleves, dataClasses, dataAnnees] = await Promise.all([
            fetchJson(API_ELEVES.getEleves),
            fetchJson(API_ELEVES.getClasses),
            fetchJson(API_ELEVES.getAnnees)
        ]);

        if (dataClasses.success) {
            classesData = dataClasses.Classes || dataClasses.niveaux || [];
            peuplerSelectClasses();
        }

        if (dataAnnees.success) {
            anneesData = dataAnnees.Annees || [];
            peuplerSelectAnnees();
        }

        if (dataEleves.success) {
            elevesData = dataEleves.Eleves || [];
            
            var searchValue = document.getElementById('search-filter')?.value || '';
            var statusValue = document.getElementById('status-filter')?.value || '';

            baseFilteredData = [...elevesData];
            filteredEleves = baseFilteredData.filter(function (eleve) {
                var matchSearch = !searchValue || (
                    eleve.NOM?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    eleve.MATRICULE?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    eleve.EMAIL?.toLowerCase().includes(searchValue.toLowerCase())
                );
                var matchStatus = !statusValue || (eleve.STATUT?.toLowerCase() === statusValue);
                return matchSearch && matchStatus;
            });

            currentPage = 1;
            renderTable();
            console.log('[RELOAD] Données rechargées:', elevesData.length, 'élèves');
        }
    } catch (err) {
        console.error('reloadElevesAfterModification:', err);
        showErrorToast('Erreur lors du rechargement', err.message || 'Connexion au serveur échouée.');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPRESSION
// ─────────────────────────────────────────────────────────────────────────────
async function supprimerEleve(id, nom) {
    var eleve = elevesData.find(e => e.ID == id);
    var anneeObj = anneesData.find(a => a.ID == eleve.ANNEE_ID || a.ANNEE === eleve.ANNEE_TEXTE);

    if (anneeObj && anneeObj.CLOTURE) {
        showErrorToast('Blocage', 'Impossible de supprimer un élève rattaché à une année clôturée.');
        return;
    }

    var result = await Swal.fire({
        title: 'Supprimer cet élève ?',
        html: '<strong>' + escapeHtml(nom) + '</strong> sera supprimé définitivement.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    showSpinner();

    try {
        var res = await fetch(API_ELEVES.supprimer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ID: id })
        });

        var data = await safeJson(res);

        if (data.success) {
            await reloadElevesAfterModification();
            Swal.fire({
                icon: 'success',
                title: data.message || 'Élève supprimé.',
                timer: 1000,
                showConfirmButton: false
            });
        } else {
            showErrorToast(data.message || 'Erreur lors de la suppression.', '');
        }
    } catch (err) {
        console.error('supprimerEleve:', err);
        showErrorToast('Erreur réseau', err.message);
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES (mise à jour du nom de fichier, etc.)
// ─────────────────────────────────────────────────────────────────────────────
function updateFileName() {
    var file = document.getElementById('excelFile');
    var display = document.getElementById('fileNameDisplay');
    var btn = document.getElementById('btnLaunchImport');
    if (!file || !display) return;

    var name = file.files[0] ? file.files[0].name : '';
    display.value = name;
    if (btn) btn.disabled = !name;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE (pour les appels depuis le HTML)
// ─────────────────────────────────────────────────────────────────────────────
window.showInitialFilterModal = showInitialFilterModal;
window.applyInitialFilters = applyInitialFilters;
window.openAddEleveModal = openAddEleveModal;
window.openEditEleveModal = openEditEleveModal;
window.resetEleveForm = resetEleveForm;
window.saveEleve = saveEleve;
window.reloadElevesAfterModification = reloadElevesAfterModification;
window.supprimerEleve = supprimerEleve;
window.updateFileName = updateFileName;