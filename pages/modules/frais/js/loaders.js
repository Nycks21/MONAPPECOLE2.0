'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════════
// PEUPLER LES SELECTS
// ════════════════════════════════════════════════════════════════════════════

function populateStudentSelect() {
    var sel = document.getElementById('paymentStudent');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Sélectionner un élève --</option>';
    elevesList.forEach(function (e) {
        var opt = document.createElement('option');
        opt.value = e.MATRICULE;
        opt.textContent = e.MATRICULE + ' — ' + (e.NOM || '');
        opt.dataset.nom = e.NOM || '';
        opt.dataset.classe = e.CLASSE_NOM || '';
        sel.appendChild(opt);
    });
}

function populateClassFilter() {
    var sel = document.getElementById('fraisFilterClasse');
    if (!sel) return;
    sel.innerHTML = '<option value="">Toutes les classes</option>';
    classesList.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.NOM;
        opt.textContent = c.NOM;
        sel.appendChild(opt);
    });
}

function populateTarifClasseSelects() {
    ['tarifClasse', 'tarifClasseFilter'].forEach(function (selId) {
        var sel = document.getElementById(selId);
        if (!sel) return;
        var isFilter = (selId === 'tarifClasseFilter');
        sel.innerHTML = isFilter
            ? '<option value="">Toutes les classes</option>'
            : '<option value="">-- Sélectionner une classe --</option>';
        classesList.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = c.ID;
            opt.textContent = c.NOM;
            sel.appendChild(opt);
        });
    });
}

// ════════════════════════════════════════════════════════════════════════════
// CHARGEMENT DES DONNÉES
// ════════════════════════════════════════════════════════════════════════════

async function loadFrais() {
    showSpinner();
    try {
        var [fraisRes, elevesRes, classesRes] = await Promise.all([
            fetch(API_FRAIS.getFrais),
            fetch(API_FRAIS.getEleves),
            fetch(API_FRAIS.getClasses)
        ]);

        var fraisResult = await fraisRes.json();
        var elevesResult = await elevesRes.json();
        var classesResult = await classesRes.json();

        console.log('📊 Frais résultat:', fraisResult);
        console.log('📊 Élèves résultat:', elevesResult);
        console.log('📊 Classes résultat:', classesResult);

        if (fraisResult.success) {
            fraisData = fraisResult.data || [];
        }
        
        // Gestion des élèves
        if (elevesResult.success) {
            if (elevesResult.Eleves) {
                elevesList = elevesResult.Eleves;
            } else if (elevesResult.data) {
                elevesList = elevesResult.data;
            } else if (Array.isArray(elevesResult)) {
                elevesList = elevesResult;
            } else if (elevesResult.eleves) {
                elevesList = elevesResult.eleves;
            } else {
                for (var key in elevesResult) {
                    if (Array.isArray(elevesResult[key])) {
                        elevesList = elevesResult[key];
                        break;
                    }
                }
            }
        }

        // Gestion des classes
        if (classesResult.success) {
            if (classesResult.Classes) {
                classesList = classesResult.Classes;
            } else if (classesResult.data) {
                classesList = classesResult.data;
            } else if (Array.isArray(classesResult)) {
                classesList = classesResult;
            } else if (classesResult.classes) {
                classesList = classesResult.classes;
            } else {
                for (var key in classesResult) {
                    if (Array.isArray(classesResult[key])) {
                        classesList = classesResult[key];
                        break;
                    }
                }
            }
        }

        console.log('👨‍🎓 Élèves chargés:', elevesList.length);
        console.log('📚 Classes chargées:', classesList.length);

        populateStudentSelect();
        populateClassFilter();
        populateTarifClasseSelects();

        filteredFrais = fraisData.slice();
        applySort();
        updateStats();
        renderTable();

    } catch (err) {
        console.error('loadFrais:', err);
        Swal.fire('Erreur', 'Impossible de charger les données des frais.', 'error');
    } finally {
        hideSpinner();
    }
}

// ════════════════════════════════════════════════════════════════════════════
// STATISTIQUES & TRI
// ════════════════════════════════════════════════════════════════════════════

function updateStats() {
    var totalFrais = 0, totalPaye = 0, totalReste = 0;
    fraisData.forEach(function (f) {
        totalFrais += parseFloat(f.TOTAL || 0);
        totalPaye += parseFloat(f.PAYE || 0);
        totalReste += parseFloat(f.RESTE || 0);
    });
    var taux = totalFrais > 0 ? (totalPaye / totalFrais * 100).toFixed(1) : 0;

    var el = function (id) { return document.getElementById(id); };
    if (el('statTotalFrais')) el('statTotalFrais').textContent = formatMoney(totalFrais);
    if (el('statTotalPaye')) el('statTotalPaye').textContent = formatMoney(totalPaye);
    if (el('statTotalReste')) el('statTotalReste').textContent = formatMoney(totalReste);
    if (el('statTauxRecouvrement')) el('statTauxRecouvrement').textContent = taux + '%';
}

function applySort() {
    filteredFrais.sort(function (a, b) {
        var va = a[currentSortCol] || '';
        var vb = b[currentSortCol] || '';
        if (typeof va === 'number' && typeof vb === 'number') {
            return currentSortDir === 'ASC' ? va - vb : vb - va;
        }
        var sa = String(va).toLowerCase(), sb = String(vb).toLowerCase();
        return currentSortDir === 'ASC' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
}

function sortBy(column) {
    currentSortDir = (currentSortCol === column && currentSortDir === 'ASC') ? 'DESC' : 'ASC';
    currentSortCol = column;
    applySort();
    renderTable();
}

// ════════════════════════════════════════════════════════════════════════════
// RENDU DU TABLEAU PAIEMENTS
// ════════════════════════════════════════════════════════════════════════════

function renderTable() {
    var tbody = document.getElementById('fraisTableBody');
    if (!tbody) return;

    if (!filteredFrais.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:50px;">'
            + '<i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>'
            + 'Aucune donnée trouvée</td></tr>';
        updateCounter();
        createPaginationControls(0);
        return;
    }

    var totalPages = Math.ceil(filteredFrais.length / rowsPerPage);
    var start = (currentPage - 1) * rowsPerPage;
    var pageData = filteredFrais.slice(start, start + rowsPerPage);

    tbody.innerHTML = '';
    pageData.forEach(function (f) {
        var prog = f.PROGRESSION || 0;
        var pw = Math.min(100, prog);
        var row = tbody.insertRow();
        row.innerHTML =
            '<td><span style="background:#f1f3f5;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">'
            + escapeHtml(f.MATRICULE || '-') + '</span></td>'
            + '<td><strong>' + escapeHtml(f.NOM || '-') + '</strong></td>'
            + '<td><span style="background:#fff;color:#007bff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;">'
            + '<i class="fas fa-folder"></i> ' + escapeHtml(f.CLASSE_NOM || '-') + '</span></td>'
            + '<td class="text-right"><strong>' + formatMoney(f.TOTAL) + '</strong></td>'
            + '<td class="text-right" style="color:#28a745">' + formatMoney(f.PAYE) + '</td>'
            + '<td class="text-right" style="color:#dc3545">' + formatMoney(f.RESTE) + '</td>'
            + '<td class="text-center"><div style="display:flex;align-items:center;gap:8px;">'
            + '<div style="flex:1;background:#e9ecef;border-radius:10px;overflow:hidden;">'
            + '<div style="width:' + pw + '%;background:' + (prog >= 100 ? '#28a745' : '#007bff') + ';height:6px;"></div></div>'
            + '<span style="font-size:12px;min-width:40px;">' + prog.toFixed(0) + '%</span></div></td>'
            + '<td>' + getStatusBadge(f.STATUT || 'Non payé') + '</td>'
            + '<td class="text-center">'
            + '<button type="button" class="btn btn-sm btn-success" onclick="openPaymentModalForStudent(\''
            + escapeHtml(f.MATRICULE) + '\',\'' + escapeHtml(f.NOM) + '\')" title="Enregistrer paiement" style="margin:0 2px;">'
            + '<i class="fas fa-money-bill-wave"></i></button>'
            + '<button type="button" class="btn btn-sm btn-info" onclick="viewPaymentHistory(\''
            + escapeHtml(f.MATRICULE) + '\',\'' + escapeHtml(f.NOM) + '\')" title="Historique" style="margin:0 2px;">'
            + '<i class="fas fa-history"></i></button>'
            + '<button type="button" class="btn btn-sm btn-secondary" onclick="printStudentReceipt(\''
            + escapeHtml(f.MATRICULE) + '\',\'' + escapeHtml(f.NOM) + '\',\'' + escapeHtml(f.CLASSE_NOM) + '\','
            + (f.TOTAL || 0) + ',' + (f.PAYE || 0) + ',' + (f.RESTE || 0) + ',\'' + escapeHtml(f.STATUT) + '\')"'
            + ' title="Imprimer reçu" style="margin:0 2px;">'
            + '<i class="fas fa-print"></i></button>'
            + '</td>';
    });

    updateCounter();
    createPaginationControls(totalPages);
}