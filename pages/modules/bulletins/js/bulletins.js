'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
var API_BULLETINS = {
    getBulletins: 'handlers/GetBulletins.ashx',
    getEleves: '../eleves/handlers/GetEleve.ashx',
    getClasses: '../../parametres/classes/handlers/GetClasse.ashx',
    getMatieres: '../../parametres/matieres/handlers/GetMatieres.ashx',
    getAnnees: '../../administrations/annee/handlers/GetAnnee.ashx',
    ajouter: 'handlers/AjouterBulletin.ashx',
    modifier: 'handlers/ModifierBulletin.ashx',
    supprimer: 'handlers/SupprimerBulletin.ashx'
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var bulletinsData = [];
var filteredBulletins = [];
var elevesList = [];
var classesList = [];
var matieresList = [];
var anneesList = [];
var currentPage = 1;
var rowsPerPage = 10;
var currentSortCol = 'ELEVE_NOM';
var currentSortDir = 'ASC';
var currentBulletinId = null;
var currentMode = 'add';

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatNote(note) {
    if (note === null || note === undefined) return '-';
    return parseFloat(note).toFixed(1) + '/20';
}

function getNoteClass(note) {
    if (note >= 16) return 'note-excellent';
    if (note >= 14) return 'note-bien';
    if (note >= 12) return 'note-assez-bien';
    if (note >= 10) return 'note-passable';
    return 'note-insuffisant';
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'flex'; s.style.visibility = 'visible'; s.style.opacity = '1'; }
}

function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'none'; s.style.visibility = 'hidden'; s.style.opacity = '0'; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeAddBulletinModal() {
    closeModal('addBulletinModal');
    currentMode = 'add';
    currentBulletinId = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
async function loadBulletins() {
    console.log('[Bulletins] Chargement des données...');
    showSpinner();
    try {
        var [bulletinsRes, elevesRes, classesRes, matieresRes, anneesRes] = await Promise.all([
            fetch(API_BULLETINS.getBulletins),
            fetch(API_BULLETINS.getEleves),
            fetch(API_BULLETINS.getClasses),
            fetch(API_BULLETINS.getMatieres),
            fetch(API_BULLETINS.getAnnees)
        ]);

        var bulletinsResult = await bulletinsRes.json();
        var elevesResult = await elevesRes.json();
        var classesResult = await classesRes.json();
        var matieresResult = await matieresRes.json();
        var anneesResult = await anneesRes.json();

        if (bulletinsResult.success) {
            bulletinsData = bulletinsResult.data || [];
            console.log('[Bulletins] Données chargées:', bulletinsData.length);
        } else {
            console.error('Erreur bulletins:', bulletinsResult.message);
            bulletinsData = [];
        }

        if (elevesResult.success) {
            elevesList = elevesResult.Eleves || [];
            populateStudentSelect();
        }

        if (classesResult.success) {
            classesList = classesResult.Classes || classesResult.niveaux || [];
            populateClassFilter();
        }

        if (matieresResult.success) {
            matieresList = matieresResult.data || [];
            populateSubjectSelect();
        }

        if (anneesResult.success) {
            anneesList = anneesResult.Annees || [];
        }

        filteredBulletins = [...bulletinsData];
        applySort();
        renderTable();
        createFilterControls();

    } catch (err) {
        console.error('loadBulletins:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Impossible de charger les données des bulletins.', 'error');
        }
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PEUPLER LES SELECTS
// ─────────────────────────────────────────────────────────────────────────────
function populateStudentSelect() {
    var sel = document.getElementById('bulletinStudent');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Sélectionner un élève...</option>';
    for (var i = 0; i < elevesList.length; i++) {
        var e = elevesList[i];
        var opt = document.createElement('option');
        opt.value = e.MATRICULE;
        opt.textContent = e.MATRICULE + ' — ' + (e.NOM || '');
        opt.dataset.nom = e.NOM || '';
        opt.dataset.classe = e.CLASSE_NOM || '';
        sel.appendChild(opt);
    }
}

function populateSubjectSelect() {
    var sel = document.getElementById('bulletinSubject');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Sélectionner une matière...</option>';
    for (var i = 0; i < matieresList.length; i++) {
        var m = matieresList[i];
        var opt = document.createElement('option');
        opt.value = m.ID;
        opt.textContent = m.NOM + ' (Coeff: ' + m.COEFFICIENT + ')';
        opt.dataset.coefficient = m.COEFFICIENT;
        opt.dataset.enseignant = m.ENSEIGNANT_NOM || '';
        opt.dataset.enseignantId = m.ENSEIGNANT_ID;
        sel.appendChild(opt);
    }
    
    // Ajouter event listener pour mettre à jour l'enseignant automatiquement
    sel.addEventListener('change', function() {
        var teacherSelect = document.getElementById('bulletinTeacher');
        if (teacherSelect && sel.selectedIndex > 0) {
            var selectedOption = sel.options[sel.selectedIndex];
            teacherSelect.value = selectedOption.dataset.enseignant || '';
        }
    });
}

function populateClassFilter() {
    var sel = document.getElementById('bulletinFilterClasse');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Toutes les classes</option>';
    for (var i = 0; i < classesList.length; i++) {
        var opt = document.createElement('option');
        opt.value = classesList[i].ID;
        opt.textContent = classesList[i].NOM;
        sel.appendChild(opt);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES
// ─────────────────────────────────────────────────────────────────────────────
function createFilterControls() {
    var filterContainer = document.getElementById('bulletin-filter-container');
    if (filterContainer) return;
    
    var fc = document.createElement('div');
    fc.id = 'bulletin-filter-container';
    fc.style.cssText = 'margin:0 0 20px;padding:14px 18px;background:linear-gradient(135deg,#f8f9fa,#e9ecef);border-radius:10px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #dee2e6;';
    fc.innerHTML = `
        <div style="flex:2;min-width:200px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-search"></i> Recherche
            </label>
            <input type="text" id="bulletin-search-filter" placeholder="Nom, matricule, matière..."
                style="width:100%;padding:9px 12px;border:1px solid #ced4da;border-radius:6px;font-size:13px;">
        </div>
        <div style="min-width:150px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-filter"></i> Classe
            </label>
            <select id="bulletinFilterClasse" class="form-control">
                <option value="">Toutes les classes</option>
            </select>
        </div>
        <div style="min-width:150px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-calendar"></i> Période
            </label>
            <select id="bulletinFilterPeriode" class="form-control">
                <option value="">Toutes</option>
                <option value="T1">Trimestre 1</option>
                <option value="T2">Trimestre 2</option>
                <option value="T3">Trimestre 3</option>
                <option value="Sem1">Semestre 1</option>
                <option value="Sem2">Semestre 2</option>
            </select>
        </div>
        <div style="min-width:130px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-list"></i> Lignes/page
            </label>
            <select id="bulletin-rows-per-page" class="form-control">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>
        <button id="bulletin-reset-filters" type="button"
            style="padding:9px 20px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;
    
    var container = document.querySelector('.dash-card-body');
    if (container) {
        container.insertBefore(fc, container.firstChild);
    }
    
    document.getElementById('bulletin-search-filter')?.addEventListener('input', filterBulletins);
    document.getElementById('bulletinFilterClasse')?.addEventListener('change', filterBulletins);
    document.getElementById('bulletinFilterPeriode')?.addEventListener('change', filterBulletins);
    document.getElementById('bulletin-rows-per-page')?.addEventListener('change', function(e) {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });
    document.getElementById('bulletin-reset-filters')?.addEventListener('click', resetFilters);
    
    // Peupler le filtre classe
    populateClassFilter();
}

function filterBulletins() {
    var searchTerm = document.getElementById('bulletin-search-filter')?.value.toLowerCase().trim() || '';
    var classeFilter = document.getElementById('bulletinFilterClasse')?.value || '';
    var periodeFilter = document.getElementById('bulletinFilterPeriode')?.value || '';
    
    filteredBulletins = bulletinsData.filter(function(item) {
        var matchSearch = !searchTerm || 
            (item.ELEVE_NOM || '').toLowerCase().includes(searchTerm) ||
            (item.MATRICULE || '').toLowerCase().includes(searchTerm) ||
            (item.MATIERE_NOM || '').toLowerCase().includes(searchTerm);
        
        var matchClasse = !classeFilter || String(item.CLASSE) === String(classeFilter);
        var matchPeriode = !periodeFilter || item.PERIODE === periodeFilter;
        
        return matchSearch && matchClasse && matchPeriode;
    });
    
    applySort();
    currentPage = 1;
    renderTable();
}

function resetFilters() {
    var search = document.getElementById('bulletin-search-filter');
    var classe = document.getElementById('bulletinFilterClasse');
    var periode = document.getElementById('bulletinFilterPeriode');
    var rows = document.getElementById('bulletin-rows-per-page');
    
    if (search) search.value = '';
    if (classe) classe.value = '';
    if (periode) periode.value = '';
    if (rows) rows.value = '10';
    
    rowsPerPage = 10;
    filteredBulletins = [...bulletinsData];
    applySort();
    currentPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// TRI
// ─────────────────────────────────────────────────────────────────────────────
function applySort() {
    filteredBulletins.sort(function(a, b) {
        var valA = a[currentSortCol] || '';
        var valB = b[currentSortCol] || '';
        
        if (typeof valA === 'number' && typeof valB === 'number') {
            return currentSortDir === 'ASC' ? valA - valB : valB - valA;
        }
        
        var strA = String(valA).toLowerCase();
        var strB = String(valB).toLowerCase();
        
        if (strA < strB) return currentSortDir === 'ASC' ? -1 : 1;
        if (strA > strB) return currentSortDir === 'ASC' ? 1 : -1;
        return 0;
    });
}

function sortBy(column) {
    if (currentSortCol === column) {
        currentSortDir = currentSortDir === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentSortCol = column;
        currentSortDir = 'ASC';
    }
    applySort();
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────
function renderTable() {
    var tbody = document.getElementById('bulletinsTableBody');
    if (!tbody) return;
    
    if (!filteredBulletins || filteredBulletins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:50px;">' +
            '<i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>' +
            'Aucun bulletin trouvé</td></tr>';
        updatePaginationInfo();
        return;
    }
    
    var start = (currentPage - 1) * rowsPerPage;
    var pageData = filteredBulletins.slice(start, start + rowsPerPage);
    
    tbody.innerHTML = '';
    for (var i = 0; i < pageData.length; i++) {
        var b = pageData[i];
        var row = tbody.insertRow();
        var noteClass = getNoteClass(b.NOTE);
        
        row.innerHTML = `
            <td class="text-center">${getMatriculeBadge(b.MATRICULE)}</td>
            <td class="text-center">${getNomBadge(b.ELEVE_NOM)}</td>
            <td class="text-center">${getClasseBadge(b.CLASSE_NOM || '-')}</td>
            <td class="text-center">${getMatiereBadge(b.MATIERE_NOM)}</td>
            <td class="text-center">${getEnseignantBadge(b.ENSEIGNANT_NOM)}</td>
            <td class="text-center"><span class="${noteClass}" style="font-weight:700;padding:4px 8px;border-radius:6px;">${formatNote(b.NOTE)}</span></td>
            <td class="text-center">${b.COEFFICIENT || 1}</td>
            <td class="text-center">${getPeriodeBadge(b.PERIODE)}</td>
            <td class="text-center">
                <div style="display:flex;gap:4px;justify-content:center;">
                    <button class="btn btn-sm btn-primary" onclick="editBulletin('${escapeHtml(b.ID)}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBulletin('${escapeHtml(b.ID)}', '${escapeHtml(b.ELEVE_NOM)}', '${escapeHtml(b.MATIERE_NOM)}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    }
    
    updatePaginationInfo();
    createPaginationControls();
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────────────────────
function getNomBadge(nom) {
    return '<span style="font-weight:700;">' + escapeHtml(nom || '-') + '</span>';
}

function getMatriculeBadge(mat) {
    return '<span style="background:#f1f3f5;color:#212529;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid #dee2e6;">' + escapeHtml(mat || '-') + '</span>';
}

function getClasseBadge(cls) {
    return '<span style="background:#fff;color:#007bff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;">' +
        '<i class="fas fa-folder" style="margin-right:4px;"></i>' + escapeHtml(cls) + '</span>';
}

function getMatiereBadge(matiere) {
    return '<span style="background:#e9ecef;color:#495057;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">' +
        '<i class="fas fa-book" style="margin-right:4px;"></i>' + escapeHtml(matiere) + '</span>';
}

function getEnseignantBadge(enseignant) {
    if (!enseignant) return '-';
    return '<span style="background:#f8f9fa;color:#6c757d;padding:3px 10px;border-radius:20px;font-size:11px;">' +
        '<i class="fas fa-chalkboard-teacher" style="margin-right:4px;"></i>' + escapeHtml(enseignant) + '</span>';
}

function getPeriodeBadge(periode) {
    var label = periode;
    if (periode === 'T1') label = 'Trimestre 1';
    else if (periode === 'T2') label = 'Trimestre 2';
    else if (periode === 'T3') label = 'Trimestre 3';
    else if (periode === 'Sem1') label = 'Semestre 1';
    else if (periode === 'Sem2') label = 'Semestre 2';
    
    return '<span style="background:#e3f2fd;color:#1976d2;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">' +
        '<i class="fas fa-calendar" style="margin-right:4px;"></i>' + escapeHtml(label) + '</span>';
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
function updatePaginationInfo() {
    var total = filteredBulletins.length;
    var start = (currentPage - 1) * rowsPerPage + 1;
    var end = Math.min(currentPage * rowsPerPage, total);
    var infoSpan = document.getElementById('bulletinPaginationInfo');
    
    if (!infoSpan) {
        var container = document.querySelector('.dash-card-body');
        if (container && !document.getElementById('bulletinPaginationInfo')) {
            var div = document.createElement('div');
            div.id = 'bulletinPaginationInfo';
            div.style.cssText = 'margin:15px 0;color:#6c757d;font-size:13px;text-align:center;';
            container.appendChild(div);
        }
        infoSpan = document.getElementById('bulletinPaginationInfo');
    }
    
    if (infoSpan) {
        if (total === 0) {
            infoSpan.textContent = 'Aucun enregistrement';
        } else {
            infoSpan.textContent = `Affichage de ${start} à ${end} sur ${total} bulletin(s)`;
        }
    }
}

function createPaginationControls() {
    var totalPages = Math.ceil(filteredBulletins.length / rowsPerPage);
    var oldContainer = document.getElementById('bulletin-pagination-container');
    if (oldContainer) oldContainer.remove();
    
    if (totalPages <= 1) return;
    
    var container = document.createElement('div');
    container.id = 'bulletin-pagination-container';
    container.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:5px;margin-top:15px;flex-wrap:wrap;';
    
    container.appendChild(createPageButton('«', function() { goToPage(1); }, currentPage === 1));
    container.appendChild(createPageButton('‹', function() { if (currentPage > 1) goToPage(currentPage - 1); }, currentPage === 1));
    
    var maxVisible = 5;
    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        container.appendChild(createPageButton('1', function() { goToPage(1); }));
        if (startPage > 2) container.appendChild(createDots());
    }
    
    for (var i = startPage; i <= endPage; i++) {
        container.appendChild(createPageButton(i.toString(), function(page) { 
            return function() { goToPage(page); };
        }(i), i === currentPage));
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) container.appendChild(createDots());
        container.appendChild(createPageButton(totalPages.toString(), function() { goToPage(totalPages); }));
    }
    
    container.appendChild(createPageButton('›', function() { if (currentPage < totalPages) goToPage(currentPage + 1); }, currentPage === totalPages));
    container.appendChild(createPageButton('»', function() { goToPage(totalPages); }, currentPage === totalPages));
    
    var tableContainer = document.querySelector('.dash-card-body');
    if (tableContainer) {
        tableContainer.appendChild(container);
    }
}

function createPageButton(text, onClick, isDisabled) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    var isActive = (!isNaN(text) && parseInt(text) === currentPage);
    
    btn.style.cssText = 'padding:7px 13px;border:1px solid ' + (isActive ? '#007bff' : '#dee2e6') + ';' +
        'background:' + (isActive ? '#007bff' : isDisabled ? '#e9ecef' : 'white') + ';' +
        'color:' + (isActive ? 'white' : isDisabled ? '#6c757d' : '#007bff') + ';' +
        'cursor:' + (isDisabled || isActive ? 'default' : 'pointer') + ';border-radius:6px;font-weight:' + (isActive ? '700' : '500') + ';' +
        'min-width:38px;transition:all .15s;';
    
    if (onClick && !isDisabled && !isActive) {
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseenter', function() {
            if (!isDisabled && !isActive) {
                btn.style.background = '#007bff';
                btn.style.color = 'white';
            }
        });
        btn.addEventListener('mouseleave', function() {
            if (!isDisabled && !isActive) {
                btn.style.background = 'white';
                btn.style.color = '#007bff';
            }
        });
    }
    
    if (isDisabled) btn.disabled = true;
    return btn;
}

function createDots() {
    var span = document.createElement('span');
    span.textContent = '…';
    span.style.cssText = 'padding:7px 4px;color:#6c757d;';
    return span;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES BULLETINS
// ─────────────────────────────────────────────────────────────────────────────
function openAddBulletinModal() {
    currentMode = 'add';
    currentBulletinId = null;
    
    var form = document.getElementById('addBulletinForm');
    if (form) form.reset();
    
    var studentSelect = document.getElementById('bulletinStudent');
    var subjectSelect = document.getElementById('bulletinSubject');
    var gradeInput = document.getElementById('bulletinGrade');
    var periodSelect = document.getElementById('bulletinPeriod');
    var commentTextarea = document.getElementById('bulletinComment');
    
    if (studentSelect) studentSelect.value = '';
    if (subjectSelect) subjectSelect.value = '';
    if (gradeInput) gradeInput.value = '';
    if (periodSelect) periodSelect.value = 'T1';
    if (commentTextarea) commentTextarea.value = '';
    
    openModal('addBulletinModal');
}

function editBulletin(id) {
    var bulletin = bulletinsData.find(function(b) { return b.ID === id; });
    if (!bulletin) {
        console.error('Bulletin non trouvé:', id);
        return;
    }
    
    currentMode = 'edit';
    currentBulletinId = id;
    
    // Ouvrir une modal d'édition (similaire à add mais avec les valeurs pré-remplies)
    Swal.fire({
        title: 'Modifier la note',
        html: `
            <div style="text-align:left;">
                <p><strong>Élève:</strong> ${escapeHtml(bulletin.ELEVE_NOM)}</p>
                <p><strong>Matière:</strong> ${escapeHtml(bulletin.MATIERE_NOM)}</p>
                <p><strong>Période:</strong> ${escapeHtml(bulletin.PERIODE)}</p>
                <div class="form-group">
                    <label>Note (0-20)</label>
                    <input type="number" id="edit-note" class="form-control" step="0.5" min="0" max="20" value="${bulletin.NOTE}">
                </div>
                <div class="form-group">
                    <label>Commentaire</label>
                    <textarea id="edit-commentaire" class="form-control" rows="3">${escapeHtml(bulletin.COMMENTAIRE || '')}</textarea>
                </div>
            </div>
        `,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        showCancelButton: true,
        preConfirm: function() {
            var note = parseFloat(document.getElementById('edit-note').value);
            var commentaire = document.getElementById('edit-commentaire').value;
            
            if (isNaN(note) || note < 0 || note > 20) {
                Swal.showValidationMessage('La note doit être entre 0 et 20');
                return false;
            }
            
            return { note: note, commentaire: commentaire };
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            updateBulletin(id, result.value.note, result.value.commentaire);
        }
    });
}

async function updateBulletin(id, note, commentaire) {
    showSpinner();
    try {
        var res = await fetch(API_BULLETINS.modifier, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ID: id,
                NOTE: note,
                COMMENTAIRE: commentaire
            })
        });
        
        var result = await res.json();
        
        if (result.success) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Note modifiée', timer: 1500, showConfirmButton: false });
            }
            setTimeout(function() { loadBulletins(); }, 1500);
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Erreur', result.message || 'Erreur lors de la modification.', 'error');
            }
        }
    } catch (err) {
        console.error('updateBulletin:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur réseau', err.message, 'error');
        }
    } finally {
        hideSpinner();
    }
}

async function saveNewBulletin() {
    var matricule = document.getElementById('bulletinStudent')?.value;
    var matiereId = document.getElementById('bulletinSubject')?.value;
    var note = parseFloat(document.getElementById('bulletinGrade')?.value);
    var periode = document.getElementById('bulletinPeriod')?.value;
    var commentaire = document.getElementById('bulletinComment')?.value;
    
    if (!matricule) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Veuillez sélectionner un élève.', 'warning');
        }
        return;
    }
    
    if (!matiereId) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Veuillez sélectionner une matière.', 'warning');
        }
        return;
    }
    
    if (isNaN(note) || note < 0 || note > 20) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'La note doit être comprise entre 0 et 20.', 'warning');
        }
        return;
    }
    
    if (!periode) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Veuillez sélectionner une période.', 'warning');
        }
        return;
    }
    
    showSpinner();
    
    try {
        var res = await fetch(API_BULLETINS.ajouter, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MATRICULE: matricule,
                MATIERE_ID: matiereId,
                NOTE: note,
                PERIODE: periode,
                COMMENTAIRE: commentaire || ''
            })
        });
        
        var result = await res.json();
        
        if (result.success) {
            closeAddBulletinModal();
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Bulletin ajouté', timer: 1500, showConfirmButton: false });
            }
            setTimeout(function() { loadBulletins(); }, 1500);
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Erreur', result.message || 'Erreur lors de l\'ajout.', 'error');
            }
        }
    } catch (err) {
        console.error('saveNewBulletin:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur réseau', err.message, 'error');
        }
    } finally {
        hideSpinner();
    }
}

async function deleteBulletin(id, eleveNom, matiereNom) {
    var result = await Swal.fire({
        title: 'Supprimer ce bulletin ?',
        html: `<strong>${escapeHtml(eleveNom)}</strong> - <strong>${escapeHtml(matiereNom)}</strong>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    });
    
    if (!result.isConfirmed) return;
    
    showSpinner();
    try {
        var res = await fetch(API_BULLETINS.supprimer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ID: id })
        });
        
        var data = await res.json();
        
        if (data.success) {
            bulletinsData = bulletinsData.filter(function(b) { return b.ID !== id; });
            filteredBulletins = filteredBulletins.filter(function(b) { return b.ID !== id; });
            renderTable();
            
            Swal.fire({ icon: 'success', title: 'Bulletin supprimé', timer: 1000, showConfirmButton: false });
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la suppression.', 'error');
        }
    } catch (err) {
        console.error('deleteBulletin:', err);
        Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
function exportBulletins() {
    if (!filteredBulletins.length) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Info', 'Aucune donnée à exporter', 'info');
        }
        return;
    }
    
    var data = [['Matricule', 'Élève', 'Classe', 'Matière', 'Enseignant', 'Note/20', 'Coefficient', 'Période', 'Commentaire']];
    
    for (var i = 0; i < filteredBulletins.length; i++) {
        var b = filteredBulletins[i];
        data.push([
            b.MATRICULE || '',
            b.ELEVE_NOM || '',
            b.CLASSE_NOM || '',
            b.MATIERE_NOM || '',
            b.ENSEIGNANT_NOM || '',
            b.NOTE || 0,
            b.COEFFICIENT || 1,
            b.PERIODE || '',
            b.COMMENTAIRE || ''
        ]);
    }
    
    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bulletins');
    XLSX.writeFile(wb, 'Bulletins_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}

function importExcel(input) {
    if (!input.files || !input.files[0]) return;
    
    var file = input.files[0];
    var reader = new FileReader();
    
    reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(sheet);
        
        console.log('Données importées:', rows);
        Swal.fire('Info', 'Import Excel: ' + rows.length + ' lignes trouvées. À implémenter.', 'info');
    };
    
    reader.readAsArrayBuffer(file);
    input.value = '';
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    console.log('[Bulletins] Initialisation...');
    loadBulletins();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('addBulletinModal');
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────
window.openAddBulletinModal = openAddBulletinModal;
window.closeAddBulletinModal = closeAddBulletinModal;
window.saveNewBulletin = saveNewBulletin;
window.editBulletin = editBulletin;
window.deleteBulletin = deleteBulletin;
window.exportBulletins = exportBulletins;
window.importExcel = importExcel;
window.filterBulletins = filterBulletins;
window.sortBy = sortBy;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}