'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
function forceHideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity = '0';
    s.setAttribute('aria-hidden', 'true');
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'flex';
    s.style.visibility = 'visible';
    s.style.opacity = '1';
    s.removeAttribute('aria-hidden');
}

function hideSpinner() { forceHideSpinner(); }

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────
function showModal(id) {
    var m = document.getElementById(id || 'eleveModal');
    if (m) {
        m.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeEleveModal() {
    var m = document.getElementById('eleveModal');
    if (m) {
        m.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentMode = null;
    currentEleveId = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES & PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
function createFilterControls() {
    if (document.getElementById('filter-container')) return;

    var fc = document.createElement('div');
    fc.id = 'filter-container';
    fc.style.cssText = 'margin:0 0 20px;padding:14px 18px;background:linear-gradient(135deg,#f8f9fa,#e9ecef);border-radius:10px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #dee2e6;';
    fc.innerHTML = `
        <div style="flex:2;min-width:200px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-search"></i> Recherche
            </label>
            <input type="text" id="search-filter" placeholder="Nom, matricule, email..."
                style="width:100%;padding:9px 12px;border:1px solid #ced4da;border-radius:6px;font-size:13px;">
        </div>
        <div style="min-width:150px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-filter"></i> Statut
            </label>
            <select id="status-filter" class="form-control">
                <option value="">Tous</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="suspendu">Suspendu</option>
            </select>
        </div>
        <div style="min-width:130px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-list"></i> Afficher
            </label>
            <select id="rows-per-page-top" class="form-control">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <button id="btn-reset-filters" type="button"
            style="padding:9px 20px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;

    var container = document.querySelector('.dash-card-body') || document.body;
    container.prepend(fc);

    document.getElementById('search-filter').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('rows-per-page-top').addEventListener('change', function (e) {
        rowsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable();
    });
    document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
}

function applyFilters() {
    var search = (document.getElementById('search-filter')?.value || '').toLowerCase().trim();
    var status = document.getElementById('status-filter')?.value || '';

    filteredEleves = baseFilteredData.filter(function (eleve) {
        var matchSearch = !search || (
            eleve.NOM?.toLowerCase().includes(search) ||
            eleve.MATRICULE?.toLowerCase().includes(search) ||
            eleve.EMAIL?.toLowerCase().includes(search)
        );
        var matchStatus = !status || (eleve.STATUT?.toLowerCase() === status);
        return matchSearch && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

function resetFilters() {
    var sf = document.getElementById('search-filter');
    var stf = document.getElementById('status-filter');
    var rp = document.getElementById('rows-per-page-top');
    if (sf) sf.value = '';
    if (stf) stf.value = '';
    if (rp) rp.value = '10';
    rowsPerPage = 10;
    applyFilters();
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

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

    var start = filteredEleves.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    var end = Math.min(currentPage * rowsPerPage, filteredEleves.length);
    counter.innerHTML = '<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ' + (filteredEleves.length === 0 ? '0' : start) + ' à ' + end + ' sur <strong>' + filteredEleves.length + '</strong> enregistrement' + (filteredEleves.length > 1 ? 's' : '');
}

// ─────────────────────────────────────────────────────────────────────────────
// SÉCURITÉ FORMULAIRE
// ─────────────────────────────────────────────────────────────────────────────
function preventFormAutoSubmit() {
    var form = document.getElementById('eleveForm');
    if (!form) return;
    form.setAttribute('novalidate', 'novalidate');
    form.addEventListener('submit', function (e) { e.preventDefault(); });
}

function ensureButtonsHaveTypeButton() {
    document.querySelectorAll('button').forEach(function (btn) {
        if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
    });
}

function initUIControls() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeEleveModal();
            closeModal('modalImport');
            closeModal('modalMapping');
        }
    });
}