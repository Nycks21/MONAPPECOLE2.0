/**
 * utilitaire.js — Importation Excel des élèves
 * ─────────────────────────────────────────────
 * Étape 1 : Dépôt du fichier Excel (drag & drop ou parcourir)
 * Étape 2 : Mappage colonnes Excel ↔ champs SQL
 * Étape 3 : Validation + aperçu des données
 * Étape 4 : Modal résultat (anomalies / intégration définitive)
 *
 * Dépendances : SheetJS (XLSX), SweetAlert2, FontAwesome
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// ÉTAT GLOBAL
// ═══════════════════════════════════════════════════════════════
var IMP = {
    step       : 0,
    workbook   : null,
    sheetData  : [],     // toutes les lignes brutes [{col: val}]
    headers    : [],     // en-têtes détectées
    mapping    : {},     // { champSQL: indexColonne (0-based) }
    validRows  : [],
    errorRows  : [],
    classesList: [],
    fileName   : '',
    totalRows  : 0,
    skipFirst  : true    // ignorer la ligne d'en-tête
};

// Champs SQL avec règles de validation
var CHAMPS = [
    { key:'MATRICULE',  label:'Matricule',        required:true,  type:'text',   hint:'Ex: 2024001'       },
    { key:'ANNEE_SCO',  label:'Année Scolaire',        required:true,  type:'text',   hint:'1'       },
    { key:'NOM',        label:'Nom complet',       required:true,  type:'text',   hint:'Ex: RAKOTO Jean'   },
    { key:'CLASSE',     label:'Classe (nom)',       required:true,  type:'classe', hint:'Ex: 6ème A'        },
    { key:'EMAIL',      label:'Email',             required:false, type:'email',  hint:'Ex: nom@mail.com'  },
    { key:'TELEPHONE',  label:'Téléphone',         required:false, type:'text',   hint:'Ex: 034 12 345 67' },
    { key:'DATE_NAISS', label:'Date de naissance', required:false, type:'date',   hint:'Ex: 2010-05-15'    },
    { key:'GENRE',      label:'Genre (M/F)',        required:false, type:'genre',  hint:'M ou F'            },
    { key:'ADRESSE',    label:'Adresse',           required:false, type:'text',   hint:''                  },
    { key:'PARENT',     label:'Parent / Tuteur',   required:false, type:'text',   hint:''                  }
];

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
    chargerClassesPourImport();
    goStep(1);
    initDragDrop();
});

// ─────────────────────────────────────────────
// NAVIGATION ENTRE ÉTAPES
// ─────────────────────────────────────────────
function goStep(n) {
    IMP.step = n;

    // Mettre à jour la barre de progression
    for (var i = 1; i <= 4; i++) {
        var stepEl  = document.getElementById('imp-step-' + i);
        var panelEl = document.getElementById('imp-panel-' + i);

        if (stepEl) {
            stepEl.className = 'imp-step' +
                (i < n ? ' done' : i === n ? ' active' : '');
        }
        if (panelEl) {
            panelEl.style.display = (i === n) ? 'block' : 'none';
        }
    }

    // Boutons nav
    var btnPrev = document.getElementById('imp-btn-prev');
    var btnNext = document.getElementById('imp-btn-next');
    var btnLaunch = document.getElementById('imp-btn-launch');

    if (btnPrev)   btnPrev.style.display   = (n > 1 && n < 4) ? 'inline-flex' : 'none';
    if (btnNext)   btnNext.style.display   = (n < 3) ? 'inline-flex' : 'none';
    if (btnLaunch) btnLaunch.style.display = (n === 3) ? 'inline-flex' : 'none';

    // Logique spécifique par étape
    if (n === 2 && IMP.headers.length) renderMappingTable();
    if (n === 3) renderPreview();
}

function nextStep() {
    if (IMP.step === 1) {
        if (!IMP.workbook) {
            Swal.fire('Attention', 'Veuillez sélectionner un fichier Excel avant de continuer.', 'warning');
            return;
        }
    }
    if (IMP.step === 2) {
        if (!validateMapping()) return;
    }
    if (IMP.step < 3) goStep(IMP.step + 1);
}

function prevStep() {
    if (IMP.step > 1) goStep(IMP.step - 1);
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1 — DÉPÔT DU FICHIER
// ═══════════════════════════════════════════════════════════════
function initDragDrop() {
    var zone = document.getElementById('imp-dropzone');
    if (!zone) return;

    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () {
        zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        var file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    var fileInput = document.getElementById('imp-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files[0]) processFile(this.files[0]);
        });
    }
}

function processFile(file) {
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
        Swal.fire('Format invalide', 'Veuillez choisir un fichier .xlsx ou .xls', 'error');
        return;
    }

    IMP.fileName  = file.name;
    IMP.workbook  = null;
    IMP.sheetData = [];
    IMP.headers   = [];

    // Afficher le nom du fichier
    var nameEl = document.getElementById('imp-file-name');
    if (nameEl) nameEl.textContent = file.name;

    var statusEl = document.getElementById('imp-file-status');
    if (statusEl) {
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lecture en cours...';
        statusEl.style.color = '#007bff';
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data     = new Uint8Array(e.target.result);
            var wb       = XLSX.read(data, { type: 'array', cellDates: true });
            IMP.workbook = wb;

            // Lire la première feuille
            var sheetName = wb.SheetNames[0];
            var ws        = wb.Sheets[sheetName];
            var json      = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

            if (!json || json.length < 2) {
                throw new Error('Le fichier semble vide ou ne contient pas de données.');
            }

            IMP.headers   = json[0].map(function (h) { return String(h || '').trim(); });
            IMP.sheetData = json.slice(1); // sans la ligne d'en-tête
            IMP.totalRows = IMP.sheetData.filter(function (r) {
                return r.some(function (c) { return String(c).trim() !== ''; });
            }).length;

            // Tentative de mappage automatique
            autoMapColumns();

            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> ' +
                    IMP.totalRows + ' ligne(s) détectée(s) — Feuille : « ' + sheetName + ' »';
                statusEl.style.color = '#28a745';
            }

            // Aperçu rapide des colonnes détectées
            renderColumnsPreview();

        } catch (err) {
            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + err.message;
                statusEl.style.color = '#dc3545';
            }
            IMP.workbook = null;
        }
    };
    reader.readAsArrayBuffer(file);
}

function autoMapColumns() {
    // Tentative de détection automatique par nom de colonne
    var aliases = {
        'MATRICULE'  : ['matricule', 'mat', 'num', 'numero', 'id élève'],
        'ANNEE_SCO'  : ['annee', 'annee_sco', 'an', 'numero'],
        'NOM'        : ['nom', 'nom complet', 'nom et prénom', 'eleve', 'élève', 'name'],
        'CLASSE'     : ['classe', 'class', 'groupe'],
        'EMAIL'      : ['email', 'mail', 'courriel', 'e-mail'],
        'TELEPHONE'  : ['telephone', 'tel', 'tél', 'phone', 'mobile'],
        'DATE_NAISS' : ['date de naissance', 'datenaissance', 'ddn', 'naissance', 'birthdate'],
        'GENRE'      : ['genre', 'sexe', 'sex', 'gender'],
        'ADRESSE'    : ['adresse', 'address'],
        'PARENT'     : ['parent', 'tuteur', 'père', 'mère', 'responsable']
    };

    IMP.mapping = {};
    IMP.headers.forEach(function (h, idx) {
        var hn = h.toLowerCase().trim();
        Object.keys(aliases).forEach(function (key) {
            if (aliases[key].indexOf(hn) !== -1 && IMP.mapping[key] === undefined) {
                IMP.mapping[key] = idx;
            }
        });
    });
}

function renderColumnsPreview() {
    var el = document.getElementById('imp-columns-preview');
    if (!el || !IMP.headers.length) return;

    el.innerHTML = IMP.headers.map(function (h, i) {
        return '<span class="col-badge">' +
            '<strong>' + String.fromCharCode(65 + i) + '</strong> ' + escHtml(h) +
            '</span>';
    }).join('');
    el.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2 — MAPPAGE
// ═══════════════════════════════════════════════════════════════
function renderMappingTable() {
    var tbody = document.getElementById('imp-mapping-body');
    if (!tbody) return;

    // Options pour le select : colonnes Excel
    var colOptions = '<option value="">— Ignorer —</option>' +
        IMP.headers.map(function (h, i) {
            return '<option value="' + i + '">' +
                String.fromCharCode(65 + i) + ' — ' + escHtml(h) + '</option>';
        }).join('');

    tbody.innerHTML = CHAMPS.map(function (c) {
        var selectedIdx = IMP.mapping[c.key] !== undefined ? IMP.mapping[c.key] : '';

        var options = '<option value="">— Ignorer —</option>' +
            IMP.headers.map(function (h, i) {
                return '<option value="' + i + '"' + (String(selectedIdx) === String(i) ? ' selected' : '') + '>' +
                    String.fromCharCode(65 + i) + ' — ' + escHtml(h) + '</option>';
            }).join('');

        // Valeur de prévisualisation depuis la 1ère ligne
        var preview = '';
        if (selectedIdx !== '' && IMP.sheetData.length > 0) {
            preview = String(IMP.sheetData[0][selectedIdx] || '');
        }

        return '<tr>' +
            '<td>' +
                '<span class="champ-label' + (c.required ? ' required' : '') + '">' +
                    escHtml(c.label) +
                '</span>' +
                '<small class="champ-hint">' + escHtml(c.hint) + '</small>' +
            '</td>' +
            '<td>' +
                '<select class="form-control mapping-select" data-field="' + c.key + '" ' +
                        'onchange="onMappingChange(this)">' +
                    options +
                '</select>' +
            '</td>' +
            '<td class="preview-cell" id="preview-' + c.key + '">' +
                '<span class="preview-val">' + escHtml(preview) + '</span>' +
            '</td>' +
        '</tr>';
    }).join('');
}

function onMappingChange(selectEl) {
    var field    = selectEl.getAttribute('data-field');
    var colIndex = selectEl.value !== '' ? parseInt(selectEl.value, 10) : undefined;

    IMP.mapping[field] = colIndex;

    // Mettre à jour la prévisualisation
    var previewEl = document.getElementById('preview-' + field);
    if (previewEl) {
        var val = (colIndex !== undefined && IMP.sheetData.length > 0)
            ? String(IMP.sheetData[0][colIndex] || '')
            : '';
        previewEl.innerHTML = '<span class="preview-val">' + escHtml(val) + '</span>';
    }
}

function validateMapping() {
    var missing = CHAMPS.filter(function (c) {
        return c.required && IMP.mapping[c.key] === undefined;
    }).map(function (c) { return c.label; });

    if (missing.length) {
        Swal.fire('Mappage incomplet',
            'Les champs obligatoires suivants ne sont pas mappés :<br><strong>' +
            missing.join(', ') + '</strong>', 'warning');
        return false;
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 3 — APERÇU + VALIDATION
// ═══════════════════════════════════════════════════════════════
function renderPreview() {
    validateAllRows();

    var stats = document.getElementById('imp-preview-stats');
    if (stats) {
        stats.innerHTML =
            '<div class="imp-stat ok"><i class="fas fa-check-circle"></i> ' +
            '<strong>' + IMP.validRows.length + '</strong> ligne(s) valide(s)</div>' +
            '<div class="imp-stat err"><i class="fas fa-exclamation-triangle"></i> ' +
            '<strong>' + IMP.errorRows.length + '</strong> anomalie(s)</div>' +
            '<div class="imp-stat total"><i class="fas fa-table"></i> ' +
            '<strong>' + (IMP.validRows.length + IMP.errorRows.length) + '</strong> total</div>';
    }

    renderPreviewTable();
}

function validateAllRows() {
    IMP.validRows  = [];
    IMP.errorRows  = [];

    var matricules = {}; // détection doublons internes

    IMP.sheetData.forEach(function (row, idx) {
        // Ignorer lignes vides
        if (!row.some(function (c) { return String(c).trim() !== ''; })) return;

        var obj    = extractRow(row);
        var errors = [];

        // Champs obligatoires
        CHAMPS.forEach(function (c) {
            if (c.required && !obj[c.key]) {
                errors.push('Champ « ' + c.label + ' » manquant');
            }
        });

        // Validation email
        if (obj.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.EMAIL)) {
            errors.push('Email invalide : ' + obj.EMAIL);
        }

        // Validation genre
        if (obj.GENRE && ['M','F'].indexOf(String(obj.GENRE).toUpperCase()) === -1) {
            errors.push('Genre doit être M ou F (reçu : ' + obj.GENRE + ')');
        }

        // Validation date
        if (obj.DATE_NAISS) {
            var d = new Date(obj.DATE_NAISS);
            if (isNaN(d.getTime())) {
                errors.push('Date de naissance invalide : ' + obj.DATE_NAISS);
            }
        }

        // Validation classe
        if (obj.CLASSE) {
            var classeMatch = IMP.classesList.find(function (c) {
                return c.NOM.toLowerCase() === String(obj.CLASSE).toLowerCase();
            });
            if (!classeMatch) {
                errors.push('Classe introuvable : « ' + obj.CLASSE + ' »');
            } else {
                obj.CLASSE_ID = classeMatch.ID;
            }
        }

        // Doublon matricule interne au fichier
        if (obj.MATRICULE) {
            if (matricules[obj.MATRICULE]) {
                errors.push('Doublon matricule dans le fichier : ' + obj.MATRICULE);
            }
            matricules[obj.MATRICULE] = true;
        }

        obj._ligne  = idx + 2; // numéro de ligne Excel (en-tête = 1)
        obj._errors = errors;

        if (errors.length) {
            IMP.errorRows.push(obj);
        } else {
            IMP.validRows.push(obj);
        }
    });
}

function extractRow(row) {
    var obj = {};
    CHAMPS.forEach(function (c) {
        if (IMP.mapping[c.key] !== undefined) {
            var val = row[IMP.mapping[c.key]];
            // Si c'est un objet Date (SheetJS avec cellDates)
            if (val instanceof Date) {
                val = val.getFullYear() + '-' +
                      String(val.getMonth()+1).padStart(2,'0') + '-' +
                      String(val.getDate()).padStart(2,'0');
            }
            obj[c.key] = String(val == null ? '' : val).trim();
        }
    });
    return obj;
}

function renderPreviewTable() {
    var container = document.getElementById('imp-preview-table');
    if (!container) return;

    var allRows  = IMP.validRows.concat(IMP.errorRows)
                    .sort(function (a, b) { return a._ligne - b._ligne; });

    if (!allRows.length) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">Aucune donnée à afficher.</p>';
        return;
    }

    var thead = '<thead><tr><th>#</th>' +
        CHAMPS.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') +
        '<th>Statut</th></tr></thead>';

    var tbody = '<tbody>' + allRows.map(function (row) {
        var isValid  = row._errors.length === 0;
        var rowClass = isValid ? 'row-valid' : 'row-error';

        var cells = CHAMPS.map(function (c) {
            return '<td>' + escHtml(row[c.key] || '—') + '</td>';
        }).join('');

        var status = isValid
            ? '<td><span class="badge-ok"><i class="fas fa-check"></i> OK</span></td>'
            : '<td><span class="badge-err" title="' + escHtml(row._errors.join('\n')) + '">' +
              '<i class="fas fa-times"></i> ' + row._errors.length + ' erreur(s)</span></td>';

        return '<tr class="' + rowClass + '"><td>' + row._ligne + '</td>' + cells + status + '</tr>';
    }).join('') + '</tbody>';

    container.innerHTML = '<div style="overflow-x:auto;max-height:340px;overflow-y:auto;">' +
        '<table class="imp-table">' + thead + tbody + '</table></div>';
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 4 — LANCEMENT + MODAL RÉSULTAT
// ═══════════════════════════════════════════════════════════════
function launchImport() {
    if (!IMP.validRows.length && IMP.errorRows.length) {
        Swal.fire('Impossible d\'importer',
            'Toutes les lignes contiennent des anomalies. Corrigez le fichier et recommencez.',
            'error');
        return;
    }

    Swal.fire({
        title  : 'Confirmer l\'import',
        html   : '<p><strong>' + IMP.validRows.length + '</strong> élève(s) seront intégrés.</p>' +
                 (IMP.errorRows.length
                    ? '<p style="color:#dc3545;"><i class="fas fa-exclamation-triangle"></i> ' +
                      IMP.errorRows.length + ' ligne(s) seront ignorées (anomalies).</p>'
                    : ''),
        icon   : 'question',
        showCancelButton  : true,
        confirmButtonText : '<i class="fas fa-database"></i> Intégrer définitivement',
        cancelButtonText  : 'Annuler',
        confirmButtonColor: '#28a745'
    }).then(function (result) {
        if (!result.isConfirmed) return;
        doIntegration();
    });
}

function doIntegration() {
    showSpinner();

    // Préparer le payload
    var payload = IMP.validRows.map(function (r) {
        return {
            MATRICULE  : r.MATRICULE  || '',
            ANNEE_SCO  : r.ANNEE_SCO  || '',
            NOM        : r.NOM        || '',
            CLASSE_ID  : r.CLASSE_ID  || '',
            EMAIL      : r.EMAIL      || '',
            TELEPHONE  : r.TELEPHONE  || '',
            DATE_NAISS : r.DATE_NAISS || null,
            GENRE      : r.GENRE      || '',
            ADRESSE    : r.ADRESSE    || '',
            PARENT     : r.PARENT     || ''
        };
    });

    fetch('handlers/ImporterEleves.ashx', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ eleves: payload })
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
        return r.json();
    })
    .then(function (data) {
        hideSpinner();
        goStep(4);
        renderResultModal(data);
    })
    .catch(function (err) {
        hideSpinner();
        Swal.fire('Erreur', 'L\'importation a échoué : ' + err.message, 'error');
    });
}

function renderResultModal(data) {
    var container = document.getElementById('imp-result-body');
    if (!container) return;

    var inserts  = data.inserted || 0;
    var skipped  = data.skipped  || 0;
    var dups     = data.duplicates || [];
    var errsSrv  = data.errors  || [];
    var hasErrors = (skipped > 0 || errsSrv.length > 0);

    var html = '<div class="imp-result-summary">' +
        '<div class="res-stat ok"><i class="fas fa-check-circle"></i><strong>' + inserts + '</strong><span>Intégrés</span></div>' +
        '<div class="res-stat warn"><i class="fas fa-exclamation-triangle"></i><strong>' + skipped + '</strong><span>Ignorés</span></div>' +
        '</div>';

    if (dups.length) {
        html += '<div class="imp-section"><h5><i class="fas fa-copy"></i> Doublons ignorés (' + dups.length + ')</h5>' +
            '<div style="overflow-x:auto;max-height:180px;overflow-y:auto;">' +
            '<table class="imp-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Raison</th></tr></thead><tbody>' +
            dups.map(function (d) {
                return '<tr class="row-warn"><td>' + escHtml(d.MATRICULE) + '</td><td>' +
                    escHtml(d.NOM) + '</td><td>' + escHtml(d.raison || 'Doublon matricule') + '</td></tr>';
            }).join('') +
            '</tbody></table></div></div>';
    }

    if (errsSrv.length) {
        html += '<div class="imp-section"><h5><i class="fas fa-times-circle"></i> Erreurs serveur (' + errsSrv.length + ')</h5>' +
            '<div style="overflow-x:auto;max-height:180px;overflow-y:auto;">' +
            '<table class="imp-table"><thead><tr><th>Matricule</th><th>Erreur</th></tr></thead><tbody>' +
            errsSrv.map(function (e) {
                return '<tr class="row-error"><td>' + escHtml(e.MATRICULE || '?') + '</td><td>' + escHtml(e.message) + '</td></tr>';
            }).join('') +
            '</tbody></table></div></div>';
    }

    if (!hasErrors) {
        html += '<div class="imp-success-msg"><i class="fas fa-check-circle"></i> ' +
            'Import totalement réussi ! ' + inserts + ' élève(s) intégré(s) sans anomalie.</div>';
    }

    // Bouton intégration définitive — grisé si anomalies non résolues
    var btnDefinitif = document.getElementById('imp-btn-definitif');
    if (btnDefinitif) {
        btnDefinitif.disabled = (inserts === 0);
        if (inserts > 0) {
            btnDefinitif.textContent = '✓ ' + inserts + ' élève(s) intégré(s) avec succès';
        }
    }

    container.innerHTML = html;
}

function confirmerIntegrationDefinitive() {
    Swal.fire({
        icon : 'success',
        title: 'Intégration confirmée',
        text : IMP.validRows.length + ' élève(s) ont été intégrés dans la base de données.',
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: 'Aller à la liste des élèves',
        confirmButtonColor: '#28a745'
    }).then(function (r) {
        if (r.isConfirmed) {
            window.location.href = '../../modules/eleves/eleves.aspx';
        }
    });
}

function resetImport() {
    IMP.step       = 0;
    IMP.workbook   = null;
    IMP.sheetData  = [];
    IMP.headers    = [];
    IMP.mapping    = {};
    IMP.validRows  = [];
    IMP.errorRows  = [];
    IMP.fileName   = '';
    IMP.totalRows  = 0;

    var fileInput = document.getElementById('imp-file-input');
    if (fileInput) fileInput.value = '';

    var nameEl = document.getElementById('imp-file-name');
    if (nameEl) nameEl.textContent = 'Aucun fichier sélectionné';

    var statusEl = document.getElementById('imp-file-status');
    if (statusEl) { statusEl.textContent = ''; }

    var colPrev = document.getElementById('imp-columns-preview');
    if (colPrev) { colPrev.innerHTML = ''; colPrev.style.display = 'none'; }

    goStep(1);
}

// ─────────────────────────────────────────────
// TÉLÉCHARGER LE MODÈLE EXCEL
// ─────────────────────────────────────────────
function downloadTemplate() {
    var headers = CHAMPS.map(function (c) { return c.label + (c.required ? ' *' : ''); });
    var example = ['2024001', 'RAKOTO Jean', '6ème A', 'rakoto@mail.com',
                   '034 12 345 67', '2010-05-15', 'M', 'Lot II A Antananarivo', 'RAKOTO Pierre'];

    var ws   = XLSX.utils.aoa_to_sheet([headers, example]);
    var wb   = XLSX.utils.book_new();

    // Style : largeur colonnes
    ws['!cols'] = headers.map(function () { return { wch: 20 }; });

    XLSX.utils.book_append_sheet(wb, ws, 'ÉLÈVES');
    XLSX.writeFile(wb, 'Modele_Import_Eleves.xlsx');
}

// ─────────────────────────────────────────────
// CHARGER LES CLASSES DEPUIS LA BDD
// ─────────────────────────────────────────────
function chargerClassesPourImport() {
    fetch('../../parametres/classes/handlers/GetClasse.ashx')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                IMP.classesList = data.Classes || data.classes || [];
            }
        })
        .catch(function (err) {
            console.warn('Classes non chargées :', err.message);
        });
}

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'flex'; s.style.visibility = 'visible'; s.style.opacity = '1'; }
}
function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) { s.style.display = 'none'; s.style.visibility = 'hidden'; s.style.opacity = '0'; }
}

// ─────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────
function escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
