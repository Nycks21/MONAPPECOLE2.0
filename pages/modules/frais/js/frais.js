'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// URLS DES HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
var API_FRAIS = {
    getFrais:            'handlers/GetFrais.ashx',
    getEleves:           '../eleves/handlers/GetEleve.ashx',
    getClasses:          '../../parametres/classes/handlers/GetClasse.ashx',
    getAnnees:           'handlers/GetAnnees.ashx',
    ajouterPaiement:     'handlers/AjouterPaiementFrais.ashx',
    getHistorique:       'handlers/GetHistoriquePaiements.ashx',
    modifierHistorique:  'handlers/ModifierHistoriquePaiement.ashx',
    supprimerHistorique: 'handlers/SupprimerHistoriquePaiement.ashx',
    getTarifs:           'handlers/GetTarifsEcolage.ashx',
    ajouterTarif:        'handlers/AjouterTarifEcolage.ashx',
    modifierTarif:       'handlers/ModifierTarifEcolage.ashx',
    supprimerTarif:      'handlers/SupprimerTarifEcolage.ashx',
    getTarifByClasse:    'handlers/GetTarifByClasse.ashx',
    updateAll:           'handlers/UpdateAllFrais.ashx',
    recalculer:          'handlers/RecalculerFrais.ashx'
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
var fraisData       = [];
var filteredFrais   = [];
var elevesList      = [];
var classesList     = [];
var anneesList      = [];
var tarifsData      = [];
var filteredTarifs  = [];
var currentPage     = 1;
var rowsPerPage     = 10;
var currentSortCol  = 'NOM';
var currentSortDir  = 'ASC';
var currentTarifPage = 1;
var tarifsPerPage    = 10;
var currentTarifId   = null;

// Variables pour l'édition de l'historique — conservées jusqu'à la fin du workflow
var _editHistoryId   = null;
var _editMatricule   = null;
var _editNom         = null;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 Ar';
    return new Intl.NumberFormat('fr-MG').format(amount) + ' Ar';
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime()))
            return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {}
    return dateStr;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('fr-FR');
    } catch(e) {}
    return dateStr;
}

function getModePaiementBadge(mode) {
    var colors = { Especes: '#28a745', Cheque: '#17a2b8', Virement: '#007bff', MobileMoney: '#ffc107' };
    var color = colors[mode] || '#6c757d';
    return '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">' + escapeHtml(mode) + '</span>';
}

function getStatusBadge(status) {
    var cfg = {
        'Terminé':  { bg: '#28a745', icon: 'fa-check-circle' },
        'En cours': { bg: '#ffc107', icon: 'fa-clock' },
        'Non payé': { bg: '#dc3545', icon: 'fa-times-circle' }
    };
    var c = cfg[status] || { bg: '#6c757d', icon: 'fa-question' };
    return '<span style="background:' + c.bg + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">'
         + '<i class="fas ' + c.icon + '"></i> ' + escapeHtml(status) + '</span>';
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
    if (!modal) return;
    modal.style.display = 'flex';
    modal.style.zIndex  = (id === 'editHistoriqueModal') ? '999999' : '9999';
    document.body.style.overflow = 'hidden';
    var mc = modal.querySelector('.modal-content');
    if (mc) mc.style.zIndex = modal.style.zIndex;
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) { modal.style.display = 'none'; }
    // Libérer le scroll uniquement si aucune autre modal n'est ouverte
    var anyOpen = ['paymentModal', 'editHistoriqueModal', 'tarifModal'].some(function(mid) {
        var m = document.getElementById(mid);
        return m && m.style.display === 'flex';
    });
    if (!anyOpen) document.body.style.overflow = '';
}

function closePaymentModal()        { closeModal('paymentModal'); }
function closeTarifModal()          { closeModal('tarifModal'); currentTarifId = null; }

function closeEditHistoriqueModal() {
    closeModal('editHistoriqueModal');
    // Ne pas effacer les variables ici — elles sont effacées après utilisation dans confirmEditHistorique
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGEMENT DES DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
async function loadFrais() {
    showSpinner();
    try {
        var [fraisRes, elevesRes, classesRes] = await Promise.all([
            fetch(API_FRAIS.getFrais),
            fetch(API_FRAIS.getEleves),
            fetch(API_FRAIS.getClasses)
        ]);

        var fraisResult   = await fraisRes.json();
        var elevesResult  = await elevesRes.json();
        var classesResult = await classesRes.json();

        if (fraisResult.success)  fraisData  = fraisResult.data  || [];
        if (elevesResult.success) elevesList = elevesResult.Eleves || [];

        if (classesResult.success) {
            classesList = classesResult.Classes  || classesResult.niveaux
                       || classesResult.data     || (Array.isArray(classesResult) ? classesResult : []);
        }

        populateStudentSelect();
        populateClassFilter();
        populateTarifClasseSelects();

        filteredFrais = fraisData.slice();
        applySort();
        updateStats();
        renderTable();
        attachPaginationButtons();

    } catch (err) {
        console.error('loadFrais:', err);
        Swal.fire('Erreur', 'Impossible de charger les données des frais.', 'error');
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
    elevesList.forEach(function(e) {
        var opt = document.createElement('option');
        opt.value = e.MATRICULE;
        opt.textContent = e.MATRICULE + ' — ' + (e.NOM || '');
        opt.dataset.nom    = e.NOM    || '';
        opt.dataset.classe = e.CLASSE_NOM || '';
        sel.appendChild(opt);
    });
}

function populateClassFilter() {
    var sel = document.getElementById('fraisFilterClasse');
    if (!sel) return;
    sel.innerHTML = '<option value="">Toutes les classes</option>';
    classesList.forEach(function(c) {
        var opt = document.createElement('option');
        opt.value = c.NOM;
        opt.textContent = c.NOM;
        sel.appendChild(opt);
    });
}

function populateTarifClasseSelects() {
    ['tarifClasse', 'tarifClasseFilter'].forEach(function(selId) {
        var sel = document.getElementById(selId);
        if (!sel) return;
        var isFilter = selId === 'tarifClasseFilter';
        sel.innerHTML = isFilter
            ? '<option value="">Toutes les classes</option>'
            : '<option value="">-- Sélectionner une classe --</option>';
        classesList.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.ID;
            opt.textContent = c.NOM;
            sel.appendChild(opt);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────
function updateStats() {
    var totalFrais = 0, totalPaye = 0, totalReste = 0;
    fraisData.forEach(function(f) {
        totalFrais += parseFloat(f.TOTAL  || 0);
        totalPaye  += parseFloat(f.PAYE   || 0);
        totalReste += parseFloat(f.RESTE  || 0);
    });
    var taux = totalFrais > 0 ? (totalPaye / totalFrais * 100).toFixed(1) : 0;

    var el = function(id) { return document.getElementById(id); };
    if (el('statTotalFrais'))         el('statTotalFrais').textContent        = formatMoney(totalFrais);
    if (el('statTotalPaye'))          el('statTotalPaye').textContent         = formatMoney(totalPaye);
    if (el('statTotalReste'))         el('statTotalReste').textContent        = formatMoney(totalReste);
    if (el('statTauxRecouvrement'))   el('statTauxRecouvrement').textContent  = taux + '%';
}

// ─────────────────────────────────────────────────────────────────────────────
// TRI
// ─────────────────────────────────────────────────────────────────────────────
function applySort() {
    filteredFrais.sort(function(a, b) {
        var va = a[currentSortCol] || '';
        var vb = b[currentSortCol] || '';
        if (typeof va === 'number' && typeof vb === 'number')
            return currentSortDir === 'ASC' ? va - vb : vb - va;
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

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function filterFraisTable() {
    var search  = (document.getElementById('fraisSearch')        || {}).value || '';
    var statut  = (document.getElementById('fraisFilterStatut')  || {}).value || '';
    var classe  = (document.getElementById('fraisFilterClasse')  || {}).value || '';
    var annee   = (document.getElementById('fraisFilterAnnee')   || {}).value || '';  // NOUVEAU

    search = search.toLowerCase().trim();

    filteredFrais = fraisData.filter(function(item) {
        var matchSearch = !search ||
            (item.NOM       || '').toLowerCase().includes(search) ||
            (item.MATRICULE || '').toLowerCase().includes(search);
        var matchStatut = !statut || (item.STATUT     || '') === statut;
        var matchClasse = !classe || (item.CLASSE_NOM || '').toLowerCase() === classe.toLowerCase();
        var matchAnnee  = !annee  || (item.ANNEE_TEXTE|| '') === annee;   // NOUVEAU
        return matchSearch && matchStatut && matchClasse && matchAnnee;
    });

    applySort();
    currentPage = 1;
    renderTable();
}

function resetFilters() {
    ['fraisSearch', 'fraisFilterStatut', 'fraisFilterClasse', 'fraisFilterAnnee'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    filteredFrais = fraisData.slice();
    applySort();
    currentPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function renderTable() {
    var tbody = document.getElementById('fraisTableBody');
    if (!tbody) return;

    if (!filteredFrais.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:50px;">'
            + '<i class="fas fa-search" style="font-size:40px;color:#ccc;display:block;margin-bottom:12px;"></i>'
            + 'Aucune donnée trouvée</td></tr>';
        updatePaginationInfo();
        return;
    }

    var start    = (currentPage - 1) * rowsPerPage;
    var pageData = filteredFrais.slice(start, start + rowsPerPage);

    tbody.innerHTML = '';
    pageData.forEach(function(f) {
        var prog  = f.PROGRESSION || 0;
        var pw    = Math.min(100, prog);
        var row   = tbody.insertRow();
        row.innerHTML =
            '<td class="text-center"><span style="background:#f1f3f5;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">'
                + escapeHtml(f.MATRICULE || '-') + '</span></td>'
            + '<td class="text-center"><strong>' + escapeHtml(f.NOM || '-') + '</strong></td>'
            + '<td class="text-center"><span style="background:#fff;color:#007bff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;">'
                + '<i class="fas fa-folder"></i> ' + escapeHtml(f.CLASSE_NOM || '-') + '</span></td>'
            + '<td class="text-center"><strong>' + formatMoney(f.TOTAL)  + '</strong></td>'
            + '<td class="text-center" style="color:#28a745">'  + formatMoney(f.PAYE)  + '</td>'
            + '<td class="text-center" style="color:#dc3545">'  + formatMoney(f.RESTE) + '</td>'
            + '<td class="text-center"><div style="display:flex;align-items:center;gap:8px;">'
                + '<div style="flex:1;background:#e9ecef;border-radius:10px;overflow:hidden;">'
                + '<div style="width:' + pw + '%;background:' + (prog >= 100 ? '#28a745' : '#007bff') + ';height:6px;"></div></div>'
                + '<span style="font-size:12px;min-width:40px;">' + prog.toFixed(0) + '%</span></div></td>'
            + '<td class="text-center">' + getStatusBadge(f.STATUT || 'Non payé') + '</td>'
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

    updatePaginationInfo();
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function updatePaginationInfo() {
    var total     = filteredFrais.length;
    var totalPages= Math.ceil(total / rowsPerPage);
    var start     = total ? (currentPage - 1) * rowsPerPage + 1 : 0;
    var end       = Math.min(currentPage * rowsPerPage, total);
    var infoSpan  = document.getElementById('fraisPaginationInfo');
    if (infoSpan)
        infoSpan.textContent = total === 0
            ? 'Aucun enregistrement'
            : 'Affichage de ' + start + ' à ' + end + ' sur ' + total + ' enregistrement(s)';

    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

function attachPaginationButtons() {
    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.onclick = function() { if (currentPage > 1) { currentPage--; renderTable(); } };
    if (nextBtn) nextBtn.onclick = function() {
        if (currentPage < Math.ceil(filteredFrais.length / rowsPerPage)) { currentPage++; renderTable(); }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAIEMENTS — MODALES
// ─────────────────────────────────────────────────────────────────────────────
function _resetPaymentForm() {
    ['paymentAmount', 'paymentRef', 'paymentComment'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    var dateEl = document.getElementById('paymentDate');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    var methodEl = document.getElementById('paymentMethod');
    if (methodEl) methodEl.value = 'Especes';
    var infoDiv = document.getElementById('paymentInfo');
    if (infoDiv) infoDiv.style.display = 'none';
}

function openAddPaymentModal() {
    var sel = document.getElementById('paymentStudent');
    if (sel) sel.value = '';
    _resetPaymentForm();
    openModal('paymentModal');
}

function openPaymentModalForStudent(matricule, nom) {
    _resetPaymentForm();
    var sel = document.getElementById('paymentStudent');
    if (sel) { sel.value = matricule; updatePaymentInfo(); }
    openModal('paymentModal');
}

async function updatePaymentInfo() {
    var sel = document.getElementById('paymentStudent');
    var infoDiv = document.getElementById('paymentInfo');
    if (!sel || !sel.value) { if (infoDiv) infoDiv.style.display = 'none'; return; }

    var matricule = sel.value;
    var fraisItem = fraisData.find(function(f) { return f.MATRICULE === matricule; });

    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };

    if (fraisItem) {
        set('infoTotal', formatMoney(fraisItem.TOTAL));
        set('infoPaye',  formatMoney(fraisItem.PAYE));
        set('infoReste', formatMoney(fraisItem.RESTE));
    } else {
        var classe = (sel.options[sel.selectedIndex] || {}).dataset && sel.options[sel.selectedIndex].dataset.classe;
        var tarif  = classe ? await _getTarifForClasse(classe) : 0;
        set('infoTotal', formatMoney(tarif));
        set('infoPaye',  formatMoney(0));
        set('infoReste', formatMoney(tarif));
    }
    if (infoDiv) infoDiv.style.display = 'block';
}

async function _getTarifForClasse(className) {
    try {
        var anneeId = await _getCurrentAnneeId();
        var res = await fetch(API_FRAIS.getTarifByClasse + '?classeNom=' + encodeURIComponent(className) + '&anneeId=' + anneeId);
        var result = await res.json();
        return (result.success && result.montant) ? result.montant : 0;
    } catch (e) { return 0; }
}

async function _getCurrentAnneeId() {
    try {
        var res = await fetch(API_FRAIS.getAnnees);
        var r = await res.json();
        return (r.success && r.data && r.data.length) ? r.data[0].ID : 1;
    } catch(e) { return 1; }
}

async function savePayment() {
    var matricule   = (document.getElementById('paymentStudent')  || {}).value;
    var montant     = parseFloat((document.getElementById('paymentAmount') || {}).value);
    var mois        = (document.getElementById('paymentMonth')     || {}).value;
    var annee       = (document.getElementById('paymentYear')      || {}).value;
    var date        = (document.getElementById('paymentDate')      || {}).value;
    var mode        = (document.getElementById('paymentMethod')    || {}).value;
    var reference   = (document.getElementById('paymentRef')       || {}).value;
    var commentaire = (document.getElementById('paymentComment')   || {}).value;

    if (!matricule)          { Swal.fire('Erreur', 'Veuillez sélectionner un élève.', 'warning'); return; }
    if (!montant || montant <= 0) { Swal.fire('Erreur', 'Le montant doit être supérieur à 0.', 'warning'); return; }
    if (!mois)               { Swal.fire('Erreur', 'Veuillez sélectionner le mois.', 'warning'); return; }
    if (!annee)              { Swal.fire('Erreur', 'Veuillez saisir l\'année.', 'warning'); return; }
    if (!date)               { Swal.fire('Erreur', 'La date est obligatoire.', 'warning'); return; }

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.ajouterPaiement, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                matricule, 
                montant, 
                moisPaiement: mois,
                annee: annee,
                datePaiement: date, 
                modePaiement: mode, 
                reference, 
                commentaire 
            })
        });
        var result = await res.json();
        if (result.success) {
            closePaymentModal();
            Swal.fire({ icon: 'success', title: 'Paiement enregistré', timer: 1500, showConfirmButton: false });
            setTimeout(loadFrais, 1500);
        } else {
            Swal.fire('Erreur', result.message || 'Erreur lors de l\'enregistrement.', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur réseau', err.message, 'error');
    } finally {
        hideSpinner();
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// MISE À JOUR / RECALCUL
// ─────────────────────────────────────────────────────────────────────────────
async function updateAllFrais() {
    var confirm = await Swal.fire({
        title: 'Mettre à jour les frais',
        html: `Cette action va :<ul style="text-align:left;margin-top:10px;">
            <li>✅ Vérifier tous les élèves</li>
            <li>✅ Ajouter les nouveaux élèves dans la table des frais</li>
            <li>✅ Recalculer RESTE, PROGRESSION et STATUT</li>
            <li>✅ Éviter les doublons</li></ul>
            <strong>Les paiements déjà effectués sont conservés.</strong><br><br>Continuer ?`,
        icon: 'info', showCancelButton: true,
        confirmButtonText: 'Oui, mettre à jour', cancelButtonText: 'Annuler',
        confirmButtonColor: '#17a2b8'
    });
    if (!confirm.isConfirmed) return;

    showSpinner();
    try {
        var res  = await fetch(API_FRAIS.updateAll, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Succès', text: data.message, timer: 3000, showConfirmButton: false });
            loadFrais();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

async function recalculerFrais() {
    var confirm = await Swal.fire({
        title: 'Recalculer les frais',
        html: `Cette action va :<ul style="text-align:left;margin-top:10px;">
            <li>✅ Récupérer les tarifs par classe</li>
            <li>✅ Recalculer le montant total pour chaque élève</li>
            <li>✅ Mettre à jour RESTE, PROGRESSION et STATUT</li></ul>
            <strong>Attention : les paiements déjà effectués sont conservés.</strong><br><br>Continuer ?`,
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Oui, recalculer', cancelButtonText: 'Annuler',
        confirmButtonColor: '#ffc107'
    });
    if (!confirm.isConfirmed) return;

    showSpinner();
    try {
        var res  = await fetch(API_FRAIS.recalculer, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Succès', text: data.message, timer: 3000, showConfirmButton: false });
            loadFrais();
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors du recalcul', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIQUE DES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
async function viewPaymentHistory(matricule, nom) {
    showSpinner();
    try {
        var res    = await fetch(API_FRAIS.getHistorique + '?matricule=' + encodeURIComponent(matricule));
        var result = await res.json();

        if (!result.success) {
            Swal.fire('Erreur', result.message || 'Impossible de charger l\'historique.', 'error');
            return;
        }

        var history = result.data || [];

        if (history.length === 0) {
            Swal.fire({
                title: 'Historique des paiements — ' + escapeHtml(nom),
                html: '<p style="padding:20px;text-align:center;color:#6c757d;">'
                    + '<i class="fas fa-history" style="font-size:40px;display:block;margin-bottom:12px;"></i>'
                    + 'Aucun paiement enregistré pour cet élève.</p>',
                icon: 'info', confirmButtonText: 'Fermer', confirmButtonColor: '#007bff'
            });
            return;
        }

        var totalPaiements = history.reduce(function(s, h) { return s + h.MONTANT; }, 0);

        var rows = history.map(function(h) {
            return '<tr style="border-bottom:1px solid #dee2e6;" id="history-row-' + h.ID + '">'
                + '<td style="padding:8px;">' + formatDateTime(h.DATE_PAIEMENT) + '</td>'
                + '<td style="padding:8px;color:#28a745;font-weight:bold;">' + formatMoney(h.MONTANT) + '</td>'
                + '<td style="padding:8px;">' + getModePaiementBadge(h.MODE_PAIEMENT) + '</td>'
                + '<td style="padding:8px;">' + escapeHtml(h.REFERENCE  || '-') + '</td>'
                + '<td style="padding:8px;">' + escapeHtml(h.USERNAME   || '-') + '</td>'
                + '<td style="padding:8px;">' + escapeHtml(h.COMMENTAIRE || '-') + '</td>'
                + '<td style="padding:8px;text-align:center;">'
                    + '<button type="button" class="btn-history-edit" onclick="openEditHistoriqueModal(\''
                        + h.ID + '\',\'' + escapeHtml(matricule) + '\',\'' + escapeHtml(nom) + '\','
                        + h.MONTANT + ',\'' + h.DATE_PAIEMENT + '\',\'' + h.MODE_PAIEMENT
                        + '\',\'' + escapeHtml(h.REFERENCE || '') + '\',\'' + escapeHtml(h.COMMENTAIRE || '') + '\')">'
                        + '<i class="fas fa-edit"></i></button> '
                    + '<button type="button" class="btn-history-delete" onclick="deleteHistoriquePaiement(\''
                        + h.ID + '\',\'' + escapeHtml(matricule) + '\',' + h.MONTANT + ')">'
                        + '<i class="fas fa-trash-alt"></i></button>'
                + '</td></tr>'
                + '<tr style="background:#f8f9fa;"><td colspan="7" style="padding:5px 8px;font-size:11px;color:#6c757d;">'
                    + '<i class="fas fa-info-circle"></i> Avant : '
                    + formatMoney(h.ANCIEN_PAYE) + ' payé / ' + formatMoney(h.ANCIEN_RESTE) + ' restant → Après : '
                    + formatMoney(h.NOUVEAU_PAYE) + ' payé / ' + formatMoney(h.NOUVEAU_RESTE) + ' restant'
                + '</td></tr>';
        }).join('');

        Swal.fire({
            title: 'Historique des paiements — ' + escapeHtml(nom),
            html: '<div style="max-height:500px;overflow-y:auto;">'
                + '<div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:15px;">'
                + '<p><strong>Élève :</strong> ' + escapeHtml(nom) + '</p>'
                + '<p><strong>Matricule :</strong> ' + escapeHtml(matricule) + '</p>'
                + '<p><strong>Total des paiements :</strong> ' + formatMoney(totalPaiements) + '</p></div>'
                + '<table style="width:100%;border-collapse:collapse;">'
                + '<thead><tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">'
                + '<th style="padding:10px;">Date</th><th style="padding:10px;">Montant</th>'
                + '<th style="padding:10px;">Mode</th><th style="padding:10px;">Référence</th>'
                + '<th style="padding:10px;">Par</th><th style="padding:10px;">Commentaire</th>'
                + '<th style="padding:10px;">Actions</th></tr></thead>'
                + '<tbody>' + rows + '</tbody></table></div>',
            icon: 'info', width: '1200px',
            confirmButtonText: 'Fermer', confirmButtonColor: '#007bff', showCloseButton: true
        });
    } catch (err) {
        console.error('viewPaymentHistory:', err);
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODIFIER UN PAIEMENT HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
function openEditHistoriqueModal(historyId, matricule, nom, ancienMontant, datePaiement, modePaiement, reference, commentaire, mois, annee) {
    _editHistoryId  = historyId;
    _editMatricule  = matricule;
    _editNom        = nom;

    document.getElementById('editStudentName').value     = nom;
    document.getElementById('editMontant').value         = ancienMontant;
    document.getElementById('editPaymentMonth').value    = mois || '';
    document.getElementById('editPaymentYear').value     = annee || '';
    document.getElementById('editDatePaiement').value    = (datePaiement || '').replace(' ', 'T').substring(0, 16);
    document.getElementById('editModePaiement').value    = modePaiement;
    document.getElementById('editReference').value       = reference  || '';
    document.getElementById('editCommentaire').value     = commentaire || '';

    if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) Swal.close();
    openModal('editHistoriqueModal');
}

async function confirmEditHistorique() {
    var montant      = parseFloat(document.getElementById('editMontant').value);
    var mois         = document.getElementById('editPaymentMonth').value;
    var annee        = document.getElementById('editPaymentYear').value;
    var datePaiement = document.getElementById('editDatePaiement').value;
    var modePaiement = document.getElementById('editModePaiement').value;
    var reference    = document.getElementById('editReference').value;
    var commentaire  = document.getElementById('editCommentaire').value;

    if (!montant || montant <= 0) { Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'warning'); return; }
    if (!datePaiement)            { Swal.fire('Erreur', 'La date est obligatoire', 'warning'); return; }

    var savedMatricule = _editMatricule;
    var savedNom       = _editNom;
    var savedHistoryId = _editHistoryId;

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.modifierHistorique, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: savedHistoryId, 
                matricule: savedMatricule,
                montant, 
                moisPaiement: mois,
                annee: annee,
                datePaiement, 
                modePaiement, 
                reference, 
                commentaire 
            })
        });
        var data = await res.json();

        if (data.success) {
            _editHistoryId = null; _editMatricule = null; _editNom = null;
            closeEditHistoriqueModal();
            Swal.fire({ icon: 'success', title: 'Modifié', text: 'Paiement modifié avec succès', timer: 1500, showConfirmButton: false });
            setTimeout(function() {
                loadFrais();
                viewPaymentHistory(savedMatricule, savedNom);
            }, 1600);
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la modification', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

async function deleteHistoriquePaiement(historyId, matricule, montant) {
    var result = await Swal.fire({
        title: 'Confirmation',
        text: 'Voulez-vous vraiment supprimer ce paiement de ' + formatMoney(montant) + ' ?',
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33', cancelButtonColor: '#6c757d'
    });
    if (!result.isConfirmed) return;

    // Récupérer le nom depuis la liste pour rouvrir l'historique après
    var fraisItem = fraisData.find(function(f) { return f.MATRICULE === matricule; });
    var nom = fraisItem ? fraisItem.NOM : '';

    showSpinner();
    try {
        var res = await fetch(API_FRAIS.supprimerHistorique, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: historyId, matricule })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Paiement supprimé avec succès', timer: 1500, showConfirmButton: false });
            setTimeout(function() {
                loadFrais();
                viewPaymentHistory(matricule, nom);
            }, 1600);
        } else {
            Swal.fire('Erreur', data.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// REÇU DE PAIEMENT PAR ÉLÈVE (NOUVELLE FONCTIONNALITÉ)
// ─────────────────────────────────────────────────────────────────────────────
function printStudentReceipt(matricule, nom, classe, total, paye, reste, statut) {
    var dateStr = new Date().toLocaleDateString('fr-FR');
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reçu — ' + escapeHtml(nom) + '</title>'
        + '<style>'
        + 'body{font-family:Arial,sans-serif;margin:30px;color:#333}'
        + 'h1{color:#007bff;border-bottom:2px solid #007bff;padding-bottom:10px}'
        + '.info-table{width:100%;border-collapse:collapse;margin:20px 0}'
        + '.info-table td{padding:10px;border:1px solid #dee2e6}'
        + '.info-table td:first-child{background:#f8f9fa;font-weight:bold;width:40%}'
        + '.amount-row td{font-size:18px;font-weight:bold}'
        + '.footer{margin-top:40px;text-align:center;color:#6c757d;font-size:12px}'
        + '@media print{button{display:none}}'
        + '</style></head><body>'
        + '<h1>🏫 Reçu de frais scolaires</h1>'
        + '<p>Date d\'impression : ' + dateStr + '</p>'
        + '<table class="info-table">'
        + '<tr><td>Matricule</td><td>' + escapeHtml(matricule) + '</td></tr>'
        + '<tr><td>Nom de l\'élève</td><td>' + escapeHtml(nom) + '</td></tr>'
        + '<tr><td>Classe</td><td>' + escapeHtml(classe) + '</td></tr>'
        + '<tr><td>Statut</td><td>' + escapeHtml(statut) + '</td></tr>'
        + '<tr class="amount-row"><td>Montant total</td><td>' + formatMoney(total) + '</td></tr>'
        + '<tr class="amount-row"><td style="color:#28a745">Montant payé</td><td style="color:#28a745">' + formatMoney(paye) + '</td></tr>'
        + '<tr class="amount-row"><td style="color:#dc3545">Reste à payer</td><td style="color:#dc3545">' + formatMoney(reste) + '</td></tr>'
        + '</table>'
        + '<div class="footer">Document généré automatiquement par le système de Gestion Scolaire</div>'
        + '<br><button onclick="window.print()" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">🖨️ Imprimer</button>'
        + '</body></html>';

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES TARIFS D'ÉCOLAGE
// ─────────────────────────────────────────────────────────────────────────────
async function loadAnnees() {
    try {
        var res    = await fetch(API_FRAIS.getAnnees);
        var result = await res.json();
        if (result.success) {
            anneesList = result.data || [];
            populateAnneeSelects();
        }
    } catch (err) { console.error('loadAnnees:', err); }
}

function populateAnneeSelects() {
    ['tarifAnnee', 'tarifAnneeFilter', 'fraisFilterAnnee'].forEach(function(selId) {
        var sel = document.getElementById(selId);
        if (!sel) return;
        var isFilter = selId !== 'tarifAnnee';
        sel.innerHTML = isFilter
            ? '<option value="">Toutes les années</option>'
            : '<option value="">-- Sélectionner une année --</option>';
        anneesList.forEach(function(a) {
            var opt = document.createElement('option');
            opt.value = isFilter ? a.ANNEE : a.ID;
            opt.textContent = a.ANNEE;
            sel.appendChild(opt);
        });
    });
}

async function loadTarifs() {
    showSpinner();
    try {
        var params     = new URLSearchParams();
        var anneeFilter= (document.getElementById('tarifAnneeFilter')  || {}).value || '';
        var classeFilter=(document.getElementById('tarifClasseFilter') || {}).value || '';
        if (anneeFilter)  params.append('anneeId',  anneeFilter);
        if (classeFilter) params.append('classeId', classeFilter);

        var url    = API_FRAIS.getTarifs + (params.toString() ? '?' + params.toString() : '');
        var res    = await fetch(url);
        var result = await res.json();

        if (result.success) {
            tarifsData     = result.data || [];
            filteredTarifs = tarifsData.slice();
            renderTarifsTable();
        }
    } catch (err) { console.error('loadTarifs:', err); }
    finally { hideSpinner(); }
}

function renderTarifsTable() {
    var tbody = document.getElementById('tarifsTableBody');
    if (!tbody) return;

    var totalPages = Math.ceil(filteredTarifs.length / tarifsPerPage);
    var start      = (currentTarifPage - 1) * tarifsPerPage;
    var pageData   = filteredTarifs.slice(start, start + tarifsPerPage);

    if (!filteredTarifs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">Aucun tarif enregistré</td></tr>';
        updateTarifPaginationInfo(0);
        return;
    }

    tbody.innerHTML = '';
    pageData.forEach(function(t) {
        var statusBadge = t.STATUT
            ? '<span class="badge-justified">Actif</span>'
            : '<span class="badge-not-justified">Inactif</span>';
        var row = tbody.insertRow();
        row.innerHTML =
            '<td class="text-center">' + escapeHtml(t.ANNEE_TEXTE) + '</td>'
            + '<td class="text-center"><strong>' + escapeHtml(t.CLASSE_NOM) + '</strong></td>'
            + '<td class="text-center" style="color:#28a745;font-weight:bold;">' + formatMoney(t.MONTANT) + '</td>'
            + '<td class="text-center">' + escapeHtml(t.DESCRIPTION || '-') + '</td>'
            + '<td class="text-center">' + statusBadge + '</td>'
            + '<td class="text-center">'
                + '<button type="button" class="btn btn-sm btn-primary" onclick="editTarif(\'' + t.ID + '\')" style="margin:0 2px;"><i class="fas fa-edit"></i></button>'
                + '<button type="button" class="btn btn-sm btn-danger" onclick="deleteTarif(\'' + t.ID + '\')" style="margin:0 2px;"><i class="fas fa-trash-alt"></i></button>'
            + '</td>';
    });

    updateTarifPaginationInfo(totalPages);
}

function updateTarifPaginationInfo(totalPages) {
    var total  = filteredTarifs.length;
    var start  = total ? (currentTarifPage - 1) * tarifsPerPage + 1 : 0;
    var end    = Math.min(currentTarifPage * tarifsPerPage, total);
    var info   = document.getElementById('tarifsPaginationInfo');
    if (info) info.textContent = total === 0
        ? 'Aucun enregistrement'
        : 'Affichage de ' + start + ' à ' + end + ' sur ' + total + ' enregistrement(s)';

    var prevBtn = document.getElementById('prevTarifPageBtn');
    var nextBtn = document.getElementById('nextTarifPageBtn');
    if (prevBtn) {
        prevBtn.disabled = currentTarifPage === 1;
        prevBtn.onclick  = function() { if (currentTarifPage > 1) { currentTarifPage--; renderTarifsTable(); } };
    }
    if (nextBtn) {
        nextBtn.disabled = currentTarifPage >= totalPages || totalPages === 0;
        nextBtn.onclick  = function() { if (currentTarifPage < totalPages) { currentTarifPage++; renderTarifsTable(); } };
    }
}

function filterTarifs() {
    var anneeF  = (document.getElementById('tarifAnneeFilter')  || {}).value || '';
    var classeF = (document.getElementById('tarifClasseFilter') || {}).value || '';
    filteredTarifs = tarifsData.filter(function(t) {
        return (!anneeF  || t.ANNEE_ID  == anneeF) &&
               (!classeF || t.CLASSE_ID == classeF);
    });
    currentTarifPage = 1;
    renderTarifsTable();
}

function resetTarifFilters() {
    var a = document.getElementById('tarifAnneeFilter');
    var c = document.getElementById('tarifClasseFilter');
    if (a) a.value = ''; if (c) c.value = '';
    filteredTarifs = tarifsData.slice();
    currentTarifPage = 1;
    renderTarifsTable();
}

function openTarifModal() {
    currentTarifId = null;
    document.getElementById('tarifModalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter un tarif';
    ['tarifEditId','tarifMontant','tarifDescription'].forEach(function(id) { document.getElementById(id).value = ''; });
    document.getElementById('tarifAnnee').value  = '';
    document.getElementById('tarifClasse').value = '';
    document.getElementById('tarifStatut').value = '1';
    openModal('tarifModal');
}

async function saveTarif() {
    var anneeId     = (document.getElementById('tarifAnnee')      || {}).value;
    var classeId    = (document.getElementById('tarifClasse')     || {}).value;
    var montant     = parseFloat((document.getElementById('tarifMontant') || {}).value);
    var description = (document.getElementById('tarifDescription')|| {}).value;
    var statut      = (document.getElementById('tarifStatut')     || {}).value === '1';

    if (!anneeId || !classeId) { Swal.fire('Erreur', 'Veuillez sélectionner une année et une classe', 'warning'); return; }
    if (!montant || montant <= 0) { Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'warning'); return; }

    showSpinner();
    try {
        var url = currentTarifId ? API_FRAIS.modifierTarif : API_FRAIS.ajouterTarif;
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentTarifId, anneeId, classeId, montant, description, statut })
        });
        var result = await res.json();
        if (result.success) {
            closeTarifModal();
            Swal.fire({ icon: 'success', title: 'Succès', text: result.message, timer: 1500, showConfirmButton: false });
            setTimeout(function() { loadTarifs(); loadFrais(); }, 1500);
        } else {
            Swal.fire('Erreur', result.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

function editTarif(id) {
    var tarif = tarifsData.find(function(t) { return t.ID === id; });
    if (!tarif) return;
    currentTarifId = id;
    document.getElementById('tarifModalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier le tarif';
    document.getElementById('tarifEditId').value     = id;
    document.getElementById('tarifAnnee').value      = tarif.ANNEE_ID;
    document.getElementById('tarifClasse').value     = tarif.CLASSE_ID;
    document.getElementById('tarifMontant').value    = tarif.MONTANT;
    document.getElementById('tarifDescription').value= tarif.DESCRIPTION || '';
    document.getElementById('tarifStatut').value     = tarif.STATUT ? '1' : '0';
    openModal('tarifModal');
}

async function deleteTarif(id) {
    var result = await Swal.fire({
        title: 'Confirmation', text: 'Voulez-vous vraiment supprimer ce tarif ?',
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33'
    });
    if (!result.isConfirmed) return;

    showSpinner();
    try {
        var res  = await fetch(API_FRAIS.supprimerTarif, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        var data = await res.json();
        if (data.success) {
            Swal.fire({ icon: 'success', title: 'Supprimé', timer: 1500, showConfirmButton: false });
            loadTarifs();
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    } catch (err) {
        Swal.fire('Erreur', err.message, 'error');
    } finally {
        hideSpinner();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SWITCH ONGLETS
// ─────────────────────────────────────────────────────────────────────────────
function switchFraisTab(tab) {
    document.querySelectorAll('.frais-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.frais-tab-content').forEach(function(c) { c.classList.remove('active'); });

    if (tab === 'paiements') {
        document.querySelectorAll('.frais-tab-btn')[0].classList.add('active');
        document.getElementById('frais-tab-paiements').classList.add('active');
    } else {
        document.querySelectorAll('.frais-tab-btn')[1].classList.add('active');
        document.getElementById('frais-tab-tarifs').classList.add('active');
        loadAnnees();
        loadTarifs();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT ET IMPRESSION
// ─────────────────────────────────────────────────────────────────────────────
function exportFraisToExcel() {
    if (!filteredFrais.length) { Swal.fire('Info', 'Aucune donnée à exporter', 'info'); return; }

    var rows = [['Matricule', 'Nom', 'Classe', 'Total (Ar)', 'Payé (Ar)', 'Reste (Ar)', 'Progression (%)', 'Statut']];
    filteredFrais.forEach(function(f) {
        rows.push([f.MATRICULE||'', f.NOM||'', f.CLASSE_NOM||'',
            f.TOTAL||0, f.PAYE||0, f.RESTE||0,
            (f.PROGRESSION||0).toFixed(1), f.STATUT||'Non payé']);
    });

    var csv  = rows.map(function(row) {
        return row.map(function(cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Frais_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function printFraisReport() {
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rapport Frais Scolaires</title>'
        + '<style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}'
        + 'th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}'
        + '@media print{button{display:none}}</style></head><body>'
        + '<h2>Rapport des Frais Scolaires</h2>'
        + '<p>Date : ' + new Date().toLocaleDateString('fr-FR') + ' | '
        + filteredFrais.length + ' enregistrement(s)</p>'
        + '<table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th>'
        + '<th>Total (Ar)</th><th>Payé (Ar)</th><th>Reste (Ar)</th><th>Progression</th><th>Statut</th></tr></thead><tbody>';

    filteredFrais.forEach(function(f) {
        html += '<tr>'
            + '<td>' + escapeHtml(f.MATRICULE||'') + '</td>'
            + '<td>' + escapeHtml(f.NOM||'')       + '</td>'
            + '<td>' + escapeHtml(f.CLASSE_NOM||'')+ '</td>'
            + '<td>' + (f.TOTAL||0)  + '</td>'
            + '<td>' + (f.PAYE ||0)  + '</td>'
            + '<td>' + (f.RESTE||0)  + '</td>'
            + '<td>' + (f.PROGRESSION||0).toFixed(1) + '%</td>'
            + '<td>' + (f.STATUT||'Non payé') + '</td>'
            + '</tr>';
    });

    html += '</tbody></table>'
        + '<br><button onclick="window.print()" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">🖨️ Imprimer</button>'
        + '</body></html>';

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    loadFrais();
    loadAnnees(); // Charger les années dès le départ pour le filtre de l'onglet paiements

    ['fraisSearch', 'fraisFilterStatut', 'fraisFilterClasse', 'fraisFilterAnnee'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input',  filterFraisTable);
        if (el) el.addEventListener('change', filterFraisTable);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ['paymentModal', 'editHistoriqueModal', 'tarifModal'].forEach(closeModal);
            if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) Swal.close();
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────
Object.assign(window, {
    openAddPaymentModal, openPaymentModalForStudent, closePaymentModal, updatePaymentInfo, savePayment,
    exportFraisToExcel, printFraisReport, printStudentReceipt,
    filterFraisTable, resetFilters, sortBy,
    viewPaymentHistory, openEditHistoriqueModal, closeEditHistoriqueModal, confirmEditHistorique, deleteHistoriquePaiement,
    switchFraisTab,
    filterTarifs, resetTarifFilters, openTarifModal, closeTarifModal, saveTarif, editTarif, deleteTarif,
    recalculerFrais, updateAllFrais
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
