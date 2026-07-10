'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UI — Module Bulletins (Modales, Action Buttons, Rendu Tableau)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MODALE DE CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────

function showConfirmDialog(title, message, confirmText, cancelText, isDanger) {
    confirmText = confirmText || 'Confirmer';
    cancelText = cancelText || 'Annuler';
    isDanger = (isDanger !== undefined) ? isDanger : true;

    return new Promise(function(resolve) {
        var resolved = false;

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000000;opacity:0;transition:opacity 0.4s ease;backdrop-filter:blur(6px);';

        var box = document.createElement('div');
        box.style.cssText = 'background:#ffffff;border-radius:16px;max-width:480px;width:92%;padding:0;box-shadow:0 25px 60px rgba(0,0,0,0.4);transform:scale(0.8) translateY(30px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s ease;opacity:0;overflow:hidden;max-height:90vh;';

        box.innerHTML = ''
            + '<div style="padding:22px 28px 14px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #f0f0f0;">'
            + '<h3 style="margin:0;font-size:20px;font-weight:700;color:#1e3a2f;">' + escapeHtml(title) + '</h3>'
            + '<button id="modalCloseBtn" style="background:none;border:none;font-size:30px;cursor:pointer;color:#adb5bd;padding:0 4px;line-height:1;transition:color 0.3s,transform 0.3s;">&times;</button>'
            + '</div>'
            + '<div style="padding:24px 28px 16px 28px;">'
            + '<p style="margin:0;color:#495057;font-size:16px;line-height:1.7;white-space:pre-wrap;">' + escapeHtml(message) + '</p>'
            + '</div>'
            + '<div style="padding:16px 28px 24px 28px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:12px;">'
            + '<button id="modalCancelBtn" style="padding:10px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;background:#f1f3f5;color:#495057;min-width:100px;transition:all 0.3s ease;">' + escapeHtml(cancelText) + '</button>'
            + '<button id="modalOkBtn" style="padding:10px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;background:' + (isDanger ? '#dc3545' : '#28a745') + ';color:white;min-width:100px;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.1);">' + escapeHtml(confirmText) + '</button>'
            + '</div>';

        overlay.appendChild(box);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function() {
            overlay.style.opacity = '1';
            box.style.opacity = '1';
            box.style.transform = 'scale(1) translateY(0)';
        });

        var close = function(result) {
            if (resolved) return;
            resolved = true;
            overlay.style.opacity = '0';
            box.style.opacity = '0';
            box.style.transform = 'scale(0.8) translateY(30px)';
            document.body.style.overflow = '';
            setTimeout(function() {
                if (overlay.parentNode) overlay.remove();
                resolve(result);
            }, 400);
        };

        var okBtn = box.querySelector('#modalOkBtn');
        var cancelBtn = box.querySelector('#modalCancelBtn');
        var closeBtn = box.querySelector('#modalCloseBtn');

        okBtn.addEventListener('mouseenter', function() {
            okBtn.style.transform = 'translateY(-2px)';
            okBtn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
        });
        okBtn.addEventListener('mouseleave', function() {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });

        cancelBtn.addEventListener('mouseenter', function() {
            cancelBtn.style.transform = 'translateY(-2px)';
            cancelBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });
        cancelBtn.addEventListener('mouseleave', function() {
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.boxShadow = 'none';
        });

        closeBtn.addEventListener('mouseenter', function() {
            closeBtn.style.color = '#212529';
            closeBtn.style.transform = 'rotate(90deg)';
        });
        closeBtn.addEventListener('mouseleave', function() {
            closeBtn.style.color = '#adb5bd';
            closeBtn.style.transform = 'rotate(0)';
        });

        okBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            close(true);
        });

        cancelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            close(false);
        });

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            close(false);
        });

        setTimeout(function() {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    close(false);
                }
            });
        }, 300);

        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                close(false);
                document.removeEventListener('keydown', escListener);
            }
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// BOUTONS D'ACTION
// ─────────────────────────────────────────────────────────────────────────────

function createActionButtons() {
    var container = document.getElementById('actionButtons');
    if (container) return;

    container = document.createElement('div');
    container.id = 'actionButtons';
    container.className = 'action-buttons';
    container.style.display = 'none';

    var btnSave = document.createElement('button');
    btnSave.id = 'btnSauvegarder';
    btnSave.className = 'btn btn-primary btn-sm';
    btnSave.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
    btnSave.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.sauvegarder === 'function') {
            window.sauvegarder();
        }
    });
    container.appendChild(btnSave);

    var btnValidate = document.createElement('button');
    btnValidate.id = 'btnValider';
    btnValidate.className = 'btn btn-success btn-sm';
    btnValidate.innerHTML = '<i class="fas fa-check-double"></i> Valider Définitivement';
    btnValidate.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.validerDefinitivement === 'function') {
            window.validerDefinitivement();
        }
    });
    container.appendChild(btnValidate);

    var btnExport = document.createElement('button');
    btnExport.id = 'btnExporter';
    btnExport.className = 'btn btn-secondary btn-sm';
    btnExport.innerHTML = '<i class="fas fa-download"></i> Exporter';
    btnExport.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.exporter === 'function') {
            window.exporter();
        }
    });
    container.appendChild(btnExport);

    var wrapper = document.getElementById('tableWrapper');
    if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.insertBefore(container, wrapper.nextSibling);
    } else {
        var section = document.getElementById('section-bulletins');
        if (section) section.appendChild(container);
    }
}

function updateButtonsState() {
    var allValidated = currentEleves.length > 0 && currentEleves.every(function(e) { return e.Statut === 'Validé'; });
    var btnSave = document.getElementById('btnSauvegarder');
    var btnValidate = document.getElementById('btnValider');

    if (btnSave) {
        btnSave.disabled = allValidated && currentEleves.length > 0;
        btnSave.style.opacity = (allValidated && currentEleves.length > 0) ? '0.5' : '1';
        btnSave.style.cursor = (allValidated && currentEleves.length > 0) ? 'not-allowed' : 'pointer';
    }

    if (btnValidate) {
        btnValidate.disabled = allValidated && currentEleves.length > 0;
        btnValidate.style.opacity = (allValidated && currentEleves.length > 0) ? '0.5' : '1';
        btnValidate.style.cursor = (allValidated && currentEleves.length > 0) ? 'not-allowed' : 'pointer';
    }
}

function resetButtons() {
    var btnIds = ['btnSauvegarder', 'btnValider'];
    for (var i = 0; i < btnIds.length; i++) {
        var btn = document.getElementById(btnIds[i]);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
}

function showActionButtons(show) {
    var container = document.getElementById('actionButtons');
    if (container) {
        container.style.display = show ? 'flex' : 'none';
        if (container.classList) {
            if (show) {
                container.classList.add('visible');
            } else {
                container.classList.remove('visible');
            }
        }
    }
}

function setUnsavedChanges(value) {
    hasUnsavedChanges = value;
    var btn = document.getElementById('btnSauvegarder');
    if (btn) {
        if (value) {
            btn.classList.add('btn-unsaved-pulse');
        } else {
            btn.classList.remove('btn-unsaved-pulse');
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDU DU TABLEAU
// ─────────────────────────────────────────────────────────────────────────────

function renderTable() {
    var tbody = document.getElementById('notesTableBody');
    if (!tbody) return;

    var fragment = document.createDocumentFragment();

    for (var idx = 0; idx < currentEleves.length; idx++) {
        var eleve = currentEleves[idx];
        var isReadonly = eleve.Statut === 'Validé';
        var totalNote = calculerTotalNote(eleve.Note1, eleve.Note2, eleve.NoteProjet);
        var moyenne = calculerMoyenne(eleve.Note1, eleve.Note2, eleve.NoteProjet);

        var moyenneClass = '';
        if (moyenne !== '-') {
            var m = parseFloat(moyenne);
            if (m >= 16) moyenneClass = 'moyenne-excellent';
            else if (m >= 14) moyenneClass = 'moyenne-tres-bien';
            else if (m >= 12) moyenneClass = 'moyenne-bien';
            else if (m >= 10) moyenneClass = 'moyenne-passable';
            else moyenneClass = 'moyenne-insuffisant';
        }

        var statutClass = 'statut-non-saisi';
        var statutIcon = '○';
        var statutText = eleve.Statut || 'Non saisi';

        if (eleve.Statut === 'Validé') {
            statutClass = 'statut-valide';
            statutIcon = '✓';
            statutText = 'Validé';
        } else if (eleve.Statut === 'En cours') {
            statutClass = 'statut-en-cours';
            statutIcon = '⏳';
            statutText = 'En cours';
        } else if (eleve.Statut === 'Enregistré') {
            statutClass = 'statut-enregistre';
            statutIcon = '📝';
            statutText = 'Enregistré';
        }

        var n1 = (eleve.Note1 != null) ? parseFloat(eleve.Note1).toFixed(2) : '';
        var n2 = (eleve.Note2 != null) ? parseFloat(eleve.Note2).toFixed(2) : '';
        var np = (eleve.NoteProjet != null) ? parseFloat(eleve.NoteProjet).toFixed(2) : '';
        var total = totalNote.toFixed(2);

        var row = document.createElement('tr');
        row.className = idx % 2 === 0 ? 'table-row-even' : 'table-row-odd';
        row.dataset.idx = idx;
        row.dataset.eleveId = eleve.EleveId;

        row.innerHTML = ''
            + '<td class="cell-eleve">'
            + '<div class="eleve-info">'
            + '<span class="eleve-numero">#' + (idx + 1) + '</span>'
            + '<strong class="eleve-nom">' + escapeHtml(eleve.Nom || '') + '</strong>'
            + '</div>'
            + '</td>'
            + '<td class="cell-note">'
            + '<input type="text" class="note-input note-input-modern" data-field="note1" value="' + n1 + '" ' + (isReadonly ? 'readonly' : '') + ' placeholder="20.00" autocomplete="off" data-original="' + n1 + '">'
            + '<div class="coeff-display">×' + currentCoefficients.coeff1 + '</div>'
            + '</td>'
            + '<td class="cell-note">'
            + '<input type="text" class="note-input note-input-modern" data-field="note2" value="' + n2 + '" ' + (isReadonly ? 'readonly' : '') + ' placeholder="20.00" autocomplete="off" data-original="' + n2 + '">'
            + '<div class="coeff-display">×' + currentCoefficients.coeff2 + '</div>'
            + '</td>'
            + '<td class="cell-note">'
            + '<input type="text" class="note-input note-input-modern" data-field="projet" value="' + np + '" ' + (isReadonly ? 'readonly' : '') + ' placeholder="20.00" autocomplete="off" data-original="' + np + '">'
            + '<div class="coeff-display">×' + currentCoefficients.coeffProjet + '</div>'
            + '</td>'
            + '<td class="cell-totalnote">'
            + '<span class="totalnote-value" data-total="' + total + '">' + total + '</span>'
            + '</td>'
            + '<td class="cell-moyenne">'
            + '<div class="moyenne-circle ' + moyenneClass + '">'
            + '<span class="moyenne-value">' + moyenne + '</span>'
            + '</div>'
            + '</td>'
            + '<td class="cell-appreciation">'
            + '<textarea class="appreciation-input" rows="2" ' + (isReadonly ? 'readonly' : '') + ' placeholder="Appréciation..." data-original="' + escapeHtml(eleve.Appreciation || '') + '">' + escapeHtml(eleve.Appreciation || '') + '</textarea>'
            + '</td>'
            + '<td class="cell-statut">'
            + '<span class="statut-badge ' + statutClass + '">'
            + '<i class="statut-icon">' + statutIcon + '</i> ' + statutText
            + '</span>'
            + '</td>';

        fragment.appendChild(row);
    }

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
    attachEventListeners();
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

window.showConfirmDialog = showConfirmDialog;
window.createActionButtons = createActionButtons;
window.updateButtonsState = updateButtonsState;
window.resetButtons = resetButtons;
window.showActionButtons = showActionButtons;
window.setUnsavedChanges = setUnsavedChanges;
window.renderTable = renderTable;