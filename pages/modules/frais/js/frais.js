'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS FRAIS
// ─────────────────────────────────────────────────────────────────────────────
var API_FRAIS = {
    getFrais: 'handlers/GetFrais.ashx',
    getEleves: '../eleves/handlers/GetEleve.ashx',
    getClasses: '../../parametres/classes/handlers/GetClasse.ashx',
    ajouterPaiement: 'handlers/AjouterPaiementFrais.ashx',
    getPaiements: 'handlers/GetPaiementsFrais.ashx'
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var fraisData = [];
var filteredFrais = [];
var elevesList = [];
var classesList = [];
var currentPage = 1;
var rowsPerPage = 10;
var currentSortCol = 'NOM';
var currentSortDir = 'ASC';

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 Ar';
    return new Intl.NumberFormat('fr-MG').format(amount) + ' Ar';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        var date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('fr-FR');
        }
    } catch(e) {}
    return dateStr;
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
// MODALES - CORRIGÉES
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', id);
    }
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closePaymentModal() {
    closeModal('paymentModal');
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
async function loadFrais() {
    console.log('[Frais] Chargement des données...');
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

        if (fraisResult.success) {
            fraisData = fraisResult.data || [];
            console.log('[Frais] Données chargées:', fraisData.length);
        } else {
            console.error('Erreur frais:', fraisResult.message);
            fraisData = [];
        }

        if (elevesResult.success) {
            elevesList = elevesResult.Eleves || [];
            populateStudentSelect();
        }

        if (classesResult.success) {
            classesList = classesResult.Classes || classesResult.niveaux || [];
            populateClassFilter();
        }

        filteredFrais = [...fraisData];
        applySort();
        updateStats();
        renderTable();

    } catch (err) {
        console.error('loadFrais:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Impossible de charger les données des frais.', 'error');
        }
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PEUPLER LES SELECTS
// ─────────────────────────────────────────────────────────────────────────────
function populateStudentSelect() {
    var sel = document.getElementById('paymentStudent');
    if (!sel) {
        console.warn('paymentStudent select not found');
        return;
    }
    
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

function populateClassFilter() {
    var sel = document.getElementById('fraisFilterClasse');
    if (!sel) {
        console.warn('fraisFilterClasse select not found');
        return;
    }
    
    sel.innerHTML = '<option value="">Toutes les classes</option>';
    for (var i = 0; i < classesList.length; i++) {
        var opt = document.createElement('option');
        opt.value = classesList[i].ID || classesList[i].NOM;
        opt.textContent = classesList[i].NOM;
        sel.appendChild(opt);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────
function updateStats() {
    var totalFrais = 0, totalPaye = 0, totalReste = 0;
    
    for (var i = 0; i < fraisData.length; i++) {
        totalFrais += parseFloat(fraisData[i].TOTAL || 0);
        totalPaye += parseFloat(fraisData[i].PAYE || 0);
        totalReste += parseFloat(fraisData[i].RESTE || 0);
    }
    
    var tauxRecouvrement = totalFrais > 0 ? (totalPaye / totalFrais * 100).toFixed(1) : 0;
    
    var elTotal = document.getElementById('statTotalFrais');
    var elPaye = document.getElementById('statTotalPaye');
    var elReste = document.getElementById('statTotalReste');
    var elTaux = document.getElementById('statTauxRecouvrement');
    
    if (elTotal) elTotal.textContent = formatMoney(totalFrais);
    if (elPaye) elPaye.textContent = formatMoney(totalPaye);
    if (elReste) elReste.textContent = formatMoney(totalReste);
    if (elTaux) elTaux.textContent = tauxRecouvrement + '%';
}

// ─────────────────────────────────────────────────────────────────────────────
// TRI
// ─────────────────────────────────────────────────────────────────────────────
function applySort() {
    filteredFrais.sort(function(a, b) {
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
// FILTRES
// ─────────────────────────────────────────────────────────────────────────────
function filterFraisTable() {
    var searchTerm = document.getElementById('fraisSearch')?.value.toLowerCase().trim() || '';
    var statusFilter = document.getElementById('fraisFilterStatut')?.value || '';
    var classFilter = document.getElementById('fraisFilterClasse')?.value || '';
    
    filteredFrais = fraisData.filter(function(item) {
        var matchSearch = !searchTerm || 
            (item.NOM || '').toLowerCase().includes(searchTerm) ||
            (item.MATRICULE || '').toLowerCase().includes(searchTerm);
        
        var matchStatus = !statusFilter || (item.STATUT || '') === statusFilter;
        
        var matchClass = !classFilter || 
            String(item.CLASSE_NOM || '').toLowerCase() === String(classFilter).toLowerCase() ||
            String(item.CLASSE_ID || '') === String(classFilter);
        
        return matchSearch && matchStatus && matchClass;
    });
    
    applySort();
    currentPage = 1;
    renderTable();
}

function resetFilters() {
    var search = document.getElementById('fraisSearch');
    var status = document.getElementById('fraisFilterStatut');
    var classe = document.getElementById('fraisFilterClasse');
    
    if (search) search.value = '';
    if (status) status.value = '';
    if (classe) classe.value = '';
    
    filteredFrais = [...fraisData];
    applySort();
    currentPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────
function renderTable() {
    var tbody = document.getElementById('fraisTableBody');
    if (!tbody) {
        console.warn('fraisTableBody not found');
        return;
    }
    
    if (!filteredFrais || filteredFrais.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:50px;">' +
            '<i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>' +
            'Aucune donnée de frais trouvée</td></tr>';
        updatePaginationInfo();
        return;
    }
    
    var start = (currentPage - 1) * rowsPerPage;
    var pageData = filteredFrais.slice(start, start + rowsPerPage);
    
    tbody.innerHTML = '';
    for (var i = 0; i < pageData.length; i++) {
        var f = pageData[i];
        var row = tbody.insertRow();
        
        var progression = f.PROGRESSION || 0;
        var progressWidth = Math.min(100, progression);
        var statusText = f.STATUT || 'Non payé';
        
        row.innerHTML = `
            <td class="text-center">${getAnneeBadge(f.ANNEE_TEXTE)}</td>
            <td class="text-center">${getMatriculeBadge(f.MATRICULE)}</td>
            <td class="text-center">${getNomBadge(f.NOM)}</td>
            <td class="text-center">${getClasseBadge(f.CLASSE_NOM || '-')}</td>
            <td class="text-center"><strong>${formatMoney(f.TOTAL)}</strong></td>
            <td class="text-center" style="color:#28a745">${formatMoney(f.PAYE)}</td>
            <td class="text-center" style="color:#dc3545">${formatMoney(f.RESTE)}</td>
            <td class="text-center">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;background:#e9ecef;border-radius:10px;overflow:hidden;">
                        <div style="width:${progressWidth}%;background:${progression >= 100 ? '#28a745' : '#007bff'};height:6px;"></div>
                    </div>
                    <span style="font-size:12px;min-width:40px;">${progression.toFixed(0)}%</span>
                </div>
            </td>
            <td class="text-center">${getStatusBadge(statusText)}</td>
            <td class="text-center">${formatDate(f.DERNIER_PAIEMENT)}</td>
            <td class="text-center">
                <div style="display:flex;gap:4px;justify-content:center;">
                    <button class="btn btn-sm btn-success" onclick="openPaymentModalForStudent('${escapeHtml(f.MATRICULE)}', '${escapeHtml(f.NOM)}')" title="Enregistrer paiement">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewPaymentHistory('${escapeHtml(f.MATRICULE)}')" title="Historique">
                        <i class="fas fa-history"></i>
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

function getAnneeBadge(anneeId) {
    // Si vous avez l'année texte, utilisez-la directement
    if (!anneeId) return '<span style="background:#f1f3f5;color:#212529;padding:3px 10px;border-radius:6px;font-size:12px;">-</span>';
    
    // Sinon, si c'est un ID, vous pouvez le formater
    return '<span style="background:#f1f3f5;color:#212529;padding:3px 10px;border-radius:6px;font-size:12px;">' + escapeHtml(anneeId) + '</span>';
}

function getStatusBadge(status) {
    var bg = '#6c757d';
    var icon = 'fa-question';
    
    if (status === 'Terminé') {
        bg = '#28a745';
        icon = 'fa-check-circle';
    } else if (status === 'En cours') {
        bg = '#ffc107';
        icon = 'fa-clock';
    } else if (status === 'Non payé') {
        bg = '#dc3545';
        icon = 'fa-times-circle';
    }
    
    return '<span style="background:' + bg + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">' +
        '<i class="fas ' + icon + '" style="margin-right:4px;"></i>' + escapeHtml(status) + '</span>';
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
function updatePaginationInfo() {
    var total = filteredFrais.length;
    var start = (currentPage - 1) * rowsPerPage + 1;
    var end = Math.min(currentPage * rowsPerPage, total);
    var infoSpan = document.getElementById('fraisPaginationInfo');
    
    if (infoSpan) {
        if (total === 0) {
            infoSpan.textContent = 'Aucun enregistrement';
        } else {
            infoSpan.textContent = `Affichage de ${start} à ${end} sur ${total} enregistrement(s)`;
        }
    }
    
    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    var totalPages = Math.ceil(total / rowsPerPage);
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function createPaginationControls() {
    var totalPages = Math.ceil(filteredFrais.length / rowsPerPage);
    var oldContainer = document.getElementById('frais-pagination-container');
    if (oldContainer) oldContainer.remove();
    
    if (totalPages <= 1) return;
    
    var container = document.createElement('div');
    container.id = 'frais-pagination-container';
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

function previousFraisPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextFraisPage() {
    var totalPages = Math.ceil(filteredFrais.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function openAddPaymentModal() {
    var sel = document.getElementById('paymentStudent');
    if (sel) sel.value = '';
    
    var amountInput = document.getElementById('paymentAmount');
    var dateInput = document.getElementById('paymentDate');
    var methodSelect = document.getElementById('paymentMethod');
    var refInput = document.getElementById('paymentRef');
    var commentInput = document.getElementById('paymentComment');
    
    if (amountInput) amountInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (methodSelect) methodSelect.value = 'Espèces';
    if (refInput) refInput.value = '';
    if (commentInput) commentInput.value = '';
    
    var infoDiv = document.getElementById('paymentInfo');
    if (infoDiv) infoDiv.style.display = 'none';
    
    openModal('paymentModal');
}

function openPaymentModalForStudent(matricule, nom) {
    var sel = document.getElementById('paymentStudent');
    if (sel) {
        sel.value = matricule;
        updatePaymentInfo();
    }
    
    var amountInput = document.getElementById('paymentAmount');
    var dateInput = document.getElementById('paymentDate');
    var methodSelect = document.getElementById('paymentMethod');
    var refInput = document.getElementById('paymentRef');
    var commentInput = document.getElementById('paymentComment');
    
    if (amountInput) amountInput.value = '';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (methodSelect) methodSelect.value = 'Espèces';
    if (refInput) refInput.value = '';
    if (commentInput) commentInput.value = '';
    
    openModal('paymentModal');
}

async function updatePaymentInfo() {
    var sel = document.getElementById('paymentStudent');
    if (!sel || !sel.value) {
        var infoDiv = document.getElementById('paymentInfo');
        if (infoDiv) infoDiv.style.display = 'none';
        return;
    }
    
    var matricule = sel.value;
    var fraisItem = fraisData.find(function(f) { return f.MATRICULE === matricule; });
    
    var totalSpan = document.getElementById('infoTotal');
    var payeSpan = document.getElementById('infoPaye');
    var resteSpan = document.getElementById('infoReste');
    
    if (fraisItem) {
        if (totalSpan) totalSpan.textContent = formatMoney(fraisItem.TOTAL);
        if (payeSpan) payeSpan.textContent = formatMoney(fraisItem.PAYE);
        if (resteSpan) resteSpan.textContent = formatMoney(fraisItem.RESTE);
    } else {
        if (totalSpan) totalSpan.textContent = formatMoney(0);
        if (payeSpan) payeSpan.textContent = formatMoney(0);
        if (resteSpan) resteSpan.textContent = formatMoney(0);
    }
    
    var infoDiv = document.getElementById('paymentInfo');
    if (infoDiv) infoDiv.style.display = 'block';
}

async function savePayment() {
    var matricule = document.getElementById('paymentStudent')?.value;
    var montant = parseFloat(document.getElementById('paymentAmount')?.value);
    var date = document.getElementById('paymentDate')?.value;
    var mode = document.getElementById('paymentMethod')?.value;
    var reference = document.getElementById('paymentRef')?.value;
    var commentaire = document.getElementById('paymentComment')?.value;
    
    if (!matricule) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Veuillez sélectionner un élève.', 'warning');
        }
        return;
    }
    
    if (!montant || montant <= 0) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'Le montant doit être supérieur à 0.', 'warning');
        }
        return;
    }
    
    if (!date) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'La date est obligatoire.', 'warning');
        }
        return;
    }
    
    showSpinner();
    
    try {
        var res = await fetch(API_FRAIS.ajouterPaiement, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matricule: matricule,
                montant: montant,
                datePaiement: date,
                modePaiement: mode,
                reference: reference,
                commentaire: commentaire
            })
        });
        
        var result = await res.json();
        
        if (result.success) {
            closePaymentModal();
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 1500, showConfirmButton: false });
            }
            setTimeout(function() {
                loadFrais();
            }, 1500);
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Erreur', result.message || 'Erreur lors de l\'enregistrement.', 'error');
            }
        }
    } catch (err) {
        console.error('savePayment:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur réseau', err.message, 'error');
        }
    } finally {
        hideSpinner();
    }
}

function viewPaymentHistory(matricule) {
    if (typeof Swal !== 'undefined') {
        Swal.fire('Info', 'Fonctionnalité à venir: Historique des paiements', 'info');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ET IMPRESSION
// ─────────────────────────────────────────────────────────────────────────────
function exportFraisToExcel() {
    if (typeof XLSX === 'undefined') {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Erreur', 'La bibliothèque Excel n\'est pas chargée.', 'error');
        }
        return;
    }
    
    if (!filteredFrais.length) {
        if (typeof Swal !== 'undefined') {
            Swal.fire('Info', 'Aucune donnée à exporter', 'info');
        }
        return;
    }
    
    var data = [['Matricule', 'Nom', 'Classe', 'Total (Ar)', 'Payé (Ar)', 'Reste (Ar)', 'Statut', 'Dernier paiement']];
    
    for (var i = 0; i < filteredFrais.length; i++) {
        var f = filteredFrais[i];
        data.push([
            f.MATRICULE || '',
            f.NOM || '',
            f.CLASSE_NOM || '',
            f.TOTAL || 0,
            f.PAYE || 0,
            f.RESTE || 0,
            f.STATUT || 'Non payé',
            formatDate(f.DERNIER_PAIEMENT)
        ]);
    }
    
    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Frais_Scolaires');
    XLSX.writeFile(wb, 'Frais_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}

function printFraisReport() {
    var printWindow = window.open('', '_blank');
    var html = '<html><head><title>Rapport Frais Scolaires</title>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    html += 'table { width: 100%; border-collapse: collapse; }';
    html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
    html += 'th { background-color: #f2f2f2; }';
    html += '.header { text-align: center; margin-bottom: 20px; }';
    html += '</style></head><body>';
    html += '<div class="header"><h2>Rapport des Frais Scolaires</h2>';
    html += '<p>Date: ' + new Date().toLocaleDateString('fr-FR') + '</p></div>';
    html += '<table><thead><tr>';
    html += '<th>Matricule</th><th>Nom</th><th>Classe</th><th>Total (Ar)</th><th>Payé (Ar)</th><th>Reste (Ar)</th><th>Statut</th>';
    html += '</tr></thead><tbody>';
    
    for (var i = 0; i < filteredFrais.length; i++) {
        var f = filteredFrais[i];
        html += '<tr>';
        html += '<td>' + escapeHtml(f.MATRICULE || '') + '</td>';
        html += '<td>' + escapeHtml(f.NOM || '') + '</td>';
        html += '<td>' + escapeHtml(f.CLASSE_NOM || '') + '</td>';
        html += '<td>' + (f.TOTAL || 0) + '</td>';
        html += '<td>' + (f.PAYE || 0) + '</td>';
        html += '<td>' + (f.RESTE || 0) + '</td>';
        html += '<td>' + (f.STATUT || 'Non payé') + '</td>';
        html += '</tr>';
    }
    
    html += '</tbody></table></body></html>';
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    console.log('[Frais] Initialisation...');
    
    // Vérifier que les éléments existent avant d'initialiser
    var modal = document.getElementById('paymentModal');
    if (!modal) {
        console.warn('[Frais] paymentModal not found in DOM');
    }
    
    loadFrais();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal('paymentModal');
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────
window.openAddPaymentModal = openAddPaymentModal;
window.openPaymentModalForStudent = openPaymentModalForStudent;
window.exportFraisToExcel = exportFraisToExcel;
window.printFraisReport = printFraisReport;
window.previousFraisPage = previousFraisPage;
window.nextFraisPage = nextFraisPage;
window.filterFraisTable = filterFraisTable;
window.savePayment = savePayment;
window.closePaymentModal = closePaymentModal;
window.updatePaymentInfo = updatePaymentInfo;
window.viewPaymentHistory = viewPaymentHistory;
window.sortBy = sortBy;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}