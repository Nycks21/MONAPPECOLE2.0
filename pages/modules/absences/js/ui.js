'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UI — Module Absences & Retards
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MODALES
// ─────────────────────────────────────────────────────────────────────────────

function showModal(id) {
    var m = document.getElementById(id);
    if (m) {
        m.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAbsenceModal() {
    var m = document.getElementById('absenceModal');
    if (m) {
        m.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentMode = null;
    currentAbsenceId = null;
}

function closeRetardModal() {
    var m = document.getElementById('retardModal');
    if (m) {
        m.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentMode = null;
    currentRetardId = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SWITCH ENTRE ONGLETS
// ─────────────────────────────────────────────────────────────────────────────

function switchTab(tab, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    currentTab = tab;
    
    var tabs = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    
    if (tab === 'absences') {
        if (tabs.length > 0) tabs[0].classList.add('active');
        var content = document.getElementById('tab-absences');
        if (content) content.classList.add('active');
        if (typeof loadAbsences === 'function') {
            loadAbsences();
        }
    } else {
        if (tabs.length > 1) tabs[1].classList.add('active');
        var content = document.getElementById('tab-retards');
        if (content) content.classList.add('active');
        if (typeof loadRetards === 'function') {
            loadRetards();
        }
    }
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRES & PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

function createFilterControlsAbsences() {
    var oldContainer = document.getElementById('abs-filter-container');
    if (oldContainer) oldContainer.remove();

    var fc = document.createElement('div');
    fc.id = 'abs-filter-container';
    fc.style.cssText = 'margin:0 0 20px;padding:14px 18px;background:linear-gradient(135deg,#f8f9fa,#e9ecef);border-radius:10px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #dee2e6;';
    fc.innerHTML = `
        <div style="flex:2;min-width:180px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-search"></i> Recherche
            </label>
            <input type="text" id="abs-search-filter" placeholder="Nom, matricule..."
                style="width:100%;padding:9px 12px;border:1px solid #ced4da;border-radius:6px;font-size:13px;">
        </div>
        <div style="min-width:140px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-filter"></i> Statut
            </label>
            <select id="abs-status-filter" class="form-control">
                <option value="">Tous</option>
                <option value="justifie">Justifiée</option>
                <option value="non_justifie">Non justifiée</option>
            </select>
        </div>
        <div style="min-width:130px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-list"></i> Afficher
            </label>
            <select id="abs-rows-per-page" class="form-control">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <button id="abs-reset-filters" type="button"
            style="padding:9px 20px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;

    var container = document.querySelector('#tab-absences .dash-card-body') || document.body;
    container.prepend(fc);

    document.getElementById('abs-search-filter').addEventListener('input', applyFiltersAbsences);
    document.getElementById('abs-status-filter').addEventListener('change', applyFiltersAbsences);
    document.getElementById('abs-rows-per-page').addEventListener('change', function (e) {
        absRows = parseInt(e.target.value);
        absPage = 1;
        renderAbsencesTable();
    });
    document.getElementById('abs-reset-filters').addEventListener('click', resetFiltersAbsences);
}

function applyFiltersAbsences() {
    var search = (document.getElementById('abs-search-filter')?.value || '').toLowerCase().trim();
    var status = document.getElementById('abs-status-filter')?.value || '';

    filteredAbsences = baseAbsencesData.filter(function (item) {
        var matchSearch = !search || (
            item.NOM?.toLowerCase().includes(search) ||
            item.MATRICULE?.toLowerCase().includes(search)
        );
        var matchStatus = !status || (
            status === 'justifie' ? item.JUSTIFIE === true : item.JUSTIFIE === false
        );
        return matchSearch && matchStatus;
    });

    absPage = 1;
    renderAbsencesTable();
}

function resetFiltersAbsences() {
    var sf = document.getElementById('abs-search-filter');
    var stf = document.getElementById('abs-status-filter');
    var rp = document.getElementById('abs-rows-per-page');
    if (sf) sf.value = '';
    if (stf) stf.value = '';
    if (rp) rp.value = '10';
    absRows = 10;
    applyFiltersAbsences();
}

function createFilterControlsRetards() {
    var oldContainer = document.getElementById('ret-filter-container');
    if (oldContainer) oldContainer.remove();

    var fc = document.createElement('div');
    fc.id = 'ret-filter-container';
    fc.style.cssText = 'margin:0 0 20px;padding:14px 18px;background:linear-gradient(135deg,#f8f9fa,#e9ecef);border-radius:10px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #dee2e6;';
    fc.innerHTML = `
        <div style="flex:2;min-width:180px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-search"></i> Recherche
            </label>
            <input type="text" id="ret-search-filter" placeholder="Nom, matricule..."
                style="width:100%;padding:9px 12px;border:1px solid #ced4da;border-radius:6px;font-size:13px;">
        </div>
        <div style="min-width:140px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-filter"></i> Statut
            </label>
            <select id="ret-status-filter" class="form-control">
                <option value="">Tous</option>
                <option value="justifie">Justifié</option>
                <option value="non_justifie">Non justifié</option>
            </select>
        </div>
        <div style="min-width:130px;">
            <label style="display:block;margin-bottom:6px;font-weight:600;color:#495057;font-size:13px;">
                <i class="fas fa-list"></i> Afficher
            </label>
            <select id="ret-rows-per-page" class="form-control">
                <option value="5">5 lignes</option>
                <option value="10" selected>10 lignes</option>
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
                <option value="-1">Tous</option>
            </select>
        </div>
        <button id="ret-reset-filters" type="button"
            style="padding:9px 20px;background:#6c757d;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
            <i class="fas fa-undo"></i> Réinitialiser
        </button>`;

    var container = document.querySelector('#tab-retards .dash-card-body') || document.body;
    container.prepend(fc);

    document.getElementById('ret-search-filter').addEventListener('input', applyFiltersRetards);
    document.getElementById('ret-status-filter').addEventListener('change', applyFiltersRetards);
    document.getElementById('ret-rows-per-page').addEventListener('change', function (e) {
        retRows = parseInt(e.target.value);
        retPage = 1;
        renderRetardsTable();
    });
    document.getElementById('ret-reset-filters').addEventListener('click', resetFiltersRetards);
}

function applyFiltersRetards() {
    var search = (document.getElementById('ret-search-filter')?.value || '').toLowerCase().trim();
    var status = document.getElementById('ret-status-filter')?.value || '';

    filteredRetards = baseRetardsData.filter(function (item) {
        var matchSearch = !search || (
            item.NOM?.toLowerCase().includes(search) ||
            item.MATRICULE?.toLowerCase().includes(search)
        );
        var matchStatus = !status || (
            status === 'justifie' ? item.JUSTIFIE === true : item.JUSTIFIE === false
        );
        return matchSearch && matchStatus;
    });

    retPage = 1;
    renderRetardsTable();
}

function resetFiltersRetards() {
    var sf = document.getElementById('ret-search-filter');
    var stf = document.getElementById('ret-status-filter');
    var rp = document.getElementById('ret-rows-per-page');
    if (sf) sf.value = '';
    if (stf) stf.value = '';
    if (rp) rp.value = '10';
    retRows = 10;
    applyFiltersRetards();
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

function createPaginationControls(containerId, currentPage, totalPages, goToPageFn) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    if (totalPages <= 1) return;

    var pc = document.createElement('div');
    pc.style.cssText = 'margin:20px 0;display:flex;justify-content:center;gap:5px;flex-wrap:wrap;';

    var createBtn = function(text, onClick, isDisabled, isActive) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.style.cssText = 'padding:7px 13px;border:1px solid ' + (isActive || !isDisabled ? '#007bff' : '#dee2e6') + ';' +
            'background:' + (isActive ? '#007bff' : isDisabled ? '#e9ecef' : 'white') + ';' +
            'color:' + (isActive ? 'white' : isDisabled ? '#6c757d' : '#007bff') + ';' +
            'cursor:' + (isDisabled || isActive ? 'default' : 'pointer') + ';border-radius:6px;font-weight:' + (isActive ? '700' : '500') + ';min-width:38px;';
        if (onClick && !isDisabled && !isActive) {
            btn.addEventListener('click', onClick);
        }
        if (isDisabled) btn.disabled = true;
        return btn;
    };

    var createDots = function() {
        var s = document.createElement('span');
        s.textContent = '…';
        s.style.cssText = 'padding:7px 4px;color:#6c757d;';
        return s;
    };

    pc.appendChild(createBtn('«', function() { goToPageFn(1); }, currentPage === 1, false));
    pc.appendChild(createBtn('‹', function() { if (currentPage > 1) goToPageFn(currentPage - 1); }, currentPage === 1, false));

    var maxVisible = 5;
    var start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    var end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
        pc.appendChild(createBtn('1', function() { goToPageFn(1); }, false, false));
        if (start > 2) pc.appendChild(createDots());
    }
    for (var i = start; i <= end; i++) {
        (function(page) {
            pc.appendChild(createBtn(page, function() { goToPageFn(page); }, false, page === currentPage));
        })(i);
    }
    if (end < totalPages) {
        if (end < totalPages - 1) pc.appendChild(createDots());
        (function(tp) {
            pc.appendChild(createBtn(tp, function() { goToPageFn(tp); }, false, false));
        })(totalPages);
    }

    pc.appendChild(createBtn('›', function() { if (currentPage < totalPages) goToPageFn(currentPage + 1); }, currentPage === totalPages, false));
    pc.appendChild(createBtn('»', function() { goToPageFn(totalPages); }, currentPage === totalPages, false));

    container.appendChild(pc);
}

function updateCounter(containerId, filteredData, currentPage, rowsPerPage) {
    var counter = document.getElementById(containerId);
    if (!counter) return;
    
    var start = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    var end = Math.min(currentPage * rowsPerPage, filteredData.length);
    counter.innerHTML = '<i class="fas fa-chart-bar"></i> <strong>Affichage :</strong> ' + 
        (filteredData.length === 0 ? '0' : start) + ' à ' + end + 
        ' sur <strong>' + filteredData.length + '</strong> enregistrement' + 
        (filteredData.length > 1 ? 's' : '');
}

// ─────────────────────────────────────────────────────────────────────────────
// SÉCURITÉ FORMULAIRE
// ─────────────────────────────────────────────────────────────────────────────

function preventFormAutoSubmit() {
    var form = document.getElementById('absenceForm');
    if (form) {
        form.setAttribute('novalidate', 'novalidate');
        form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    
    var formRetard = document.getElementById('retardForm');
    if (formRetard) {
        formRetard.setAttribute('novalidate', 'novalidate');
        formRetard.addEventListener('submit', function (e) { e.preventDefault(); });
    }
}

function ensureButtonsHaveTypeButton() {
    document.querySelectorAll('button').forEach(function (btn) {
        if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
    });
}

function initUIControls() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAbsenceModal();
            closeRetardModal();
        }
    });
    
    // Écouteurs pour la justification
    var absenceJustifie = document.getElementById('absenceJustifie');
    if (absenceJustifie) {
        absenceJustifie.addEventListener('change', function(e) {
            var group = document.getElementById('absenceJustificationGroup');
            if (group) group.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    var retardJustifie = document.getElementById('retardJustifie');
    if (retardJustifie) {
        retardJustifie.addEventListener('change', function(e) {
            var group = document.getElementById('retardJustificationGroup');
            if (group) group.style.display = e.target.checked ? 'block' : 'none';
        });
    }
}

// Exposition globale
window.switchTab = switchTab;
window.closeAbsenceModal = closeAbsenceModal;
window.closeRetardModal = closeRetardModal;
window.showModal = showModal;