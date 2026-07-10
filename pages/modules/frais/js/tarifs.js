'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES TARIFS D'ÉCOLAGE
// ─────────────────────────────────────────────────────────────────────────────
async function loadAnnees() {
    try {
        var res = await fetch(API_FRAIS.getAnnees);
        var result = await res.json();
        if (result.success) {
            anneesList = result.data || [];
            populateAnneeSelects();
        }
    } catch (err) { console.error('loadAnnees:', err); }
}

function populateAnneeSelects() {
    ['tarifAnnee', 'tarifAnneeFilter', 'fraisFilterAnnee'].forEach(function (selId) {
        var sel = document.getElementById(selId);
        if (!sel) return;
        var isFilter = (selId !== 'tarifAnnee');
        sel.innerHTML = isFilter
            ? '<option value="">Toutes les années</option>'
            : '<option value="">-- Sélectionner une année --</option>';
        anneesList.forEach(function (a) {
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
        var params = new URLSearchParams();
        var anneeFilter = document.getElementById('tarifAnneeFilter') ? document.getElementById('tarifAnneeFilter').value || '' : '';
        var classeFilter = document.getElementById('tarifClasseFilter') ? document.getElementById('tarifClasseFilter').value || '' : '';
        if (anneeFilter) params.append('anneeId', anneeFilter);
        if (classeFilter) params.append('classeId', classeFilter);

        var url = API_FRAIS.getTarifs + (params.toString() ? '?' + params.toString() : '');
        var res = await fetch(url);
        var result = await res.json();

        if (result.success) {
            tarifsData = result.data || [];
            filteredTarifs = tarifsData.slice();
            renderTarifsTable();
        }
    } catch (err) { console.error('loadTarifs:', err); } finally { hideSpinner(); }
}

function renderTarifsTable() {
    var tbody = document.getElementById('tarifsTableBody');
    if (!tbody) return;

    var totalPages = Math.ceil(filteredTarifs.length / tarifsPerPage);
    var start = (currentTarifPage - 1) * tarifsPerPage;
    var pageData = filteredTarifs.slice(start, start + tarifsPerPage);

    if (!filteredTarifs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;">Aucun tarif enregistré</td></tr>';
        updateTarifPaginationInfo(0);
        return;
    }

    tbody.innerHTML = '';
    pageData.forEach(function (t) {
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
    var total = filteredTarifs.length;
    var start = total ? (currentTarifPage - 1) * tarifsPerPage + 1 : 0;
    var end = Math.min(currentTarifPage * tarifsPerPage, total);
    var info = document.getElementById('tarifsPaginationInfo');
    if (info) {
        info.textContent = total === 0
            ? 'Aucun enregistrement'
            : 'Affichage de ' + start + ' à ' + end + ' sur ' + total + ' enregistrement(s)';
    }

    var prevBtn = document.getElementById('prevTarifPageBtn');
    var nextBtn = document.getElementById('nextTarifPageBtn');
    if (prevBtn) {
        prevBtn.disabled = (currentTarifPage === 1);
        prevBtn.onclick = function () {
            if (currentTarifPage > 1) {
                currentTarifPage--;
                renderTarifsTable();
            }
        };
    }
    if (nextBtn) {
        nextBtn.disabled = (currentTarifPage >= totalPages || totalPages === 0);
        nextBtn.onclick = function () {
            if (currentTarifPage < totalPages) {
                currentTarifPage++;
                renderTarifsTable();
            }
        };
    }
}

function filterTarifs() {
    var anneeF = document.getElementById('tarifAnneeFilter') ? document.getElementById('tarifAnneeFilter').value || '' : '';
    var classeF = document.getElementById('tarifClasseFilter') ? document.getElementById('tarifClasseFilter').value || '' : '';
    filteredTarifs = tarifsData.filter(function (t) {
        return (!anneeF || t.ANNEE_ID == anneeF) && (!classeF || t.CLASSE_ID == classeF);
    });
    currentTarifPage = 1;
    renderTarifsTable();
}

function resetTarifFilters() {
    var a = document.getElementById('tarifAnneeFilter');
    var c = document.getElementById('tarifClasseFilter');
    if (a) a.value = '';
    if (c) c.value = '';
    filteredTarifs = tarifsData.slice();
    currentTarifPage = 1;
    renderTarifsTable();
}

function openTarifModal() {
    currentTarifId = null;
    document.getElementById('tarifModalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter un tarif';
    ['tarifEditId', 'tarifMontant', 'tarifDescription'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('tarifAnnee').value = '';
    document.getElementById('tarifClasse').value = '';
    document.getElementById('tarifStatut').value = '1';
    openModal('tarifModal');
}

async function saveTarif() {
    var anneeId = document.getElementById('tarifAnnee') ? document.getElementById('tarifAnnee').value : '';
    var classeId = document.getElementById('tarifClasse') ? document.getElementById('tarifClasse').value : '';
    var montant = parseFloat(document.getElementById('tarifMontant') ? document.getElementById('tarifMontant').value : 0);
    var description = document.getElementById('tarifDescription') ? document.getElementById('tarifDescription').value : '';
    var statut = document.getElementById('tarifStatut') ? document.getElementById('tarifStatut').value === '1' : true;

    if (!anneeId || !classeId) {
        Swal.fire('Erreur', 'Veuillez sélectionner une année et une classe', 'warning');
        return;
    }
    if (!montant || montant <= 0) {
        Swal.fire('Erreur', 'Le montant doit être supérieur à 0', 'warning');
        return;
    }

    showSpinner();
    try {
        var url = currentTarifId ? API_FRAIS.modifierTarif : API_FRAIS.ajouterTarif;
        var res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentTarifId, anneeId: anneeId, classeId: classeId, montant: montant, description: description, statut: statut })
        });
        var result = await res.json();
        if (result.success) {
            closeTarifModal();
            Swal.fire({ icon: 'success', title: 'Succès', text: result.message, timer: 1500, showConfirmButton: false });
            setTimeout(function () { loadTarifs(); loadFrais(); }, 1500);
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
    var tarif = tarifsData.find(function (t) { return t.ID === id; });
    if (!tarif) return;
    currentTarifId = id;
    document.getElementById('tarifModalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier le tarif';
    document.getElementById('tarifEditId').value = id;
    document.getElementById('tarifAnnee').value = tarif.ANNEE_ID;
    document.getElementById('tarifClasse').value = tarif.CLASSE_ID;
    document.getElementById('tarifMontant').value = tarif.MONTANT;
    document.getElementById('tarifDescription').value = tarif.DESCRIPTION || '';
    document.getElementById('tarifStatut').value = tarif.STATUT ? '1' : '0';
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
        var res = await fetch(API_FRAIS.supprimerTarif, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
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
    document.querySelectorAll('.frais-tab-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.frais-tab-content').forEach(function (c) { c.classList.remove('active'); });

    if (tab === 'paiements') {
        var btns = document.querySelectorAll('.frais-tab-btn');
        if (btns.length > 0) btns[0].classList.add('active');
        var content = document.getElementById('frais-tab-paiements');
        if (content) content.classList.add('active');
    } else {
        var btns = document.querySelectorAll('.frais-tab-btn');
        if (btns.length > 1) btns[1].classList.add('active');
        var content = document.getElementById('frais-tab-tarifs');
        if (content) content.classList.add('active');
        loadAnnees();
        loadTarifs();
    }
}