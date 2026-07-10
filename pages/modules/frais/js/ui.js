'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) {
        s.style.display = 'flex';
        s.style.visibility = 'visible';
        s.style.opacity = '1';
    }
}

function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) {
        s.style.display = 'none';
        s.style.visibility = 'hidden';
        s.style.opacity = '0';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = 'flex';
    modal.style.zIndex = (id === 'editHistoriqueModal') ? '999999' : '9999';
    document.body.style.overflow = 'hidden';
    var mc = modal.querySelector('.modal-content');
    if (mc) mc.style.zIndex = modal.style.zIndex;
}

function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) { modal.style.display = 'none'; }
    var anyOpen = ['paymentModal', 'editHistoriqueModal', 'tarifModal'].some(function (mid) {
        var m = document.getElementById(mid);
        return m && m.style.display === 'flex';
    });
    if (!anyOpen) document.body.style.overflow = '';
}

function closePaymentModal() { closeModal('paymentModal'); }
function closeTarifModal() { closeModal('tarifModal'); currentTarifId = null; }
function closeEditHistoriqueModal() { closeModal('editHistoriqueModal'); }

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES PAIEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function createFilterControls() {
    var oldContainer = document.getElementById('frais-filter-container');
    if (oldContainer) oldContainer.remove();

    var filterContainer = document.createElement('div');
    filterContainer.id = 'frais-filter-container';
    filterContainer.style.cssText = 'margin:0 0 20px 0;padding:15px 20px;background:linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%);border-radius:10px;display:flex;gap:15px;flex-wrap:wrap;align-items:flex-end;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid #dee2e6;';

    filterContainer.innerHTML = ''
        + '<div style="flex:2;min-width:200px;">'
        + '<label style="display:block;margin-bottom:8px;font-weight:600;"><i class="fas fa-search"></i> Recherche :</label>'
        + '<input type="text" id="fraisSearch" placeholder="Nom, matricule..." style="width:100%;padding:10px 12px;border:1px solid #ced4da;border-radius:6px;">'
        + '</div>'
        + '<div style="min-width:160px;">'
        + '<label style="display:block;margin-bottom:8px;font-weight:600;"><i class="fas fa-filter"></i> Statut :</label>'
        + '<select id="fraisFilterStatut" style="width:100%;padding:10px 12px;border:1px solid #ced4da;border-radius:6px;">'
        + '<option value="">Tous</option>'
        + '<option value="Terminé">Terminé</option>'
        + '<option value="En cours">En cours</option>'
        + '<option value="Non payé">Non payé</option>'
        + '</select>'
        + '</div>'
        + '<div style="min-width:160px;">'
        + '<label style="display:block;margin-bottom:8px;font-weight:600;"><i class="fas fa-filter"></i> Classe :</label>'
        + '<select id="fraisFilterClasse" style="width:100%;padding:10px 12px;border:1px solid #ced4da;border-radius:6px;">'
        + '<option value="">Toutes</option>'
        + '</select>'
        + '</div>'
        + '<div style="min-width:160px;">'
        + '<label style="display:block;margin-bottom:8px;font-weight:600;"><i class="fas fa-calendar"></i> Année :</label>'
        + '<select id="fraisFilterAnnee" style="width:100%;padding:10px 12px;border:1px solid #ced4da;border-radius:6px;">'
        + '<option value="">Toutes</option>'
        + '</select>'
        + '</div>'
        + '<div style="min-width:140px;">'
        + '<label style="display:block;margin-bottom:8px;font-weight:600;"><i class="fas fa-table"></i> Lignes/page :</label>'
        + '<select id="frais-rows-per-page" style="width:100%;padding:10px 12px;border:1px solid #ced4da;border-radius:6px;">'
        + '<option value="5">5 lignes</option>'
        + '<option value="10" selected>10 lignes</option>'
        + '<option value="20">20 lignes</option>'
        + '<option value="50">50 lignes</option>'
        + '<option value="100">100 lignes</option>'
        + '<option value="-1">Tous</option>'
        + '</select>'
        + '</div>'
        + '<div>'
        + '<button id="frais-reset-filters" style="padding:10px 24px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;">'
        + '<i class="fas fa-undo-alt"></i> Réinitialiser'
        + '</button>'
        + '</div>';

    var dashCardBody = document.querySelector('.dash-card-body');
    if (dashCardBody) {
        dashCardBody.insertBefore(filterContainer, dashCardBody.firstChild);
    } else {
        var table = document.querySelector('.dash-table');
        if (table && table.parentNode) {
            table.parentNode.insertBefore(filterContainer, table);
        }
    }

    var searchEl = document.getElementById('fraisSearch');
    var statutEl = document.getElementById('fraisFilterStatut');
    var classeEl = document.getElementById('fraisFilterClasse');
    var anneeEl = document.getElementById('fraisFilterAnnee');
    var rowsEl = document.getElementById('frais-rows-per-page');
    var resetEl = document.getElementById('frais-reset-filters');

    if (searchEl) searchEl.addEventListener('input', filterFraisTable);
    if (statutEl) statutEl.addEventListener('change', filterFraisTable);
    if (classeEl) classeEl.addEventListener('change', filterFraisTable);
    if (anneeEl) anneeEl.addEventListener('change', filterFraisTable);
    if (rowsEl) {
        rowsEl.addEventListener('change', function(e) {
            rowsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderTable();
        });
    }
    if (resetEl) resetEl.addEventListener('click', resetFilters);

    populateClassFilter();
    populateAnneeSelects();
}

function filterFraisTable() {
    var search = document.getElementById('fraisSearch') ? document.getElementById('fraisSearch').value || '' : '';
    var statut = document.getElementById('fraisFilterStatut') ? document.getElementById('fraisFilterStatut').value || '' : '';
    var classe = document.getElementById('fraisFilterClasse') ? document.getElementById('fraisFilterClasse').value || '' : '';
    var annee = document.getElementById('fraisFilterAnnee') ? document.getElementById('fraisFilterAnnee').value || '' : '';

    search = search.toLowerCase().trim();

    filteredFrais = fraisData.filter(function (item) {
        var matchSearch = !search ||
            (item.NOM || '').toLowerCase().includes(search) ||
            (item.MATRICULE || '').toLowerCase().includes(search);
        var matchStatut = !statut || (item.STATUT || '') === statut;
        var matchClasse = !classe || (item.CLASSE_NOM || '').toLowerCase() === classe.toLowerCase();
        var matchAnnee = !annee || (item.ANNEE_TEXTE || '') === annee;
        return matchSearch && matchStatut && matchClasse && matchAnnee;
    });

    applySort();
    currentPage = 1;
    renderTable();
}

function resetFilters() {
    ['fraisSearch', 'fraisFilterStatut', 'fraisFilterClasse', 'fraisFilterAnnee'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var rowsSelect = document.getElementById('frais-rows-per-page');
    if (rowsSelect) rowsSelect.value = '10';
    rowsPerPage = 10;
    filteredFrais = fraisData.slice();
    applySort();
    currentPage = 1;
    renderTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
function createPaginationControls(totalPages) {
    var oldPagination = document.getElementById('pagination-container');
    if (oldPagination) oldPagination.remove();
    if (totalPages <= 1) return;

    var container = document.createElement('div');
    container.id = 'pagination-container';
    container.style.cssText = 'margin:20px 0;display:flex;justify-content:center;gap:5px;flex-wrap:wrap;';

    var createBtn = function(text, onClick, disabled, isDots) {
        disabled = disabled || false;
        isDots = isDots || false;
        var btn = document.createElement('button');
        btn.textContent = text;
        if (isDots) {
            btn.style.cssText = 'padding:8px 12px;border:none;background:transparent;color:#6c757d;cursor:default;';
            return btn;
        }
        var isActive = (text == currentPage && !isNaN(text));
        btn.style.cssText = 'padding:8px 14px;border:1px solid ' + (isActive ? '#007bff' : '#dee2e6') + ';'
            + 'background:' + (isActive ? '#007bff' : (disabled ? '#e9ecef' : 'white')) + ';'
            + 'color:' + (isActive ? 'white' : (disabled ? '#6c757d' : '#007bff')) + ';'
            + 'cursor:' + (disabled || isActive ? 'default' : 'pointer') + ';border-radius:6px;font-weight:' + (isActive ? '700' : '500') + ';min-width:40px;';
        if (onClick && !disabled && !isActive) btn.onclick = onClick;
        if (disabled) btn.disabled = true;
        return btn;
    };

    container.appendChild(createBtn('«', function() { goToPage(1); }, currentPage === 1));
    container.appendChild(createBtn('‹', function() { if (currentPage > 1) { currentPage--; renderTable(); } }, currentPage === 1));

    var maxVisible = 5;
    var start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    var end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        container.appendChild(createBtn('1', function() { goToPage(1); }));
        if (start > 2) container.appendChild(createBtn('...', null, true, true));
    }
    for (var i = start; i <= end; i++) {
        (function(page) {
            container.appendChild(createBtn(page, function() { goToPage(page); }, false));
        })(i);
    }
    if (end < totalPages) {
        if (end < totalPages - 1) container.appendChild(createBtn('...', null, true, true));
        (function(tp) {
            container.appendChild(createBtn(tp, function() { goToPage(tp); }));
        })(totalPages);
    }
    container.appendChild(createBtn('›', function() { if (currentPage < totalPages) { currentPage++; renderTable(); } }, currentPage === totalPages));
    container.appendChild(createBtn('»', function() { goToPage(totalPages); }, currentPage === totalPages));

    var table = document.querySelector('.dash-table');
    if (table && table.parentNode) {
        table.parentNode.insertBefore(container, table.nextSibling);
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

function updateCounter() {
    var counter = document.getElementById('record-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'record-counter';
        counter.style.cssText = 'margin:15px 0 0;padding:10px 15px;text-align:center;font-size:14px;background:#f8f9fa;border-radius:6px;border:1px solid #e9ecef;';
        var pagination = document.getElementById('pagination-container');
        if (pagination && pagination.parentNode) {
            pagination.parentNode.insertBefore(counter, pagination);
        } else {
            var table = document.querySelector('.dash-table');
            if (table && table.parentNode) {
                table.parentNode.insertBefore(counter, table.nextSibling);
            }
        }
    }
    
    var start = filteredFrais.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    var end = Math.min(currentPage * rowsPerPage, filteredFrais.length);
    counter.innerHTML = '<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ' + (filteredFrais.length === 0 ? '0' : start) + ' à ' + end + ' sur <strong>' + filteredFrais.length + '</strong> enregistrement' + (filteredFrais.length > 1 ? 's' : '');
}