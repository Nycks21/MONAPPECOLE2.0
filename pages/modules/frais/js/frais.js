﻿﻿'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS FRAIS
// ─────────────────────────────────────────────────────────────────────────────
var API_FRAIS = {
    getFrais: 'handlers/GetFrais.ashx',
    getEleves: '../eleves/handlers/GetEleve.ashx',
    getClasses: '../../parametres/classes/handlers/GetClasse.ashx',
    ajouterPaiement: 'handlers/AjouterPaiementFrais.ashx',
    getHistorique: 'handlers/GetHistoriquePaiements.ashx',
    modifierHistorique: 'handlers/ModifierHistoriquePaiement.ashx',
    supprimerHistorique: 'handlers/SupprimerHistoriquePaiement.ashx'
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

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
        var date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        }
    } catch(e) {}
    return dateStr;
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

function getModePaiementBadge(mode) {
    var colors = {
        'Especes': '#28a745',
        'Cheque': '#17a2b8',
        'Virement': '#007bff',
        'MobileMoney': '#ffc107'
    };
    var color = colors[mode] || '#6c757d';
    return '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">' + escapeHtml(mode) + '</span>';
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
        attachPaginationButtons();

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
    if (!sel) return;
    
    sel.innerHTML = '<option value="">-- Sélectionner un élève --</option>';
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
    if (!sel) return;
    
    sel.innerHTML = '<option value="">Toutes les classes</option>';
    for (var i = 0; i < classesList.length; i++) {
        var opt = document.createElement('option');
        opt.value = classesList[i].NOM;
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
            (item.CLASSE_NOM || '').toLowerCase() === classFilter.toLowerCase();
        
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
    if (!tbody) return;
    
    if (!filteredFrais || filteredFrais.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:50px;"><i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>Aucune donnée de frais trouvée</td></tr>';
        updatePaginationInfo();
        return;
    }
    
    var start = (currentPage - 1) * rowsPerPage;
    var pageData = filteredFrais.slice(start, start + rowsPerPage);
    
    tbody.innerHTML = '';
    for (var i = 0; i < pageData.length; i++) {
        var f = pageData[i];
        var progression = f.PROGRESSION || 0;
        var progressWidth = Math.min(100, progression);
        
        var row = tbody.insertRow();
        row.innerHTML = `
            <td class="text-center"><span style="background:#f1f3f5;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">${escapeHtml(f.MATRICULE || '-')}</span></td>
            <td class="text-center"><strong>${escapeHtml(f.NOM || '-')}</strong></td>
            <td class="text-center"><span style="background:#fff;color:#007bff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;"><i class="fas fa-folder"></i> ${escapeHtml(f.CLASSE_NOM || '-')}</span></td>
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
            <td class="text-center">${getStatusBadge(f.STATUT || 'Non payé')}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-success" onclick="openPaymentModalForStudent('${escapeHtml(f.MATRICULE)}', '${escapeHtml(f.NOM)}')" title="Enregistrer paiement" style="margin:0 2px;">
                    <i class="fas fa-money-bill-wave"></i>
                </button>
                <button type="button" class="btn btn-sm btn-info" onclick="viewPaymentHistory('${escapeHtml(f.MATRICULE)}', '${escapeHtml(f.NOM)}')" title="Historique" style="margin:0 2px;">
                    <i class="fas fa-history"></i>
                </button>
            </td>
        `;
    }
    
    updatePaginationInfo();
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
    
    return '<span style="background:' + bg + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;"><i class="fas ' + icon + '"></i> ' + escapeHtml(status) + '</span>';
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

function attachPaginationButtons() {
    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.onclick = function() { if (currentPage > 1) { currentPage--; renderTable(); } };
    }
    if (nextBtn) {
        nextBtn.onclick = function() { 
            var totalPages = Math.ceil(filteredFrais.length / rowsPerPage);
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        };
    }
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
    if (methodSelect) methodSelect.value = 'Especes';
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
    if (methodSelect) methodSelect.value = 'Especes';
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
        Swal.fire('Erreur', 'Veuillez sélectionner un élève.', 'warning');
        return;
    }
    
    if (!montant || montant <= 0) {
        Swal.fire('Erreur', 'Le montant doit être supérieur à 0.', 'warning');
        return;
    }
    
    if (!date) {
        Swal.fire('Erreur', 'La date est obligatoire.', 'warning');
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
            Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 1500, showConfirmButton: false });
            setTimeout(function() { loadFrais(); }, 1500);
        } else {
            Swal.fire('Erreur', result.message || 'Erreur lors de l\'enregistrement.', 'error');
        }
    } catch (err) {
        console.error('savePayment:', err);
        Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIQUE DES PAIEMENTS AVEC ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
async function viewPaymentHistory(matricule, nom) {
    showSpinner();
    try {
        var res = await fetch(API_FRAIS.getHistorique + '?matricule=' + encodeURIComponent(matricule));
        var result = await res.json();
        
        if (result.success && result.data && result.data.length > 0) {
            var history = result.data;
            var totalPaiements = 0;
            
            for (var i = 0; i < history.length; i++) {
                totalPaiements += history[i].MONTANT;
            }
            
            var historyHtml = `
                <div style="max-height: 500px; overflow-y: auto;">
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong>Élève:</strong> ${escapeHtml(nom)}</p>
                        <p><strong>Matricule:</strong> ${escapeHtml(matricule)}</p>
                        <p><strong>Total des paiements:</strong> ${formatMoney(totalPaiements)}</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                                <th style="padding: 10px; text-align: left;">Date</th>
                                <th style="padding: 10px; text-align: left;">Montant</th>
                                <th style="padding: 10px; text-align: left;">Mode</th>
                                <th style="padding: 10px; text-align: left;">Référence</th>
                                <th style="padding: 10px; text-align: left;">Enregistré par</th>
                                <th style="padding: 10px; text-align: left;">Commentaire</th>
                                <th style="padding: 10px; text-align: center;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            for (var i = 0; i < history.length; i++) {
                var h = history[i];
                historyHtml += `
                    <tr style="border-bottom: 1px solid #dee2e6;" id="history-row-${h.ID}">
                        <td style="padding: 8px;">${formatDateTime(h.DATE_PAIEMENT)}</td>
                        <td style="padding: 8px; color: #28a745; font-weight: bold;">${formatMoney(h.MONTANT)}</td>
                        <td style="padding: 8px;">${getModePaiementBadge(h.MODE_PAIEMENT)}</td>
                        <td style="padding: 8px;">${escapeHtml(h.REFERENCE || '-')}</td>
                        <td style="padding: 8px;">${escapeHtml(h.USERNAME || '-')}</td>
                        <td style="padding: 8px;">${escapeHtml(h.COMMENTAIRE || '-')}</td>
                        <td style="padding: 8px; text-align: center;">
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                <button type="button" class="btn-history-edit" onclick="editHistoriquePaiement('${h.ID}', '${matricule}', '${escapeHtml(nom)}', ${h.MONTANT}, '${h.DATE_PAIEMENT}', '${h.MODE_PAIEMENT}', '${escapeHtml(h.REFERENCE || '')}', '${escapeHtml(h.COMMENTAIRE || '')}')" title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="btn-history-delete" onclick="deleteHistoriquePaiement('${h.ID}', '${matricule}', ${h.MONTANT})" title="Supprimer">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="7" style="padding: 5px 8px; font-size: 11px; color: #6c757d;">
                            <i class="fas fa-info-circle"></i> 
                            Avant: ${formatMoney(h.ANCIEN_PAYE)} payé / ${formatMoney(h.ANCIEN_RESTE)} restant → 
                            Après: ${formatMoney(h.NOUVEAU_PAYE)} payé / ${formatMoney(h.NOUVEAU_RESTE)} restant
                        </td>
                    </tr>
                `;
            }
            
            historyHtml += `
                        </tbody>
                    </table>
                </div>
            `;
            
            Swal.fire({
                title: `Historique des paiements - ${escapeHtml(nom)}`,
                html: historyHtml,
                icon: 'info',
                width: '1200px',
                confirmButtonText: 'Fermer',
                confirmButtonColor: '#007bff',
                showCloseButton: true
            });
        } else {
            Swal.fire({
                title: 'Aucun historique',
                text: `Aucun paiement enregistré pour ${escapeHtml(nom)}`,
                icon: 'info',
                confirmButtonText: 'OK'
            });
        }
    } catch (err) {
        console.error('viewPaymentHistory:', err);
        Swal.fire('Erreur', 'Impossible de charger l\'historique des paiements', 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODIFIER UN PAIEMENT HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
async function editHistoriquePaiement(historyId, matricule, nom, ancienMontant, datePaiement, modePaiement, reference, commentaire) {
    var result = await Swal.fire({
        title: 'Modifier le paiement',
        html: `
            <div style="text-align: left;">
                <div class="form-group">
                    <label>Élève</label>
                    <input type="text" id="editStudentName" class="swal2-input" value="${escapeHtml(nom)}" readonly style="background:#e9ecef;">
                </div>
                <div class="form-group">
                    <label>Montant (Ar)</label>
                    <input type="number" id="editMontant" class="swal2-input" value="${ancienMontant}" step="1000" min="0">
                </div>
                <div class="form-group">
                    <label>Date du paiement</label>
                    <input type="datetime-local" id="editDatePaiement" class="swal2-input" value="${datePaiement.replace(' ', 'T').substring(0, 16)}">
                </div>
                <div class="form-group">
                    <label>Mode de paiement</label>
                    <select id="editModePaiement" class="swal2-select">
                        <option value="Especes" ${modePaiement === 'Especes' ? 'selected' : ''}>Espèces</option>
                        <option value="Cheque" ${modePaiement === 'Cheque' ? 'selected' : ''}>Chèque</option>
                        <option value="Virement" ${modePaiement === 'Virement' ? 'selected' : ''}>Virement</option>
                        <option value="MobileMoney" ${modePaiement === 'MobileMoney' ? 'selected' : ''}>Mobile Money</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Référence</label>
                    <input type="text" id="editReference" class="swal2-input" value="${escapeHtml(reference)}">
                </div>
                <div class="form-group">
                    <label>Commentaire</label>
                    <textarea id="editCommentaire" class="swal2-textarea" rows="2">${escapeHtml(commentaire)}</textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d',
        preConfirm: function() {
            var montant = parseFloat(document.getElementById('editMontant').value);
            var datePaiement = document.getElementById('editDatePaiement').value;
            var modePaiement = document.getElementById('editModePaiement').value;
            var reference = document.getElementById('editReference').value;
            var commentaire = document.getElementById('editCommentaire').value;
            
            if (!montant || montant <= 0) {
                Swal.showValidationMessage('Le montant doit être supérieur à 0');
                return false;
            }
            if (!datePaiement) {
                Swal.showValidationMessage('La date est obligatoire');
                return false;
            }
            
            return {
                montant: montant,
                datePaiement: datePaiement,
                modePaiement: modePaiement,
                reference: reference,
                commentaire: commentaire
            };
        }
    });
    
    if (result.isConfirmed) {
        showSpinner();
        try {
            var res = await fetch(API_FRAIS.modifierHistorique, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: historyId,
                    matricule: matricule,
                    montant: result.value.montant,
                    datePaiement: result.value.datePaiement,
                    modePaiement: result.value.modePaiement,
                    reference: result.value.reference,
                    commentaire: result.value.commentaire
                })
            });
            var data = await res.json();
            
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Modifié', text: 'Paiement modifié avec succès', timer: 1500, showConfirmButton: false });
                setTimeout(function() { 
                    loadFrais();
                    viewPaymentHistory(matricule, nom);
                }, 1500);
            } else {
                Swal.fire('Erreur', data.message || 'Erreur lors de la modification', 'error');
            }
        } catch (err) {
            console.error('editHistoriquePaiement:', err);
            Swal.fire('Erreur', err.message, 'error');
        } finally {
            hideSpinner();
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPRIMER UN PAIEMENT HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
async function deleteHistoriquePaiement(historyId, matricule, montant) {
    var result = await Swal.fire({
        title: 'Confirmation',
        text: `Voulez-vous vraiment supprimer ce paiement de ${formatMoney(montant)} ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d'
    });
    
    if (result.isConfirmed) {
        showSpinner();
        try {
            var res = await fetch(API_FRAIS.supprimerHistorique, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: historyId, matricule: matricule })
            });
            var data = await res.json();
            
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Paiement supprimé avec succès', timer: 1500, showConfirmButton: false });
                setTimeout(function() { 
                    loadFrais();
                }, 1500);
            } else {
                Swal.fire('Erreur', data.message || 'Erreur lors de la suppression', 'error');
            }
        } catch (err) {
            console.error('deleteHistoriquePaiement:', err);
            Swal.fire('Erreur', err.message, 'error');
        } finally {
            hideSpinner();
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ET IMPRESSION
// ─────────────────────────────────────────────────────────────────────────────
function exportFraisToExcel() {
    if (!filteredFrais.length) {
        Swal.fire('Info', 'Aucune donnée à exporter', 'info');
        return;
    }
    
    var data = [['Matricule', 'Nom', 'Classe', 'Total (Ar)', 'Payé (Ar)', 'Reste (Ar)', 'Statut']];
    
    for (var i = 0; i < filteredFrais.length; i++) {
        var f = filteredFrais[i];
        data.push([
            f.MATRICULE || '',
            f.NOM || '',
            f.CLASSE_NOM || '',
            f.TOTAL || 0,
            f.PAYE || 0,
            f.RESTE || 0,
            f.STATUT || 'Non payé'
        ]);
    }
    
    var csv = data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'Frais_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(url);
}

function printFraisReport() {
    var printWindow = window.open('', '_blank');
    var html = '<html><head><title>Rapport Frais Scolaires</title>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    html += 'table { width: 100%; border-collapse: collapse; }';
    html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
    html += 'th { background-color: #f2f2f2; }';
    html += '</style></head><body>';
    html += '<h2>Rapport des Frais Scolaires</h2>';
    html += '<p>Date: ' + new Date().toLocaleDateString('fr-FR') + '</p>';
    html += '<table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th><th>Total (Ar)</th><th>Payé (Ar)</th><th>Reste (Ar)</th><th>Statut</th></tr></thead><tbody>';
    
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
    loadFrais();
    
    var searchInput = document.getElementById('fraisSearch');
    var statusFilter = document.getElementById('fraisFilterStatut');
    var classFilter = document.getElementById('fraisFilterClasse');
    
    if (searchInput) searchInput.addEventListener('input', filterFraisTable);
    if (statusFilter) statusFilter.addEventListener('change', filterFraisTable);
    if (classFilter) classFilter.addEventListener('change', filterFraisTable);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal('paymentModal');
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
window.resetFilters = resetFilters;
window.savePayment = savePayment;
window.closePaymentModal = closePaymentModal;
window.updatePaymentInfo = updatePaymentInfo;
window.sortBy = sortBy;
window.viewPaymentHistory = viewPaymentHistory;
window.editHistoriquePaiement = editHistoriquePaiement;
window.deleteHistoriquePaiement = deleteHistoriquePaiement;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}